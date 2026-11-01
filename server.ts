import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// High limit for base64 images and PDFs
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Document scanning & OCR extraction endpoint using Gemini 3.8 Flash
app.post('/api/scan-document', async (req, res) => {
  try {
    const { fileBase64, mimeType } = req.body;

    if (!fileBase64) {
      return res.status(400).json({
        error: 'Missing fileBase64 in request body.',
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please check your environment variables.',
      });
    }

    // Parse and normalize base64 payload and MIME type
    let cleanMime = mimeType || 'image/jpeg';
    let base64Data = fileBase64;

    if (fileBase64.startsWith('data:')) {
      const commaIdx = fileBase64.indexOf(',');
      if (commaIdx !== -1) {
        const header = fileBase64.substring(0, commaIdx);
        const dataPayload = fileBase64.substring(commaIdx + 1);

        const mimeMatch = header.match(/^data:([^;,]+)/);
        if (mimeMatch && mimeMatch[1]) {
          cleanMime = mimeMatch[1].trim();
        }

        if (header.includes(';base64')) {
          base64Data = dataPayload.trim();
        } else {
          // If URL-encoded (e.g. svg text), decode and convert to standard base64
          try {
            const decoded = decodeURIComponent(dataPayload);
            base64Data = Buffer.from(decoded, 'utf-8').toString('base64');
          } catch {
            base64Data = Buffer.from(dataPayload, 'utf-8').toString('base64');
          }
        }
      }
    } else {
      base64Data = fileBase64.trim();
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const promptText = `You are an expert customer record intake and OCR transcription assistant.
Analyze the provided document (which may be a handwritten intake sheet, identity card, driver license, passport, signed application form, membership slip, invoice, or receipt).
Transcribe and extract the customer's personal, contact, and identity data with highest fidelity.

Extract the following customer fields:
- fullName: Customer's complete first and last name.
- email: Valid email address if mentioned, or empty string.
- phone: Telephone/mobile number including area or country code if visible, or empty string.
- streetAddress: Physical street address or PO box.
- city: City or municipality name.
- stateOrProvince: State, province, or region.
- postalCode: Postal code / ZIP code.
- idType: Type of document or customer identity presented (e.g., "Driver's License", "Passport", "National ID", "Membership Card", "Registration Form").
- idNumber: The unique identification number, license number, or registration code.
- dateOfBirth: Date of birth in YYYY-MM-DD or standard readable format if present, else empty string.
- notes: Any special notes, customer preferences, emergency contact, or handwritten annotations present on the document.
- confidenceScore: An estimated integer from 0 to 100 reflecting the legibility and certainty of the extracted handwriting or text.
- summary: A brief 1-sentence description of the processed document.

If any field cannot be found or is completely illegible, provide an empty string for that field. Do not invent synthetic details.`;

    const partsContent = cleanMime.includes('svg')
      ? [
          {
            text: `Here is the SVG document source markup containing the customer registration data:\n\`\`\`xml\n${Buffer.from(base64Data, 'base64').toString('utf-8')}\n\`\`\`\n\n${promptText}`,
          },
        ]
      : [
          {
            inlineData: {
              mimeType: cleanMime,
              data: base64Data,
            },
          },
          {
            text: promptText,
          },
        ];

    const candidateModels = ['gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-2.5-flash'];
    let response: any = null;
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: {
            parts: partsContent,
          },
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                fullName: { type: Type.STRING, description: 'Full customer name' },
                email: { type: Type.STRING, description: 'Customer email' },
                phone: { type: Type.STRING, description: 'Customer phone number' },
                streetAddress: { type: Type.STRING, description: 'Street address' },
                city: { type: Type.STRING, description: 'City' },
                stateOrProvince: { type: Type.STRING, description: 'State or province' },
                postalCode: { type: Type.STRING, description: 'Postal or ZIP code' },
                idType: { type: Type.STRING, description: 'Type of ID document' },
                idNumber: { type: Type.STRING, description: 'ID number or code' },
                dateOfBirth: { type: Type.STRING, description: 'Date of birth' },
                notes: { type: Type.STRING, description: 'Handwritten remarks or notes' },
                confidenceScore: { type: Type.INTEGER, description: 'Confidence score 0-100' },
                summary: { type: Type.STRING, description: 'Document summary' },
              },
              required: ['fullName'],
            },
          },
        });
        if (response && response.text) {
          console.log(`Successfully processed document using ${modelName}`);
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${modelName} failed:`, err.message || err);
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error('Gemini model returned empty response.');
    }

    const rawText = response.text;
    const customerData = JSON.parse(rawText);
    return res.json({
      success: true,
      data: customerData,
    });
  } catch (error: any) {
    console.error('Scan document error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze document with Gemini AI.',
    });
  }
});

// Serve frontend: Vite middlewares in dev, static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
