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
  // Keep first 16 or 15 digits (handles trailing 000000 branch suffixes)
  if (digits.length > 16) {
    return digits.substring(0, 16);
  }
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

  // 6. Robust Multi-Page Items Parsing Algorithm
  // Patterns for repeating table headers/footers in multi-page e-Faktur
  const PAGE_HEADER_FOOTER_PATTERNS = [
    /^Faktur\s+Pajak/i,
    /^Kode\s+dan\s+Nomor\s+Seri/i,
    /^Pengusaha\s+Kena\s+Pajak/i,
    /^Pembeli\s+Barang\s+Kena\s+Pajak/i,
    /^Nama\s*:/i,
    /^Alamat\s*:/i,
    /^NPWP\s*:/i,
    /^NIK\s*:/i,
    /^Nomor\s+Paspor\s*:/i,
    /^Identitas\s+Lain\s*:/i,
    /^Email\s*:/i,
    /^No\.?\s*(?:Kode\s*Barang)?/i,
    /^Kode\s*(?:Barang)?/i,
    /^Barang\s*\/\s*Jasa/i,
    /^Nama\s+Barang\s+Kena\s+Pajak/i,
    /^Harga\s+Jual\s*\/\s*Penggantian/i,
    /^Uang\s+Muka\s*\/\s*Termin/i,
    /^\(Rp\)/i,
    /^Halaman\s+\d+/i,
    /^Page\s+\d+/i,
    /^\d+\s+(?:dari|of)\s+\d+/i,
    /^Lembar\s+ke/i,
    /^Untuk\s*:/i,
    /^Salinan\b/i,
    /^Ditandatangani\s+secara\s+elektronik/i,
    /^(?:KOTA|KAB\.?|KABUPATEN|JAKARTA|SURABAYA|SIDOARJO|SEMARANG|MEDAN|BANDUNG|BEKASI|TANGERANG)\s*,?\s*\d{1,2}\s+[A-Za-z]+\s+\d{4}/i,
    /^\(Referensi:[^\)]*\)/i,
    /^Referensi\s*:/i,
    /^#\d{15,22}/,
    /^(?:Potongan\s*Harga|PPnBM)/i,
  ];

  // In Indonesian e-Faktur, every item calculation row has:
  // "Rp <hargaSatuan> x <qty> <satuan>"
  // We locate all occurrences of this invariant anchor, supporting x, X, and Unicode ×
  const rateQtyRegex = /Rp\.?\s*([\d.,]+)\s*[xX\u00D7]\s*([\d.,]+)(?:\s+([A-Za-z0-9\/\-]+))?/gi;
  interface MatchedRate {
    index: number;
    length: number;
    hargaSatuan: number;
    qty: number;
    satuan: string;
  }

  const rateMatches: MatchedRate[] = [];
  let rMatch: RegExpExecArray | null;
  while ((rMatch = rateQtyRegex.exec(normalized)) !== null) {
    rateMatches.push({
      index: rMatch.index,
      length: rMatch[0].length,
      hargaSatuan: parseIdrNumber(rMatch[1]),
      qty: parseIdrNumber(rMatch[2]),
      satuan: rMatch[3] || 'Piece',
    });
  }

  const items: FakturItem[] = [];

  // Find start of items section (after Pembeli header or "Nama Barang Kena Pajak")
  const firstTableHdr = normalized.indexOf('Nama Barang Kena Pajak');
  let tableSearchStart = firstTableHdr !== -1 ? firstTableHdr + 22 : 0;
  
  // Find end of items section (before summary totals)
  // Anchored before Dikurangi Potongan / DPP summary
  const summaryAnchor = normalized.search(/(?:Harga\s+Jual\s*\/\s*Penggantian[^\n]*\n\s*Dikurangi|Dikurangi\s+Potongan\s+Harga|Dasar\s+Pengenaan\s+Pajak)/i);
  const tableSearchEnd = summaryAnchor !== -1 ? summaryAnchor : normalized.length;

  let lastItemEndIndex = tableSearchStart;

  for (let i = 0; i < rateMatches.length; i++) {
    const currentRate = rateMatches[i];
    const nextRate = rateMatches[i + 1];

    // The text preceding this rate line contains the item index, code, and product name
    const precedingChunk = normalized.substring(lastItemEndIndex, currentRate.index);

    // Filter lines in preceding chunk
    const rawLines = precedingChunk.split('\n').map(l => l.trim()).filter(Boolean);
    const candidateLines: string[] = [];

    for (const line of rawLines) {
      // Check if line matches known header/footer
      const isHdr = PAGE_HEADER_FOOTER_PATTERNS.some(p => p.test(line));
      if (isHdr) continue;

      // Check if line is purely a numeric currency amount or trailing item total (e.g. "638.000,00", "471,00", "0,00")
      if (/^(?:Rp\.?\s*)?[\d.,]+$/.test(line)) {
        continue;
      }

      // Skip address details leaking across page break
      if (/^(?:RT\s*\d+|RW\s*\d+|JAWA\s+TIMUR|DKI\s+JAKARTA|\b\d{5}\b)$/i.test(line)) {
        continue;
      }

      candidateLines.push(line);
    }

    let nomorUrut = i + 1;
    let kodeBarang = '';
    let namaBarang = '';

    if (candidateLines.length > 0) {
      // Find the line where the item actually starts: either "^(number) (code)" or "^(number)"
      const itemStartIdx = candidateLines.findIndex((line) => {
        const m = line.match(/^(\d{1,4})(?:\s+([0-9]{5,8}))?(?:\s+(.*))?$/);
        return m !== null && parseInt(m[1], 10) <= 9999;
      });

      // Discard any preceding lines before the item start (e.g. signer names or page break text)
      const validLines = itemStartIdx !== -1 ? candidateLines.slice(itemStartIdx) : candidateLines;

      if (validLines.length > 0) {
        const firstLine = validLines[0];
        const numMatch = firstLine.match(/^(\d{1,4})(?:\s+([0-9]{5,8}))?(?:\s+(.*))?$/);
        if (numMatch && parseInt(numMatch[1], 10) <= 9999) {
          nomorUrut = parseInt(numMatch[1], 10);
          kodeBarang = numMatch[2] || '';
          const inlineName = numMatch[3] || '';
          const remaining = validLines.slice(1);

          if (inlineName) {
            namaBarang = [inlineName, ...remaining].join(' ').trim();
          } else if (remaining.length > 0) {
            if (!kodeBarang && /^[0-9]{5,8}$/.test(remaining[0])) {
              kodeBarang = remaining[0];
              namaBarang = remaining.slice(1).join(' ').trim();
            } else {
              namaBarang = remaining.join(' ').trim();
            }
          }
        } else {
          namaBarang = validLines.join(' ').trim();
        }
      }
    }

    if (!namaBarang) {
      namaBarang = 'Barang / Jasa Kena Pajak';
    }

    // Now look at text following currentRate up to next item or table end
    const postChunkEnd = nextRate ? nextRate.index : tableSearchEnd;
    const postChunk = normalized.substring(currentRate.index + currentRate.length, postChunkEnd);

    // Extract Potongan Harga
    let potonganHarga = 0;
    const potMatch = postChunk.match(/Potongan\s*Harga\s*=\s*Rp\.?\s*([\d.,]+)/i);
    if (potMatch) {
      potonganHarga = parseIdrNumber(potMatch[1]);
    }

    // Extract PPnBM
    let ppnbm = 0;
    const bmMatch = postChunk.match(/PPnBM(?:\s*\([^\)]*\))?\s*=\s*Rp\.?\s*([\d.,]+)/i);
    if (bmMatch) {
      ppnbm = parseIdrNumber(bmMatch[1]);
    }

    // Extract line gross total (Harga Jual)
    // Formula: Qty * Harga Satuan (as displayed in Attachment #2 Col L)
    let hargaJual = currentRate.qty * currentRate.hargaSatuan;

    // Check if e-Faktur explicitly lists the item total on the line after PPnBM
    if (bmMatch && bmMatch.index !== undefined) {
      const afterBm = postChunk.substring(bmMatch.index + bmMatch[0].length);
      const explicitTotalMatch = afterBm.match(/^\s*([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{2})?|[0-9]+(?:,[0-9]{2})?)/m);
      if (explicitTotalMatch) {
        const parsedVal = parseIdrNumber(explicitTotalMatch[1]);
        if (parsedVal > 0) {
          hargaJual = parsedVal;
        }
      }
    }

    items.push({
      nomorUrut,
      kodeBarang,
      namaBarang,
      hargaSatuan: currentRate.hargaSatuan,
      qty: currentRate.qty,
      satuan: currentRate.satuan,
      potonganHarga,
      ppnbm,
      hargaJual,
    });

    // Advance pointer
    if (bmMatch && bmMatch.index !== undefined) {
      lastItemEndIndex = currentRate.index + currentRate.length + bmMatch.index + bmMatch[0].length;
    } else {
      lastItemEndIndex = currentRate.index + currentRate.length;
    }
  }

  // Fallback: If no items found through rate anchors (e.g. lump-sum or OCR layout)
  if (items.length === 0) {
    const fallbackItems = parseItemsFallback(normalized);
    if (fallbackItems.length > 0) {
      items.push(...fallbackItems);
    } else if (hargaJualTotal > 0) {
      items.push({
        nomorUrut: 1,
        kodeBarang: '',
        namaBarang: 'Barang / Jasa Kena Pajak',
        hargaSatuan: hargaJualTotal,
        qty: 1,
        satuan: 'Piece',
        potonganHarga: potonganHargaTotal,
        ppnbm: ppnbmTotal,
        hargaJual: hargaJualTotal,
      });
    }
  }

  // Determine category ('beli' vs 'jual')
  // Automatically detects based on PKP identity and file hints:
  // In INDAL's environment:
  // If INDAL ALUMINIUM INDUSTRY TBK (NPWP 0011225356054000) is Penjual -> Faktur Jual (Penjualan)
  // If INDAL is Pembeli -> Faktur Beli (Pembelian)
  let category: 'beli' | 'jual' = categoryHint || 'beli';
  const lowerFile = fileName.toLowerCase();

  if (lowerFile.includes('jual') || lowerFile.includes('penjualan')) {
    category = 'jual';
  } else if (lowerFile.includes('beli') || lowerFile.includes('pembelian')) {
    category = 'beli';
  } else {
    const isSellerIndal =
      namaPenjual.toUpperCase().includes('INDAL') ||
      cleanNpwp(npwpPenjual).startsWith('0011225356054');
    const isBuyerIndal =
      namaPembeli.toUpperCase().includes('INDAL') ||
      cleanNpwp(npwpPembeli).startsWith('0011225356054');

    if (isSellerIndal && !isBuyerIndal) {
      category = 'jual';
    } else if (isBuyerIndal) {
      category = 'beli';
    }
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

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line matches: "Rp <satuan> x <qty> <unit>"
    const rateQtyMatch = line.match(/Rp\.?\s*([\d.,]+)\s*x\s*([\d.,]+)(?:\s*([A-Za-z0-9\/]+))?/i);
    if (rateQtyMatch) {
      const hargaSatuan = parseIdrNumber(rateQtyMatch[1]);
      const qty = parseIdrNumber(rateQtyMatch[2]);
      const satuan = rateQtyMatch[3] || 'Piece';

      let namaBarang = '';
      let nomorUrut = items.length + 1;
      let kodeBarang = '';

      // Look backward for product name
      if (i > 0) {
        const nameLines: string[] = [];
        let j = i - 1;
        while (j >= 0 && !lines[j].startsWith('Rp') && !lines[j].includes('Potongan Harga') && !lines[j].includes('Harga Jual')) {
          const l = lines[j];
          const idxMatch = l.match(/^(\d{1,4})(?:\s+([0-9]{5,8}))?\s*(.*)$/);
          if (idxMatch && parseInt(idxMatch[1], 10) <= 9999) {
            nomorUrut = parseInt(idxMatch[1], 10);
            kodeBarang = idxMatch[2] || '';
            if (idxMatch[3]) nameLines.unshift(idxMatch[3]);
            break;
          } else {
            nameLines.unshift(l);
          }
          j--;
          if (i - j > 4) break;
        }
        namaBarang = nameLines.join(' ').trim();
      }

      // Look forward for Potongan and PPnBM
      let potonganHarga = 0;
      let ppnbm = 0;
      let hargaJual = qty * hargaSatuan;

      for (let k = i + 1; k < Math.min(i + 5, lines.length); k++) {
        if (lines[k].includes('Potongan Harga')) {
          const pMatch = lines[k].match(/Potongan\s*Harga\s*=\s*Rp\.?\s*([\d.,]+)/i);
          if (pMatch) potonganHarga = parseIdrNumber(pMatch[1]);
        }
        if (lines[k].includes('PPnBM')) {
          const bmMatch = lines[k].match(/PPnBM(?:\s*\([^\)]*\))?\s*=\s*Rp\.?\s*([\d.,]+)/i);
          if (bmMatch) ppnbm = parseIdrNumber(bmMatch[1]);
        }
      }

      items.push({
        nomorUrut,
        kodeBarang,
        namaBarang: namaBarang || 'Barang/Jasa',
        hargaSatuan,
        qty,
        satuan,
        potonganHarga,
        ppnbm,
        hargaJual,
      });
    }
  }

  return items;
}
