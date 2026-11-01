export interface CustomerRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  stateOrProvince: string;
  postalCode: string;
  idType: string;
  idNumber: string;
  dateOfBirth?: string;
  notes?: string;
  confidenceScore?: number;
  documentSummary?: string;
  createdAt: string;
  updatedAt: string;
  sourceDocument?: {
    fileName: string;
    fileType: string;
    fileSize?: number;
    previewDataUrl?: string;
    scannedAt: string;
  };
}

export interface ExtractedCustomerData {
  fullName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  stateOrProvince: string;
  postalCode: string;
  idType: string;
  idNumber: string;
  dateOfBirth: string;
  notes: string;
  confidenceScore?: number;
  summary?: string;
}

export type ScanStep = 'select_source' | 'scanning' | 'verify_split';

export type FilterStatus = 'all' | 'verified_id' | 'recent_7_days';
