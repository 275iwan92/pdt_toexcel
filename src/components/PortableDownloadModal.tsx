import React, { useState } from 'react';
import {
  Download,
  X,
  Laptop,
  CheckCircle2,
  HardDrive,
  ShieldCheck,
  Zap,
  HelpCircle,
  FileCode2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { downloadPortableApp } from '../utils/portableAppExporter';

interface PortableDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PortableDownloadModal: React.FC<PortableDownloadModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadPortableApp();
      setDownloadSuccess(true);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
              <Laptop className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Deploy Aplikasi Portable ke Klien</h2>
              <p className="text-xs text-emerald-100">
                Zero-Install • 100% Offline • Windows XP / 7 / 8 / 10 / 11
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 text-xs sm:text-sm">
          {/* Quick Explanation */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-xs text-emerald-900">
                Aplikasi siap jalan tanpa perlu koneksi internet & tanpa instalasi!
              </p>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Paket ZIP ini berisi seluruh file aplikasi beserta skrip launcher otomatis. Sangat cocok dideploy langsung di komputer kantor atau klien, termasuk komputer dengan pembatasan hak Administrator.
              </p>
            </div>
          </div>

          {/* Key Advantages */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <HardDrive className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-800 text-xs">Zero Install</h4>
              <p className="text-[11px] text-slate-600 leading-normal">
                Tidak butuh installer (`.msi` / `.exe`). Cukup ekstrak di Desktop atau USB Flashdisk.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-800 text-xs">100% Offline & Aman</h4>
              <p className="text-[11px] text-slate-600 leading-normal">
                Data faktur diproses lokal di RAM komputer. Kerahasiaan data perpajakan klien 100% terjaga.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-800 text-xs">Semua Windows</h4>
              <p className="text-[11px] text-slate-600 leading-normal">
                Bisa berjalan di Windows XP SP3, Windows 7, Windows 8, Windows 10, hingga Windows 11.
              </p>
            </div>
          </div>

          {/* Deployment Steps */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <FileCode2 className="w-4 h-4 text-emerald-600" />
              <span>Cara Menjalankan di Komputer Klien:</span>
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <p className="font-semibold text-slate-800">
                    Ekstrak file <code className="px-1.5 py-0.5 bg-slate-200 text-slate-900 rounded font-mono text-[11px]">eFaktur_Converter_Portable.zip</code>
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Ekstrak ke folder mana saja (misal: Desktop, Drive D:\, atau USB Flashdisk).
                  </p>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <p className="font-semibold text-slate-800">
                    Untuk Windows 7, 8, 10, 11: Klik 2x file <code className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono text-[11px]">Jalankan_Aplikasi.bat</code>
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Aplikasi otomatis membuka browser default klien (Chrome, Edge, Firefox, Brave) pada port lokal offline.
                  </p>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <p className="font-semibold text-slate-800">
                    Untuk Windows XP: Klik file <code className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded font-mono text-[11px]">Buka_Langsung_Chrome.bat</code> atau <code className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded font-mono text-[11px]">Buka_Langsung_Firefox.bat</code>
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Atau langsung klik file <code className="px-1 py-0.5 bg-slate-200 text-slate-800 rounded font-mono text-[11px]">index.html</code> di browser yang terpasang di Windows XP (MyPal / Firefox 52 ESR).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>Format: File Arsip Standar .ZIP (Ukuran ~3.2 MB)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>
                {isDownloading
                  ? 'Sedang Menyiapkan Paket Portable...'
                  : downloadSuccess
                  ? 'Download Ulang Paket Portable (.zip)'
                  : 'Download Aplikasi Portable (.zip)'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
