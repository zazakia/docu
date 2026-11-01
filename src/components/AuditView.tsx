import React from 'react';
import { Sparkles, Calendar, FileText, ExternalLink, CheckCircle, ShieldCheck } from 'lucide-react';
import { CustomerRecord } from '../types/customer';

interface AuditViewProps {
  customers: CustomerRecord[];
  onSelectCustomer: (customer: CustomerRecord) => void;
  onOpenScan: () => void;
}

export const AuditView: React.FC<AuditViewProps> = ({
  customers,
  onSelectCustomer,
  onOpenScan,
}) => {
  const scannedCustomers = customers.filter((c) => c.sourceDocument);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-xl text-slate-900">
            Document Ingestion Audit Trail
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Historical audit log of all scanned handwritten documents, PDFs, ID cards, and camera captures.
          </p>
        </div>

        <button
          onClick={onOpenScan}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Scan New Document
        </button>
      </div>

      {scannedCustomers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scannedCustomers.map((c) => {
            const doc = c.sourceDocument!;
            return (
              <div
                key={c.id}
                onClick={() => onSelectCustomer(c)}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group flex flex-col"
              >
                {/* Document Thumbnail Preview */}
                <div className="h-44 bg-slate-900 relative overflow-hidden flex items-center justify-center">
                  {doc.previewDataUrl ? (
                    <img
                      src={doc.previewDataUrl}
                      alt={doc.fileName}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <FileText className="w-8 h-8 mb-2" />
                      <span className="text-xs">{doc.fileName}</span>
                    </div>
                  )}

                  {/* Confidence Pill */}
                  {c.confidenceScore && (
                    <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur px-2.5 py-1 rounded text-[11px] font-mono font-bold text-emerald-400 shadow">
                      {c.confidenceScore}% confidence
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="font-mono">{doc.fileName}</span>
                      <span>{new Date(doc.scannedAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="font-display font-semibold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {c.fullName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {c.idType} · <span className="font-mono">{c.idNumber || 'ID Verified'}</span>
                    </p>
                  </div>

                  {c.documentSummary && (
                    <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded-lg line-clamp-2">
                      "{c.documentSummary}"
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-medium">
                    <span>Inspect verified fields</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-900 text-sm mb-1">
            No scanned documents in audit history
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Upload or photograph documents to record and digitize customer data automatically.
          </p>
          <button
            onClick={onOpenScan}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Scan Your First Document
          </button>
        </div>
      )}
    </div>
  );
};
