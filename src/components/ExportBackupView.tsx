import React, { useRef, useState } from 'react';
import { Download, Upload, Database, RefreshCw, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { CustomerRecord } from '../types/customer';
import { exportCustomersCsv, exportCustomersJson, saveStoredCustomers } from '../utils/storage';

interface ExportBackupViewProps {
  customers: CustomerRecord[];
  onReloadCustomers: () => void;
  onToast: (msg: string) => void;
}

export const ExportBackupView: React.FC<ExportBackupViewProps> = ({
  customers,
  onReloadCustomers,
  onToast,
}) => {
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleExportCsv = () => {
    exportCustomersCsv(customers);
    onToast(`Exported ${customers.length} customer records to CSV.`);
  };

  const handleExportJson = () => {
    exportCustomersJson(customers);
    onToast(`Exported ${customers.length} customer records to JSON.`);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (!Array.isArray(parsed)) {
          throw new Error('Imported JSON must be an array of customer records.');
        }

        saveStoredCustomers(parsed);
        onReloadCustomers();
        onToast(`Successfully restored ${parsed.length} customer records from backup!`);
      } catch (err: any) {
        setImportError(err.message || 'Failed to parse JSON backup file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetToSamples = () => {
    if (confirm('Are you sure you want to reset the database to sample initial customers?')) {
      localStorage.removeItem('docuencode_customers_v1');
      onReloadCustomers();
      onToast('Database reset to initial sample customers.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="font-display font-bold text-xl text-slate-900">
          Data Export &amp; Backup Center
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Export your customer database to external spreadsheets, CRM formats, or create JSON backups.
        </p>
      </div>

      {importError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span>{importError}</span>
        </div>
      )}

      {/* Main Export Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CSV Card */}
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="font-display font-semibold text-base text-slate-900 mb-1">
              CSV Spreadsheet Export
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Download clean spreadsheet data compatible with Excel, Google Sheets, Salesforce, and modern CRMs. Includes all contact, identification, and location fields.
            </p>
          </div>
          <button
            onClick={handleExportCsv}
            className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" />
            Download Customer CSV ({customers.length} records)
          </button>
        </div>

        {/* JSON Backup Card */}
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-display font-semibold text-base text-slate-900 mb-1">
              JSON Database Backup
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Full data dump including document audit trail metadata, confidence scores, and raw timestamps. Ideal for archiving or transferring data between workstations.
            </p>
          </div>
          <button
            onClick={handleExportJson}
            className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" />
            Download JSON Backup
          </button>
        </div>
      </div>

      {/* Restore & Reset Section */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-display font-semibold text-sm text-slate-900">
          Restore from Backup or Reset
        </h3>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div>
            <p className="text-xs font-medium text-slate-700">Restore from JSON file</p>
            <p className="text-xs text-slate-500">
              Upload a previously exported JSON backup to reload customer records.
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportJson}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors flex items-center gap-2 shrink-0"
          >
            <Upload className="w-4 h-4" />
            Choose JSON Backup
          </button>
        </div>

        <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-slate-700">Reset to Initial Sample Data</p>
            <p className="text-xs text-slate-500">
              Re-populate database with default sample customer records and test entries.
            </p>
          </div>
          <button
            onClick={handleResetToSamples}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-300 rounded-lg transition-colors flex items-center gap-2 shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Database
          </button>
        </div>
      </div>
    </div>
  );
};
