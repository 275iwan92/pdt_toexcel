export interface FakturItem {
  nomorUrut?: number;
  kodeBarang?: string;
  namaBarang: string;
  hargaSatuan: number;
  qty: number;
  satuan?: string;
  potonganHarga: number;
  ppnbm: number;
  hargaJual: number;
}

export interface FakturPajakData {
  id: string;
  fileName: string;
  category: 'beli' | 'jual'; // 'beli' = Faktur Beli (Pembelian), 'jual' = Faktur Jual (Penjualan)
  
  nomorFaktur: string;
  tanggalFaktur: string; // DD-MM-YYYY
  bulanTahun: string;    // MMYYYY e.g. "062026"
  
  // Penjual (Pengusaha Kena Pajak)
  namaPenjual: string;
  npwpPenjual: string;
  alamatPenjual?: string;

  // Pembeli
  namaPembeli: string;
  npwpPembeli: string;
  alamatPembeli?: string;

  // Items
  items: FakturItem[];

  // Totals / Rekap
  hargaJualTotal: number;
  potonganHargaTotal: number;
  hargaJualNett: number; // for Pembelian: Harga Jual - Potongan Harga
  uangMuka: number;
  dpp: number;
  dppNilaiLain: number;
  ppn: number;
  ppnbmTotal: number;
  keterangan: string;

  // Status
  rawText?: string;
  parseWarnings?: string[];
}

export const INDONESIAN_MONTHS: Record<string, string> = {
  januari: '01',
  februari: '02',
  maret: '03',
  april: '04',
  mei: '05',
  juni: '06',
  juli: '07',
  agustus: '08',
  september: '09',
  oktober: '10',
  november: '11',
  desember: '12',
};

/**
 * Parses Indonesian currency/number string (e.g. "2.266.200,00" -> 2266200.00)
 */
export function parseIdrNumber(valStr: string | null | undefined): number {
  if (!valStr) return 0;
  const cleaned = valStr
    .replace(/[^\d,.-]/g, '')
    .trim();
  if (!cleaned) return 0;

  // If format is like 2.266.200,00 (Indonesian: dot thousands, comma decimal)
  if (cleaned.includes(',')) {
    const withoutDots = cleaned.replace(/\./g, '');
    const withDotDecimal = withoutDots.replace(',', '.');
    const num = parseFloat(withDotDecimal);
    return isNaN(num) ? 0 : num;
  }
  
  // If only dots (e.g. 256.800) or pure number
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    // Definitely dots as thousands
    const num = parseFloat(cleaned.replace(/\./g, ''));
    return isNaN(num) ? 0 : num;
  } else if (parts.length === 2 && parts[1].length === 3) {
    // e.g. "256.800" without decimal -> 256800
    const num = parseFloat(cleaned.replace(/\./g, ''));
    return isNaN(num) ? 0 : num;
  }

  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Clean NPWP string to 15 or 16 continuous digits
 */
export function cleanNpwp(npwpStr: string | null | undefined): string {
  if (!npwpStr) return '';
  const digits = npwpStr.replace(/\D/g, '');
  // Keep first 16 or 15 digits
  return digits;
}

/**
 * Parses e-Faktur Pajak plain text (extracted from PDF pages)
 */
