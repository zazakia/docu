import React from 'react';
import { X } from 'lucide-react';
import { DocumentViewer } from './DocumentViewer';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataUrl: string;
  fileName: string;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  dataUrl,
  fileName,
}) => {
  if (!isOpen || !dataUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between text-white bg-slate-950">
          <div className="truncate">
            <span className="text-xs text-slate-400">Scanned Document Inspector</span>
            <h3 className="font-display font-semibold text-sm text-white truncate">
              {fileName || 'Original Document Scan'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-3 overflow-hidden">
          <DocumentViewer
            dataUrl={dataUrl}
            mimeType={fileName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'}
            fileName={fileName}
          />
        </div>
      </div>
    </div>
  );
};
