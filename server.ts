import express from 'express';
import path from 'path';
import fs from 'fs';
import JSZip from 'jszip';
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

  // Portable Windows App (.zip) download endpoint
  app.get('/api/download-portable', async (req, res) => {
    try {
      const distPath = path.join(process.cwd(), 'dist');
      const zip = new JSZip();

      // Check if dist exists, add all dist files except server.cjs
      if (fs.existsSync(distPath)) {
        const addFolderRecursively = (currentDir: string, zipFolder: JSZip) => {
          const items = fs.readdirSync(currentDir, { withFileTypes: true });
          for (const item of items) {
            const itemPath = path.join(currentDir, item.name);
            if (item.isDirectory()) {
              addFolderRecursively(itemPath, zipFolder.folder(item.name)!);
            } else if (item.isFile()) {
              if (item.name.startsWith('server.cjs')) continue;
              zipFolder.file(item.name, fs.readFileSync(itemPath));
            }
          }
        };
        addFolderRecursively(distPath, zip);
      } else {
        const indexPath = path.join(process.cwd(), 'index.html');
        if (fs.existsSync(indexPath)) {
          zip.file('index.html', fs.readFileSync(indexPath, 'utf-8'));
        }
      }

      const BATCH_LAUNCHER = `@echo off
chcp 65001 >nul
title e-Faktur Pajak to Excel Converter (Portable)
color 0A

echo =====================================================================
echo   e-Faktur Pajak to Excel Converter - Versi Portable Zero-Install
echo   Kompatibel: Windows XP / Windows 7 / Windows 8 / Windows 10 / 11
echo =====================================================================
echo.
echo [1/2] Menyiapkan aplikasi offline...

where powershell >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [2/2] Membuka aplikasi di browser (Port 5800)...
    echo.
    echo =====================================================================
    echo   JANGAN TUTUP JENDELA CMD INI SELAMA MENGGUNAKAN APLIKASI.
    echo   (Jendela ini berfungsi sebagai server lokal aman di PC Anda)
    echo   Anda dapat meminimalkan (minimize) jendela ini.
    echo =====================================================================
    echo.
    powershell -NoProfile -ExecutionPolicy Bypass -Command "$port = 5800; $listener = New-Object System.Net.HttpListener; $listener.Prefixes.Add('http://localhost:' + $port + '/'); try { $listener.Start() } catch { $port = 5801; $listener.Prefixes.Clear(); $listener.Prefixes.Add('http://localhost:' + $port + '/'); $listener.Start() }; Start-Process ('http://localhost:' + $port + '/'); Write-Host ('Aplikasi berhasil berjalan di: http://localhost:' + $port + '/'); while ($listener.IsListening) { $context = $listener.GetContext(); $request = $context.Request; $response = $context.Response; $url = $request.RawUrl.Split('?')[0]; if ($url -eq '/') { $url = '/index.html' }; $filePath = Join-Path $PSScriptRoot $url.TrimStart('/'); if (Test-Path $filePath -PathType Leaf) { $bytes = [IO.File]::ReadAllBytes($filePath); $ext = [IO.Path]::GetExtension($filePath).ToLower(); switch ($ext) { '.html' { $response.ContentType = 'text/html; charset=utf-8' } '.js' { $response.ContentType = 'application/javascript; charset=utf-8' } '.mjs' { $response.ContentType = 'application/javascript; charset=utf-8' } '.css' { $response.ContentType = 'text/css; charset=utf-8' } '.json' { $response.ContentType = 'application/json' } '.svg' { $response.ContentType = 'image/svg+xml' } '.png' { $response.ContentType = 'image/png' } default { $response.ContentType = 'application/octet-stream' } }; $response.ContentLength64 = $bytes.Length; $response.OutputStream.Write($bytes, 0, $bytes.Length); $response.Close() } else { $response.StatusCode = 404; $response.Close() } }"
    pause
    exit /b
)

echo [2/2] Membuka langsung via Browser...
start "" "%~dp0index.html"
exit /b
`;

      const BATCH_CHROME = `@echo off
title Buka di Google Chrome
start chrome.exe --allow-file-access-from-files "%~dp0index.html"
exit
`;

      const BATCH_EDGE = `@echo off
title Buka di Microsoft Edge
start msedge.exe --allow-file-access-from-files "%~dp0index.html"
exit
`;

      const BATCH_FIREFOX = `@echo off
title Buka di Mozilla Firefox
start firefox.exe "%~dp0index.html"
exit
`;

      const PETUNJUK_TXT = `===================================================================
PETUNJUK PENGGUNAAN e-FAKTUR CONVERTER PORTABLE (OFFLINE)
Kompatibel: Windows XP (SP3), Windows 7, Windows 8, Windows 10, Windows 11
===================================================================

1. CARA MENJALANKAN DI WINDOWS 7 / 8 / 10 / 11:
   - Klik 2x pada file: "Jalankan_Aplikasi.bat"
   - Browser default Anda (Chrome, Edge, Firefox, Brave) akan otomatis terbuka.
   - Jangan tutup jendela CMD hitam tersebut selama Anda bekerja (bisa di-minimize).

2. CARA MENJALANKAN DI WINDOWS XP:
   - Jika menggunakan Mozilla Firefox / Chrome:
     Klik file "Buka_Langsung_Firefox.bat" atau "Buka_Langsung_Chrome.bat".
   - Atau langsung klik 2x pada file "index.html".

3. KEUNGGULAN VERSI PORTABLE INI:
   - 100% OFFLINE: Tidak membutuhkan koneksi internet sama sekali.
   - ZERO INSTALL: Cukup ekstrak di folder mana pun (Desktop, Drive D, USB Flashdisk).
   - TIDAK BUTUH HAK ADMIN: Sangat cocok untuk PC kantor/klien yang dikunci oleh IT administrator.
   - PRIVASI & KERAHASIAAN TERJAMIN: Seluruh proses ekstraksi PDF faktur pajak ke Excel
     dieksekusi langsung di memori komputer Anda. Tidak ada data yang dikirim ke internet.
   - Multi-Format Excel & CSV: Dilengkapi 2 Sheet ("Detail Barang" & "Rekap Faktur")
     sesuai format standar e-Faktur Pajak resmi Indonesia.

===================================================================
`;

      zip.file('Jalankan_Aplikasi.bat', BATCH_LAUNCHER);
      zip.file('Buka_Langsung_Chrome.bat', BATCH_CHROME);
      zip.file('Buka_Langsung_Edge.bat', BATCH_EDGE);
      zip.file('Buka_Langsung_Firefox.bat', BATCH_FIREFOX);
      zip.file('PETUNJUK_WINDOWS_XP_7_10_11.txt', PETUNJUK_TXT);

      const buffer = await zip.generateAsync({
        type: 'nodebuffer',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="eFaktur_Converter_Portable_WinXP_7_10_11.zip"');
      res.send(buffer);
    } catch (err: any) {
      console.error('Portable zip generation error:', err);
      res.status(500).json({ error: 'Gagal membuat file zip: ' + err.message });
    }
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
