import JSZip from 'jszip';
import { FakturPajakData } from './fakturParser';
import { createFakturWorkbook } from './excelGenerator';

export async function createBatchZip(
  fakturs: FakturPajakData[]
): Promise<Blob> {
  const zip = new JSZip();

  const beliInvoices = fakturs.filter((f) => f.category === 'beli');
  const jualInvoices = fakturs.filter((f) => f.category === 'jual');

  // Exactly 1 Excel file for all Faktur Beli
  if (beliInvoices.length > 0) {
    const workbook = await createFakturWorkbook({
      category: 'beli',
      fakturs: beliInvoices,
    });
    const buffer = await workbook.xlsx.writeBuffer();
    zip.file('fakturbeli.xlsx', buffer);
  }

  // Exactly 1 Excel file for all Faktur Jual
  if (jualInvoices.length > 0) {
    const workbook = await createFakturWorkbook({
      category: 'jual',
      fakturs: jualInvoices,
    });
    const buffer = await workbook.xlsx.writeBuffer();
    zip.file('fakturjual.xlsx', buffer);
  }

  return await zip.generateAsync({ type: 'blob' });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
