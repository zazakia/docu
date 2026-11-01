import React from 'react';
import { ScanText, Plus, Database, Sparkles, Download } from 'lucide-react';

interface NavbarProps {
  activeTab: 'customers' | 'audit' | 'export';
  setActiveTab: (tab: 'customers' | 'audit' | 'export') => void;
  onOpenScan: () => void;
  customerCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenScan,
  customerCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <ScanText className="w-5 h-5" />
          </div>
          <button
            onClick={() => setActiveTab('customers')}
            className="text-left font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap hover:text-indigo-600 transition-colors"
          >
            DocuEncode
          </button>
        </div>

        {/* Zone 2: Clean single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('customers')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'customers'
                ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                : 'hover:text-slate-900'
            }`}
          >
            Customer Ledger ({customerCount})
          </button>
          <button
            onClick={onOpenScan}
            className="whitespace-nowrap shrink-0 hover:text-slate-900 transition-colors py-1 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            AI Document Ingestion
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'audit'
                ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                : 'hover:text-slate-900'
            }`}
          >
            Scan Audit Trail
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'export'
                ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                : 'hover:text-slate-900'
            }`}
          >
            Export & Backup
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenScan}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Scan Document</span>
          </button>
        </div>
      </div>
    </header>
  );
};
