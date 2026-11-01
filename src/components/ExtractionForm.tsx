import React, { useState } from 'react';
import { Check, Sparkles, AlertCircle, RotateCcw, User, Mail, Phone, MapPin, CreditCard, Calendar, FileText } from 'lucide-react';
import { ExtractedCustomerData } from '../types/customer';

interface ExtractionFormProps {
  initialData: ExtractedCustomerData;
  onSave: (finalData: ExtractedCustomerData) => void;
  onCancel: () => void;
  confidenceScore?: number;
  documentSummary?: string;
}

export const ExtractionForm: React.FC<ExtractionFormProps> = ({
  initialData,
  onSave,
  onCancel,
  confidenceScore,
  documentSummary,
}) => {
  const [formData, setFormData] = useState<ExtractedCustomerData>(initialData);
  const [modifiedFields, setModifiedFields] = useState<Set<keyof ExtractedCustomerData>>(new Set());
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (field: keyof ExtractedCustomerData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setModifiedFields((prev) => {
      const next = new Set(prev);
      if (value !== initialData[field]) {
        next.add(field);
      } else {
        next.delete(field);
      }
      return next;
    });

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleReset = () => {
    setFormData(initialData);
    setModifiedFields(new Set());
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Customer full name is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData);
  };

  const score = confidenceScore ?? formData.confidenceScore ?? 94;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Form Top Header with AI Confidence */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display font-semibold text-slate-900 text-base">
              Customer Data Verification
            </h3>
            <span className="text-xs text-indigo-700 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              AI Extracted
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-reference with document scan on left and adjust any ambiguous handwriting.
          </p>
        </div>

        {/* AI Confidence Meter */}
        <div className="text-right shrink-0">
          <div className="text-xs font-medium text-slate-500">Extraction Confidence</div>
          <div className="text-sm font-bold font-mono text-emerald-600 tabular-nums">
            {score}%
          </div>
        </div>
      </div>

      {/* Document Summary Banner */}
      {(documentSummary || formData.summary) && (
        <div className="px-6 py-2.5 bg-indigo-50/60 border-b border-indigo-100 text-xs text-indigo-950 flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
          <span className="truncate">{documentSummary || formData.summary}</span>
        </div>
      )}

      {/* Form Fields Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Full Name */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Full Legal Name <span className="text-rose-500">*</span>
            </label>
            {modifiedFields.has('fullName') && (
              <span className="text-[11px] text-amber-600 font-medium">User edited</span>
            )}
          </div>
          <input
            type="text"
            required
            value={formData.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            placeholder="e.g. Jane Doe"
            className={`w-full px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
              errors.fullName ? 'border-rose-400 focus:border-rose-500' : 'border-slate-300 focus:border-indigo-600'
            }`}
          />
          {errors.fullName && (
            <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.fullName}
            </p>
          )}
        </div>

        {/* ID Document Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                ID Document Type
              </label>
              {modifiedFields.has('idType') && (
                <span className="text-[11px] text-amber-600 font-medium">User edited</span>
              )}
            </div>
            <input
              type="text"
              value={formData.idType}
              onChange={(e) => handleChange('idType', e.target.value)}
              placeholder="e.g. Driver's License, Passport"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                ID / Reference Number
              </label>
              {modifiedFields.has('idNumber') && (
                <span className="text-[11px] text-amber-600 font-medium">User edited</span>
              )}
            </div>
            <input
              type="text"
              value={formData.idNumber}
              onChange={(e) => handleChange('idNumber', e.target.value)}
              placeholder="e.g. DL-9830219"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white font-mono focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* Contact Info (Email & Phone) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Email Address
              </label>
              {modifiedFields.has('email') && (
                <span className="text-[11px] text-amber-600 font-medium">User edited</span>
              )}
            </div>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="client@domain.com"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Phone Number
              </label>
              {modifiedFields.has('phone') && (
                <span className="text-[11px] text-amber-600 font-medium">User edited</span>
              )}
            </div>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white font-mono focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* Date of Birth */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Date of Birth
            </label>
            {modifiedFields.has('dateOfBirth') && (
              <span className="text-[11px] text-amber-600 font-medium">User edited</span>
            )}
          </div>
          <input
            type="text"
            value={formData.dateOfBirth}
            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
            placeholder="YYYY-MM-DD or readable birth date"
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Street Address */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Street Address
            </label>
            {modifiedFields.has('streetAddress') && (
              <span className="text-[11px] text-amber-600 font-medium">User edited</span>
            )}
          </div>
          <input
            type="text"
            value={formData.streetAddress}
            onChange={(e) => handleChange('streetAddress', e.target.value)}
            placeholder="e.g. 742 Evergreen Terrace, Apt 4"
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* City, State, Postal Code */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">City</label>
              {modifiedFields.has('city') && (
                <span className="text-[11px] text-amber-600 font-medium">Edited</span>
              )}
            </div>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="e.g. Seattle"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">State / Region</label>
              {modifiedFields.has('stateOrProvince') && (
                <span className="text-[11px] text-amber-600 font-medium">Edited</span>
              )}
            </div>
            <input
              type="text"
              value={formData.stateOrProvince}
              onChange={(e) => handleChange('stateOrProvince', e.target.value)}
              placeholder="e.g. WA"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Postal / ZIP</label>
              {modifiedFields.has('postalCode') && (
                <span className="text-[11px] text-amber-600 font-medium">Edited</span>
              )}
            </div>
            <input
              type="text"
              value={formData.postalCode}
              onChange={(e) => handleChange('postalCode', e.target.value)}
              placeholder="e.g. 98101"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white font-mono focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* Handwritten Remarks / Notes */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700">
              Customer Remarks &amp; Handwritten Notes
            </label>
            {modifiedFields.has('notes') && (
              <span className="text-[11px] text-amber-600 font-medium">User edited</span>
            )}
          </div>
          <textarea
            rows={3}
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Special instructions, dietary/intake notes, preferences..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 resize-none"
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {modifiedFields.size > 0 && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Changes
            </button>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm transition-colors"
        >
          <Check className="w-4 h-4" />
          Encode &amp; Commit Record
        </button>
      </div>
    </form>
  );
};
