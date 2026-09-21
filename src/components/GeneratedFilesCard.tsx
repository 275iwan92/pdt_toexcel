import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Archive,
  CheckCircle2,
  Layers,
  RotateCcw,
  Sparkles,
  Info,
  FileText,
} from 'lucide-react';
import { FakturPajakData } from '../utils/fakturParser';
import { createFakturWorkbook, downloadWorkbook } from '../utils/excelGenerator';
import { createBatchZip, downloadBlob } from '../utils/zipExporter';
import { generateDetailCsv, generateRekapCsv, downloadCsv } from '../utils/csvExporter';

interface GeneratedFilesCardProps {
  invoices: FakturPajakData[];
  onReset?: () => void;
}

interface CategoryExcelFile {
  category: 'beli' | 'jual';
  fileName: string;
  title: string;
  badgeLabel: string;
  invoices: FakturPajakData[];
  totalFaktur: number;
  totalLines: number;
  totalDpp: number;
  totalPpn: number;
  colorScheme: {
    accent: string;
    bgBadge: string;
    textBadge: string;
    border: string;
    bgCard: string;
    button: string;
    iconBg: string;
  };
}

export const GeneratedFilesCard: React.FC<GeneratedFilesCardProps> = ({ invoices, onReset }) => {
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [downloadingZip, setDownloadingZip] = useState(false);

  // Separate all invoices strictly into Faktur Beli and Faktur Jual
  const beliInvoices = invoices.filter((inv) => inv.category === 'beli');
  const jualInvoices = invoices.filter((inv) => inv.category === 'jual');

  const fileGroups: CategoryExcelFile[] = [];

  if (beliInvoices.length > 0) {
    let totalLines = 0;
    let totalDpp = 0;
    let totalPpn = 0;
    for (const inv of beliInvoices) {
      totalLines += inv.items.length || 1;
      totalDpp += inv.dpp || 0;
      totalPpn += inv.ppn || 0;
    }

    fileGroups.push({
      category: 'beli',
      fileName: 'fakturbeli.xlsx',
      title: 'Faktur Pajak Masukan (Pembelian)',
      badgeLabel: 'FAKTUR BELI',
      invoices: beliInvoices,
      totalFaktur: beliInvoices.length,
      totalLines,
      totalDpp,
      totalPpn,
      colorScheme: {
        accent: 'blue',
        bgBadge: 'bg-blue-100',
        textBadge: 'text-blue-800',
        border: 'border-blue-200',
        bgCard: 'bg-gradient-to-br from-blue-50/50 to-indigo-50/20',
        button: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white',
        iconBg: 'bg-blue-600 text-white',
      },
    });
  }

  if (jualInvoices.length > 0) {
    let totalLines = 0;
    let totalDpp = 0;
    let totalPpn = 0;
    for (const inv of jualInvoices) {
      totalLines += inv.items.length || 1;
      totalDpp += inv.dpp || 0;
      totalPpn += inv.ppn || 0;
    }

    fileGroups.push({
      category: 'jual',
      fileName: 'fakturjual.xlsx',
      title: 'Faktur Pajak Keluaran (Penjualan)',
      badgeLabel: 'FAKTUR JUAL',
      invoices: jualInvoices,
      totalFaktur: jualInvoices.length,
      totalLines,
      totalDpp,
      totalPpn,
      colorScheme: {
        accent: 'emerald',
        bgBadge: 'bg-emerald-100',
        textBadge: 'text-emerald-800',
        border: 'border-emerald-200',
        bgCard: 'bg-gradient-to-br from-emerald-50/50 to-teal-50/20',
        button: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white',
        iconBg: 'bg-emerald-600 text-white',
      },
    });
  }

  if (fileGroups.length === 0) {
    return null;
  }

  const handleDownloadSingle = async (group: CategoryExcelFile) => {
    try {
      setDownloadingFile(group.fileName);
      const workbook = await createFakturWorkbook({
        category: group.category,
        fakturs: group.invoices,
      });
      await downloadWorkbook(workbook, group.fileName);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloadingFile(null);
    }
  };

  const handleDownloadAllZip = async () => {
    try {
      setDownloadingZip(true);
      const zipBlob = await createBatchZip(invoices);
      downloadBlob(zipBlob, `faktur-pajak-excel-${new Date().toISOString().slice(0, 10)}.zip`);
    } catch (err) {
      console.error('ZIP error:', err);
    } finally {
      setDownloadingZip(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header bar */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">
              Hasil File Excel ({fileGroups.length} File Gabungan)
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Hanya 1 file Excel untuk seluruh PDF tipe Beli (
            <code className="text-blue-300 font-mono">fakturbeli.xlsx</code>), dan 1 file Excel untuk
            seluruh PDF tipe Jual (
            <code className="text-emerald-300 font-mono">fakturjual.xlsx</code>). Masing-masing berisi 2 Sheet (
            <span className="text-white font-medium">Detail Barang</span> & <span className="text-white font-medium">Rekap Faktur</span>).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-rose-950/80 active:bg-rose-900 text-rose-300 hover:text-rose-200 border border-slate-700 hover:border-rose-800 font-medium text-xs rounded-xl transition-all shadow-xs cursor-pointer"
              title="Kosongkan seluruh data PDF dan hasil Excel"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset / Kosongkan</span>
            </button>
          )}

          {fileGroups.length > 1 && (
            <button
              type="button"
              onClick={handleDownloadAllZip}
              disabled={downloadingZip}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Archive className="w-4 h-4" />
              <span>{downloadingZip ? 'Menyiapkan ZIP...' : 'Download Keduanya (.ZIP)'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 1 Excel File Per Category Grid */}
      <div className="p-4 sm:p-5">
        <div
          className={`grid gap-4 ${
            fileGroups.length === 1 ? 'grid-cols-1 max-w-2xl mx-auto' : 'grid-cols-1 md:grid-cols-2'
          }`}
        >
          {fileGroups.map((group) => {
            const isBeli = group.category === 'beli';
            return (
              <div
                key={group.fileName}
                className={`p-5 rounded-xl border transition-all flex flex-col justify-between gap-4 ${group.colorScheme.border} ${group.colorScheme.bgCard}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-xs ${group.colorScheme.iconBg}`}
                      >
                        XLS
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${group.colorScheme.bgBadge} ${group.colorScheme.textBadge}`}
                          >
                            {group.badgeLabel}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">
                            1 File Gabungan
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 font-mono mt-0.5">
                          {group.fileName}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-2">
                    Menggabungkan seluruh ({group.totalFaktur}) PDF Faktur Pajak{' '}
                    {isBeli ? 'Pembelian' : 'Penjualan'} ke dalam 1 file Excel.
                  </p>

                  {/* Summary Metric Strip */}
                  <div className="mt-3.5 grid grid-cols-3 gap-2.5 text-xs py-2.5 px-3 bg-white/90 rounded-lg border border-slate-200/80 shadow-2xs">
                    <div>
                      <div className="text-[11px] text-slate-400 font-medium">Total PDF</div>
                      <div className="font-bold text-slate-800 text-sm mt-0.5">
                        {group.totalFaktur} Faktur
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 font-medium">Baris Barang</div>
                      <div className="font-bold text-slate-800 text-sm mt-0.5">
                        {group.totalLines} Baris
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 font-medium">Total DPP</div>
                      <div
                        className="font-bold text-slate-800 text-sm mt-0.5 truncate"
                        title={formatCurrency(group.totalDpp)}
                      >
                        {formatCurrency(group.totalDpp)}
                      </div>
                    </div>
                  </div>

                  {/* 2 Sheet indicator breakdown */}
                  <div className="mt-3.5 p-2.5 bg-slate-50/80 rounded-lg border border-slate-200/60 space-y-1.5 text-xs">
                    <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-500" />
                      Struktur Sheet dalam {group.fileName}:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-1">
                      <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>
                          <strong>Sheet 1:</strong> Detail Barang ({isBeli ? '12 Kolom Attachment #1' : `${group.totalLines} baris`})
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>
                          <strong>Sheet 2:</strong> Rekap Faktur ({isBeli ? '9 Kolom + Total Kuning' : `${group.totalFaktur} baris`})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Download Button */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadSingle(group)}
                    disabled={downloadingFile === group.fileName}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${group.colorScheme.button} disabled:opacity-50`}
                  >
                    <Download className="w-4 h-4" />
                    <span>
                      {downloadingFile === group.fileName
                        ? 'Sedang Memproses Excel...'
                        : `Download ${group.fileName}`}
                    </span>
                  </button>

                  {/* CSV Alternative for Large Datasets (>50k - 350k rows) */}
                  <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between gap-2 text-xs">
                    <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>Format CSV (Data Masif):</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const csv = generateDetailCsv(group.invoices);
                          downloadCsv(csv, `${isBeli ? 'fakturbeli' : 'fakturjual'}_detail_barang.csv`);
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer shadow-2xs"
                        title="Download CSV Sheet 1 (Detail Barang) - Sangat cepat & hemat memori"
                      >
                        CSV Detail
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const csv = generateRekapCsv(group.invoices, group.category);
                          downloadCsv(csv, `${isBeli ? 'fakturbeli' : 'fakturjual'}_rekap_faktur.csv`);
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer shadow-2xs"
                        title="Download CSV Sheet 2 (Rekap Faktur) - Sangat cepat & hemat memori"
                      >
                        CSV Rekap
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
