import React, { useState } from 'react';
import { X, User, Plus, Check } from 'lucide-react';
import { CustomerRecord } from '../types/customer';

interface ManualCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<CustomerRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const ManualCustomerModal: React.FC<ManualCustomerModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [streetAddress, setStreetAddress] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [stateOrProvince, setStateOrProvince] = useState<string>('');
  const [postalCode, setPostalCode] = useState<string>('');
  const [idType, setIdType] = useState<string>("Driver's License");
  const [idNumber, setIdNumber] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Customer full name is required.');
      return;
    }

    onSave({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      streetAddress: streetAddress.trim(),
      city: city.trim(),
      stateOrProvince: stateOrProvince.trim(),
      postalCode: postalCode.trim(),
      idType: idType.trim(),
      idNumber: idNumber.trim(),
      dateOfBirth: dateOfBirth.trim(),
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-sm text-slate-900">
                Manual Customer Encoding
              </h3>
              <p className="text-xs text-slate-500">
                Create record directly without document scanner
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && <p className="text-xs text-rose-500">{error}</p>}

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Full Legal Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setError('');
              }}
              placeholder="e.g. Robert Smith"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">ID Type</label>
              <input
                type="text"
                value={idType}
                onChange={(e) => setIdType(e.target.value)}
                placeholder="Driver's License / Passport"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:border-indigo-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">ID Number</label>
              <input
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder="e.g. DL-4019283"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@example.com"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:border-indigo-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 0123"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Date of Birth</label>
            <input
              type="text"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              placeholder="YYYY-MM-DD"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Street Address
            </label>
            <input
              type="text"
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              placeholder="123 Main St, Apt 2"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="New York"
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:border-indigo-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">State</label>
              <input
                type="text"
                value={stateOrProvince}
                onChange={(e) => setStateOrProvince(e.target.value)}
                placeholder="NY"
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:border-indigo-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Postal</label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="10001"
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-mono focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Remarks &amp; Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes or account preferences..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:border-indigo-600 focus:outline-none resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
            >
              Save Customer Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
