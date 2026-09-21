import React from 'react';
import { X, FileText, CheckCircle2, Building, Calendar, DollarSign } from 'lucide-react';
import { FakturPajakData } from '../utils/fakturParser';

interface InvoiceDetailModalProps {
  invoice: FakturPajakData | null;
  onClose: () => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({ invoice, onClose }) => {
  if (!invoice) return null;

  const formatIDR = (n: number | undefined) => {
    if (n === undefined || n === null) return 'Rp 0,00';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 2 }).format(n);
  };

  const isBeli = invoice.category === 'beli';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl text-white font-bold text-xs ${isBeli ? 'bg-blue-600' : 'bg-emerald-600'}`}>
              {isBeli ? 'FAKTUR BELI' : 'FAKTUR JUAL'}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-mono">
                {invoice.nomorFaktur}
              </h3>
              <p className="text-xs text-slate-500">
                File: {invoice.fileName} • Tanggal: {invoice.tanggalFaktur}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Parties: Penjual & Pembeli */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Pengusaha Kena Pajak (Penjual)
              </div>
              <div className="font-bold text-slate-900 text-sm">{invoice.namaPenjual}</div>
              <div className="font-mono text-slate-600">NPWP: {invoice.npwpPenjual || '-'}</div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Pembeli Barang Kena Pajak
              </div>
              <div className="font-bold text-slate-900 text-sm">{invoice.namaPembeli}</div>
              <div className="font-mono text-slate-600">NPWP: {invoice.npwpPembeli || '-'}</div>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Daftar Barang / Jasa Kena Pajak ({invoice.items.length} Item)
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">No</th>
                    <th className="py-2 px-3">Nama Barang / Jasa</th>
                    <th className="py-2 px-3 text-right">Qty</th>
                    <th className="py-2 px-3 text-right">Harga Satuan</th>
                    <th className="py-2 px-3 text-right">Potongan</th>
                    <th className="py-2 px-3 text-right">Harga Jual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {invoice.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-slate-400">{item.nomorUrut || idx + 1}</td>
                      <td className="py-2 px-3 font-sans text-slate-800">{item.namaBarang}</td>
                      <td className="py-2 px-3 text-right text-slate-900">
                        {item.qty.toLocaleString('id-ID')} {item.satuan}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-600">{formatIDR(item.hargaSatuan)}</td>
                      <td className="py-2 px-3 text-right text-slate-500">{formatIDR(item.potonganHarga)}</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">{formatIDR(item.hargaJual)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Rekap Totals */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-sans">Harga Jual Total</div>
              <div className="font-bold text-slate-800">{formatIDR(invoice.hargaJualTotal)}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-sans">Dasar Pengenaan Pajak (DPP)</div>
              <div className="font-bold text-slate-900">{formatIDR(invoice.dpp)}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-sans">Jumlah PPN (11%/12%)</div>
              <div className="font-bold text-emerald-700">{formatIDR(invoice.ppn)}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-sans">Keterangan / Referensi</div>
              <div className="font-sans text-slate-700 truncate">{invoice.keterangan || '-'}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 px-5 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
