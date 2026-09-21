import ExcelJS from 'exceljs';
import { FakturPajakData, cleanNpwp } from './fakturParser';

export interface GenerateExcelOptions {
  category: 'beli' | 'jual';
  fakturs: FakturPajakData[];
}

/**
 * Generates Excel Workbook matching exact user specifications and attachments:
 * 
 * ATTACHMENT #1: SHEET "Detail Barang"
 * Columns:
 * A: No. Faktur Pajak
 * B: Tanggal Faktur (DD-MM-YYYY, centered)
 * C: Nama Penjual
 * D: NPWP Penjual (16 digits continuous, text format '@')
 * E: Nama Pembeli
 * F: NPWP Pembeli (16 digits continuous, text format '@')
 * G: Nama Barang/Jasa
 * H: Potongan Harga (0.00)
 * I: PPnBM (0.00)
 * J: Qty (0.00)
 * K: Harga Satuan (#,##0.00)
 * L: Harga Jual (#,##0.00)
 * 
 * ATTACHMENT #2: SHEET "Rekap Faktur" (Khusus Pembelian / Faktur Beli)
 * Columns:
 * A: No. Faktur Pajak
 * B: Nama Penjual
 * C: Tanggal Faktur (DD-MM-YYYY, centered)
 * D: Harga Jual
 * E: Potongan Harga
 * F: Harga Jual nett
 * G: DPP
 * H: PPN
 * I: PPnBM
 * 
 * Row N+1: Baris Total dengan Yellow Highlight (#FFFF00) pada kolom:
 * - Col D: Harga Jual (Formula =SUM(D2:DN), Yellow Fill, Bold)
 * - Col F: Harga Jual nett (Formula =SUM(F2:FN), Yellow Fill, Bold)
 * - Col G: DPP (Formula =SUM(G2:GN), Yellow Fill, Bold)
 * - Col H: PPN (Formula =SUM(H2:HN), Yellow Fill, Bold)
 * - Col I: PPnBM (Formula =SUM(I2:IN), Yellow Fill, Bold)
 * Col E (Potongan Harga): Kosong / Tanpa warna kuning (persis Attachment #2)
 */
