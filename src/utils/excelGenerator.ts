import ExcelJS from 'exceljs';
import { FakturPajakData } from './fakturParser';

export interface GenerateExcelOptions {
  category: 'beli' | 'jual';
  fakturs: FakturPajakData[];
}

/**
 * Generates Excel Workbook matching exact user specifications:
 * BAGIAN 1 (PENJUALAN):
 * - Sheet "Detail Barang": ['No. Faktur Pajak', 'Tanggal Faktur', 'Nama Penjual', 'NPWP Penjual', 'Nama Pembeli', 'NPWP Pembeli', 'Nama Barang/Jasa', 'Potongan Harga', 'PPnBM', 'Qty', 'Harga Satuan', 'Harga Jual']
 * - Sheet "Rekap Faktur": ['No. Faktur Pajak', 'Nama Penjual', 'Nama Pembeli', 'Tanggal Faktur', 'Harga Jual', 'Potongan Harga', 'Uang Muka yang telah diterima', 'DPP', 'DPP Nilai Lain', 'PPN', 'PPnBM', 'Keterangan ']
 * 
 * BAGIAN 2 (PEMBELIAN):
 * - Sheet "Detail Barang": ['No. Faktur Pajak', 'Tanggal Faktur', 'Nama Penjual', 'NPWP Penjual', 'Nama Pembeli', 'NPWP Pembeli', 'Nama Barang/Jasa', 'Potongan Harga', 'PPnBM', 'Qty', 'Harga Satuan', 'Harga Jual']
 * - Sheet "Rekap Faktur": ['No. Faktur Pajak', 'Nama Penjual', 'Tanggal Faktur', 'Harga Jual', 'Potongan Harga', 'Harga Jual nett', 'DPP', 'PPN', 'PPnBM']
 */
export async function createFakturWorkbook({ category, fakturs }: GenerateExcelOptions): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Faktur Pajak Converter';
  workbook.lastModifiedBy = 'Faktur Pajak Converter';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Primary color for header
  const isJual = category === 'jual';
  const headerFillColor = isJual ? 'D9E8F5' : 'E2E8F0'; // Soft business blue / slate

  // -------------------------------------------------------------
  // 1. SHEET: "Detail Barang"
  // -------------------------------------------------------------
  const detailSheet = workbook.addWorksheet('Detail Barang', {
    views: [{ state: 'frozen', ySplit: 1 }],
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

  detailSheet.addRow(detailHeaders);

  // Add detail rows
  for (const f of fakturs) {
    if (f.items && f.items.length > 0) {
      for (const item of f.items) {
        detailSheet.addRow([
          f.nomorFaktur,
          f.tanggalFaktur,
          f.namaPenjual,
          f.npwpPenjual,
          f.namaPembeli,
          f.npwpPembeli,
          item.namaBarang,
          item.potonganHarga || 0,
          item.ppnbm || 0,
          item.qty || 0,
          item.hargaSatuan || 0,
          item.hargaJual || 0,
        ]);
      }
    } else {
      // If no itemized lines detected, emit single summary line
      detailSheet.addRow([
        f.nomorFaktur,
        f.tanggalFaktur,
        f.namaPenjual,
        f.npwpPenjual,
        f.namaPembeli,
        f.npwpPembeli,
        'Barang / Jasa Kena Pajak',
        f.potonganHargaTotal || 0,
        f.ppnbmTotal || 0,
        1,
        f.hargaJualTotal || 0,
        f.hargaJualTotal || 0,
      ]);
    }
  }

  // Format "Detail Barang" columns
  styleWorksheet(detailSheet, {
    headerFillColor,
    textColumns: [1, 2, 3, 4, 5, 6, 7], // No Faktur, Tgl, Nama & NPWP Penjual, Nama & NPWP Pembeli, Nama Barang
    currencyColumns: [8, 9, 11, 12],     // Potongan, PPnBM, Harga Satuan, Harga Jual
    qtyColumns: [10],                    // Qty
  });

  // -------------------------------------------------------------
  // 2. SHEET: "Rekap Faktur"
  // -------------------------------------------------------------
  const rekapSheet = workbook.addWorksheet('Rekap Faktur', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  let rekapHeaders: string[] = [];
  if (isJual) {
    // Bagian 1: Output Excel Untuk Penjualan
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
    // Bagian 2: Output Excel Untuk Pembelian
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

  rekapSheet.addRow(rekapHeaders);

  for (const f of fakturs) {
    if (isJual) {
      rekapSheet.addRow([
        f.nomorFaktur,
        f.namaPenjual,
        f.namaPembeli,
        f.tanggalFaktur,
        f.hargaJualTotal,
        f.potonganHargaTotal,
        f.uangMuka,
        f.dpp,
        f.dppNilaiLain,
        f.ppn,
        f.ppnbmTotal,
        f.keterangan || '',
      ]);
    } else {
      rekapSheet.addRow([
        f.nomorFaktur,
        f.namaPenjual,
        f.tanggalFaktur,
        f.hargaJualTotal,
        f.potonganHargaTotal,
        f.hargaJualNett,
        f.dpp,
        f.ppn,
        f.ppnbmTotal,
      ]);
    }
  }

  if (isJual) {
    styleWorksheet(rekapSheet, {
      headerFillColor,
      textColumns: [1, 2, 3, 4, 12],
      currencyColumns: [5, 6, 7, 8, 9, 10, 11],
      qtyColumns: [],
    });
  } else {
    styleWorksheet(rekapSheet, {
      headerFillColor,
      textColumns: [1, 2, 3],
      currencyColumns: [4, 5, 6, 7, 8, 9],
      qtyColumns: [],
    });
  }

  return workbook;
}

interface StyleOptions {
  headerFillColor: string;
  textColumns: number[];
  currencyColumns: number[];
  qtyColumns: number[];
}

function styleWorksheet(sheet: ExcelJS.Worksheet, options: StyleOptions) {
  const headerRow = sheet.getRow(1);
  headerRow.height = 24;
  headerRow.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF1E293B' } };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF' + options.headerFillColor },
    };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'medium', color: { argb: 'FF94A3B8' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    };
  });

  // Enable auto filter across headers
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: sheet.columnCount },
  };

  // Format data rows
  const rowCount = sheet.rowCount;
  for (let r = 2; r <= rowCount; r++) {
    const row = sheet.getRow(r);
    row.height = 20;

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      // Borders
      cell.border = {
        top: { style: 'hair', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'hair', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
      cell.font = { name: 'Segoe UI', size: 9.5 };

      if (options.currencyColumns.includes(colNumber)) {
        cell.numFmt = '#,##0.00';
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
      } else if (options.qtyColumns.includes(colNumber)) {
        cell.numFmt = '#,##0.00';
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
      } else {
        // Text format
        cell.numFmt = '@';
        if (cell.value !== null && cell.value !== undefined) {
          cell.value = String(cell.value);
        }
        // If it's a date or tax invoice number, center or left
        if (colNumber === 2 || colNumber === 1) {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        }
      }
    });
  }

  // Adjust column widths automatically
  sheet.columns.forEach((col, idx) => {
    let maxLength = 12;
    if (col.header) {
      maxLength = Math.max(maxLength, String(col.header).length);
    }
    col.eachCell?.({ includeEmpty: false }, (cell) => {
      const valStr = cell.value ? String(cell.value) : '';
      if (valStr.length > maxLength) {
        maxLength = Math.min(valStr.length, 60);
      }
    });
    col.width = maxLength + 4;
  });
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
