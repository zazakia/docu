# Customer Encoding System & Intelligent Document Digitizer

A dedicated customer record management and document digitization workspace. The application enables operators to upload or capture photos of physical handwritten registration sheets, PDF applications, ID cards, and intake forms, uses Gemini 3.8 Flash to extract structured customer records, and provides a split-screen verification interface for immediate review before committing records to the customer database.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and UX specifications have been aligned based on your responses:

- **Confirmed Data Model**: Personal & contact details focus—Full Name, Phone Number, Email Address, Physical Street Address / City, Government/Customer ID Type & Number, Date of Birth, and Intake Notes.
- **Confirmed Verification Workflow**: Split-screen review environment displaying the raw scanned document (with zoom, rotate, and pan controls) on the left side, side-by-side with an auto-populated, editable customer form on the right side with field-by-field verification status before saving.
- **Confirmed Input Ingestion**: Dual capture capabilities supporting both drag-and-drop document/file uploads (PDF documents, PNG, JPG, WebP) and direct in-browser live device camera capture with alignment guide frame and freeze-frame review.
- **Recommended Persistence**: Local persistent storage with pre-seeded realistic customer records, search, filter, inline edit, delete, and 1-click CSV/JSON export for external CRM integration.

---

## 1. Overview & Core Concept

### What It Does
The Customer Encoding System streamlines customer intake and record onboarding. Instead of slow and error-prone manual typing, operators can upload or photograph handwritten or printed customer forms (registration cards, membership slips, business cards, ID badges, or application PDFs). The system sends the document to a server-side Gemini 3.8 Flash multimodal endpoint with a strict structured JSON schema, automatically extracting customer entities. The operator reviews the extracted values directly next to the original document in a split-screen view, makes any rapid edits or corrections, and saves the customer record directly into a searchable database table.

### Target Audience & Persona
- Intake clerks, front-desk administrators, retail operators, clinic coordinators, and field agents who handle physical paperwork or scanned customer documents and need to digitize them into a structured database rapidly.

### Key Value
- **Up to 80% reduction in data entry time** by converting physical handwriting and documents directly into typed fields.
- **Zero data hallucinations & human-in-the-loop safety**: Side-by-side verification prevents transcription errors before database commitment.
- **All-in-one ingestion**: Handles both digital documents (PDFs, scans) and mobile/webcam physical camera snaps.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Document Intake (Upload or Camera Capture)**:
   - User lands on the main customer dashboard.
   - User clicks **"Scan Document"** in the top action bar or uses the drag-and-drop ingestion dropzone.
   - User can switch between **File Upload** (PDF, PNG, JPG) or **Live Camera** (accesses camera with real-time video feed and "Snap Document" trigger).
   - Sample test documents (handwritten intake form, printed membership card, clinic registration PDF scan) are provided for instant 1-click testing.

2. **AI Document Processing & Extraction**:
   - While processing, a non-blocking progress status displays the extraction stage (image pre-processing $\rightarrow$ Gemini multimodal analysis $\rightarrow$ schema validation).
   - Server-side Gemini 3.8 Flash analyzes the document content, extracting:
     - `fullName`, `email`, `phone`, `streetAddress`, `city`, `stateOrProvince`, `postalCode`, `idType`, `idNumber`, `dateOfBirth`, `notes`, and extraction confidence level.

3. **Split-Screen Review & Verification Workspace**:
   - **Left Pane (50%)**: Interactive document previewer supporting zoom in/out, pan, rotate 90°, and page navigation for multi-page documents.
   - **Right Pane (50%)**: Clean, structured customer form pre-filled with the extracted fields. Each field features an individual confirmation indicator and editable input.
   - Operator checks values against the document, adjusts any handwritten ambiguity, and clicks **"Confirm & Save Customer"** or **"Cancel"**.

4. **Customer Ledger & Record Management**:
   - High-density data grid displaying all saved customer records.
   - Real-time instant search by name, email, phone, ID, or city.
   - Sorting by registration date, name, or ID.
   - Detailed side drawer displaying full customer history, intake timestamps, and a linked preview of the original source document snapshot.
   - Actions to edit, delete, export records to CSV or JSON, or add manual records.

### Visual Identity & Theme
- **Aesthetic Direction**: High-efficiency, professional SaaS workstation (inspired by linear data tools and document intelligence software).
- **Typography**: 
  - Brand & Section Headers: `Plus Jakarta Sans` (crisp, modern geometric sans).
  - Body & Form Labels: `DM Sans` (highly legible at 12–14px density).
  - Data Numerals, IDs & Timestamps: `JetBrains Mono` / `tabular-nums` for rock-solid tabular alignment.
- **Color Palette (60-30-10 discipline)**:
  - 60% Canvas: Slate neutral canvas (`bg-slate-50 dark:bg-slate-950`).
  - 30% Structural Surfaces: Crisp white cards with hairline borders (`bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800`).
  - 10% Accent: Deep indigo/blue (`bg-indigo-600 hover:bg-indigo-700 text-white`) for primary scan and save actions, accompanied by emerald for verified status tags.
- **Anti-Slop Discipline**:
  - No decorative status dots or fake latency metrics.
  - Unboxed metadata using subtle typographic separators (`·` or `/`).
  - Strict Top Bar Contract: Wordmark on left, clean navigation links in center, single primary action ("Scan Document") on right.

