/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { UploadDropzone } from './components/UploadDropzone';
import { GeneratedFilesCard } from './components/GeneratedFilesCard';
import { DataPreviewTable } from './components/DataPreviewTable';
import { InvoiceDetailModal } from './components/InvoiceDetailModal';
import { FakturPajakData, parseFakturText } from './utils/fakturParser';
import { extractTextFromPdf } from './utils/pdfExtractor';
import { getSampleInvoices } from './data/sampleInvoices';
import {
  FileSpreadsheet,
  Receipt,
  ShoppingCart,
  TrendingUp,
  FileCheck2,
  FolderSync,
  Info,
  Layers,
  RotateCcw,
} from 'lucide-react';

export default function App() {
  const [invoices, setInvoices] = useState<FakturPajakData[]>(() => getSampleInvoices());
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number; currentFileName?: string } | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<FakturPajakData | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Summary statistics
  const stats = useMemo(() => {
    let totalBeli = 0;
    let totalJual = 0;
    let totalItems = 0;
    let totalDpp = 0;
    let totalPpn = 0;

    for (const inv of invoices) {
      if (inv.category === 'beli') totalBeli++;
      else totalJual++;

      totalItems += inv.items.length || 1;
      totalDpp += inv.dpp || 0;
      totalPpn += inv.ppn || 0;
    }

    return {
      totalInvoices: invoices.length,
      totalBeli,
      totalJual,
      totalItems,
      totalDpp,
      totalPpn,
    };
  }, [invoices]);

  // Load sample invoices
  const handleLoadSamples = () => {
    const samples = getSampleInvoices();
    setInvoices(samples);
    setStatusMessage(`Memuat ${samples.length} contoh Faktur Pajak (Pembelian & Penjualan).`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const executeReset = () => {
    setInvoices([]);
    setSelectedInvoice(null);
    setProgress(null);
    setShowResetConfirm(false);
    setStatusMessage('Data berhasil di-reset. Seluruh file PDF dan hasil preview Excel telah dikosongkan.');
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Process uploaded PDF files
  const handleFilesSelected = async (files: File[], targetCategory?: 'beli' | 'jual') => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setProgress({ current: 0, total: files.length });

    const newParsed: FakturPajakData[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress({ current: i + 1, total: files.length, currentFileName: file.name });

      // Determine category based on targetCategory, relativePath, or filename
      let cat: 'beli' | 'jual' = targetCategory || 'beli';
      const pathAndName = (file.webkitRelativePath || file.name).toLowerCase();
      if (pathAndName.includes('fakturjual') || pathAndName.includes('penjualan') || pathAndName.includes('jual')) {
        cat = 'jual';
      } else if (pathAndName.includes('fakturbeli') || pathAndName.includes('pembelian') || pathAndName.includes('beli')) {
        cat = 'beli';
      }

      try {
        const arrayBuffer = await file.arrayBuffer();
        const { fullText } = await extractTextFromPdf(arrayBuffer, file.name);

        if (fullText && fullText.trim().length > 30) {
          const parsed = parseFakturText(fullText, file.name, cat);
          newParsed.push(parsed);
        } else {
          // If text extraction is empty (scanned image PDF), attempt server AI parsing fallback
          try {
            const base64 = await fileToBase64(file);
            const res = await fetch('/api/ai-parse', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                base64Data: base64,
                mimeType: file.type || 'application/pdf',
                fileName: file.name,
              }),
            });
            if (res.ok) {
              const data = await res.json();
              if (data.data) {
                const aiParsed: FakturPajakData = {
                  ...data.data,
                  category: cat,
                  id: `${data.data.nomorFaktur || file.name}-${Date.now()}`,
                };
                newParsed.push(aiParsed);
              }
            } else {
              const resJson = await res.json().catch(() => ({}));
              errors.push(`${file.name}: ${resJson.error || 'PDF berupa gambar/scan dan memerlukan GEMINI_API_KEY untuk OCR.'}`);
            }
          } catch {
            errors.push(`${file.name}: Tidak dapat mengekstrak teks PDF.`);
          }
        }
      } catch (err: any) {
        console.error(`Error parsing ${file.name}:`, err);
        errors.push(`${file.name}: ${err.message || 'Gagal memproses file'}`);
      }
    }

    if (newParsed.length > 0) {
      setInvoices((prev) => {
        // Deduplicate based on nomorFaktur if present
        const map = new Map<string, FakturPajakData>();
        for (const item of prev) {
          map.set(item.nomorFaktur || item.id, item);
        }
        for (const item of newParsed) {
          map.set(item.nomorFaktur || item.id, item);
        }
        return Array.from(map.values());
      });

      setStatusMessage(`Berhasil mengekstrak ${newParsed.length} file PDF Faktur Pajak.`);
    } else if (errors.length > 0) {
      setStatusMessage(`Peringatan: Gagal memproses ${errors.length} file.`);
    }

    setIsProcessing(false);
    setProgress(null);
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        onLoadSamples={handleLoadSamples}
        onClearAll={() => setShowResetConfirm(true)}
        totalInvoices={invoices.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Status Notification */}
        {statusMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-medium flex items-center justify-between shadow-xs">
            <span>{statusMessage}</span>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="text-emerald-700 hover:text-emerald-950 text-xs font-bold ml-2 cursor-pointer"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Specification & Output Guidelines Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs">
                  Format Standar DJP
                </span>
                <h2 className="text-sm font-bold text-slate-900">
                  Konversi Faktur Pajak PDF ke Excel (.xlsx)
                </h2>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Mendukung folder upload <strong>FakturBeli</strong> dan <strong>FakturJual</strong>. Output berupa 1 file Excel untuk seluruh PDF tipe Beli (<code className="text-blue-700 font-semibold font-mono">fakturbeli.xlsx</code>) dan 1 file Excel untuk seluruh PDF tipe Jual (<code className="text-emerald-700 font-semibold font-mono">fakturjual.xlsx</code>) dengan 2 sheet wajib: <strong>Detail Barang</strong> dan <strong>Rekap Faktur</strong>.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-4">
              <div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Sheet 1</div>
                <div className="font-bold text-slate-800">Detail Barang (12 Kolom)</div>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Sheet 2</div>
                <div className="font-bold text-slate-800">Rekap Faktur (Sesuai DJP)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Dropzones */}
        <UploadDropzone
          onFilesSelected={handleFilesSelected}
          isProcessing={isProcessing}
          progress={progress}
          totalInvoices={invoices.length}
          onReset={() => setShowResetConfirm(true)}
        />

        {/* Summary Stats Overview */}
        {invoices.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-medium uppercase">Total Faktur</span>
                <Receipt className="w-4 h-4 text-slate-500" />
              </div>
              <div className="text-lg font-bold text-slate-900 mt-1">
                {stats.totalInvoices}{' '}
                <span className="text-xs font-normal text-slate-500">
                  ({stats.totalBeli} Beli / {stats.totalJual} Jual)
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-medium uppercase">Detail Barang/Jasa</span>
                <Layers className="w-4 h-4 text-slate-500" />
              </div>
              <div className="text-lg font-bold text-slate-900 mt-1">
                {stats.totalItems}{' '}
                <span className="text-xs font-normal text-slate-500">Baris</span>
              </div>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-medium uppercase">Dasar Pengenaan Pajak</span>
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-base font-bold text-slate-900 mt-1 truncate" title={formatIDR(stats.totalDpp)}>
                {formatIDR(stats.totalDpp)}
              </div>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-medium uppercase">Total PPN</span>
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-base font-bold text-emerald-700 mt-1 truncate" title={formatIDR(stats.totalPpn)}>
                {formatIDR(stats.totalPpn)}
              </div>
            </div>
          </div>
        )}

        {/* Generated Files Ready to Download */}
        <GeneratedFilesCard
          invoices={invoices}
          onReset={() => setShowResetConfirm(true)}
        />

        {/* Interactive Data Preview Spreadsheet */}
        <DataPreviewTable
          invoices={invoices}
          onSelectInvoice={(inv) => setSelectedInvoice(inv)}
          onReset={() => setShowResetConfirm(true)}
          onLoadSamples={handleLoadSamples}
        />
      </main>

      {/* Invoice Detail Modal */}
      <InvoiceDetailModal
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">
                Kosongkan Seluruh Data?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tindakan ini akan menghapus semua file PDF faktur yang sedang dimuat, mengosongkan tabel preview, serta mereset hasil file Excel (<strong>fakturbeli.xlsx</strong> & <strong>fakturjual.xlsx</strong>).
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeReset}
                className="flex-1 py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Ya, Kosongkan Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            Faktur Pajak PDF to Excel Converter • Format DJP e-Faktur
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Client-side PDF Extraction</span>
            <span>•</span>
            <span>ExcelJS Multi-sheet Generation</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}
