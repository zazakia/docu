import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Camera,
  FileText,
  Sparkles,
  Loader2,
  AlertCircle,
  FileCheck2,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import { ExtractedCustomerData, CustomerRecord } from '../types/customer';
import { DocumentViewer } from './DocumentViewer';
import { ExtractionForm } from './ExtractionForm';
import { CameraCaptureModal } from './CameraCaptureModal';
import { SAMPLE_DOCUMENTS, SampleDoc, rasterizeSvgToPngDataUrl } from '../utils/sampleDocuments';

interface SplitScreenScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerEncoded: (recordData: Omit<CustomerRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

type ScanModalStep = 'source_picker' | 'analyzing' | 'split_verification';

export const SplitScreenScanModal: React.FC<SplitScreenScanModalProps> = ({
  isOpen,
  onClose,
  onCustomerEncoded,
}) => {
  const [step, setStep] = useState<ScanModalStep>('source_picker');
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [documentDataUrl, setDocumentDataUrl] = useState<string>('');
  const [documentMimeType, setDocumentMimeType] = useState<string>('image/jpeg');
  const [documentFileName, setDocumentFileName] = useState<string>('');
  const [documentFileSize, setDocumentFileSize] = useState<number | undefined>(undefined);
  const [extractedData, setExtractedData] = useState<ExtractedCustomerData | null>(null);
  const [scanningError, setScanningError] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const resetModal = () => {
    setStep('source_picker');
    setDocumentDataUrl('');
    setDocumentFileName('');
    setDocumentFileSize(undefined);
    setExtractedData(null);
    setScanningError(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  // Process the selected file data (dataUrl, mime, name) through Gemini API
  const processDocumentWithGemini = async (
    dataUrl: string,
    mimeType: string,
    fileName: string,
    fileSize?: number
  ) => {
    setDocumentDataUrl(dataUrl);
    setDocumentMimeType(mimeType);
    setDocumentFileName(fileName);
    setDocumentFileSize(fileSize);
    setScanningError(null);
    setStep('analyzing');

    try {
      const response = await fetch('/api/scan-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileBase64: dataUrl,
          mimeType: mimeType,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to process document with Gemini AI.');
      }

      setExtractedData(result.data);
      setStep('split_verification');
    } catch (err: any) {
      console.error('Scan error:', err);
      setScanningError(err.message || 'Error occurred while contacting Gemini extraction service.');
      setStep('source_picker');
    }
  };

  // Handle file input selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      let resultStr = reader.result as string;
      let mime = file.type || 'image/jpeg';
      let name = file.name;

      if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
        resultStr = await rasterizeSvgToPngDataUrl(resultStr);
        mime = 'image/png';
        name = file.name.replace(/\.svg$/i, '.png');
      }

      processDocumentWithGemini(resultStr, mime, name, file.size);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Handle Drag & Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      let resultStr = reader.result as string;
      let mime = file.type || 'image/jpeg';
      let name = file.name;

      if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
        resultStr = await rasterizeSvgToPngDataUrl(resultStr);
        mime = 'image/png';
        name = file.name.replace(/\.svg$/i, '.png');
      }

      processDocumentWithGemini(resultStr, mime, name, file.size);
    };
    reader.readAsDataURL(file);
  };

  // Handle Camera Capture
  const handleCameraCapture = (imageDataUrl: string) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    processDocumentWithGemini(
      imageDataUrl,
      'image/jpeg',
      `camera_scan_${timestamp}.jpg`,
      Math.round((imageDataUrl.length * 3) / 4)
    );
  };

  // Handle Sample Document selection
  const handleSelectSample = async (sample: SampleDoc) => {
    setStep('analyzing');
    const rawDataUrl = sample.getDataUrl();
    const pngDataUrl = await rasterizeSvgToPngDataUrl(rawDataUrl);
    processDocumentWithGemini(
      pngDataUrl,
      'image/png',
      `${sample.id}_sample.png`,
      pngDataUrl.length
    );
  };

  // Handle final verification save
  const handleFinalSave = (finalData: ExtractedCustomerData) => {
    onCustomerEncoded({
      fullName: finalData.fullName,
      email: finalData.email,
      phone: finalData.phone,
      streetAddress: finalData.streetAddress,
      city: finalData.city,
      stateOrProvince: finalData.stateOrProvince,
      postalCode: finalData.postalCode,
      idType: finalData.idType || 'Document Verified',
      idNumber: finalData.idNumber,
      dateOfBirth: finalData.dateOfBirth,
      notes: finalData.notes,
      confidenceScore: finalData.confidenceScore,
      documentSummary: finalData.summary,
      sourceDocument: {
        fileName: documentFileName,
        fileType: documentMimeType,
        fileSize: documentFileSize,
        previewDataUrl: documentDataUrl,
        scannedAt: new Date().toISOString(),
      },
    });

    handleClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
        <div
          className={`bg-white rounded-2xl w-full flex flex-col border border-slate-200 shadow-2xl transition-all ${
            step === 'split_verification'
              ? 'max-w-[1560px] h-[92vh]'
              : 'max-w-3xl max-h-[90vh]'
          } overflow-hidden`}
        >
          {/* Top Modal Navigation Header */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50/70 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/10 text-indigo-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-display font-semibold text-base text-slate-900 flex items-center gap-2">
                  <span>Customer Document Encoding</span>
                  {step === 'split_verification' && (
                    <span className="text-xs text-indigo-700 font-medium">
                      Split-Screen Review
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-500">
                  {step === 'split_verification'
                    ? 'Verify extracted data against the scanned document before committing to database.'
                    : 'Upload any written document, scanned PDF, image, or use camera to convert to customer data.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {step === 'split_verification' && (
                <button
                  type="button"
                  onClick={() => setStep('source_picker')}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Scan Another Document
                </button>
              )}
              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto">
            {/* STEP 1: SOURCE PICKER */}
            {step === 'source_picker' && (
              <div className="p-6 md:p-8 space-y-6">
                {scanningError && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-rose-800">Document Processing Issue</p>
                      <p>{scanningError}</p>
                    </div>
                  </div>
                )}

                {/* Main Ingestion Box (Upload & Camera) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* File Upload Dropzone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingFile(true);
                    }}
                    onDragLeave={() => setIsDraggingFile(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-8 border-2 border-dashed rounded-xl cursor-pointer flex flex-col items-center justify-center text-center transition-all ${
                      isDraggingFile
                        ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]'
                        : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                      <Upload className="w-6 h-6" />
                    </div>
                    <h3 className="font-display font-semibold text-sm text-slate-900 mb-1">
                      Upload Document or PDF
                    </h3>
                    <p className="text-xs text-slate-500 mb-3 max-w-[220px]">
                      Drag and drop PDF documents, JPG, PNG, or phone photos here
                    </p>
                    <span className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-lg">
                      Browse Files
                    </span>
                  </div>

                  {/* Direct Camera Capture */}
                  <div
                    onClick={() => setIsCameraOpen(true)}
                    className="p-8 border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/30 rounded-xl cursor-pointer flex flex-col items-center justify-center text-center transition-all"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                      <Camera className="w-6 h-6" />
                    </div>
                    <h3 className="font-display font-semibold text-sm text-slate-900 mb-1">
                      Live Camera Scanner
                    </h3>
                    <p className="text-xs text-slate-500 mb-3 max-w-[220px]">
                      Use your device webcam or phone camera to snap paper documents
                    </p>
                    <span className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-lg">
                      Open Camera
                    </span>
                  </div>
                </div>

                {/* Fast One-Click Test Documents Section */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Or Test Instantly with Sample Documents
                    </h3>
                    <span className="text-xs text-slate-400">1-click test</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {SAMPLE_DOCUMENTS.map((sample) => (
                      <button
                        key={sample.id}
                        type="button"
                        onClick={() => handleSelectSample(sample)}
                        className="p-4 text-left border border-slate-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                            <span className="font-semibold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {sample.title}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium mb-1">
                            {sample.subtitle}
                          </p>
                          <p className="text-[11px] text-slate-400 line-clamp-2">
                            {sample.description}
                          </p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-indigo-600">
                          <span>Scan this document</span>
                          <span>&rarr;</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: ANALYZING SPINNER */}
            {step === 'analyzing' && (
              <div className="p-12 sm:p-20 flex flex-col items-center justify-center text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 animate-pulse">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <Loader2 className="w-20 h-20 text-indigo-600 animate-spin absolute -top-2 -left-2" />
                </div>

                <h3 className="font-display font-semibold text-lg text-slate-900 mb-2">
                  Gemini AI Analyzing Document...
                </h3>
                <p className="text-xs text-slate-500 max-w-md mb-6 leading-relaxed">
                  Reading handwritten penmanship, parsing customer credentials, and structuring
                  identifying information into customer records...
                </p>

                <div className="max-w-xs w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-indigo-600 h-full w-2/3 animate-[pulse_1.5s_ease-in-out_infinite]" />
                </div>
              </div>
            )}

            {/* STEP 3: SPLIT-SCREEN VERIFICATION */}
            {step === 'split_verification' && extractedData && (
              <div className="p-4 sm:p-6 h-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 h-full min-h-[550px]">
                  {/* Left Side: Document Viewer */}
                  <div className="h-[480px] lg:h-full">
                    <DocumentViewer
                      dataUrl={documentDataUrl}
                      mimeType={documentMimeType}
                      fileName={documentFileName}
                      fileSize={documentFileSize}
                    />
                  </div>

                  {/* Right Side: Extracted Customer Form */}
                  <div className="h-[520px] lg:h-full">
                    <ExtractionForm
                      initialData={extractedData}
                      confidenceScore={extractedData.confidenceScore}
                      documentSummary={extractedData.summary}
                      onSave={handleFinalSave}
                      onCancel={() => setStep('source_picker')}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Camera Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </>
  );
};
