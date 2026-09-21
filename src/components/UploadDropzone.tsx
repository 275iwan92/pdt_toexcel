import React, { useRef, useState } from 'react';
import { UploadCloud, FolderUp, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface UploadDropzoneProps {
  onFilesSelected: (files: File[], targetCategory?: 'beli' | 'jual') => Promise<void>;
  isProcessing: boolean;
  progress: { current: number; total: number; currentFileName?: string } | null;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  onFilesSelected,
  isProcessing,
  progress,
}) => {
  const [dragActiveBeli, setDragActiveBeli] = useState(false);
  const [dragActiveJual, setDragActiveJual] = useState(false);

  // Hidden inputs
  const beliFileInputRef = useRef<HTMLInputElement>(null);
  const beliFolderInputRef = useRef<HTMLInputElement>(null);
  const jualFileInputRef = useRef<HTMLInputElement>(null);
  const jualFolderInputRef = useRef<HTMLInputElement>(null);
  const anyFolderInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent, type: 'beli' | 'jual', status: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'beli') setDragActiveBeli(status);
    if (type === 'jual') setDragActiveJual(status);
  };

  const handleDrop = async (e: React.DragEvent, type: 'beli' | 'jual') => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'beli') setDragActiveBeli(false);
    if (type === 'jual') setDragActiveJual(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter(
        f => f.name.toLowerCase().endsWith('.pdf') || f.type === 'application/pdf'
      );
      if (files.length > 0) {
        await onFilesSelected(files, type);
      }
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>, type?: 'beli' | 'jual') => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).filter(
        f => f.name.toLowerCase().endsWith('.pdf') || f.type === 'application/pdf'
      );
      if (files.length > 0) {
        await onFilesSelected(files, type);
      }
      e.target.value = ''; // Reset input to allow re-selection
    }
  };

  return (
    <div className="space-y-4">
      {/* Top action helper bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100/70 p-3 rounded-xl border border-slate-200 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <FolderUp className="w-4 h-4 text-emerald-600" />
          <span>
            Pilih atau seret folder <strong>FakturBeli</strong> atau <strong>FakturJual</strong> berisi file-file PDF Faktur Pajak.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => anyFolderInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-md border border-slate-300 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <FolderUp className="w-3.5 h-3.5 text-slate-500" />
            Upload Any Folder (Auto-Detect)
          </button>
          <input
            ref={anyFolderInputRef}
            type="file"
            multiple
            // @ts-ignore
            webkitdirectory="true"
            directory="true"
            className="hidden"
            onChange={(e) => handleInputChange(e)}
          />
        </div>
      </div>

      {/* Two dedicated dropzones: Faktur Beli and Faktur Jual */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. DROPZONE FAKTUR BELI */}
        <div
          onDragOver={(e) => handleDrag(e, 'beli', true)}
          onDragEnter={(e) => handleDrag(e, 'beli', true)}
          onDragLeave={(e) => handleDrag(e, 'beli', false)}
          onDrop={(e) => handleDrop(e, 'beli')}
          className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
            dragActiveBeli
              ? 'border-blue-500 bg-blue-50/70'
              : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50/50'
          }`}
        >
          <input
            ref={beliFileInputRef}
            type="file"
            multiple
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => handleInputChange(e, 'beli')}
          />
          <input
            ref={beliFolderInputRef}
            type="file"
            multiple
            // @ts-ignore
            webkitdirectory="true"
            directory="true"
            className="hidden"
            onChange={(e) => handleInputChange(e, 'beli')}
          />

          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
              <FolderUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Folder / File: Faktur Beli (Pembelian)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Output: <code className="text-blue-600 font-mono font-medium">fakturbeli-mmyyyy.xlsx</code>
              </p>
            </div>

            <p className="text-xs text-slate-400 max-w-xs">
              Seret PDF ke sini, atau klik tombol di bawah untuk memilih file atau folder
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => beliFolderInputRef.current?.click()}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              >
                Pilih Folder FakturBeli
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => beliFileInputRef.current?.click()}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200 cursor-pointer disabled:opacity-50"
              >
                Pilih File PDF
              </button>
            </div>
          </div>
        </div>

        {/* 2. DROPZONE FAKTUR JUAL */}
        <div
          onDragOver={(e) => handleDrag(e, 'jual', true)}
          onDragEnter={(e) => handleDrag(e, 'jual', true)}
          onDragLeave={(e) => handleDrag(e, 'jual', false)}
          onDrop={(e) => handleDrop(e, 'jual')}
          className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
            dragActiveJual
              ? 'border-emerald-500 bg-emerald-50/70'
              : 'border-slate-300 bg-white hover:border-emerald-400 hover:bg-slate-50/50'
          }`}
        >
          <input
            ref={jualFileInputRef}
            type="file"
            multiple
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => handleInputChange(e, 'jual')}
          />
          <input
            ref={jualFolderInputRef}
            type="file"
            multiple
            // @ts-ignore
            webkitdirectory="true"
            directory="true"
            className="hidden"
            onChange={(e) => handleInputChange(e, 'jual')}
          />

          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
              <FolderUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Folder / File: Faktur Jual (Penjualan)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Output: <code className="text-emerald-700 font-mono font-medium">fakturjual-mmyyyy.xlsx</code>
              </p>
            </div>

            <p className="text-xs text-slate-400 max-w-xs">
              Seret PDF ke sini, atau klik tombol di bawah untuk memilih file atau folder
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => jualFolderInputRef.current?.click()}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              >
                Pilih Folder FakturJual
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => jualFileInputRef.current?.click()}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200 cursor-pointer disabled:opacity-50"
              >
                Pilih File PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Processing Progress Bar */}
      {isProcessing && progress && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2 animate-pulse">
          <div className="flex items-center justify-between text-xs font-medium text-blue-900">
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              Mengekstrak PDF ({progress.current} / {progress.total})...
            </span>
            <span className="font-semibold">
              {Math.round((progress.current / progress.total) * 100)}%
            </span>
          </div>
          <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300 rounded-full"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
          {progress.currentFileName && (
            <p className="text-[11px] text-blue-700 truncate">
              File: {progress.currentFileName}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