export function parseFakturText(text: string, fileName: string = '', categoryHint?: 'beli' | 'jual'): FakturPajakData {
  const warnings: string[] = [];

  // Normalize line endings and multiple spaces
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n').map(l => l.trim());

  // 1. Nomor Faktur Pajak
  let nomorFaktur = '';
  const noFakturMatch = normalized.match(/Kode\s+dan\s+Nomor\s+Seri\s+Faktur\s+Pajak\s*:\s*([0-9]{10,20})/i);
  if (noFakturMatch) {
    nomorFaktur = noFakturMatch[1].trim();
  } else {
    // Fallback: search for 16-digit pattern after "Faktur Pajak"
    const fallbackNo = normalized.match(/(\b0[0-9]{15}\b|\b[0-9]{16}\b)/);
    if (fallbackNo) nomorFaktur = fallbackNo[1];
  }

  // 2. Pengusaha Kena Pajak (Penjual)
  let namaPenjual = '';
  let npwpPenjual = '';
  const pkpMatch = normalized.match(/Pengusaha\s+Kena\s+Pajak:([\s\S]*?)Pembeli\s+Barang\s+Kena\s+Pajak/i);
  if (pkpMatch) {
    const pkpSection = pkpMatch[1];
    const namaMatch = pkpSection.match(/Nama\s*:\s*([^\n]+)/i);
    if (namaMatch) namaPenjual = namaMatch[1].trim();

    const npwpMatch = pkpSection.match(/NPWP\s*:\s*([0-9.\-\s]+)/i);
    if (npwpMatch) npwpPenjual = cleanNpwp(npwpMatch[1]);
  } else {
    // Fallback search
    const sellerNamaMatch = normalized.match(/Nama\s*:\s*([^\n]+)/i);
    if (sellerNamaMatch) namaPenjual = sellerNamaMatch[1].trim();
  }

  // 3. Pembeli Barang Kena Pajak
  let namaPembeli = '';
  let npwpPembeli = '';
  // Section spans from "Pembeli Barang Kena Pajak" until "Nama Barang Kena Pajak" or table header
  const pembeliMatch = normalized.match(/Pembeli\s+Barang\s+Kena\s+Pajak[^\n:]*:([\s\S]*?)(?:Nama\s+Barang\s+Kena\s+Pajak|\n\s*No\.\s*\n|Harga\s+Jual\s*\/)/i);
  if (pembeliMatch) {
    const pembeliSection = pembeliMatch[1];
    const namaMatch = pembeliSection.match(/Nama\s*:\s*([^\n]+)/i);
    if (namaMatch) namaPembeli = namaMatch[1].trim();

    const npwpMatch = pembeliSection.match(/NPWP\s*:\s*([0-9.\-\s]+)/i);
    if (npwpMatch) npwpPembeli = cleanNpwp(npwpMatch[1]);
  } else {
    // Fallback: search anywhere after PKP section for buyer NPWP
    const secondaryBuyerMatch = normalized.match(/Pembeli[\s\S]*?NPWP\s*:\s*([0-9.\-\s]+)/i);
    if (secondaryBuyerMatch) {
      npwpPembeli = cleanNpwp(secondaryBuyerMatch[1]);
    }
  }

  // 4. Tanggal Faktur & Kota
  let tanggalFaktur = '';
  let bulanTahun = '';
  // e.g. "KOTA SURABAYA, 23 Juni 2026" or "KAB. SIDOARJO, 10 September 2026"
  const dateMatch = normalized.match(/(?:(?:KOTA|KAB\.|KABUPATEN)\s+[A-Za-z\s.]+,\s*)?(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/i);
  if (dateMatch) {
    const day = dateMatch[1].padStart(2, '0');
    const monthName = dateMatch[2].toLowerCase();
    const year = dateMatch[3];
    const monthNum = INDONESIAN_MONTHS[monthName] || '01';
    tanggalFaktur = `${day}-${monthNum}-${year}`;
    bulanTahun = `${monthNum}${year}`;
  } else {
    // Numeric date fallback: "23-06-2026" or "23/06/2026"
    const numDateMatch = normalized.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (numDateMatch) {
      const day = numDateMatch[1].padStart(2, '0');
      const monthNum = numDateMatch[2].padStart(2, '0');
      const year = numDateMatch[3];
      tanggalFaktur = `${day}-${monthNum}-${year}`;
      bulanTahun = `${monthNum}${year}`;
    }
  }

  // 5. Totals / Rekap Section
  let hargaJualTotal = 0;
  let potonganHargaTotal = 0;
  let uangMuka = 0;
  let dpp = 0;
  let dppNilaiLain = 0;
  let ppn = 0;
  let ppnbmTotal = 0;
  let keterangan = '';

  const totalMatch = normalized.match(/Harga\s+Jual\s*(?:\/[^\n]+)?\s+([0-9.,]+)/i);
  if (totalMatch) {
    hargaJualTotal = parseIdrNumber(totalMatch[1]);
  }

  const potMatch = normalized.match(/Dikurangi\s+Potongan\s+Harga\s*([0-9.,]+)?/i);
  if (potMatch && potMatch[1]) {
    potonganHargaTotal = parseIdrNumber(potMatch[1]);
  }

  const umMatch = normalized.match(/Dikurangi\s+Uang\s+Muka\s+yang\s+telah\s+diterima\s*([0-9.,]+)?/i);
  if (umMatch && umMatch[1]) {
    uangMuka = parseIdrNumber(umMatch[1]);
  }

  const dppMatch = normalized.match(/Dasar\s+Pengenaan\s+Pajak\s*([0-9.,]+)/i);
  if (dppMatch) {
    dpp = parseIdrNumber(dppMatch[1]);
  }

  const ppnMatch = normalized.match(/Jumlah\s+PPN\s*(?:\([^\)]+\))?\s*([0-9.,]+)/i);
  if (ppnMatch) {
    ppn = parseIdrNumber(ppnMatch[1]);
  }

  const ppnbmMatch = normalized.match(/Jumlah\s+PPnBM\s*(?:\([^\)]+\))?\s*([0-9.,]+)/i);
  if (ppnbmMatch) {
    ppnbmTotal = parseIdrNumber(ppnbmMatch[1]);
  }

  // Check for DPP Nilai Lain if exists
  const dppNilaiLainMatch = normalized.match(/(?:DPP\s+Nilai\s+Lain|Dasar\s+Pengenaan\s+Pajak\s*\(DPP\s+Nilai\s+Lain\))\s*[:=]?\s*([0-9.,]+)/i);
  if (dppNilaiLainMatch) {
    dppNilaiLain = parseIdrNumber(dppNilaiLainMatch[1]);
  }

  // Keterangan / Referensi
  const refMatch = normalized.match(/\((?:Referensi|Keterangan)\s*:\s*([^)]*)\)/i);
  if (refMatch) {
    keterangan = refMatch[1].trim();
  }

  // Calculate hargaJualNett for Pembelian
  const hargaJualNett = hargaJualTotal - potonganHargaTotal;

  // 6. Items parsing
  const items: FakturItem[] = [];
  
  // Find item table chunk: between "Nama Barang Kena Pajak" and "Harga Jual / Penggantian"
  const tableStartIndex = normalized.indexOf('Nama Barang Kena Pajak');
  const tableEndIndex = normalized.lastIndexOf('Harga Jual / Penggantian');

  let tableText = '';
  if (tableStartIndex !== -1 && tableEndIndex !== -1 && tableEndIndex > tableStartIndex) {
    tableText = normalized.substring(tableStartIndex, tableEndIndex);
  } else if (tableStartIndex !== -1) {
    tableText = normalized.substring(tableStartIndex);
  } else {
    tableText = normalized;
  }

  // In DJP e-faktur format, items follow this structured block:
  // <item_number> [optional_code]
  // <Nama Barang>
  // Rp <harga_satuan> x <qty> <satuan>
  // Potongan Harga = Rp <potongan>
  // PPnBM (<ppnbm_rate>%) = Rp <ppnbm>
  // <harga_jual>
  
  // Regex strategy to split or match blocks
  // Find all matches of: Rp <val> x <val> <unit>
  const itemPattern = /(\d+)\s+([0-9]{6}|[-0-9A-Za-z]+)?\s*[\n\r]+([^\n\r]+(?:[\n\r]+(?!(?:Rp\s*[\d.,]+\s*x|Potongan Harga|\d+\s+[0-9]{6}))[^\n\r]+)*)[\n\r]+\s*Rp\s*([\d.,]+)\s*x\s*([\d.,]+)\s*([A-Za-z0-9\/]+)?[\s\S]*?Potongan\s*Harga\s*=\s*Rp\s*([\d.,]+)[\s\S]*?PPnBM\s*\([^\)]*\)\s*=\s*Rp\s*([\d.,]+)[\s\S]*?([\d.,]+)(?=\s*(?:\d+\s+[0-9]{6}|\d+\s+[A-Z]|Harga\s+Jual\s*\/|$))/gi;

  let match;
  while ((match = itemPattern.exec(tableText)) !== null) {
    const no = parseInt(match[1], 10);
    const kode = match[2] || '';
    const rawNama = match[3].trim();
    const hargaSatuan = parseIdrNumber(match[4]);
    const qty = parseIdrNumber(match[5]);
    const satuan = match[6] || '';
    const potonganHarga = parseIdrNumber(match[7]);
    const ppnbm = parseIdrNumber(match[8]);
    const hargaJual = parseIdrNumber(match[9]);

    items.push({
      nomorUrut: isNaN(no) ? items.length + 1 : no,
      kodeBarang: kode,
      namaBarang: rawNama,
      hargaSatuan,
      qty,
      satuan,
      potonganHarga,
      ppnbm,
      hargaJual,
    });
  }

  // If standard item regex did not capture all items (e.g. slight OCR variation),
  // let's do a line-by-line fallback parser
  if (items.length === 0) {
    const fallbackItems = parseItemsFallback(tableText);
    if (fallbackItems.length > 0) {
      items.push(...fallbackItems);
    }
  }

  // Determine category ('beli' or 'jual')
  // By default:
  // If user provided a categoryHint, respect it.
  // Otherwise check filename or relativePath: "fakturbeli", "fakturjual", "beli", "jual".
  // Or check if INDAL or company is Penjual vs Pembeli.
  let category: 'beli' | 'jual' = categoryHint || 'beli';
  const lowerFile = fileName.toLowerCase();
  if (lowerFile.includes('jual') || lowerFile.includes('penjualan')) {
    category = 'jual';
  } else if (lowerFile.includes('beli') || lowerFile.includes('pembelian')) {
    category = 'beli';
  } else if (!categoryHint) {
    // If company is Penjual, it's a Faktur Jual (sales invoice).
    // If buyer is company or unknown, default to 'beli' or 'jual'.
    // If Penjual has "INDAL" or similar prominent PKP, can infer.
  }

  return {
    id: `${nomorFaktur || fileName}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    fileName,
    category,
    nomorFaktur,
    tanggalFaktur,
    bulanTahun: bulanTahun || '000000',
    namaPenjual,
    npwpPenjual,
    namaPembeli,
    npwpPembeli,
    items,
    hargaJualTotal,
    potonganHargaTotal,
    hargaJualNett,
    uangMuka,
    dpp,
    dppNilaiLain,
    ppn,
    ppnbmTotal,
    keterangan,
    rawText: normalized,
    parseWarnings: warnings,
  };
}

/**
 * Fallback line-by-line parser for items in case of formatting anomalies
 */
function parseItemsFallback(tableText: string): FakturItem[] {
  const items: FakturItem[] = [];
  const lines = tableText.split('\n').map(l => l.trim()).filter(Boolean);

  let currentItem: Partial<FakturItem> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line matches: "Rp <satuan> x <qty> <unit>"
    const rateQtyMatch = line.match(/Rp\s*([\d.,]+)\s*x\s*([\d.,]+)(?:\s*([A-Za-z0-9\/]+))?/i);
    if (rateQtyMatch) {
      if (!currentItem) currentItem = {};
      currentItem.hargaSatuan = parseIdrNumber(rateQtyMatch[1]);
      currentItem.qty = parseIdrNumber(rateQtyMatch[2]);
      currentItem.satuan = rateQtyMatch[3] || 'Piece';
      
      // Look backward for product name
      if (!currentItem.namaBarang && i > 0) {
        let nameLines: string[] = [];
        let j = i - 1;
        while (j >= 0 && !lines[j].startsWith('Rp') && !lines[j].includes('Potongan Harga') && !lines[j].includes('Harga Jual')) {
          const l = lines[j];
          // If line starts with a number (item index e.g. "1 848200" or "1")
          const idxMatch = l.match(/^(\d+)(?:\s+([0-9]{5,8}))?\s*(.*)$/);
          if (idxMatch) {
            currentItem.nomorUrut = parseInt(idxMatch[1], 10);
            currentItem.kodeBarang = idxMatch[2] || '';
            if (idxMatch[3]) nameLines.unshift(idxMatch[3]);
            break;
          } else {
            nameLines.unshift(l);
          }
          j--;
          if (i - j > 4) break;
        }
        currentItem.namaBarang = nameLines.join(' ').trim();
      }
      continue;
    }

    if (currentItem && line.includes('Potongan Harga')) {
      const pMatch = line.match(/Potongan\s*Harga\s*=\s*Rp\s*([\d.,]+)/i);
      currentItem.potonganHarga = pMatch ? parseIdrNumber(pMatch[1]) : 0;
      continue;
    }

    if (currentItem && line.includes('PPnBM')) {
      const bmMatch = line.match(/PPnBM\s*\([^\)]*\)\s*=\s*Rp\s*([\d.,]+)/i);
      currentItem.ppnbm = bmMatch ? parseIdrNumber(bmMatch[1]) : 0;
      continue;
    }

    // Line with just numeric total for the item
    if (currentItem && currentItem.hargaSatuan !== undefined && currentItem.hargaJual === undefined) {
      const numMatch = line.match(/^([\d.,]+)$/);
      if (numMatch && !line.includes(' ')) {
        currentItem.hargaJual = parseIdrNumber(numMatch[1]);
        // Push and reset
        items.push({
          nomorUrut: currentItem.nomorUrut || items.length + 1,
          kodeBarang: currentItem.kodeBarang || '',
          namaBarang: currentItem.namaBarang || 'Barang/Jasa',
          hargaSatuan: currentItem.hargaSatuan || 0,
          qty: currentItem.qty || 1,
          satuan: currentItem.satuan || 'Piece',
          potonganHarga: currentItem.potonganHarga || 0,
          ppnbm: currentItem.ppnbm || 0,
          hargaJual: currentItem.hargaJual || ((currentItem.hargaSatuan || 0) * (currentItem.qty || 1)),
        });
        currentItem = null;
      }
    }
  }

  return items;
}
