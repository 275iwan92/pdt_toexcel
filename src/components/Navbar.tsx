import React from 'react';
import { FileSpreadsheet, Sparkles, Trash2, FolderSync } from 'lucide-react';

interface NavbarProps {
  onLoadSamples: () => void;
  onClearAll: () => void;
  totalInvoices: number;
}

export const Navbar: React.FC<NavbarProps> = ({ onLoadSamples, onClearAll, totalInvoices }) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
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
              Auto-converts FakturBeli & FakturJual to 2-Sheet Excel (.xlsx)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onLoadSamples}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 border border-emerald-200 rounded-lg transition-colors shadow-xs"
            title="Muat contoh faktur pajak pembelian & penjualan"
          >
            <FolderSync className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Load Sample Faktur</span>
            <span className="sm:hidden">Sample</span>
          </button>

          {totalInvoices > 0 && (
            <button
              onClick={onClearAll}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors"
              title="Hapus semua data"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear Data</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
