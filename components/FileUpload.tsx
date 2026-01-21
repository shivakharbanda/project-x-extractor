import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
  processingMessage?: string;
  processingProgress?: {
    currentPage?: number;
    totalPages?: number;
    percent?: number;
  };
  externalError?: string | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  isProcessing,
  processingMessage,
  processingProgress,
  externalError
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use external error if provided, otherwise use local validation error
  const displayError = externalError || error;

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndUpload(files[0]);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      validateAndUpload(e.target.files[0]);
    }
  };

  const validateAndUpload = (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }
    // Limit to 20MB for this demo
    if (file.size > 20 * 1024 * 1024) {
      setError('File size too large. Please upload a file smaller than 20MB.');
      return;
    }
    onFileSelect(file);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8">
      <div className="max-w-xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Vendor Bid Extractor</h1>
          <p className="text-slate-500">
            Upload a vendor quote to automatically extract line items and pricing into an interactive workspace.
          </p>
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative group border-2 border-dashed rounded-xl p-12 transition-all duration-200 ease-in-out cursor-pointer
            flex flex-col items-center justify-center bg-white
            ${isDragging 
              ? 'border-indigo-500 bg-indigo-50 shadow-lg' 
              : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50 shadow-sm'}
            ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
          `}
        >
          <input
            type="file"
            accept=".pdf"
            onChange={handleInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isProcessing}
          />
          
          <div className="bg-indigo-100 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-200">
            {isProcessing ? (
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            ) : (
               <Upload className="w-8 h-8 text-indigo-600" />
            )}
           
          </div>

          <h3 className="text-lg font-semibold text-slate-900 mb-1">
            {isProcessing ? (processingMessage || 'Processing...') : 'Drop your PDF here'}
          </h3>

          {isProcessing && processingProgress?.totalPages ? (
            <div className="w-full max-w-xs mb-4">
              <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${processingProgress.percent || 0}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 text-center">
                Page {processingProgress.currentPage} of {processingProgress.totalPages}
              </p>
            </div>
          ) : (
            <p className="text-slate-500 text-sm mb-4">
              {isProcessing ? 'Analyzing document...' : 'or click to browse files'}
            </p>
          )}

          {isProcessing && processingProgress?.percent === 100 && processingMessage?.includes('Waiting') && (
            <div className="text-xs text-indigo-500 animate-pulse mt-1">
              Almost there...
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            <FileText className="w-3 h-3" />
            <span>PDF files only (max 20MB)</span>
          </div>
        </div>

        {displayError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{displayError}</span>
          </div>
        )}
      </div>
    </div>
  );
};
