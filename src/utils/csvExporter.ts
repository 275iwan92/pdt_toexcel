import { FakturPajakData, cleanNpwp } from './fakturParser';

/**
 * Escapes a cell value for standard CSV compatibility.
 * If preserveText is true (e.g., for NPWP or Nomor Faktur), wraps as ="value"
 * so Microsoft Excel does not convert large numeric strings into scientific notation (e.g. 3.5E+15)
 * or drop leading zeroes (e.g. 040...).
 */
function escapeCsvCell(val: string | number | undefined | null, preserveText = false): string {
  if (val === undefined || val === null) return '""';
  const str = String(val);

  if (preserveText && str.trim()) {
    // Formula format ="04002600370924288" prevents Excel scientific notation
    const escaped = str.replace(/"/g, '""');
    return `="""${escaped}"""`;
  }

  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Generates CSV string for "Detail Barang" (12 columns, Attachment #1 format).
 */
export function generateDetailCsv(fakturs: FakturPajakData[]): string {
  const headers = [
    'No. Faktur Pajak',
    'Tanggal Faktur',
    'Nama Penjual',
    'NPWP Penjual',
    'Nama Pembeli',
    'NPWP Pembeli',
    'Nama Barang/Jasa',
    'Potongan Harga',
    'PPnBM',
    'Qty',
    'Harga Satuan',
    'Harga Jual',
  ];

  const lines: string[] = [];
  lines.push(headers.map((h) => escapeCsvCell(h)).join(','));

  for (const f of fakturs) {
    const cleanNoFaktur = String(f.nomorFaktur || '').trim();
    const cleanNpwpSeller = cleanNpwp(f.npwpPenjual);
    const cleanNpwpBuyer = cleanNpwp(f.npwpPembeli);

    if (f.items && f.items.length > 0) {
      for (const item of f.items) {
        const itemHj = item.hargaJual || (item.qty * item.hargaSatuan);
        lines.push([
          escapeCsvCell(cleanNoFaktur, true),
          escapeCsvCell(f.tanggalFaktur),
          escapeCsvCell(f.namaPenjual),
          escapeCsvCell(cleanNpwpSeller, true),
          escapeCsvCell(f.namaPembeli),
          escapeCsvCell(cleanNpwpBuyer, true),
          escapeCsvCell(item.namaBarang),
          escapeCsvCell(item.potonganHarga || 0),
          escapeCsvCell(item.ppnbm || 0),
          escapeCsvCell(item.qty || 0),
          escapeCsvCell(item.hargaSatuan || 0),
          escapeCsvCell(itemHj || 0),
        ].join(','));
      }
    } else {
      lines.push([
        escapeCsvCell(cleanNoFaktur, true),
        escapeCsvCell(f.tanggalFaktur),
        escapeCsvCell(f.namaPenjual),
        escapeCsvCell(cleanNpwpSeller, true),
        escapeCsvCell(f.namaPembeli),
        escapeCsvCell(cleanNpwpBuyer, true),
        escapeCsvCell('Barang / Jasa Kena Pajak'),
        escapeCsvCell(f.potonganHargaTotal || 0),
        escapeCsvCell(f.ppnbmTotal || 0),
        escapeCsvCell(1),
        escapeCsvCell(f.hargaJualTotal || 0),
        escapeCsvCell(f.hargaJualTotal || 0),
      ].join(','));
    }
  }

  return '\uFEFF' + lines.join('\r\n');
}

/**
 * Generates CSV string for "Rekap Faktur" (9 columns, Attachment #2 format).
 */
export function generateRekapCsv(fakturs: FakturPajakData[], category: 'beli' | 'jual' = 'beli'): string {
  const isJual = category === 'jual';
  const headers = [
    'No. Faktur Pajak',
    isJual ? 'Nama Pembeli' : 'Nama Penjual',
    'Tanggal Faktur',
    'Harga Jual',
    'Potongan Harga',
    'Harga Jual nett',
    'DPP',
    'PPN',
    'PPnBM',
  ];

  const lines: string[] = [];
  lines.push(headers.map((h) => escapeCsvCell(h)).join(','));

  let totalHargaJual = 0;
  let totalPotongan = 0;
  let totalHjNett = 0;
  let totalDpp = 0;
  let totalPpn = 0;
  let totalPpnbm = 0;

  for (const f of fakturs) {
    const cleanNoFaktur = String(f.nomorFaktur || '').trim();
    const partnerName = isJual ? f.namaPembeli : f.namaPenjual;
    const itemsHjSum = f.items && f.items.length > 0
      ? f.items.reduce((s, it) => s + (it.hargaJual || it.qty * it.hargaSatuan), 0)
      : 0;
    const hj = (f.hargaJualTotal && f.hargaJualTotal > 1) ? f.hargaJualTotal : (itemsHjSum || f.dpp || 0);
    const pot = f.potonganHargaTotal || 0;
    const hjNett = (f.hargaJualNett && f.hargaJualNett > 1) ? f.hargaJualNett : (hj - pot);
    const dpp = f.dpp || 0;
    const ppn = f.ppn || 0;
    const ppnbm = f.ppnbmTotal || 0;

    totalHargaJual += hj;
    totalPotongan += pot;
    totalHjNett += hjNett;
    totalDpp += dpp;
    totalPpn += ppn;
    totalPpnbm += ppnbm;

    lines.push([
      escapeCsvCell(cleanNoFaktur, true),
      escapeCsvCell(partnerName),
      escapeCsvCell(f.tanggalFaktur),
      escapeCsvCell(hj),
      escapeCsvCell(pot),
      escapeCsvCell(hjNett),
      escapeCsvCell(dpp),
      escapeCsvCell(ppn),
      escapeCsvCell(ppnbm),
    ].join(','));
  }

  // Summary row at the bottom
  lines.push([
    escapeCsvCell('TOTAL'),
    escapeCsvCell(''),
    escapeCsvCell(''),
    escapeCsvCell(totalHargaJual),
    escapeCsvCell(totalPotongan),
    escapeCsvCell(totalHjNett),
    escapeCsvCell(totalDpp),
    escapeCsvCell(totalPpn),
    escapeCsvCell(totalPpnbm),
  ].join(','));

  return '\uFEFF' + lines.join('\r\n');
}

/**
 * Downloads a CSV string as a downloadable file in the browser.
 */
export function downloadCsv(csvContent: string, fileName: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
