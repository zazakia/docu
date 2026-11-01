import { CustomerRecord } from '../types/customer';

const STORAGE_KEY = 'docuencode_customers_v1';

// Seed sample customer records if empty
const INITIAL_CUSTOMERS: CustomerRecord[] = [
  {
    id: 'cust_seed_101',
    fullName: 'Sophia Isabelle Chen',
    email: 'sophia.chen@pacifictech.io',
    phone: '+1 (415) 555-0192',
    streetAddress: '550 Montgomery Street, Suite 400',
    city: 'San Francisco',
    stateOrProvince: 'CA',
    postalCode: '94111',
    idType: "Driver's License",
    idNumber: 'CA-D8820491',
    dateOfBirth: '1991-06-24',
    notes: 'Key decision maker for enterprise SaaS licensing. Prefers paperless invoices.',
    confidenceScore: 98,
    documentSummary: 'State driver license and business card verification scan.',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    sourceDocument: {
      fileName: 'chen_drivers_license_scan.jpg',
      fileType: 'image/jpeg',
      scannedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
  },
  {
    id: 'cust_seed_102',
    fullName: 'Liam Patrick O’Connor',
    email: 'liam.oconnor@aurorabio.com',
    phone: '+1 (617) 555-0178',
    streetAddress: '100 Technology Square, 3rd Floor',
    city: 'Cambridge',
    stateOrProvince: 'MA',
    postalCode: '02139',
    idType: 'Passport',
    idNumber: 'USA-77391024',
    dateOfBirth: '1985-11-09',
    notes: 'Biotech lab coordinator. Requested expedited hardware shipping.',
    confidenceScore: 95,
    documentSummary: 'Signed client registration form and government passport photo page.',
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    sourceDocument: {
      fileName: 'oconnor_registration_form.pdf',
      fileType: 'application/pdf',
      scannedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    },
  },
  {
    id: 'cust_seed_103',
    fullName: 'Amina Zahra Al-Mansoor',
    email: 'amina.almansoor@globalfreight.net',
    phone: '+1 (312) 555-0115',
    streetAddress: '233 South Wacker Drive, Suite 120',
    city: 'Chicago',
    stateOrProvince: 'IL',
    postalCode: '60606',
    idType: 'National ID / Corporate ID',
    idNumber: 'IL-NID-492019',
    dateOfBirth: '1994-03-18',
    notes: 'Logistics director. Authorized for cross-border dispatch operations.',
    confidenceScore: 92,
    documentSummary: 'Handwritten intake memo verified against commercial ID.',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    sourceDocument: {
      fileName: 'amina_intake_sheet.png',
      fileType: 'image/png',
      scannedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
  },
];

export function getStoredCustomers(): CustomerRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CUSTOMERS));
      return INITIAL_CUSTOMERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_CUSTOMERS;
  } catch (e) {
    console.error('Failed to read customers from localStorage:', e);
    return INITIAL_CUSTOMERS;
  }
}

export function saveStoredCustomers(customers: CustomerRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
  } catch (e) {
    console.error('Failed to save customers to localStorage:', e);
  }
}

export function addStoredCustomer(data: Omit<CustomerRecord, 'id' | 'createdAt' | 'updatedAt'>): CustomerRecord {
  const customers = getStoredCustomers();
  const newRecord: CustomerRecord = {
    ...data,
    id: 'cust_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updated = [newRecord, ...customers];
  saveStoredCustomers(updated);
  return newRecord;
}

export function updateStoredCustomer(id: string, updates: Partial<CustomerRecord>): CustomerRecord | null {
  const customers = getStoredCustomers();
  let updatedRecord: CustomerRecord | null = null;
  const nextList = customers.map((c) => {
    if (c.id === id) {
      updatedRecord = {
        ...c,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      return updatedRecord;
    }
    return c;
  });

  if (updatedRecord) {
    saveStoredCustomers(nextList);
  }
  return updatedRecord;
}

export function deleteStoredCustomer(id: string): void {
  const customers = getStoredCustomers();
  const nextList = customers.filter((c) => c.id !== id);
  saveStoredCustomers(nextList);
}

export function exportCustomersCsv(customers: CustomerRecord[]): void {
  const headers = [
    'Customer ID',
    'Full Name',
    'Email',
    'Phone',
    'Street Address',
    'City',
    'State/Province',
    'Postal Code',
    'ID Type',
    'ID Number',
    'Date of Birth',
    'Confidence Score',
    'Document Summary',
    'Notes',
    'Encoded Date',
  ];

  const escapeCsv = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = customers.map((c) => [
    escapeCsv(c.id),
    escapeCsv(c.fullName),
    escapeCsv(c.email),
    escapeCsv(c.phone),
    escapeCsv(c.streetAddress),
    escapeCsv(c.city),
    escapeCsv(c.stateOrProvince),
    escapeCsv(c.postalCode),
    escapeCsv(c.idType),
    escapeCsv(c.idNumber),
    escapeCsv(c.dateOfBirth || ''),
    escapeCsv(c.confidenceScore || ''),
    escapeCsv(c.documentSummary || ''),
    escapeCsv(c.notes || ''),
    escapeCsv(c.createdAt),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `customer_records_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportCustomersJson(customers: CustomerRecord[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(customers, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', `customer_records_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
