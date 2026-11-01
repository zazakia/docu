import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Download,
  Filter,
  FileText,
  Trash2,
  Eye,
  Mail,
  Phone,
  CreditCard,
  MapPin,
  Sparkles,
  ArrowUpDown,
  CheckCircle2,
  Calendar,
  X,
  RotateCcw,
} from 'lucide-react';
import { CustomerRecord } from '../types/customer';

interface CustomerTableProps {
  customers: CustomerRecord[];
  onSelectCustomer: (customer: CustomerRecord) => void;
  onDeleteCustomer: (id: string) => void;
  onOpenScan: () => void;
  onOpenManualModal: () => void;
  onExportCsv: () => void;
  onExportJson: () => void;
}

type DateFilterOption = 'all' | 'today' | 'last_7_days' | 'last_30_days' | 'custom';
type SortOption = 'date_desc' | 'date_asc' | 'name_asc' | 'name_desc';

export const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  onSelectCustomer,
  onDeleteCustomer,
  onOpenScan,
  onOpenManualModal,
  onExportCsv,
  onExportJson,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('all');
  const [customDate, setCustomDate] = useState<string>('');
  const [selectedIdType, setSelectedIdType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date_desc');

  // Derive unique ID types from records
  const availableIdTypes = useMemo(() => {
    const types = new Set<string>();
    customers.forEach((c) => {
      if (c.idType) types.add(c.idType);
    });
    return Array.from(types);
  }, [customers]);

  // Date match checker
  const checkDateMatch = (createdAtStr: string): boolean => {
    if (dateFilter === 'all') return true;
    const recordDate = new Date(createdAtStr);
    const now = new Date();

    if (dateFilter === 'today') {
      return (
        recordDate.getFullYear() === now.getFullYear() &&
        recordDate.getMonth() === now.getMonth() &&
        recordDate.getDate() === now.getDate()
      );
    }

    if (dateFilter === 'last_7_days') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      return recordDate >= sevenDaysAgo;
    }

    if (dateFilter === 'last_30_days') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
      thirtyDaysAgo.setHours(0, 0, 0, 0);
      return recordDate >= thirtyDaysAgo;
    }

    if (dateFilter === 'custom' && customDate) {
      // Compare calendar YYYY-MM-DD
      const recordYmd = new Date(recordDate.getTime() - recordDate.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10);
      return recordYmd === customDate;
    }

    return true;
  };

  // Filter and sort customers
  const filteredCustomers = useMemo(() => {
    return customers
      .filter((c) => {
        // Name and content search
        const query = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !query ||
          c.fullName.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query) ||
          c.phone.toLowerCase().includes(query) ||
          c.idNumber.toLowerCase().includes(query) ||
          c.city.toLowerCase().includes(query) ||
          c.streetAddress.toLowerCase().includes(query) ||
          (c.dateOfBirth && c.dateOfBirth.toLowerCase().includes(query)) ||
          new Date(c.createdAt).toLocaleDateString().toLowerCase().includes(query) ||
          (c.notes && c.notes.toLowerCase().includes(query));

        // Date filter
        const matchesDate = checkDateMatch(c.createdAt);

        // ID type filter
        const matchesType =
          selectedIdType === 'all' ||
          (c.idType && c.idType.toLowerCase() === selectedIdType.toLowerCase());

        return matchesQuery && matchesDate && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else if (sortBy === 'date_asc') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        } else if (sortBy === 'name_asc') {
          return a.fullName.localeCompare(b.fullName);
        } else if (sortBy === 'name_desc') {
          return b.fullName.localeCompare(a.fullName);
        }
        return 0;
      });
  }, [customers, searchQuery, dateFilter, customDate, selectedIdType, sortBy]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    dateFilter !== 'all' ||
    customDate !== '' ||
    selectedIdType !== 'all';

  const handleClearFilters = () => {
    setSearchQuery('');
    setDateFilter('all');
    setCustomDate('');
    setSelectedIdType('all');
    setSortBy('date_desc');
  };

  const avgConfidence = useMemo(() => {
    const scored = customers.filter((c) => typeof c.confidenceScore === 'number');
    if (scored.length === 0) return 96;
    const total = scored.reduce((sum, c) => sum + (c.confidenceScore || 0), 0);
    return Math.round(total / scored.length);
  }, [customers]);

  return (
    <div className="space-y-4">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <div className="text-xs font-medium text-slate-500">Total Encoded Customers</div>
          <div className="text-2xl font-bold font-display text-slate-900 mt-1 tabular-nums">
            {customers.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Verified in persistent database</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <div className="text-xs font-medium text-slate-500">OCR Extraction Accuracy</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 mt-1 tabular-nums">
            {avgConfidence}%
          </div>
          <div className="text-xs text-slate-500 mt-1">Average confidence across scans</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Document Ingestion</div>
            <div className="text-2xl font-bold font-display text-indigo-600 mt-1">
              Gemini Vision
            </div>
            <div className="text-xs text-slate-500 mt-1">Multimodal vision OCR active</div>
          </div>
          <button
            onClick={onOpenScan}
            className="px-3 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            New Scan
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Table Controls Bar with Search and Filters */}
        <div className="p-4 border-b border-slate-200 flex flex-col gap-3 bg-slate-50/50">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Box */}
            <div className="relative flex-1 max-w-xl">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customers by name, phone, email, ID, or date..."
                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns and Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Date Filter Dropdown */}
              <div className="flex items-center gap-1.5">
                <div className="relative">
                  <select
                    value={dateFilter}
                    onChange={(e) => {
                      const val = e.target.value as DateFilterOption;
                      setDateFilter(val);
                      if (val !== 'custom') setCustomDate('');
                    }}
                    className={`pl-8 pr-7 py-2 text-xs bg-white border rounded-lg text-slate-700 focus:outline-none focus:border-indigo-600 appearance-none font-medium cursor-pointer ${
                      dateFilter !== 'all' ? 'border-indigo-400 ring-1 ring-indigo-400/20 text-indigo-900 bg-indigo-50/30' : 'border-slate-300'
                    }`}
                  >
                    <option value="all">All Dates</option>
                    <option value="today">Added Today</option>
                    <option value="last_7_days">Past 7 Days</option>
                    <option value="last_30_days">Past 30 Days</option>
                    <option value="custom">Specific Date...</option>
                  </select>
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <span className="text-[10px] text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">▼</span>
                </div>

                {/* Custom Date Picker (when Specific Date selected) */}
                {dateFilter === 'custom' && (
                  <div className="relative flex items-center">
                    <input
                      type="date"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      className="px-2.5 py-1.5 text-xs bg-white border border-indigo-400 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                    />
                    {customDate && (
                      <button
                        type="button"
                        onClick={() => setCustomDate('')}
                        className="ml-1 p-1 text-slate-400 hover:text-slate-600 rounded"
                        title="Clear date"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* ID Document Type Filter Dropdown */}
              {availableIdTypes.length > 0 && (
                <div className="relative">
                  <select
                    value={selectedIdType}
                    onChange={(e) => setSelectedIdType(e.target.value)}
                    className={`pl-8 pr-7 py-2 text-xs bg-white border rounded-lg text-slate-700 focus:outline-none focus:border-indigo-600 appearance-none font-medium cursor-pointer ${
                      selectedIdType !== 'all' ? 'border-indigo-400 ring-1 ring-indigo-400/20 text-indigo-900 bg-indigo-50/30' : 'border-slate-300'
                    }`}
                  >
                    <option value="all">All Document Types</option>
                    {availableIdTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <span className="text-[10px] text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">▼</span>
                </div>
              )}

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="pl-8 pr-7 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:border-indigo-600 appearance-none font-medium cursor-pointer"
                >
                  <option value="date_desc">Date: Newest First</option>
                  <option value="date_asc">Date: Oldest First</option>
                  <option value="name_asc">Name: A → Z</option>
                  <option value="name_desc">Name: Z → A</option>
                </select>
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <span className="text-[10px] text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">▼</span>
              </div>

              {/* Export Buttons */}
              <button
                onClick={onExportCsv}
                title="Download customer data as CSV spreadsheet"
                className="px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                CSV
              </button>
              <button
                onClick={onExportJson}
                title="Download customer data as JSON"
                className="px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5"
              >
                JSON
              </button>

              {/* Manual Entry Button */}
              <button
                onClick={onOpenManualModal}
                className="px-3 py-2 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Manual Entry
              </button>
            </div>
          </div>

          {/* Active Filters Summary Bar */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60 text-slate-600">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-slate-700">Active filters:</span>
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800">
                    Name/Query: "{searchQuery}"
                    <button onClick={() => setSearchQuery('')} className="hover:text-rose-500 ml-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {dateFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800">
                    Date: {dateFilter === 'today' ? 'Today' : dateFilter === 'last_7_days' ? 'Past 7 Days' : dateFilter === 'last_30_days' ? 'Past 30 Days' : customDate || 'Selected Day'}
                    <button onClick={() => { setDateFilter('all'); setCustomDate(''); }} className="hover:text-rose-500 ml-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedIdType !== 'all' && (
                  <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800">
                    Type: {selectedIdType}
                    <button onClick={() => setSelectedIdType('all')} className="hover:text-rose-500 ml-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <span className="text-slate-400">·</span>
                <span className="font-semibold text-indigo-600">
                  {filteredCustomers.length} {filteredCustomers.length === 1 ? 'match' : 'matches'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1 hover:underline ml-auto"
              >
                <RotateCcw className="w-3 h-3" />
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Customer Data Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px] tracking-wider">
                <th className="px-5 py-3">Customer &amp; ID Document</th>
                <th className="px-5 py-3">Contact Details</th>
                <th className="px-5 py-3">Address</th>
                <th className="px-5 py-3">ID Reference</th>
                <th className="px-5 py-3">Confidence &amp; Scan Source</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    onClick={() => onSelectCustomer(customer)}
                    className="hover:bg-indigo-50/40 cursor-pointer transition-colors group"
                  >
                    {/* Customer Name & Document */}
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                        {customer.fullName}
                      </div>
                      <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                        <CreditCard className="w-3 h-3 text-slate-400" />
                        <span>{customer.idType || 'Standard ID'}</span>
                        {customer.dateOfBirth && (
                          <>
                            <span className="text-slate-300">·</span>
                            <span>DOB: {customer.dateOfBirth}</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Contact Details */}
                    <td className="px-5 py-3.5">
                      {customer.email ? (
                        <div className="text-slate-800 flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[180px]">{customer.email}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No email</span>
                      )}
                      {customer.phone && (
                        <div className="text-slate-500 font-mono text-[11px] flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                    </td>

                    {/* Address */}
                    <td className="px-5 py-3.5">
                      <div className="text-slate-800 truncate max-w-[200px]">
                        {customer.streetAddress || 'No street listed'}
                      </div>
                      <div className="text-slate-500 text-[11px] truncate max-w-[200px]">
                        {[customer.city, customer.stateOrProvince, customer.postalCode]
                          .filter(Boolean)
                          .join(', ') || 'Location pending'}
                      </div>
                    </td>

                    {/* ID Reference Number */}
                    <td className="px-5 py-3.5">
                      <span className="font-mono font-medium text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {customer.idNumber || 'PENDING'}
                      </span>
                    </td>

                    {/* Confidence & Scan Source */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        {customer.confidenceScore ? (
                          <span className="font-mono text-emerald-700 font-bold tabular-nums">
                            {customer.confidenceScore}%
                          </span>
                        ) : (
                          <span className="text-slate-400">Manual</span>
                        )}
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-500 truncate max-w-[120px]">
                          {customer.sourceDocument?.fileName || 'Manual entry'}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[10px] mt-0.5">
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div
                        className="inline-flex items-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => onSelectCustomer(customer)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="View customer details and document audit"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteCustomer(customer.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete customer record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-6 h-6" />
                    </div>
                    <h4 className="font-semibold text-slate-900 text-sm mb-1">
                      {hasActiveFilters
                        ? 'No customers match your search or date filter'
                        : 'No customer records found'}
                    </h4>
                    <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
                      {hasActiveFilters
                        ? 'Try clearing your search query or selecting a different date range.'
                        : 'Scan a written document, intake sheet, or photo ID with Gemini AI to convert and encode customer data.'}
                    </p>
                    {hasActiveFilters ? (
                      <button
                        onClick={handleClearFilters}
                        className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors inline-flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset All Filters
                      </button>
                    ) : (
                      <button
                        onClick={onOpenScan}
                        className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-sm"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Scan Document Now
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Info */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 text-slate-500 text-xs flex items-center justify-between">
          <span>
            Showing <strong className="text-slate-800">{filteredCustomers.length}</strong> of{' '}
            <strong className="text-slate-800">{customers.length}</strong> customers
            {hasActiveFilters && ' (filtered)'}
          </span>
          <span className="text-[11px] text-slate-400">
            Click any row to view complete profile and scan audit trail
          </span>
        </div>
      </div>
    </div>
  );
};
