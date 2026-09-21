import React from 'react';
import { FileSpreadsheet, RotateCcw, FolderSync, Laptop } from 'lucide-react';

interface NavbarProps {
  onLoadSamples: () => void;
  onClearAll: () => void;
  totalInvoices: number;
  onOpenPortableModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onLoadSamples,
  onClearAll,
  totalInvoices,
  onOpenPortableModal,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">
                Faktur Pajak PDF to Excel
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                e-Faktur DJP
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              1 File Excel untuk Faktur Beli (<code className="text-blue-600 font-mono text-[11px]">fakturbeli.xlsx</code>) & 1 File Excel untuk Faktur Jual (<code className="text-emerald-700 font-mono text-[11px]">fakturjual.xlsx</code>)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {onOpenPortableModal && (
            <button
              onClick={onOpenPortableModal}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 border border-slate-300 rounded-lg transition-all shadow-2xs cursor-pointer"
              title="Download Aplikasi Portable untuk Windows XP / 7 / 10 / 11 (Deploy di Klien)"
            >
              <Laptop className="w-3.5 h-3.5 text-emerald-600" />
              <span>App Portable (.zip)</span>
            </button>
          )}

          <button
            onClick={onLoadSamples}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 border border-emerald-200 rounded-lg transition-colors shadow-2xs cursor-pointer"
            title="Muat contoh faktur pajak pembelian & penjualan"
          >
            <FolderSync className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Muat Contoh Faktur</span>
            <span className="sm:hidden">Contoh</span>
          </button>

          {totalInvoices > 0 ? (
            <button
              onClick={onClearAll}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 border border-rose-300 rounded-lg transition-all shadow-2xs cursor-pointer"
              title="Kosongkan seluruh data PDF dan hasil Excel"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
              <span>Reset / Kosongkan</span>
            </button>
          ) : (
            <span className="hidden sm:inline-flex items-center px-2.5 py-1 text-xs font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded-lg">
              Data Kosong
            </span>
          )}
        </div>
      </div>
    </header>
  );
};

