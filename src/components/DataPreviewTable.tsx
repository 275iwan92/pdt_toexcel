import React, { useState, useMemo } from 'react';
import { Search, Filter, Layers, ListFilter, ArrowUpDown, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { FakturPajakData } from '../utils/fakturParser';

interface DataPreviewTableProps {
  invoices: FakturPajakData[];
  onSelectInvoice?: (inv: FakturPajakData) => void;
}

export const DataPreviewTable: React.FC<DataPreviewTableProps> = ({ invoices, onSelectInvoice }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'beli' | 'jual'>('all');
  const [activeSheet, setActiveSheet] = useState<'detail' | 'rekap'>('detail');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // Extract unique periods (MMYYYY)
  const periods = useMemo(() => {
    const s = new Set<string>();
    invoices.forEach(inv => {
      if (inv.bulanTahun && inv.bulanTahun !== '000000') {
        s.add(inv.bulanTahun);
      }
    });
    return Array.from(s).sort();
  }, [invoices]);

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      if (activeCategory !== 'all' && inv.category !== activeCategory) {
        return false;
      }
      if (selectedPeriod !== 'all' && inv.bulanTahun !== selectedPeriod) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchBasic = 
          inv.nomorFaktur.toLowerCase().includes(q) ||
          inv.namaPenjual.toLowerCase().includes(q) ||
          inv.namaPembeli.toLowerCase().includes(q) ||
          inv.npwpPenjual.toLowerCase().includes(q) ||
          inv.npwpPembeli.toLowerCase().includes(q) ||
          (inv.keterangan && inv.keterangan.toLowerCase().includes(q));

        if (matchBasic) return true;

        const matchItem = inv.items.some(it => it.namaBarang.toLowerCase().includes(q));
        if (matchItem) return true;

        return false;
      }
      return true;
    });
  }, [invoices, activeCategory, selectedPeriod, searchQuery]);

  // Flatten detail items if activeSheet === 'detail'
  interface FlatDetailRow {
    invoiceId: string;
    category: 'beli' | 'jual';
    nomorFaktur: string;
    tanggalFaktur: string;
    namaPenjual: string;
    npwpPenjual: string;
    namaPembeli: string;
    npwpPembeli: string;
    namaBarang: string;
    potonganHarga: number;
    ppnbm: number;
    qty: number;
    hargaSatuan: number;
    hargaJual: number;
    originalInvoice: FakturPajakData;
  }

  const flatDetailRows: FlatDetailRow[] = useMemo(() => {
    const rows: FlatDetailRow[] = [];
    for (const inv of filteredInvoices) {
      if (inv.items && inv.items.length > 0) {
        for (const it of inv.items) {
          rows.push({
            invoiceId: inv.id,
            category: inv.category,
            nomorFaktur: inv.nomorFaktur,
            tanggalFaktur: inv.tanggalFaktur,
            namaPenjual: inv.namaPenjual,
            npwpPenjual: inv.npwpPenjual,
            namaPembeli: inv.namaPembeli,
            npwpPembeli: inv.npwpPembeli,
            namaBarang: it.namaBarang,
            potonganHarga: it.potonganHarga,
            ppnbm: it.ppnbm,
            qty: it.qty,
            hargaSatuan: it.hargaSatuan,
            hargaJual: it.hargaJual,
            originalInvoice: inv,
          });
        }
      } else {
        rows.push({
          invoiceId: inv.id,
          category: inv.category,
          nomorFaktur: inv.nomorFaktur,
          tanggalFaktur: inv.tanggalFaktur,
          namaPenjual: inv.namaPenjual,
          npwpPenjual: inv.npwpPenjual,
          namaPembeli: inv.namaPembeli,
          npwpPembeli: inv.npwpPembeli,
          namaBarang: 'Barang/Jasa',
          potonganHarga: inv.potonganHargaTotal,
          ppnbm: inv.ppnbmTotal,
          qty: 1,
          hargaSatuan: inv.hargaJualTotal,
          hargaJual: inv.hargaJualTotal,
          originalInvoice: inv,
        });
      }
    }
    return rows;
  }, [filteredInvoices]);

  const totalRows = activeSheet === 'detail' ? flatDetailRows.length : filteredInvoices.length;
  const totalPages = Math.ceil(totalRows / pageSize) || 1;
  const paginatedDetails = flatDetailRows.slice((page - 1) * pageSize, page * pageSize);
  const paginatedRekap = filteredInvoices.slice((page - 1) * pageSize, page * pageSize);

  const formatIDR = (n: number | undefined) => {
    if (n === undefined || n === null) return '0.00';
    return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
      {/* Controls Bar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Sheet Selector (Tabs) */}
          <div className="inline-flex p-1 bg-slate-200/80 rounded-xl">
            <button
              type="button"
              onClick={() => { setActiveSheet('detail'); setPage(1); }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeSheet === 'detail'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sheet: Detail Barang ({flatDetailRows.length})
            </button>
            <button
              type="button"
              onClick={() => { setActiveSheet('rekap'); setPage(1); }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeSheet === 'rekap'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sheet: Rekap Faktur ({filteredInvoices.length})
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Kategori:</span>
            <div className="inline-flex p-1 bg-slate-200/80 rounded-xl">
              <button
                type="button"
                onClick={() => { setActiveCategory('all'); setPage(1); }}
                className={`px-3 py-1 text-xs font-medium rounded-lg cursor-pointer transition-all ${
                  activeCategory === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua ({invoices.length})
              </button>
              <button
                type="button"
                onClick={() => { setActiveCategory('beli'); setPage(1); }}
                className={`px-3 py-1 text-xs font-medium rounded-lg cursor-pointer transition-all ${
                  activeCategory === 'beli'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Faktur Beli
              </button>
              <button
                type="button"
                onClick={() => { setActiveCategory('jual'); setPage(1); }}
                className={`px-3 py-1 text-xs font-medium rounded-lg cursor-pointer transition-all ${
                  activeCategory === 'jual'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Faktur Jual
              </button>
            </div>
          </div>
        </div>

        {/* Filter by Month & Search Input */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          {/* Period selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium whitespace-nowrap">Periode (MMYYYY):</span>
            <select
              value={selectedPeriod}
              onChange={(e) => { setSelectedPeriod(e.target.value); setPage(1); }}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium shadow-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="all">Semua Periode</option>
              {periods.map(p => (
                <option key={p} value={p}>
                  {p.length === 6 ? `${p.substring(0, 2)}/${p.substring(2)}` : p}
                </option>
              ))}
            </select>
          </div>

          {/* Search bar */}
          <div className="flex-1 min-w-[220px] relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari no. faktur, nama penjual, pembeli, atau barang..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 shadow-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Spreadsheet / Table Container */}
      <div className="overflow-x-auto min-h-[300px]">
        {activeSheet === 'detail' ? (
          /* ========================================================
             SHEET: DETAIL BARANG (12 COLUMNS AS MANDATED)
             ['No. Faktur Pajak', 'Tanggal Faktur', 'Nama Penjual', 'NPWP Penjual', 
              'Nama Pembeli', 'NPWP Pembeli', 'Nama Barang/Jasa', 'Potongan Harga', 
              'PPnBM', 'Qty', 'Harga Satuan', 'Harga Jual']
             ======================================================== */
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-300 uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3 whitespace-nowrap">No. Faktur Pajak</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Tanggal Faktur</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Nama Penjual</th>
                <th className="py-2.5 px-3 whitespace-nowrap">NPWP Penjual</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Nama Pembeli</th>
                <th className="py-2.5 px-3 whitespace-nowrap">NPWP Pembeli</th>
                <th className="py-2.5 px-3 min-w-[200px]">Nama Barang/Jasa</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Potongan Harga</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">PPnBM</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Qty</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Harga Satuan</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Harga Jual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedDetails.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400">
                    Tidak ada data barang yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                paginatedDetails.map((row, idx) => (
                  <tr
                    key={`${row.invoiceId}-${idx}`}
                    className="hover:bg-slate-50 transition-colors font-mono text-[11px]"
                  >
                    <td className="py-2 px-3 whitespace-nowrap text-slate-900 font-semibold">
                      {row.nomorFaktur}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-slate-600 font-sans">
                      {row.tanggalFaktur}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-slate-800 font-sans">
                      {row.namaPenjual}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-slate-500">
                      {row.npwpPenjual}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-slate-800 font-sans">
                      {row.namaPembeli}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-slate-500">
                      {row.npwpPembeli}
                    </td>
                    <td className="py-2 px-3 text-slate-800 font-sans max-w-xs break-words">
                      {row.namaBarang}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-right text-slate-600">
                      {formatIDR(row.potonganHarga)}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-right text-slate-600">
                      {formatIDR(row.ppnbm)}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-right text-slate-900 font-semibold">
                      {row.qty.toLocaleString('id-ID', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-right text-slate-700">
                      {formatIDR(row.hargaSatuan)}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-right text-slate-900 font-bold">
                      {formatIDR(row.hargaJual)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          /* ========================================================
             SHEET: REKAP FAKTUR
             BAGIAN 1: OUTPUT EXCEL UNTUK PENJUALAN
             ['No. Faktur Pajak', 'Nama Penjual', 'Nama Pembeli', 'Tanggal Faktur', 
              'Harga Jual', 'Potongan Harga', 'Uang Muka yang telah diterima', 
              'DPP', 'DPP Nilai Lain', 'PPN', 'PPnBM', 'Keterangan ']

             BAGIAN 2: OUTPUT EXCEL UNTUK PEMBELIAN
             ['No. Faktur Pajak', 'Nama Penjual', 'Tanggal Faktur', 
              'Harga Jual', 'Potongan Harga', 'Harga Jual nett', 'DPP', 'PPN', 'PPnBM']
             ======================================================== */
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-300 uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3 whitespace-nowrap">No. Faktur Pajak</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Kategori</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Nama Penjual</th>
                {activeCategory !== 'beli' && (
                  <th className="py-2.5 px-3 whitespace-nowrap">Nama Pembeli</th>
                )}
                <th className="py-2.5 px-3 whitespace-nowrap">Tanggal Faktur</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Harga Jual</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">Potongan Harga</th>
                {activeCategory === 'beli' ? (
                  <th className="py-2.5 px-3 whitespace-nowrap text-right">Harga Jual nett</th>
                ) : (
                  <th className="py-2.5 px-3 whitespace-nowrap text-right">Uang Muka Diterima</th>
                )}
                <th className="py-2.5 px-3 whitespace-nowrap text-right">DPP</th>
                {activeCategory !== 'beli' && (
                  <th className="py-2.5 px-3 whitespace-nowrap text-right">DPP Nilai Lain</th>
                )}
                <th className="py-2.5 px-3 whitespace-nowrap text-right">PPN</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">PPnBM</th>
                {activeCategory !== 'beli' && (
                  <th className="py-2.5 px-3 whitespace-nowrap">Keterangan</th>
                )}
                <th className="py-2.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedRekap.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-12 text-center text-slate-400">
                    Tidak ada rekap faktur yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                paginatedRekap.map((inv) => {
                  const isBeli = inv.category === 'beli';
                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-slate-50 transition-colors font-mono text-[11px]"
                    >
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-900 font-semibold">
                        {inv.nomorFaktur}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-sans">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            isBeli ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {isBeli ? 'Beli' : 'Jual'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-800 font-sans">
                        {inv.namaPenjual}
                      </td>
                      {activeCategory !== 'beli' && (
                        <td className="py-2.5 px-3 whitespace-nowrap text-slate-800 font-sans">
                          {inv.namaPembeli}
                        </td>
                      )}
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-600 font-sans">
                        {inv.tanggalFaktur}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-right text-slate-800">
                        {formatIDR(inv.hargaJualTotal)}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-right text-slate-600">
                        {formatIDR(inv.potonganHargaTotal)}
                      </td>
                      {isBeli ? (
                        <td className="py-2.5 px-3 whitespace-nowrap text-right text-slate-800 font-medium">
                          {formatIDR(inv.hargaJualNett)}
                        </td>
                      ) : (
                        <td className="py-2.5 px-3 whitespace-nowrap text-right text-slate-600">
                          {formatIDR(inv.uangMuka)}
                        </td>
                      )}
                      <td className="py-2.5 px-3 whitespace-nowrap text-right text-slate-900 font-bold">
                        {formatIDR(inv.dpp)}
                      </td>
                      {activeCategory !== 'beli' && (
                        <td className="py-2.5 px-3 whitespace-nowrap text-right text-slate-600">
                          {formatIDR(inv.dppNilaiLain)}
                        </td>
                      )}
                      <td className="py-2.5 px-3 whitespace-nowrap text-right text-emerald-700 font-bold">
                        {formatIDR(inv.ppn)}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-right text-slate-600">
                        {formatIDR(inv.ppnbmTotal)}
                      </td>
                      {activeCategory !== 'beli' && (
                        <td className="py-2.5 px-3 text-slate-500 font-sans truncate max-w-[150px]">
                          {inv.keterangan || '-'}
                        </td>
                      )}
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => onSelectInvoice?.(inv)}
                          className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 cursor-pointer"
                          title="Lihat Detail Faktur"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
        <div>
          Menampilkan {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, totalRows)} dari {totalRows} baris
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-medium">
            Halaman {page} dari {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
