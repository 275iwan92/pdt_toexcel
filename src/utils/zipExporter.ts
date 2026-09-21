import JSZip from 'jszip';
import { FakturPajakData } from './fakturParser';
import { createFakturWorkbook } from './excelGenerator';

export async function createBatchZip(
  fakturs: FakturPajakData[]
): Promise<Blob> {
  const zip = new JSZip();

  // Group by category ('beli' vs 'jual') and bulanTahun (MMYYYY)
  const grouped: Record<string, { category: 'beli' | 'jual'; bulanTahun: string; items: FakturPajakData[] }> = {};

  for (const f of fakturs) {
    const key = `${f.category}-${f.bulanTahun || 'unknown'}`;
    if (!grouped[key]) {
      grouped[key] = {
        category: f.category,
        bulanTahun: f.bulanTahun || 'unknown',
        items: [],
      };
    }
    grouped[key].items.push(f);
  }

  // Create an Excel file for each group
  for (const key of Object.keys(grouped)) {
    const group = grouped[key];
    const workbook = await createFakturWorkbook({
      category: group.category,
      fakturs: group.items,
    });
    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = group.category === 'beli' 
      ? `fakturbeli-${group.bulanTahun}.xlsx`
      : `fakturjual-${group.bulanTahun}.xlsx`;

    zip.file(fileName, buffer);
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
