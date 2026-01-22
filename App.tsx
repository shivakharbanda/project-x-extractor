import React, { useState, useCallback, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { PDFViewer } from './components/PDFViewer';
import { DataPanel } from './components/DataPanel';
import { ChatInterface } from './components/ChatInterface';
import { geminiService, fileToBase64 } from './services/geminiService';
import { ocrPdfPages, findContactFieldPosition, findAllFieldPositions } from './services/ocrService';
import { ExtractedBidData, ChatMessage, ProcessingState, PageOcrData, ProcessingProgress, ContactFieldHighlight } from './types';
import { v4 as uuidv4 } from 'uuid'; // A simple random ID generator would suffice but using uuid usually implies a lib, I'll use simple Date.now for demo

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<ExtractedBidData | null>(null);
  const [ocrData, setOcrData] = useState<PageOcrData[]>([]);
  const [processingState, setProcessingState] = useState<ProcessingState>({ status: 'idle' });
  const [processingProgress, setProcessingProgress] = useState<ProcessingProgress | null>(null);
  const [highlightedLineId, setHighlightedLineId] = useState<number | null>(null);
  const [contactFieldHighlight, setContactFieldHighlight] = useState<ContactFieldHighlight | null>(null);
  const [showHighlights, setShowHighlights] = useState(true);
  const [allFieldHighlights, setAllFieldHighlights] = useState<Map<string, ContactFieldHighlight>>(new Map());

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatTyping, setIsChatTyping] = useState(false);

  // Compute all field highlights when data and ocrData are loaded
  useEffect(() => {
    if (data && ocrData.length > 0) {
      const highlights = findAllFieldPositions(
        data.vendor_info,
        data.receiver_info,
        ocrData
      );
      setAllFieldHighlights(highlights);
      console.log(`Computed ${highlights.size} field highlights`);
    } else {
      setAllFieldHighlights(new Map());
    }
  }, [data, ocrData]);

  // File Upload Handler
  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setOcrData([]); // Reset OCR data
    setProcessingState({ status: 'processing', message: 'Converting PDF...' });
    setProcessingProgress({ stage: 'converting', message: 'Converting PDF...' });

    // ABORT FLAG - prevents state updates after any error
    let aborted = false;

    try {
      console.log('Starting parallel Gemini + OCR processing...');
      const base64 = await fileToBase64(selectedFile);

      if (aborted) return; // Check after async operation
      setProcessingState({ status: 'processing', message: 'Analyzing document...' });
      setProcessingProgress({ stage: 'extracting', message: 'Extracting data with AI...' });

      // Track both completions
      let ocrComplete = false;
      let geminiComplete = false;

      // Run Gemini extraction and OCR in parallel
      const [extractedData, ocrResults] = await Promise.all([
        // Gemini extraction
        (async () => {
          try {
            const result = await geminiService.extractBidData(base64, selectedFile.type);
            if (aborted) return null; // Don't update state if already errored
            geminiComplete = true;
            // If OCR already done, we're finished
            if (ocrComplete) {
              setProcessingProgress({ stage: 'matching', message: 'Matching data to document...', percent: 100 });
            } else {
              // OCR still running, update message to indicate AI is done
              setProcessingProgress(prev => prev ? {
                ...prev,
                message: `AI extraction complete. ${prev.message}`
              } : prev);
            }
            return result;
          } catch (error) {
            aborted = true; // Set flag BEFORE re-throwing
            throw error;
          }
        })(),
        // OCR processing
        (async () => {
          try {
            const result = await ocrPdfPages(selectedFile, (progress) => {
              if (aborted) return; // CRITICAL: Skip ALL state updates if aborted
              const ocrPercent = Math.round((progress.currentPage / progress.totalPages) * 100);
              setProcessingState({
                status: 'processing',
                message: progress.status
              });
              setProcessingProgress({
                stage: 'ocr',
                message: geminiComplete
                  ? `Performing OCR on page ${progress.currentPage}...`
                  : `Extracting with AI + OCR page ${progress.currentPage}...`,
                currentPage: progress.currentPage,
                totalPages: progress.totalPages,
                percent: ocrPercent
              });
            });
            if (aborted) return []; // Don't update state if already errored
            ocrComplete = true;
            // If Gemini not done yet, show waiting message
            if (!geminiComplete) {
              setProcessingProgress({
                stage: 'extracting',
                message: 'OCR complete. Waiting for AI analysis...',
                percent: 100  // OCR is 100%, but still waiting
              });
            }
            return result;
          } catch (error) {
            aborted = true; // Set flag BEFORE re-throwing
            throw error;
          }
        })()
      ]);

      // CRITICAL: Check abort before ANY success state updates
      if (aborted) return;

      console.log('Gemini extraction complete');
      console.log(`OCR complete: ${ocrResults.length} pages processed`);

      setProcessingProgress({ stage: 'matching', message: 'Matching data to document...', percent: 100 });
      setData(extractedData);
      setOcrData(ocrResults);
      setProcessingState({ status: 'success' });
      setProcessingProgress(null);

      // Add initial greeting to chat
      setChatMessages([{
        id: Date.now().toString(),
        role: 'model',
        text: `I've extracted ${extractedData.summary.total_items} items from the bid for ${extractedData.vendor_info.vendor_name}. Total value is ${extractedData.summary.grand_total.toLocaleString('en-US', {style: 'currency', currency: extractedData.summary.currency})}. What would you like to know?`,
        timestamp: new Date()
      }]);

    } catch (error: any) {
      aborted = true; // Ensure flag is set (might already be set by inner catch)
      console.error(error);
      // Convert API errors to user-friendly messages
      let userMessage = 'Failed to extract data. Please try again.';
      const errorString = error?.message || error?.toString() || '';

      if (errorString.includes('503') || errorString.includes('overloaded') || errorString.includes('UNAVAILABLE')) {
        userMessage = 'Our service is temporarily busy. Please try again in a moment.';
      } else if (errorString.includes('401') || errorString.includes('API_KEY') || errorString.includes('UNAUTHENTICATED')) {
        userMessage = 'Service configuration error. Please contact support.';
      } else if (errorString.includes('429') || errorString.includes('RESOURCE_EXHAUSTED')) {
        userMessage = 'Too many requests. Please wait a moment and try again.';
      } else if (errorString.includes('network') || errorString.includes('fetch')) {
        userMessage = 'Network error. Please check your connection and try again.';
      }

      setProcessingState({ status: 'error', message: userMessage });
      setProcessingProgress(null);
      setFile(null);
    }
  };

  // Interaction Handlers
  const handleLineClick = useCallback((lineId: number) => {
    setHighlightedLineId(lineId);
    setContactFieldHighlight(null); // Clear contact highlight when clicking line item

    // Also scroll table row into view
    const row = document.getElementById(`table-row-${lineId}`);
    if (row) {
        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const handleContactFieldClick = useCallback((fieldName: string) => {
    if (!data || ocrData.length === 0) return;

    // Get the field value from vendor_info or receiver_info
    let fieldValue = '';
    if (fieldName.startsWith('supplier_') || fieldName === 'vendor_name' ||
        fieldName === 'quote_id' || fieldName === 'quote_date' || fieldName === 'terms') {
      fieldValue = (data.vendor_info as any)[fieldName] || '';
    } else if (fieldName.startsWith('receiver_')) {
      fieldValue = (data.receiver_info as any)[fieldName] || '';
    }

    if (!fieldValue) return;

    // Find the position in OCR data
    const highlight = findContactFieldPosition(fieldName, fieldValue, ocrData);
    if (highlight) {
      setContactFieldHighlight(highlight);
      setHighlightedLineId(null); // Clear line highlight when clicking contact field
    }
  }, [data, ocrData]);

  const handleLineHover = useCallback((lineId: number | null) => {
    // Only highlight if explicitly clicking usually, but for bidirectional feel we can use hover
    // For this implementation, let's keep click as primary persistent selection, hover for subtle cue
    // But updating state on every hover might be jittery for the PDF re-render, 
    // so we strictly use CLICK for the PDF highlight, and allow Hover for Chat->View interactions
    if (lineId !== null) {
      // Optional: fast hover effect logic if needed
    }
  }, []);

  const handleChatMessage = async (text: string) => {
    if (!data) return;

    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, newUserMsg]);
    setIsChatTyping(true);

    try {
      const response = await geminiService.chatWithBid(chatMessages, text, data);
      
      const newBotMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text,
        relatedLineItems: response.relatedLineItems,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, newBotMsg]);

      // If the bot mentions specific lines, highlight the first one
      if (response.relatedLineItems && response.relatedLineItems.length > 0) {
        handleLineClick(response.relatedLineItems[0]);
      }

    } catch (error) {
      console.error(error);
       setChatMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I'm sorry, I encountered an error analyzing the bid data.",
        timestamp: new Date()
      }]);
    } finally {
      setIsChatTyping(false);
    }
  };

  const handleChatHover = (lineNumbers: number[] | undefined) => {
     if (lineNumbers && lineNumbers.length > 0) {
         setHighlightedLineId(lineNumbers[0]);
     } else {
         // Optionally clear highlight or keep last clicked
     }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-100 overflow-hidden">
        {/* Navigation Bar */}
        <nav className="h-14 bg-white border-b border-slate-200 flex items-center px-6 shrink-0 z-30 justify-between">
            <div className="flex items-center gap-2">
                <div className="bg-indigo-600 rounded-lg p-1.5">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <span className="font-bold text-slate-800 text-lg tracking-tight">BidExtract</span>
            </div>
            {data && (
                <button
                    onClick={() => { setFile(null); setData(null); setOcrData([]); setChatMessages([]); }}
                    className="text-sm text-slate-500 hover:text-indigo-600 font-medium px-4 py-2 hover:bg-slate-50 rounded-lg transition-colors"
                >
                    Upload New Bid
                </button>
            )}
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 flex overflow-hidden relative">
            {!data ? (
                // Upload View
                <FileUpload
                    onFileSelect={handleFileSelect}
                    isProcessing={processingState.status === 'processing'}
                    processingMessage={processingProgress?.message}
                    processingProgress={processingProgress ? {
                        currentPage: processingProgress.currentPage,
                        totalPages: processingProgress.totalPages,
                        percent: processingProgress.percent
                    } : undefined}
                    externalError={processingState.status === 'error' ? processingState.message : null}
                />
            ) : (
                // Split View Workspace
                <div className="flex w-full h-full">
                    {/* Left: PDF Viewer (50%) */}
                    <div className="w-1/2 h-full relative border-r border-slate-200">
                        <PDFViewer
                            file={file}
                            extractedData={data.line_items}
                            ocrData={ocrData}
                            highlightedLineId={highlightedLineId}
                            onLineItemClick={handleLineClick}
                            contactFieldHighlight={contactFieldHighlight}
                            showHighlights={showHighlights}
                            allFieldHighlights={allFieldHighlights}
                        />
                    </div>

                    {/* Right: Data Table (50%) */}
                    <div className="w-1/2 h-full bg-white relative">
                        <DataPanel
                            data={data}
                            highlightedLineId={highlightedLineId}
                            onLineHover={handleLineHover}
                            onLineClick={handleLineClick}
                            onContactFieldClick={handleContactFieldClick}
                            showHighlights={showHighlights}
                            onToggleHighlights={() => setShowHighlights(!showHighlights)}
                        />
                    </div>
                    
                    {/* Chat Overlay */}
                    <ChatInterface 
                        messages={chatMessages}
                        onSendMessage={handleChatMessage}
                        isTyping={isChatTyping}
                        onHoverLineItem={handleChatHover}
                    />
                </div>
            )}
        </main>
    </div>
  );
};

export default App;