export async function createFakturWorkbook({ category, fakturs }: GenerateExcelOptions): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Faktur Pajak Converter';
  workbook.lastModifiedBy = 'Faktur Pajak Converter';
  workbook.created = new Date();
  workbook.modified = new Date();

  const isJual = category === 'jual';

  // -------------------------------------------------------------
  // 1. SHEET: "Detail Barang" (Attachment #1)
  // -------------------------------------------------------------
  const detailSheet = workbook.addWorksheet('Detail Barang', {
    views: [{ state: 'frozen', ySplit: 1, showGridLines: true }],
  });

  const detailHeaders = [
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

  const headerRowDetail = detailSheet.addRow(detailHeaders);
  headerRowDetail.height = 24;

  // Populate Detail Rows
  for (const f of fakturs) {
    const cleanNoFaktur = String(f.nomorFaktur || '').trim();
    const cleanNpwpSeller = cleanNpwp(f.npwpPenjual);
    const cleanNpwpBuyer = cleanNpwp(f.npwpPembeli);

    if (f.items && f.items.length > 0) {
      for (const item of f.items) {
        const itemHargaJual = item.hargaJual || (item.qty * item.hargaSatuan);
        detailSheet.addRow([
          cleanNoFaktur,
          f.tanggalFaktur,
          f.namaPenjual,
          cleanNpwpSeller,
          f.namaPembeli,
          cleanNpwpBuyer,
          item.namaBarang,
          item.potonganHarga || 0,
          item.ppnbm || 0,
          item.qty || 0,
          item.hargaSatuan || 0,
          itemHargaJual || 0,
        ]);
      }
    } else {
      // Fallback single line if no sub-items
      detailSheet.addRow([
        cleanNoFaktur,
        f.tanggalFaktur,
        f.namaPenjual,
        cleanNpwpSeller,
        f.namaPembeli,
        cleanNpwpBuyer,
        'Barang / Jasa Kena Pajak',
        f.potonganHargaTotal || 0,
        f.ppnbmTotal || 0,
        1,
        f.hargaJualTotal || 0,
        f.hargaJualTotal || 0,
      ]);
    }
  }

  // Format Header Row for Detail Barang
  headerRowDetail.eachCell((cell) => {
    cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF000000' } };
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF2F2F2' },
    };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFB0BEC5' } },
      bottom: { style: 'thin', color: { argb: 'FF78909C' } },
      left: { style: 'thin', color: { argb: 'FFB0BEC5' } },
      right: { style: 'thin', color: { argb: 'FFB0BEC5' } },
    };
  });

  const detailRowCount = detailSheet.rowCount;

  // Format Data Rows for Detail Barang
  for (let r = 2; r <= detailRowCount; r++) {
    const row = detailSheet.getRow(r);
    row.height = 20;

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      // Grid lines / borders
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      };
      cell.font = { name: 'Segoe UI', size: 10 };

      // Col 1: No Faktur Pajak (text format with leading zeroes)
      // Col 4: NPWP Penjual (text format)
      // Col 6: NPWP Pembeli (text format)
      if (colNumber === 1 || colNumber === 4 || colNumber === 6) {
        cell.numFmt = '@';
        if (cell.value !== null && cell.value !== undefined) {
          cell.value = String(cell.value);
        }
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      }
      // Col 2: Tanggal Faktur (centered DD-MM-YYYY)
      else if (colNumber === 2) {
        cell.numFmt = '@';
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }
      // Col 3, 5, 7: Text columns (Nama Penjual, Nama Pembeli, Nama Barang)
      else if (colNumber === 3 || colNumber === 5 || colNumber === 7) {
        cell.numFmt = '@';
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      }
      // Col 8, 9, 10, 11, 12: Currency and Qty (#,##0.00)
      else {
        cell.numFmt = '#,##0.00';
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
      }
    });
  }

  // Set explicit column widths for Detail Barang matching Attachment #1
  const detailColWidths = [24, 15, 30, 20, 30, 20, 45, 16, 14, 14, 18, 18];
  detailColWidths.forEach((w, idx) => {
    detailSheet.getColumn(idx + 1).width = w;
  });

  // Enable AutoFilter on Detail Barang
  detailSheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: detailRowCount, column: 12 },
  };

  // -------------------------------------------------------------
  // 2. SHEET: "Rekap Faktur" (Attachment #2)
  // -------------------------------------------------------------
  const rekapSheet = workbook.addWorksheet('Rekap Faktur', {
    views: [{ state: 'frozen', ySplit: 1, showGridLines: true }],
  });

  let rekapHeaders: string[] = [];
  if (isJual) {
    // Bagian Penjualan
    rekapHeaders = [
      'No. Faktur Pajak',
      'Nama Penjual',
      'Nama Pembeli',
      'Tanggal Faktur',
      'Harga Jual',
      'Potongan Harga',
      'Uang Muka yang telah diterima',
      'DPP',
      'DPP Nilai Lain',
      'PPN',
      'PPnBM',
      'Keterangan ',
    ];
  } else {
    // Bagian Pembelian (Attachment #2 Exact Columns: 9 columns)
    rekapHeaders = [
      'No. Faktur Pajak',
      'Nama Penjual',
      'Tanggal Faktur',
      'Harga Jual',
      'Potongan Harga',
      'Harga Jual nett',
      'DPP',
      'PPN',
      'PPnBM',
    ];
  }

  const headerRowRekap = rekapSheet.addRow(rekapHeaders);
  headerRowRekap.height = 24;

  headerRowRekap.eachCell((cell) => {
    cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF000000' } };
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF2F2F2' },
    };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFB0BEC5' } },
      bottom: { style: 'thin', color: { argb: 'FF78909C' } },
      left: { style: 'thin', color: { argb: 'FFB0BEC5' } },
      right: { style: 'thin', color: { argb: 'FFB0BEC5' } },
    };
  });

  // Calculate sum totals for the yellow summary row
  let sumHargaJual = 0;
  let sumPotongan = 0;
  let sumHargaJualNett = 0;
  let sumUangMuka = 0;
  let sumDpp = 0;
  let sumDppNilaiLain = 0;
  let sumPpn = 0;
  let sumPpnbm = 0;

  // Add data rows to Rekap Faktur
  for (const f of fakturs) {
    const cleanNoFaktur = String(f.nomorFaktur || '').trim();
    const itemsHjSum = f.items && f.items.length > 0
      ? f.items.reduce((s, it) => s + (it.hargaJual || it.qty * it.hargaSatuan), 0)
      : 0;
    const hj = (f.hargaJualTotal && f.hargaJualTotal > 1) ? f.hargaJualTotal : (itemsHjSum || f.dpp || 0);
    const pot = f.potonganHargaTotal || 0;
    const hjNett = (f.hargaJualNett && f.hargaJualNett > 1) ? f.hargaJualNett : (hj - pot);
    const um = f.uangMuka || 0;
    const dppVal = f.dpp || 0;
    const dppNl = f.dppNilaiLain || 0;
    const ppnVal = f.ppn || 0;
    const ppnbmVal = f.ppnbmTotal || 0;

    sumHargaJual += hj;
    sumPotongan += pot;
    sumHargaJualNett += hjNett;
    sumUangMuka += um;
    sumDpp += dppVal;
    sumDppNilaiLain += dppNl;
    sumPpn += ppnVal;
    sumPpnbm += ppnbmVal;

    if (isJual) {
      rekapSheet.addRow([
        cleanNoFaktur,
        f.namaPenjual,
        f.namaPembeli,
        f.tanggalFaktur,
        hj,
        pot,
        um,
        dppVal,
        dppNl,
        ppnVal,
        ppnbmVal,
        f.keterangan || '',
      ]);
    } else {
      // Attachment #2 exact data mapping
      rekapSheet.addRow([
        cleanNoFaktur,
        f.namaPenjual,
        f.tanggalFaktur,
        hj,
        pot,
        hjNett,
        dppVal,
        ppnVal,
        ppnbmVal,
      ]);
    }
  }

  const lastDataRow = rekapSheet.rowCount;

  // Format data rows in Rekap Faktur
  for (let r = 2; r <= lastDataRow; r++) {
    const row = rekapSheet.getRow(r);
    row.height = 20;

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      };
      cell.font = { name: 'Segoe UI', size: 10 };

      if (!isJual) {
        // PEMBELIAN (Attachment #2):
        // Col 1: No Faktur Pajak (text)
        if (colNumber === 1) {
          cell.numFmt = '@';
          if (cell.value !== null && cell.value !== undefined) cell.value = String(cell.value);
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        }
        // Col 2: Nama Penjual (text)
        else if (colNumber === 2) {
          cell.numFmt = '@';
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        }
        // Col 3: Tanggal Faktur (centered)
        else if (colNumber === 3) {
          cell.numFmt = '@';
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        }
        // Col 4-9: Numbers (#,##0.00, right aligned)
        else {
          cell.numFmt = '#,##0.00';
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
        }
      } else {
        // PENJUALAN:
        if (colNumber === 1) {
          cell.numFmt = '@';
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        } else if (colNumber === 2 || colNumber === 3 || colNumber === 12) {
          cell.numFmt = '@';
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        } else if (colNumber === 4) {
          cell.numFmt = '@';
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else {
          cell.numFmt = '#,##0.00';
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
        }
      }
    });
  }

  // -------------------------------------------------------------
  // ROW N+1: TOTAL ROW WITH VIBRANT YELLOW HIGHLIGHT (#FFFF00)
  // (Directly matching Attachment #2 Row 11!)
  // -------------------------------------------------------------
  if (lastDataRow >= 2) {
    const totalRowIndex = lastDataRow + 1;
    const totalRow = rekapSheet.getRow(totalRowIndex);
    totalRow.height = 22;

    const yellowFillStyle: ExcelJS.Fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFFF00' }, // Pure #FFFF00 Vibrant Yellow as shown in Attachment #2
    };

    const totalBorderBlack: Partial<ExcelJS.Borders> = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'medium', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } },
    };

    if (!isJual) {
      // Attachment #2 exact column total styling:
      // Col 1 (No Faktur): blank
      // Col 2 (Nama Penjual): blank
      // Col 3 (Tanggal): blank
      // Col 4 (Harga Jual): YELLOW FILL, SUM(D2:DN), BOLD
      // Col 5 (Potongan Harga): BLANK / NO FILL (Persis attachment #2!)
      // Col 6 (Harga Jual nett): YELLOW FILL, SUM(F2:FN), BOLD
      // Col 7 (DPP): YELLOW FILL, SUM(G2:GN), BOLD
      // Col 8 (PPN): YELLOW FILL, SUM(H2:HN), BOLD
      // Col 9 (PPnBM): YELLOW FILL, SUM(I2:IN), BOLD

      // Cell D: Harga Jual Total
      const cellD = totalRow.getCell(4);
      cellD.value = { formula: `SUM(D2:D${lastDataRow})`, result: sumHargaJual };
      cellD.numFmt = '#,##0.00';
      cellD.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF000000' } };
      cellD.alignment = { vertical: 'middle', horizontal: 'right' };
      cellD.fill = yellowFillStyle;
      cellD.border = totalBorderBlack;

      // Cell F: Harga Jual nett Total
      const cellF = totalRow.getCell(6);
      cellF.value = { formula: `SUM(F2:F${lastDataRow})`, result: sumHargaJualNett };
      cellF.numFmt = '#,##0.00';
      cellF.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF000000' } };
      cellF.alignment = { vertical: 'middle', horizontal: 'right' };
      cellF.fill = yellowFillStyle;
      cellF.border = totalBorderBlack;

      // Cell G: DPP Total
      const cellG = totalRow.getCell(7);
      cellG.value = { formula: `SUM(G2:G${lastDataRow})`, result: sumDpp };
      cellG.numFmt = '#,##0.00';
      cellG.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF000000' } };
      cellG.alignment = { vertical: 'middle', horizontal: 'right' };
      cellG.fill = yellowFillStyle;
      cellG.border = totalBorderBlack;

      // Cell H: PPN Total
      const cellH = totalRow.getCell(8);
      cellH.value = { formula: `SUM(H2:H${lastDataRow})`, result: sumPpn };
      cellH.numFmt = '#,##0.00';
      cellH.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF000000' } };
      cellH.alignment = { vertical: 'middle', horizontal: 'right' };
      cellH.fill = yellowFillStyle;
      cellH.border = totalBorderBlack;

      // Cell I: PPnBM Total
      const cellI = totalRow.getCell(9);
      cellI.value = { formula: `SUM(I2:I${lastDataRow})`, result: sumPpnbm };
      cellI.numFmt = '#,##0.00';
      cellI.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF000000' } };
      cellI.alignment = { vertical: 'middle', horizontal: 'right' };
      cellI.fill = yellowFillStyle;
      cellI.border = totalBorderBlack;
    } else {
      // Penjualan Total Row
      const numCols = [5, 6, 7, 8, 9, 10, 11];
      const colLetters = ['E', 'F', 'G', 'H', 'I', 'J', 'K'];
      const colSums = [sumHargaJual, sumPotongan, sumUangMuka, sumDpp, sumDppNilaiLain, sumPpn, sumPpnbm];

      numCols.forEach((colNum, i) => {
        const cell = totalRow.getCell(colNum);
        cell.value = { formula: `SUM(${colLetters[i]}2:${colLetters[i]}${lastDataRow})`, result: colSums[i] };
        cell.numFmt = '#,##0.00';
        cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF000000' } };
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        cell.fill = yellowFillStyle;
        cell.border = totalBorderBlack;
      });
    }

    // Set AutoFilter only over data rows (excluding the total row!)
    rekapSheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: lastDataRow, column: isJual ? 12 : 9 },
    };
  }

  // Set explicit column widths for Rekap Faktur
  if (!isJual) {
    const rekapBeliWidths = [24, 36, 16, 18, 16, 18, 18, 18, 14];
    rekapBeliWidths.forEach((w, idx) => {
      rekapSheet.getColumn(idx + 1).width = w;
    });
  } else {
    const rekapJualWidths = [24, 32, 32, 16, 18, 16, 20, 18, 18, 18, 14, 24];
    rekapJualWidths.forEach((w, idx) => {
      rekapSheet.getColumn(idx + 1).width = w;
    });
  }

  return workbook;
}

/**
 * Helper to download workbook in the browser
 */
export async function downloadWorkbook(workbook: ExcelJS.Workbook, filename: string): Promise<void> {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
