import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Layers,
  ListFilter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  RotateCcw,
  FileSpreadsheet,
  FolderSync,
} from 'lucide-react';
import { FakturPajakData, cleanNpwp } from '../utils/fakturParser';

interface DataPreviewTableProps {
  invoices: FakturPajakData[];
  onSelectInvoice?: (inv: FakturPajakData) => void;
  onReset?: () => void;
  onLoadSamples?: () => void;
}

export const DataPreviewTable: React.FC<DataPreviewTableProps> = ({
  invoices,
  onSelectInvoice,
  onReset,
  onLoadSamples,
}) => {
  // Default to 'beli' as requested by user
  const [activeCategory, setActiveCategory] = useState<'all' | 'beli' | 'jual'>('beli');
  const [activeSheet, setActiveSheet] = useState<'detail' | 'rekap'>('detail');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(100);

  const countBeli = useMemo(() => invoices.filter((i) => i.category === 'beli').length, [invoices]);
  const countJual = useMemo(() => invoices.filter((i) => i.category === 'jual').length, [invoices]);

  // Extract unique periods (MMYYYY)
  const periods = useMemo(() => {
    const s = new Set<string>();
    invoices.forEach((inv) => {
      if (inv.bulanTahun && inv.bulanTahun !== '000000') {
        s.add(inv.bulanTahun);
      }
    });
    return Array.from(s).sort();
  }, [invoices]);

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
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

        const matchItem = inv.items.some((it) => it.namaBarang.toLowerCase().includes(q));
        if (matchItem) return true;

        return false;
      }
      return true;
    });
  }, [invoices, activeCategory, selectedPeriod, searchQuery]);

  // Calculate totals for Rekap Faktur summary row
  const totalsRekap = useMemo(() => {
    let hargaJual = 0;
    let potongan = 0;
    let hargaJualNett = 0;
    let uangMuka = 0;
    let dpp = 0;
    let dppNilaiLain = 0;
    let ppn = 0;
    let ppnbm = 0;

    for (const inv of filteredInvoices) {
      const hj = inv.hargaJualTotal || 0;
      const pot = inv.potonganHargaTotal || 0;
      const hjNett = inv.hargaJualNett || (hj - pot);
      hargaJual += hj;
      potongan += pot;
      hargaJualNett += hjNett;
      uangMuka += inv.uangMuka || 0;
      dpp += inv.dpp || 0;
      dppNilaiLain += inv.dppNilaiLain || 0;
      ppn += inv.ppn || 0;
      ppnbm += inv.ppnbmTotal || 0;
    }

    return {
      hargaJual,
      potongan,
      hargaJualNett,
      uangMuka,
      dpp,
      dppNilaiLain,
      ppn,
      ppnbm,
    };
  }, [filteredInvoices]);

  // Flatten detail items if activeSheet === 'detail' (Attachment #1)
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
      const cleanSellerNpwp = cleanNpwp(inv.npwpPenjual);
      const cleanBuyerNpwp = cleanNpwp(inv.npwpPembeli);

      if (inv.items && inv.items.length > 0) {
        for (const it of inv.items) {
          const itemHj = it.hargaJual || (it.qty * it.hargaSatuan);
          rows.push({
            invoiceId: inv.id,
            category: inv.category,
            nomorFaktur: inv.nomorFaktur,
            tanggalFaktur: inv.tanggalFaktur,
            namaPenjual: inv.namaPenjual,
            npwpPenjual: cleanSellerNpwp,
            namaPembeli: inv.namaPembeli,
            npwpPembeli: cleanBuyerNpwp,
            namaBarang: it.namaBarang,
            potonganHarga: it.potonganHarga || 0,
            ppnbm: it.ppnbm || 0,
            qty: it.qty || 0,
            hargaSatuan: it.hargaSatuan || 0,
            hargaJual: itemHj || 0,
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
          npwpPenjual: cleanSellerNpwp,
          namaPembeli: inv.namaPembeli,
          npwpPembeli: cleanBuyerNpwp,
          namaBarang: 'Barang / Jasa Kena Pajak',
          potonganHarga: inv.potonganHargaTotal || 0,
          ppnbm: inv.ppnbmTotal || 0,
          qty: 1,
          hargaSatuan: inv.hargaJualTotal || 0,
          hargaJual: inv.hargaJualTotal || 0,
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
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  };

  if (invoices.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <FileSpreadsheet className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-800">Preview Excel Kosong</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
          Seluruh data telah kosong/direset. Silakan pilih atau seret folder FakturBeli / FakturJual di atas untuk mengkonversi PDF ke Excel, atau muat contoh faktur.
        </p>
        {onLoadSamples && (
          <button
            type="button"
            onClick={onLoadSamples}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
          >
            <FolderSync className="w-4 h-4" />
            <span>Muat Contoh Faktur Pajak</span>
          </button>
        )}
      </div>
    );
  }

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
                onClick={() => { setActiveCategory('beli'); setPage(1); }}
                className={`px-3 py-1 text-xs font-medium rounded-lg cursor-pointer transition-all ${
                  activeCategory === 'beli'
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                fakturbeli.xlsx ({countBeli})
              </button>
              <button
                type="button"
                onClick={() => { setActiveCategory('jual'); setPage(1); }}
                className={`px-3 py-1 text-xs font-medium rounded-lg cursor-pointer transition-all ${
                  activeCategory === 'jual'
                    ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                fakturjual.xlsx ({countJual})
              </button>
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
              {periods.map((p) => (
                <option key={p} value={p}>
                  {p.length === 6 ? `${p.substring(0, 2)}/${p.substring(2)}` : p}
                </option>
              ))}
            </select>
          </div>

          {/* Search bar */}
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari no. faktur, nama penjual, pembeli, atau barang..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 shadow-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Reset Button */}
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 border border-rose-300 rounded-lg transition-colors cursor-pointer shadow-2xs"
              title="Kosongkan seluruh data PDF dan hasil preview Excel"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
              <span>Reset / Kosongkan</span>
            </button>
          )}
        </div>
      </div>

      {/* Spreadsheet / Table Container */}
      <div className="overflow-x-auto min-h-[300px]">
        {activeSheet === 'detail' ? (
          /* ========================================================
             SHEET: DETAIL BARANG (ATTACHMENT #1)
             12 Kolom Persis Attachment #1:
             ['No. Faktur Pajak', 'Tanggal Faktur', 'Nama Penjual', 'NPWP Penjual', 
              'Nama Pembeli', 'NPWP Pembeli', 'Nama Barang/Jasa', 'Potongan Harga', 
              'PPnBM', 'Qty', 'Harga Satuan', 'Harga Jual']
             ======================================================== */
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-[11px]">
                <th className="py-2.5 px-3 whitespace-nowrap border-r border-slate-200">No. Faktur Pajak</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-center border-r border-slate-200">Tanggal Faktur</th>
                <th className="py-2.5 px-3 whitespace-nowrap border-r border-slate-200">Nama Penjual</th>
                <th className="py-2.5 px-3 whitespace-nowrap border-r border-slate-200">NPWP Penjual</th>
                <th className="py-2.5 px-3 whitespace-nowrap border-r border-slate-200">Nama Pembeli</th>
                <th className="py-2.5 px-3 whitespace-nowrap border-r border-slate-200">NPWP Pembeli</th>
                <th className="py-2.5 px-3 min-w-[220px] border-r border-slate-200">Nama Barang/Jasa</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right border-r border-slate-200">Potongan Harga</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right border-r border-slate-200">PPnBM</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right border-r border-slate-200">Qty</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right border-r border-slate-200">Harga Satuan</th>
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
                    <td className="py-2 px-3 whitespace-nowrap text-slate-900 font-semibold border-r border-slate-100">
                      {row.nomorFaktur}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-slate-700 font-sans text-center border-r border-slate-100">
                      {row.tanggalFaktur}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-slate-900 font-sans border-r border-slate-100">
                      {row.namaPenjual}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-slate-700 border-r border-slate-100">
                      {row.npwpPenjual}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-slate-900 font-sans border-r border-slate-100">
                      {row.namaPembeli}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-slate-700 border-r border-slate-100">
                      {row.npwpPembeli}
                    </td>
                    <td className="py-2 px-3 text-slate-900 font-sans max-w-xs break-words border-r border-slate-100">
                      {row.namaBarang}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-right text-slate-600 border-r border-slate-100">
                      {formatIDR(row.potonganHarga)}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-right text-slate-600 border-r border-slate-100">
                      {formatIDR(row.ppnbm)}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-right text-slate-900 font-medium border-r border-slate-100">
                      {row.qty.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-right text-slate-800 border-r border-slate-100">
                      {formatIDR(row.hargaSatuan)}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-right text-slate-900 font-semibold">
                      {formatIDR(row.hargaJual)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          /* ========================================================
             SHEET: REKAP FAKTUR (ATTACHMENT #2)
             Jika Kategori === 'beli' (Attachment #2 Exact 9 Columns):
             ['No. Faktur Pajak', 'Nama Penjual', 'Tanggal Faktur', 
              'Harga Jual', 'Potongan Harga', 'Harga Jual nett', 'DPP', 'PPN', 'PPnBM']
             
             Plus Total Row with Yellow Highlight (#FFFF00) persis baris 11 attachment #2!
             ======================================================== */
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-[11px]">
                <th className="py-2.5 px-3 whitespace-nowrap border-r border-slate-200">No. Faktur Pajak</th>
                <th className="py-2.5 px-3 whitespace-nowrap border-r border-slate-200">Nama Penjual</th>
                {activeCategory !== 'beli' && (
                  <th className="py-2.5 px-3 whitespace-nowrap border-r border-slate-200">Nama Pembeli</th>
                )}
                <th className="py-2.5 px-3 whitespace-nowrap text-center border-r border-slate-200">Tanggal Faktur</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right border-r border-slate-200">Harga Jual</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right border-r border-slate-200">Potongan Harga</th>
                {activeCategory === 'beli' ? (
                  <th className="py-2.5 px-3 whitespace-nowrap text-right border-r border-slate-200">Harga Jual nett</th>
                ) : (
                  <th className="py-2.5 px-3 whitespace-nowrap text-right border-r border-slate-200">Uang Muka yang telah diterima</th>
                )}
                <th className="py-2.5 px-3 whitespace-nowrap text-right border-r border-slate-200">DPP</th>
                {activeCategory !== 'beli' && (
                  <th className="py-2.5 px-3 whitespace-nowrap text-right border-r border-slate-200">DPP Nilai Lain</th>
                )}
                <th className="py-2.5 px-3 whitespace-nowrap text-right border-r border-slate-200">PPN</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right border-r border-slate-200">PPnBM</th>
                {activeCategory !== 'beli' && (
                  <th className="py-2.5 px-3 whitespace-nowrap">Keterangan </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedRekap.length === 0 ? (
                <tr>
                  <td colSpan={activeCategory === 'beli' ? 9 : 12} className="py-12 text-center text-slate-400">
                    Tidak ada rekap faktur yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                paginatedRekap.map((inv) => {
                  const hj = inv.hargaJualTotal || 0;
                  const pot = inv.potonganHargaTotal || 0;
                  const hjNett = inv.hargaJualNett || (hj - pot);

                  return (
                    <tr
                      key={inv.id}
                      onClick={() => onSelectInvoice?.(inv)}
                      className="hover:bg-slate-50 transition-colors font-mono text-[11px] cursor-pointer"
                      title="Klik baris untuk melihat detail faktur"
                    >
                      <td className="py-2 px-3 whitespace-nowrap text-slate-900 font-semibold border-r border-slate-100">
                        {inv.nomorFaktur}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap text-slate-900 font-sans border-r border-slate-100">
                        {inv.namaPenjual}
                      </td>
                      {activeCategory !== 'beli' && (
                        <td className="py-2 px-3 whitespace-nowrap text-slate-900 font-sans border-r border-slate-100">
                          {inv.namaPembeli}
                        </td>
                      )}
                      <td className="py-2 px-3 whitespace-nowrap text-slate-700 font-sans text-center border-r border-slate-100">
                        {inv.tanggalFaktur}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap text-right text-slate-900 border-r border-slate-100">
                        {formatIDR(hj)}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap text-right text-slate-600 border-r border-slate-100">
                        {formatIDR(pot)}
                      </td>
                      {activeCategory === 'beli' ? (
                        <td className="py-2 px-3 whitespace-nowrap text-right text-slate-900 font-medium border-r border-slate-100">
                          {formatIDR(hjNett)}
                        </td>
                      ) : (
                        <td className="py-2 px-3 whitespace-nowrap text-right text-slate-600 border-r border-slate-100">
                          {formatIDR(inv.uangMuka)}
                        </td>
                      )}
                      <td className="py-2 px-3 whitespace-nowrap text-right text-slate-900 border-r border-slate-100">
                        {formatIDR(inv.dpp)}
                      </td>
                      {activeCategory !== 'beli' && (
                        <td className="py-2 px-3 whitespace-nowrap text-right text-slate-600 border-r border-slate-100">
                          {formatIDR(inv.dppNilaiLain)}
                        </td>
                      )}
                      <td className="py-2 px-3 whitespace-nowrap text-right text-slate-900 border-r border-slate-100">
                        {formatIDR(inv.ppn)}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap text-right text-slate-900 border-r border-slate-100">
                        {formatIDR(inv.ppnbmTotal)}
                      </td>
                      {activeCategory !== 'beli' && (
                        <td className="py-2 px-3 text-slate-600 font-sans truncate max-w-[160px]">
                          {inv.keterangan || '-'}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* TOTAL ROW (Persis Baris 11 di Attachment #2 dengan Yellow Highlight #FFFF00) */}
            {filteredInvoices.length > 0 && (
              <tfoot>
                {activeCategory === 'beli' ? (
                  <tr className="font-mono text-[11px] font-bold">
                    <td className="py-2 px-3 bg-white"></td>
                    <td className="py-2 px-3 bg-white"></td>
                    <td className="py-2 px-3 bg-white"></td>
                    {/* Col D: Harga Jual - YELLOW HIGHLIGHT */}
                    <td className="py-2 px-3 whitespace-nowrap text-right text-black bg-[#FFFF00] border-t border-b-2 border-l border-r border-black shadow-xs">
                      {formatIDR(totalsRekap.hargaJual)}
                    </td>
                    {/* Col E: Potongan Harga - BLANK (Persis attachment #2) */}
                    <td className="py-2 px-3 bg-white"></td>
                    {/* Col F: Harga Jual nett - YELLOW HIGHLIGHT */}
                    <td className="py-2 px-3 whitespace-nowrap text-right text-black bg-[#FFFF00] border-t border-b-2 border-l border-r border-black shadow-xs">
                      {formatIDR(totalsRekap.hargaJualNett)}
                    </td>
                    {/* Col G: DPP - YELLOW HIGHLIGHT */}
                    <td className="py-2 px-3 whitespace-nowrap text-right text-black bg-[#FFFF00] border-t border-b-2 border-l border-r border-black shadow-xs">
                      {formatIDR(totalsRekap.dpp)}
                    </td>
                    {/* Col H: PPN - YELLOW HIGHLIGHT */}
                    <td className="py-2 px-3 whitespace-nowrap text-right text-black bg-[#FFFF00] border-t border-b-2 border-l border-r border-black shadow-xs">
                      {formatIDR(totalsRekap.ppn)}
                    </td>
                    {/* Col I: PPnBM - YELLOW HIGHLIGHT */}
                    <td className="py-2 px-3 whitespace-nowrap text-right text-black bg-[#FFFF00] border-t border-b-2 border-l border-r border-black shadow-xs">
                      {formatIDR(totalsRekap.ppnbm)}
                    </td>
                  </tr>
                ) : (
                  <tr className="font-mono text-[11px] font-bold">
                    <td className="py-2 px-3 bg-white"></td>
                    <td className="py-2 px-3 bg-white"></td>
                    <td className="py-2 px-3 bg-white"></td>
                    <td className="py-2 px-3 bg-white"></td>
                    <td className="py-2 px-3 whitespace-nowrap text-right text-black bg-[#FFFF00] border-t border-b-2 border-l border-r border-black shadow-xs">
                      {formatIDR(totalsRekap.hargaJual)}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-right text-black bg-[#FFFF00] border-t border-b-2 border-l border-r border-black shadow-xs">
                      {formatIDR(totalsRekap.potongan)}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-right text-black bg-[#FFFF00] border-t border-b-2 border-l border-r border-black shadow-xs">
                      {formatIDR(totalsRekap.uangMuka)}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-right text-black bg-[#FFFF00] border-t border-b-2 border-l border-r border-black shadow-xs">
                      {formatIDR(totalsRekap.dpp)}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-right text-black bg-[#FFFF00] border-t border-b-2 border-l border-r border-black shadow-xs">
                      {formatIDR(totalsRekap.dppNilaiLain)}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-right text-black bg-[#FFFF00] border-t border-b-2 border-l border-r border-black shadow-xs">
                      {formatIDR(totalsRekap.ppn)}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-right text-black bg-[#FFFF00] border-t border-b-2 border-l border-r border-black shadow-xs">
                      {formatIDR(totalsRekap.ppnbm)}
                    </td>
                    <td className="py-2 px-3 bg-white"></td>
                  </tr>
                )}
              </tfoot>
            )}
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-3">
          <span>
            Menampilkan <strong className="text-slate-800 font-semibold">{totalRows === 0 ? 0 : (page - 1) * pageSize + 1} - {Math.min(page * pageSize, totalRows)}</strong> dari <strong className="text-slate-800 font-semibold">{totalRows}</strong> baris data
          </span>
          <div className="flex items-center gap-1.5 ml-2 border-l border-slate-200 pl-3">
            <span className="text-slate-400">Tampilkan:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-700 font-medium focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value={20}>20 baris</option>
              <option value={50}>50 baris</option>
              <option value={100}>100 baris (Lihat Semua 90)</option>
              <option value={500}>500 baris</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-medium">
            Halaman {page} dari {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
