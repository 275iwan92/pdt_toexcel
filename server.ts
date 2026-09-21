import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

async function extractPdfTextServer(buffer: Buffer): Promise<string> {
  // Use legacy build designed for Node.js
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const uint8 = new Uint8Array(buffer);
  const loadingTask = pdfjs.getDocument({
    data: uint8,
    useSystemFonts: true,
  });
  const doc = await loadingTask.promise;
  const fullTextParts: string[] = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const items: Array<{ str: string; x: number; y: number }> = [];

    for (const item of content.items) {
      if ('str' in item && item.str.trim().length > 0) {
        items.push({
          str: item.str,
          x: item.transform[4],
          y: item.transform[5],
        });
      }
    }

    // Sort top-to-bottom, left-to-right
    items.sort((a, b) => {
      const yDiff = b.y - a.y;
      if (Math.abs(yDiff) > 3) return yDiff;
      return a.x - b.x;
    });

    const lines: string[] = [];
    let curLine: typeof items = [];
    let curY: number | null = null;

    for (const item of items) {
      if (curY === null) {
        curY = item.y;
        curLine = [item];
      } else if (Math.abs(item.y - curY) <= 4) {
        curLine.push(item);
      } else {
        curLine.sort((a, b) => a.x - b.x);
        lines.push(curLine.map((it) => it.str).join(' '));
        curY = item.y;
        curLine = [item];
      }
    }

    if (curLine.length > 0) {
      curLine.sort((a, b) => a.x - b.x);
      lines.push(curLine.map((it) => it.str).join(' '));
    }

    fullTextParts.push(lines.join('\n'));
  }

  return fullTextParts.join('\n');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // API health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Server-side PDF extraction endpoint (reliable fallback for all browsers)
  app.post('/api/parse-pdf', async (req, res) => {
    try {
      const { base64Data, fileName } = req.body;
      if (!base64Data) {
        return res.status(400).json({ error: 'Missing base64Data' });
      }

      const buffer = Buffer.from(base64Data, 'base64');
      const text = await extractPdfTextServer(buffer);

      res.json({
        success: true,
        text,
        fileName: fileName || 'file.pdf',
      });
    } catch (err: any) {
      console.error('Server PDF parsing error:', err);
      res.status(500).json({ error: err.message || 'Failed to extract text from PDF on server' });
    }
  });

  // AI-assisted parsing fallback for scanned/image PDFs
  app.post('/api/ai-parse', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: 'GEMINI_API_KEY is not configured.' });
      }

      const { base64Data, mimeType, fileName } = req.body;
      if (!base64Data) {
        return res.status(400).json({ error: 'Missing base64Data.' });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are an expert tax accountant specialized in Indonesian e-Faktur Pajak (VAT Tax Invoice).
Extract all structured data from this Faktur Pajak document. Return ONLY valid JSON in this exact structure:
{
  "nomorFaktur": "16-digit invoice number e.g. 04002600237157125",
  "tanggalFaktur": "DD-MM-YYYY e.g. 23-06-2026",
  "bulanTahun": "MMYYYY e.g. 062026",
  "namaPenjual": "Vendor company name",
  "npwpPenjual": "15 or 16 digit seller NPWP without symbols",
  "namaPembeli": "Buyer company name",
  "npwpPembeli": "15 or 16 digit buyer NPWP without symbols",
  "items": [
    {
      "nomorUrut": 1,
      "kodeBarang": "optional code",
      "namaBarang": "Product or service description",
      "hargaSatuan": 128400,
      "qty": 2,
      "satuan": "Piece",
      "potonganHarga": 0,
      "ppnbm": 0,
      "hargaJual": 256800
    }
  ],
  "hargaJualTotal": 2266200,
  "potonganHargaTotal": 0,
  "uangMuka": 0,
  "dpp": 2077350,
  "dppNilaiLain": 0,
  "ppn": 249282,
  "ppnbmTotal": 0,
  "keterangan": "Reference number or invoice ref"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: mimeType || 'application/pdf',
                },
              },
              { text: prompt },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '{}';
      const parsedData = JSON.parse(responseText);
      parsedData.fileName = fileName || 'faktur.pdf';
      parsedData.id = `${parsedData.nomorFaktur || fileName}-${Date.now()}`;
      parsedData.hargaJualNett = (parsedData.hargaJualTotal || 0) - (parsedData.potonganHargaTotal || 0);

      res.json({ success: true, data: parsedData });
    } catch (err: any) {
      console.error('AI parse error:', err);
      res.status(500).json({ error: err.message || 'Failed to process document with AI' });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
