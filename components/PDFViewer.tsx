import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Document, Page } from 'react-pdf';
import { LineItem, LineHighlight, PageOcrData, FieldHighlight } from '../types';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { OCR_SCALE, findLineItemFields } from '../services/ocrService';

interface PDFViewerProps {
  file: File | null;
  extractedData: LineItem[];
  ocrData: PageOcrData[];
  highlightedLineId: number | null;
  onLineItemClick: (lineId: number) => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  file,
  extractedData,
  ocrData,
  highlightedLineId,
  onLineItemClick
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [scale, setScale] = useState(1.2);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track which page each line is on for scrolling
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const highlightRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const onDocumentLoadSuccess = async ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  // Match extracted data to OCR text positions using useMemo
  const lineHighlights = useMemo(() => {
    if (ocrData.length === 0 || extractedData.length === 0) {
      console.log('Skipping highlight matching - no OCR data yet');
      return new Map<number, LineHighlight>();
    }

    console.log(`Matching ${extractedData.length} line items to OCR text...`);
    const newHighlights = new Map<number, LineHighlight>();

    extractedData.forEach(item => {
      const fieldHighlights = findLineItemFields(item, ocrData);

      if (fieldHighlights.length > 0) {
        // OCR coordinates are at OCR_SCALE, need to convert to base scale (scale=1)
        newHighlights.set(item.line, {
          lineId: item.line,
          highlights: fieldHighlights.map(h => ({
            pageIndex: h.pageIndex,
            boundingBox: {
              x: h.boundingBox.x / OCR_SCALE,
              y: h.boundingBox.y / OCR_SCALE,
              width: h.boundingBox.width / OCR_SCALE,
              height: h.boundingBox.height / OCR_SCALE
            },
            fieldType: h.fieldType
          }))
        });

        console.log(`Created ${fieldHighlights.length} highlights for line ${item.line}`);
      }
    });

    console.log(`Total line items with highlights: ${newHighlights.size}`);
    return newHighlights;
  }, [ocrData, extractedData]);

  // Scroll to highlighted item when it changes
  useEffect(() => {
    if (highlightedLineId === null) return;

    const highlightEl = highlightRefs.current.get(highlightedLineId);
    if (highlightEl) {
      highlightEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightedLineId]);

  // Highlight overlay component for a single page
  const HighlightOverlay: React.FC<{ pageIndex: number }> = ({ pageIndex }) => {
    // Get all highlights for this page (may be from different line items)
    const pageHighlights: Array<{ lineId: number; highlight: FieldHighlight }> = [];

    lineHighlights.forEach((lineH, lineId) => {
      lineH.highlights
        .filter(h => h.pageIndex === pageIndex)
        .forEach(h => pageHighlights.push({ lineId, highlight: h }));
    });

    if (pageHighlights.length === 0) return null;

    return (
      <div className="absolute inset-0 pointer-events-none">
        {pageHighlights.map(({ lineId, highlight }, idx) => {
          const isActive = highlightedLineId === lineId;
          const { x, y, width, height } = highlight.boundingBox;

          // Color coding by field type
          const getHighlightStyles = () => {
            if (isActive) {
              switch (highlight.fieldType) {
                case 'tag':
                  return 'bg-yellow-300/60 border-2 border-yellow-500 shadow-lg ring-2 ring-yellow-400 ring-offset-1';
                case 'unit_price':
                  return 'bg-green-300/60 border-2 border-green-500 shadow-lg ring-2 ring-green-400 ring-offset-1';
                case 'line_total':
                  return 'bg-blue-300/60 border-2 border-blue-500 shadow-lg ring-2 ring-blue-400 ring-offset-1';
              }
            }
            return 'bg-transparent border border-transparent hover:bg-indigo-100/40 hover:border-indigo-300';
          };

          return (
            <div
              key={`${lineId}-${highlight.fieldType}-${idx}`}
              ref={el => {
                // Store ref for the first highlight (tag) for scrolling purposes
                if (el && highlight.fieldType === 'tag') {
                  highlightRefs.current.set(lineId, el);
                }
              }}
              className={`absolute transition-all duration-300 pointer-events-auto cursor-pointer ${getHighlightStyles()}`}
              style={{
                left: x * scale,
                top: y * scale,
                width: width * scale,
                height: height * scale,
                borderRadius: 4
              }}
              onClick={() => onLineItemClick(lineId)}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 border-r border-slate-200">
      {/* Toolbar */}
      <div className="bg-white p-2 border-b border-slate-200 flex items-center justify-between shadow-sm z-20">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2">Source Document</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="p-1 hover:bg-slate-100 rounded text-slate-600">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium text-slate-600 w-12 text-center">{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(s => Math.min(2.5, s + 0.1))} className="p-1 hover:bg-slate-100 rounded text-slate-600">
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PDF Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-8 flex justify-center bg-slate-500/10"
      >
        {file && (
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex flex-col items-center mt-20 text-slate-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                Loading PDF...
              </div>
            }
            error={
              <div className="mt-20 text-red-500 bg-red-50 p-4 rounded">
                Error loading PDF. Please ensure valid file.
              </div>
            }
          >
            {Array.from(new Array(numPages), (el, index) => (
              <div
                key={`page_${index + 1}`}
                className="mb-8 shadow-lg relative"
                ref={el => {
                  if (el) pageRefs.current.set(index, el);
                }}
              >
                <Page
                  pageNumber={index + 1}
                  scale={scale}
                  className="bg-white"
                  renderTextLayer={true}
                  renderAnnotationLayer={false}
                />
                <HighlightOverlay pageIndex={index} />
              </div>
            ))}
          </Document>
        )}
      </div>
    </div>
  );
};
