import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  FileText,
  Clock,
  Sparkles,
  Trash2,
  Edit2,
  Check,
  ExternalLink,
  Printer,
} from 'lucide-react';
import { CustomerRecord } from '../types/customer';

interface CustomerDetailDrawerProps {
  customer: CustomerRecord | null;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<CustomerRecord>) => void;
  onDelete: (id: string) => void;
  onOpenDocumentPreview?: (dataUrl: string, fileName: string) => void;
}

export const CustomerDetailDrawer: React.FC<CustomerDetailDrawerProps> = ({
  customer,
  onClose,
  onUpdate,
  onDelete,
  onOpenDocumentPreview,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<Partial<CustomerRecord>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  if (!customer) return null;

  const handleStartEdit = () => {
    setFormData({
      fullName: customer.fullName,
      email: customer.email,
      phone: customer.phone,
      streetAddress: customer.streetAddress,
      city: customer.city,
      stateOrProvince: customer.stateOrProvince,
      postalCode: customer.postalCode,
      idType: customer.idType,
      idNumber: customer.idNumber,
      dateOfBirth: customer.dateOfBirth,
      notes: customer.notes,
    });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    onUpdate(customer.id, formData);
    setIsEditing(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden animate-slideIn">
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-slate-500">
                {customer.id}
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-emerald-700 font-medium">Encoded Record</span>
            </div>
            <h2 className="font-display font-bold text-lg text-slate-900 mt-0.5">
              {customer.fullName}
            </h2>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrint}
              title="Print Customer Card"
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Source Document Card (Audit Trail) */}
          {customer.sourceDocument && (
            <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-200">
                    Source Document Audit
                  </span>
                </div>
                {customer.confidenceScore && (
                  <span className="text-xs font-mono font-bold text-emerald-400 tabular-nums">
                    {customer.confidenceScore}% confidence
                  </span>
                )}
              </div>

              {/* Document thumbnail / preview if available */}
              {customer.sourceDocument.previewDataUrl && (
                <div className="relative aspect-[16/9] bg-slate-950 rounded-lg overflow-hidden mb-3 border border-slate-800 group">
                  <img
                    src={customer.sourceDocument.previewDataUrl}
                    alt={customer.sourceDocument.fileName}
                    className="w-full h-full object-contain"
                  />
                  {onOpenDocumentPreview && (
                    <button
                      type="button"
                      onClick={() =>
                        onOpenDocumentPreview(
                          customer.sourceDocument!.previewDataUrl!,
                          customer.sourceDocument!.fileName
                        )
                      }
                      className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-xs font-semibold text-white"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View High-Res Scan
                    </button>
                  )}
                </div>
              )}

              <div className="text-xs text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>File:</span>
                  <span className="font-medium text-slate-200 truncate max-w-[240px]">
                    {customer.sourceDocument.fileName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Scanned at:</span>
                  <span className="font-mono text-slate-300">
                    {new Date(customer.sourceDocument.scannedAt).toLocaleString()}
                  </span>
                </div>
                {customer.documentSummary && (
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300 italic">
                    "{customer.documentSummary}"
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Customer Details Form / View */}
          {!isEditing ? (
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Customer Profile
                </h3>
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit Details
                </button>
              </div>

              {/* Identification details */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-start gap-3">
                  <CreditCard className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs text-slate-500">Identification Document</div>
                    <div className="font-medium text-slate-900">
                      {customer.idType || 'Standard ID'}{' '}
                      <span className="font-mono text-indigo-600 ml-1">
                        {customer.idNumber || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {customer.dateOfBirth && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs text-slate-500">Date of Birth</div>
                      <div className="font-mono text-slate-900">{customer.dateOfBirth}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs text-slate-500">Email Address</div>
                    {customer.email ? (
                      <a
                        href={`mailto:${customer.email}`}
                        className="text-indigo-600 hover:underline font-medium"
                      >
                        {customer.email}
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">Not provided</span>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs text-slate-500">Phone Number</div>
                    {customer.phone ? (
                      <a
                        href={`tel:${customer.phone}`}
                        className="text-indigo-600 hover:underline font-mono"
                      >
                        {customer.phone}
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">Not provided</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Physical Address */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs text-slate-500">Registered Address</div>
                    <div className="font-medium text-slate-900">
                      {customer.streetAddress || 'No street specified'}
                    </div>
                    <div className="text-slate-600 text-xs mt-0.5">
                      {[customer.city, customer.stateOrProvince, customer.postalCode]
                        .filter(Boolean)
                        .join(', ') || 'Location details pending'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Intake Notes */}
              {customer.notes && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs text-slate-500">Intake Notes &amp; Remarks</div>
                      <p className="text-slate-700 text-xs mt-1 leading-relaxed whitespace-pre-wrap">
                        {customer.notes}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="pt-2 text-xs text-slate-400 flex items-center justify-between border-t border-slate-200">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> First Encoded:
                </span>
                <span className="font-mono">
                  {new Date(customer.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ) : (
            /* Edit Mode */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Edit Customer Information
                </h3>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.fullName || ''}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    ID Type
                  </label>
                  <input
                    type="text"
                    value={formData.idType || ''}
                    onChange={(e) => setFormData({ ...formData, idType: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:border-indigo-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    ID Number
                  </label>
                  <input
                    type="text"
                    value={formData.idNumber || ''}
                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:border-indigo-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Date of Birth
                </label>
                <input
                  type="text"
                  value={formData.dateOfBirth || ''}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.streetAddress || ''}
                  onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:border-indigo-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">State</label>
                  <input
                    type="text"
                    value={formData.stateOrProvince || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, stateOrProvince: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:border-indigo-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Postal</label>
                  <input
                    type="text"
                    value={formData.postalCode || ''}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-mono focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Intake Notes
                </label>
                <textarea
                  rows={3}
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:border-indigo-600 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium inline-flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Record
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-600 font-medium">Delete customer?</span>
              <button
                type="button"
                onClick={() => {
                  onDelete(customer.id);
                  onClose();
                }}
                className="px-2.5 py-1 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md"
              >
                Yes, Delete
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-2 py-1 text-xs text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
