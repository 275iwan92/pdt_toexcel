import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Polyfill Promise.withResolvers for browsers that don't support it natively yet
if (typeof (Promise as any).withResolvers === 'undefined') {
  (Promise as any).withResolvers = function <T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: any) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

// Configure worker for browser environment using local Vite asset URL (bypasses CORS/sandbox worker restrictions)
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
  } catch (err) {
    console.warn('Worker initialization note:', err);
  }
}

export interface ExtractedPageText {
  pageNumber: number;
  text: string;
}

export function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Extracts formatted text from a PDF File or ArrayBuffer
 * 1. Tries client-side PDF.js worker
 * 2. Falls back to server-side PDF.js extraction endpoint (/api/parse-pdf)
 */
export async function extractTextFromPdf(
  data: ArrayBuffer | Uint8Array,
  fileName?: string
): Promise<{ fullText: string; pages: ExtractedPageText[] }> {
  // 1. Attempt client-side extraction
  try {
    const loadingTask = pdfjsLib.getDocument({
      data,
      useSystemFonts: true,
    });

    const pdfDoc = await loadingTask.promise;
    const pages: ExtractedPageText[] = [];
    const fullTextParts: string[] = [];

    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();

      interface TextItemWithPos {
        str: string;
        x: number;
        y: number;
        width: number;
        height: number;
      }

      const items: TextItemWithPos[] = [];
      for (const item of textContent.items) {
        if ('str' in item && item.str.trim().length > 0) {
          const x = item.transform[4];
          const y = item.transform[5];
          const width = item.width || 0;
          const height = item.height || 0;
          items.push({
            str: item.str,
            x,
            y,
            width,
            height,
          });
        }
      }

      // Sort primarily by Y descending (top of page first), then X ascending
      items.sort((a, b) => {
        const yDiff = b.y - a.y;
        if (Math.abs(yDiff) > 3) {
          return yDiff;
        }
        return a.x - b.x;
      });

      // Group into lines based on Y tolerance
      const lines: string[] = [];
      let currentLineItems: TextItemWithPos[] = [];
      let currentY: number | null = null;

      for (const item of items) {
        if (currentY === null) {
          currentY = item.y;
          currentLineItems = [item];
        } else if (Math.abs(item.y - currentY) <= 4) {
          currentLineItems.push(item);
        } else {
          currentLineItems.sort((a, b) => a.x - b.x);
          lines.push(currentLineItems.map((it) => it.str).join(' '));
          currentY = item.y;
          currentLineItems = [item];
        }
      }

      if (currentLineItems.length > 0) {
        currentLineItems.sort((a, b) => a.x - b.x);
        lines.push(currentLineItems.map((it) => it.str).join(' '));
      }

      const pageText = lines.join('\n');
      pages.push({ pageNumber: pageNum, text: pageText });
      fullTextParts.push(pageText);
    }

    const fullText = fullTextParts.join('\n');
    if (fullText && fullText.trim().length > 30) {
      return { fullText, pages };
    }
  } catch (clientErr: any) {
    console.warn('Client-side PDF extraction encountered issue, trying server fallback:', clientErr);
  }

  // 2. Fallback to server-side extraction
  try {
    const base64Data = arrayBufferToBase64(data);
    const res = await fetch('/api/parse-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64Data, fileName }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.text) {
        return {
          fullText: json.text,
          pages: [{ pageNumber: 1, text: json.text }],
        };
      }
    }
  } catch (serverErr) {
    console.error('Server-side PDF extraction fallback error:', serverErr);
  }

  return { fullText: '', pages: [] };
}