---

## 3. Key Product Decisions & Trade-Offs

- **Server-Side Gemini Integration**:
  - *Chosen Approach*: Node.js/Express server proxy at `/api/scan-document` using the official `@google/genai` TypeScript SDK with `model: "gemini-3.8-flash"`.
  - *Why*: Keeps the `GEMINI_API_KEY` protected on the server, allows robust payload handling for large images/PDFs, and configures `responseSchema` with `Type.OBJECT` for strict typed JSON output without messy markdown parsing.
- **Multimodal Payload Ingestion**:
  - *Chosen Approach*: Handle standard Base64 inline data for image formats (`image/jpeg`, `image/png`, `image/webp`) and PDF (`application/pdf`).
  - *Why*: Gemini 3.8 Flash natively supports both image OCR and direct PDF document understanding, allowing seamless single-pipeline ingestion.
- **Camera Capture Architecture**:
  - *Chosen Approach*: Native HTML5 `navigator.mediaDevices.getUserMedia` video stream rendered onto an offscreen canvas for snapshot extraction.
  - *Why*: Zero external heavyweight dependencies, immediate cross-platform browser support, and instant high-res snapshot capture.
- **Client Persistence**:
  - *Chosen Approach*: Browser `localStorage` with initial seed records and automatic sync, coupled with full CSV/JSON export and import capabilities.
  - *Why*: Instant reactivity, offline availability, zero configuration overhead for operators, and easy portable data export.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Frontend (React 19 + Vite)                       │
├──────────────────────────────────────┬──────────────────────────────────────┤
│ Main Navigation & Top Bar            │  [Customer Ledger Table & Search]    │
│  - Filter / Search / Sort            │  - High-density tabular data         │
│  - Quick CSV / JSON Export           │  - View details / Edit / Delete      │
├──────────────────────────────────────┴──────────────────────────────────────┤
│ Intake Modal / Workspace                                                    │
│  ┌───────────────────────────────────┬───────────────────────────────────┐  │
│  │ Document Intake Pane              │ Extraction Verification Form      │  │
│  │  - File Upload (PDF, PNG, JPG)    │  - Full Name, Phone, Email        │  │
│  │  - Live Webcam Stream & Snapshot  │  - Address, City, Postal Code     │  │
│  │  - Sample Pre-loaded Documents    │  - ID Type & ID Number            │  │
│  │  - Zoom / Rotate / Pan Controls   │  - Notes & Confidence Rating      │  │
│  └───────────────────────────────────┴───────────────────────────────────┘  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ POST /api/scan-document
                                       ▼ (Base64 file data + MIME type)
┌─────────────────────────────────────────────────────────────────────────────┐
│                     Backend Proxy Server (Express + tsx)                     │
│  - Validates payload format & size                                          │
│  - Initializes GoogleGenAI SDK with process.env.GEMINI_API_KEY              │
│  - Passes system instructions: "Extract all customer details accurately..."  │
│  - Enforces responseSchema with strict typed fields                         │
│  - Returns parsed CustomerData JSON to client                               │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Gemini API Call
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                 Google Gemini 3.8 Flash Multimodal Engine                    │
│  - Analyzes handwritten, printed, and PDF document contents                 │
│  - Extracts name, contact info, address, IDs, and dates                     │
│  - Returns formatted structured JSON payload                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Model (`CustomerRecord`)

```typescript
export interface CustomerRecord {
  id: string;               // UUID or nanoid
  fullName: string;         // Customer's full legal or preferred name
  email: string;            // Contact email address
  phone: string;            // Contact phone number with country/area code
  streetAddress: string;    // Street address / building / unit
  city: string;             // City or municipality
  stateOrProvince: string;  // State, province, or region
  postalCode: string;       // ZIP / Postal code
  idType: string;           // e.g., 'Driver License', 'Passport', 'National ID', 'Customer Card'
  idNumber: string;         // Unique ID alphanumeric string
  dateOfBirth?: string;     // YYYY-MM-DD or formatted date string
  notes?: string;           // Handwritten remarks, preferences, intake context
  createdAt: string;        // ISO timestamp
  updatedAt: string;        // ISO timestamp
  sourceDocument?: {        // Audit trail linking extracted document
    fileName: string;
    fileType: string;
    previewDataUrl?: string; // Stored thumbnail or snapshot data
    extractedAt: string;
  };
}
```

### Server Endpoint (`/api/scan-document`)
- **Route**: `POST /api/scan-document`
- **Request Body**:
  ```json
  {
    "fileBase64": "...",
    "mimeType": "image/jpeg" | "image/png" | "application/pdf"
  }
  ```
- **Gemini Config**:
  - `model`: `"gemini-3.8-flash"`
  - `responseMimeType`: `"application/json"`
  - `responseSchema`: Typed schema matching `fullName`, `email`, `phone`, `streetAddress`, `city`, `stateOrProvince`, `postalCode`, `idType`, `idNumber`, `dateOfBirth`, `notes`.
  - `systemInstruction`: "You are an expert document encoding and OCR extraction assistant. Extract all customer registration and personal identity details from the provided document image or PDF. If handwriting is ambiguous, provide the most plausible reading. Return only valid structured data."
