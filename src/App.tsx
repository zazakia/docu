/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CustomerTable } from './components/CustomerTable';
import { SplitScreenScanModal } from './components/SplitScreenScanModal';
import { CustomerDetailDrawer } from './components/CustomerDetailDrawer';
import { ManualCustomerModal } from './components/ManualCustomerModal';
import { AuditView } from './components/AuditView';
import { ExportBackupView } from './components/ExportBackupView';
import { DocumentPreviewModal } from './components/DocumentPreviewModal';
import { CustomerRecord } from './types/customer';
import {
  getStoredCustomers,
  addStoredCustomer,
  updateStoredCustomer,
  deleteStoredCustomer,
  exportCustomersCsv,
  exportCustomersJson,
} from './utils/storage';
import { CheckCircle2, Sparkles, AlertCircle, FileText, Upload } from 'lucide-react';

export default function App() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'customers' | 'audit' | 'export'>('customers');
  const [isScanModalOpen, setIsScanModalOpen] = useState<boolean>(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{ dataUrl: string; fileName: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load persistent customers on mount
  useEffect(() => {
    loadCustomersList();
  }, []);

  const loadCustomersList = () => {
    const list = getStoredCustomers();
    setCustomers(list);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Called when AI document scan is verified and committed
  const handleCustomerEncoded = (
    recordData: Omit<CustomerRecord, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const newRecord = addStoredCustomer(recordData);
    setCustomers(getStoredCustomers());
    showToast(`Successfully encoded customer "${newRecord.fullName}"!`);
    setSelectedCustomer(newRecord);
  };

  // Manual entry save
  const handleManualSave = (
    data: Omit<CustomerRecord, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const newRecord = addStoredCustomer(data);
    setCustomers(getStoredCustomers());
    showToast(`Saved customer record for "${newRecord.fullName}".`);
    setSelectedCustomer(newRecord);
  };

  // Update existing record
  const handleUpdateCustomer = (id: string, updates: Partial<CustomerRecord>) => {
    const updated = updateStoredCustomer(id, updates);
    if (updated) {
      setCustomers(getStoredCustomers());
      setSelectedCustomer(updated);
      showToast('Customer record updated successfully.');
    }
  };

  // Delete customer
  const handleDeleteCustomer = (id: string) => {
    deleteStoredCustomer(id);
    setCustomers(getStoredCustomers());
    if (selectedCustomer?.id === id) {
      setSelectedCustomer(null);
    }
    showToast('Customer record deleted.');
  };

  const handleExportCsv = () => {
    exportCustomersCsv(customers);
    showToast(`Exported ${customers.length} customer records to CSV.`);
  };

  const handleExportJson = () => {
    exportCustomersJson(customers);
    showToast(`Exported ${customers.length} customer records to JSON.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Strict Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenScan={() => setIsScanModalOpen(true)}
        customerCount={customers.length}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Workspace Hero Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multimodal AI Encoding Engine</span>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
              Customer Data &amp; Document Ingestion
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Scan written documents, paper intake sheets, government IDs, or PDFs. Gemini 3.8 Flash automatically transcribes text and populates structured records with split-screen verification.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsScanModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-sm transition-all"
            >
              <Upload className="w-4 h-4" />
              Scan Document / PDF
            </button>
          </div>
        </div>

        {/* Tab Views */}
        {activeTab === 'customers' && (
          <CustomerTable
            customers={customers}
            onSelectCustomer={(c) => setSelectedCustomer(c)}
            onDeleteCustomer={handleDeleteCustomer}
            onOpenScan={() => setIsScanModalOpen(true)}
            onOpenManualModal={() => setIsManualModalOpen(true)}
            onExportCsv={handleExportCsv}
            onExportJson={handleExportJson}
          />
        )}

        {activeTab === 'audit' && (
          <AuditView
            customers={customers}
            onSelectCustomer={(c) => setSelectedCustomer(c)}
            onOpenScan={() => setIsScanModalOpen(true)}
          />
        )}

        {activeTab === 'export' && (
          <ExportBackupView
            customers={customers}
            onReloadCustomers={loadCustomersList}
            onToast={showToast}
          />
        )}
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white text-xs font-medium rounded-xl shadow-xl border border-slate-800 animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Core Split-Screen Document Scanner Modal */}
      <SplitScreenScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onCustomerEncoded={handleCustomerEncoded}
      />

      {/* Slide-over Customer Profile & Document Audit Drawer */}
      <CustomerDetailDrawer
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        onUpdate={handleUpdateCustomer}
        onDelete={handleDeleteCustomer}
        onOpenDocumentPreview={(dataUrl, fileName) =>
          setPreviewDoc({ dataUrl, fileName })
        }
      />

      {/* Quick Manual Record Modal */}
      <ManualCustomerModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSave={handleManualSave}
      />

      {/* Full-size High-Res Document Previewer Modal */}
      <DocumentPreviewModal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        dataUrl={previewDoc?.dataUrl || ''}
        fileName={previewDoc?.fileName || ''}
      />
    </div>
  );
}
