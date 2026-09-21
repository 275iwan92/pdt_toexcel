import React, { useState } from 'react';
import { FileSpreadsheet, Download, Archive, CheckCircle2, Layers, Calendar, ChevronRight } from 'lucide-react';
import { FakturPajakData } from '../utils/fakturParser';
import { createFakturWorkbook, downloadWorkbook } from '../utils/excelGenerator';
import { createBatchZip, downloadBlob } from '../utils/zipExporter';

interface GeneratedFilesCardProps {
  invoices: FakturPajakData[];
}

interface GroupedFile {
  category: 'beli' | 'jual';
  bulanTahun: string;
  displayPeriod: string;
  fileName: string;
  items: FakturPajakData[];
  totalFaktur: number;
  totalLines: number;
  totalDpp: number;
  totalPpn: number;
}

export const GeneratedFilesCard: React.FC<GeneratedFilesCardProps> = ({ invoices }) => {
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [downloadingZip, setDownloadingZip] = useState(false);

  // Group invoices by category and bulanTahun
  const groupsMap: Record<string, GroupedFile> = {};

  for (const inv of invoices) {
    const category = inv.category;
    const bt = inv.bulanTahun && inv.bulanTahun !== '000000' ? inv.bulanTahun : 'unknown';
    const key = `${category}-${bt}`;

    if (!groupsMap[key]) {
      // Format display period e.g. "062026" -> "Bulan 06 / 2026"
      let displayPeriod = bt;
      if (bt.length === 6) {
        displayPeriod = `${bt.substring(0, 2)} - ${bt.substring(2)}`;
      }

      const fileName = category === 'beli' ? `fakturbeli-${bt}.xlsx` : `fakturjual-${bt}.xlsx`;

      groupsMap[key] = {
        category,
        bulanTahun: bt,
        displayPeriod,
        fileName,
        items: [],
        totalFaktur: 0,
        totalLines: 0,
        totalDpp: 0,
        totalPpn: 0,
      };
    }

    groupsMap[key].items.push(inv);
    groupsMap[key].totalFaktur += 1;
    groupsMap[key].totalLines += inv.items.length || 1;
    groupsMap[key].totalDpp += inv.dpp || 0;
    groupsMap[key].totalPpn += inv.ppn || 0;
  }

  const fileGroups = Object.values(groupsMap).sort((a, b) => {
    if (a.category !== b.category) return a.category === 'beli' ? -1 : 1;
    return a.bulanTahun.localeCompare(b.bulanTahun);
  });

  if (fileGroups.length === 0) {
    return null;
  }

  const handleDownloadSingle = async (group: GroupedFile) => {
    try {
      setDownloadingFile(group.fileName);
      const workbook = await createFakturWorkbook({
        category: group.category,
        fakturs: group.items,
      });
      await downloadWorkbook(workbook, group.fileName);
    } catch (err) {
      console.error('Download error:', err);
      alert('Gagal mengunduh file Excel: ' + (err as Error).message);
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
      alert('Gagal membuat file ZIP: ' + (err as Error).message);
    } finally {
      setDownloadingZip(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header bar */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">
              File Excel Siap Unduh ({fileGroups.length} File)
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Setiap file Excel berisi 2 Sheet: <span className="text-emerald-300 font-medium">Detail Barang</span> & <span className="text-emerald-300 font-medium">Rekap Faktur</span>
          </p>
        </div>

        {fileGroups.length > 0 && (
          <button
            type="button"
            onClick={handleDownloadAllZip}
            disabled={downloadingZip}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Archive className="w-4 h-4" />
            <span>{downloadingZip ? 'Menyiapkan ZIP...' : 'Download All (.ZIP)'}</span>
          </button>
        )}
      </div>

      {/* Files Grid */}
      <div className="p-4 sm:p-5 divide-y divide-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fileGroups.map((group) => {
            const isBeli = group.category === 'beli';
            return (
              <div
                key={group.fileName}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                  isBeli
                    ? 'border-blue-200/80 bg-blue-50/30 hover:bg-blue-50/60'
                    : 'border-emerald-200/80 bg-emerald-50/30 hover:bg-emerald-50/60'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isBeli ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
                        }`}
                      >
                        XLS
                      </div>
                      <div>
                        <span
                          className={`inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            isBeli
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isBeli ? 'Faktur Beli' : 'Faktur Jual'}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 font-mono mt-0.5 break-all">
                          {group.fileName}
                        </h4>
                      </div>
                    </div>

                    <span className="text-xs text-slate-500 flex items-center gap-1 font-medium whitespace-nowrap">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {group.displayPeriod}
                    </span>
                  </div>

                  {/* Badges / Stats */}
                  <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] py-2 px-2.5 bg-white/80 rounded-lg border border-slate-200/60">
                    <div>
                      <div className="text-slate-400">Total Faktur</div>
                      <div className="font-semibold text-slate-800">{group.totalFaktur} Faktur</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Barang/Jasa</div>
                      <div className="font-semibold text-slate-800">{group.totalLines} Baris</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Total DPP</div>
                      <div className="font-semibold text-slate-800 truncate" title={formatCurrency(group.totalDpp)}>
                        {formatCurrency(group.totalDpp)}
                      </div>
                    </div>
                  </div>

                  {/* 2 Sheet indicator */}
                  <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-600">
                    <span className="flex items-center gap-1 text-emerald-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Sheet: Detail Barang
                    </span>
                    <span className="flex items-center gap-1 text-emerald-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Sheet: Rekap Faktur
                    </span>
                  </div>
                </div>

                {/* Download Button */}
                <button
                  type="button"
                  onClick={() => handleDownloadSingle(group)}
                  disabled={downloadingFile === group.fileName}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs ${
                    isBeli
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>
                    {downloadingFile === group.fileName
                      ? 'Mengunduh...'
                      : `Unduh ${group.fileName}`}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
