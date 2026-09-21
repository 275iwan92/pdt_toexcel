import JSZip from 'jszip';

export const BATCH_LAUNCHER_CONTENT = `@echo off
chcp 65001 >nul
title e-Faktur Pajak to Excel Converter (Portable)
color 0A

echo =====================================================================
echo   e-Faktur Pajak to Excel Converter - Versi Portable Zero-Install
echo   Kompatibel: Windows XP / Windows 7 / Windows 8 / Windows 10 / 11
echo =====================================================================
echo.
echo [1/2] Menyiapkan aplikasi offline...

:: Periksa ketersediaan PowerShell (Windows 7, 8, 10, 11)
where powershell >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [2/2] Membuka aplikasi di browser (Port 5800)...
    echo.
    echo =====================================================================
    echo   JANGAN TUTUP JENDELA CMD INI SELAMA MENGGUNAKAN APLIKASI.
    echo   (Jendela ini berfungsi sebagai server lokal aman di PC Anda)
    echo   Anda dapat meminimalkan (minimize) jendela ini.
    echo =====================================================================
    echo.
    powershell -NoProfile -ExecutionPolicy Bypass -Command "$port = 5800; $listener = New-Object System.Net.HttpListener; $listener.Prefixes.Add('http://localhost:' + $port + '/'); try { $listener.Start() } catch { $port = 5801; $listener.Prefixes.Clear(); $listener.Prefixes.Add('http://localhost:' + $port + '/'); $listener.Start() }; Start-Process ('http://localhost:' + $port + '/'); Write-Host ('Aplikasi berhasil berjalan di: http://localhost:' + $port + '/'); while ($listener.IsListening) { $context = $listener.GetContext(); $request = $context.Request; $response = $context.Response; $url = $request.RawUrl.Split('?')[0]; if ($url -eq '/') { $url = '/index.html' }; $filePath = Join-Path $PSScriptRoot $url.TrimStart('/'); if (Test-Path $filePath -PathType Leaf) { $bytes = [IO.File]::ReadAllBytes($filePath); $ext = [IO.Path]::GetExtension($filePath).ToLower(); switch ($ext) { '.html' { $response.ContentType = 'text/html; charset=utf-8' } '.js' { $response.ContentType = 'application/javascript; charset=utf-8' } '.mjs' { $response.ContentType = 'application/javascript; charset=utf-8' } '.css' { $response.ContentType = 'text/css; charset=utf-8' } '.json' { $response.ContentType = 'application/json' } '.svg' { $response.ContentType = 'image/svg+xml' } '.png' { $response.ContentType = 'image/png' } default { $response.ContentType = 'application/octet-stream' } }; $response.ContentLength64 = $bytes.Length; $response.OutputStream.Write($bytes, 0, $bytes.Length); $response.Close() } else { $response.StatusCode = 404; $response.Close() } }"
    pause
    exit /b
)

:: Fallback untuk Windows XP tanpa PowerShell
echo [2/2] Membuka langsung via Browser...
start "" "%~dp0index.html"
exit /b
`;

export const BATCH_CHROME_CONTENT = `@echo off
title Buka di Google Chrome
start chrome.exe --allow-file-access-from-files "%~dp0index.html"
exit
`;

export const BATCH_EDGE_CONTENT = `@echo off
title Buka di Microsoft Edge
start msedge.exe --allow-file-access-from-files "%~dp0index.html"
exit
`;

export const BATCH_FIREFOX_CONTENT = `@echo off
title Buka di Mozilla Firefox
start firefox.exe "%~dp0index.html"
exit
`;

export const PETUNJUK_TXT_CONTENT = `===================================================================
PETUNJUK PENGGUNAAN e-FAKTUR CONVERTER PORTABLE (OFFLINE)
Kompatibel: Windows XP (SP3), Windows 7, Windows 8, Windows 10, Windows 11
===================================================================

1. CARA MENJALANKAN DI WINDOWS 7 / 8 / 10 / 11:
   - Klik 2x pada file: "Jalankan_Aplikasi.bat"
   - Browser default Anda (Chrome, Edge, Firefox, Brave) akan otomatis terbuka.
   - Jangan tutup jendela CMD hitam tersebut selama Anda bekerja (bisa di-minimize).

2. CARA MENJALANKAN DI WINDOWS XP:
   - Jika menggunakan Mozilla Firefox / Chrome:
     Klik file "Buka_Langsung_Firefox.bat" atau "Buka_Langsung_Chrome.bat".
   - Atau langsung klik 2x pada file "index.html".

3. KEUNGGULAN VERSI PORTABLE INI:
   - 100% OFFLINE: Tidak membutuhkan koneksi internet sama sekali.
   - ZERO INSTALL: Cukup ekstrak di folder mana pun (Desktop, Drive D, USB Flashdisk).
   - TIDAK BUTUH HAK ADMIN: Sangat cocok untuk PC kantor/klien yang dikunci oleh IT administrator.
   - PRIVASI & KERAHASIAAN TERJAMIN: Seluruh proses ekstraksi PDF faktur pajak ke Excel
     dieksekusi langsung di memori komputer Anda. Tidak ada data yang dikirim ke internet.
   - Multi-Format Excel & CSV: Dilengkapi 2 Sheet ("Detail Barang" & "Rekap Faktur")
     sesuai format standar e-Faktur Pajak resmi Indonesia.

===================================================================
`;

/**
 * Downloads the portable ZIP package either from the server API or generates it client-side.
 */
export async function downloadPortableApp(): Promise<void> {
  try {
    // 1. First try server endpoint which has access to fully bundled dist/ files
    const response = await fetch('/api/download-portable');
    if (response.ok) {
      const blob = await response.blob();
      triggerBlobDownload(blob, 'eFaktur_Converter_Portable_WinXP_7_10_11.zip');
      return;
    }
  } catch (err) {
    console.warn('Server download endpoint failed, falling back to client-side packaging:', err);
  }

  // 2. Client-side packaging fallback using JSZip
  const zip = new JSZip();
  
  // Fetch current index.html
  let indexHtml = '<!doctype html><html><head><title>e-Faktur Converter</title></head><body>Please open via Jalankan_Aplikasi.bat</body></html>';
  try {
    const res = await fetch(window.location.href);
    if (res.ok) {
      indexHtml = await res.text();
    }
  } catch {
    // fallback
  }

  zip.file('index.html', indexHtml);
  zip.file('Jalankan_Aplikasi.bat', BATCH_LAUNCHER_CONTENT);
  zip.file('Buka_Langsung_Chrome.bat', BATCH_CHROME_CONTENT);
  zip.file('Buka_Langsung_Edge.bat', BATCH_EDGE_CONTENT);
  zip.file('Buka_Langsung_Firefox.bat', BATCH_FIREFOX_CONTENT);
  zip.file('PETUNJUK_WINDOWS_XP_7_10_11.txt', PETUNJUK_TXT_CONTENT);

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  triggerBlobDownload(zipBlob, 'eFaktur_Converter_Portable_WinXP_7_10_11.zip');
}

function triggerBlobDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
