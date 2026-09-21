import { FakturPajakData, parseFakturText } from '../utils/fakturParser';

const RAW_SAMPLES: { fileName: string; category: 'beli' | 'jual'; text: string }[] = [
  // =========================================================================
  // FAKTUR BELI (PEMBELIAN) - Matches Attachment #1 Rekap Faktur (Rp 255,964,486.00)
  // =========================================================================
  {
    fileName: 'FakturBeli/04002600237157125_AsianBearindo.pdf',
    category: 'beli',
    text: `Faktur Pajak
Nama: ASIAN BEARINDO JAYA
Alamat: JL TANJUNGSARI NO.19, KOTA SURABAYA #0017394099614000000000
Kode dan Nomor Seri Faktur Pajak: 04002600237157125
Pengusaha Kena Pajak:
Nama : ASIAN BEARINDO JAYA
Alamat : JL TANJUNGSARI NO.19, RT 002, RW 005, SUKOMANUNGGAL, SUKOMANUNGGAL, KOTA SURABAYA, JAWA TIMUR 60188
NPWP : 0017394099614000
Pembeli Barang Kena Pajak/Penerima Jasa Kena Pajak:
Nama : INDAL ALUMINIUM INDUSTRY TBK.
Alamat : DS. SAWOTRATAP , RT 000, RW 000, SAWOTRATAP, GEDANGAN, KAB. SIDOARJO, JAWA TIMUR 61254 #0011225356054000000000
NPWP : 0011225356054000
NIK : -
Nomor Paspor : -
Identitas Lain : -
Email: -
No. Kode Barang/ Jasa Nama Barang Kena Pajak / Jasa Kena Pajak Harga Jual / Penggantian / Uang Muka / Termin (Rp)
1 848200
6911 2RS D/GROOVE BB .NTN
Rp 128.400,00 x 2,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
256.800,00
2 848200
6202 ZZ D/GROOVE BB .SKF
Rp 24.300,00 x 10,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
243.000,00
3 848200
6203 ZZ/C3 D/GROOVE BB .SKF
Rp 26.300,00 x 10,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
263.000,00
4 848200
6306 ZZ D/GROOVE BB .SKF
Rp 82.000,00 x 4,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
328.000,00
5 848200
6308 ZZ D/GROOVE BB .SKF
Rp 160.600,00 x 4,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
642.400,00
6 848700
TC 55.00 80.00 10.00 OIL SEAL .TTO
Rp 14.000,00 x 2,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
28.000,00
7 848700
DH 20 HYDRAULIC S .VALQUA
Rp 14.000,00 x 10,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
140.000,00
8 848700
UHS 20 HYDRAULIC S .VALQUA
Rp 12.500,00 x 10,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
125.000,00
9 848700
UHS 50 HYDRAULIC S .VALQUA
Rp 24.000,00 x 10,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
240.000,00
Harga Jual / Penggantian / Uang Muka / Termin 2.266.200,00
Dikurangi Potongan Harga 0,00
Dikurangi Uang Muka yang telah diterima 0,00
Dasar Pengenaan Pajak 2.077.350,00
Jumlah PPN (Pajak Pertambahan Nilai) 249.282,00
Jumlah PPnBM (Pajak Penjualan atas Barang Mewah) 0,00
KOTA SURABAYA, 23 Juni 2026
Ditandatangani secara elektronik
PUJI WARASTUTI
(Referensi: INV. ABJ260609083)`,
  },
  {
    fileName: 'FakturBeli/04002600276801354_Ekasapta.pdf',
    category: 'beli',
    text: `Faktur Pajak
Nama: EKASAPTA HIDUPMAJU
Alamat: JL RAYA GUBENG NO.27, KOTA SURABAYA #0016406266606000000000
Kode dan Nomor Seri Faktur Pajak: 04002600276801354
Pengusaha Kena Pajak:
Nama : EKASAPTA HIDUPMAJU
Alamat : JL RAYA GUBENG NO.27, RT 000, RW 000, GUBENG, GUBENG, KOTA SURABAYA, JAWA TIMUR 60281
NPWP : 0016406266606000
Pembeli Barang Kena Pajak/Penerima Jasa Kena Pajak:
Nama : INDAL ALUMINIUM INDUSTRY TBK.
Alamat : DS. SAWOTRATAP , RT 000, RW 000, SAWOTRATAP, GEDANGAN, KAB. SIDOARJO, JAWA TIMUR 61254 #0011225356054000000000
NPWP : 0011225356054000
NIK : -
Nomor Paspor : -
Identitas Lain : -
Email: -
No. Kode Barang/ Jasa Nama Barang Kena Pajak / Jasa Kena Pajak Harga Jual / Penggantian / Uang Muka / Termin (Rp)
1 854400
KABEL NYAF 1 X 0.75 MM BIRU, SUPREME
Rp 291.700,00 x 1,00 Roll
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
291.700,00
2 854400
KABEL NYAF 1 X 0.75 MM2 HITAM, SUPREME
Rp 291.700,00 x 1,00 Roll
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
291.700,00
3 854400
KABEL NYAF 1 X 0.75 MM2 MERAH, SUPREME
Rp 291.700,00 x 1,00 Roll
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
291.700,00
4 854400
KABEL NYYHY 2 X 1.5 MM2, SUPREME
Rp 12.377,00 x 100,00 Meter
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
1.237.700,00
5 854400
KABEL NYAF 1 X 35 MM2 HITAM, SUPREME
Rp 100.541,00 x 50,00 Meter
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
5.027.050,00
Harga Jual / Penggantian / Uang Muka / Termin 7.139.850,00
Dikurangi Potongan Harga 0,00
Dikurangi Uang Muka yang telah diterima 0,00
Dasar Pengenaan Pajak 6.544.860,00
Jumlah PPN (Pajak Pertambahan Nilai) 785.383,00
Jumlah PPnBM (Pajak Penjualan atas Barang Mewah) 0,00
KOTA SURABAYA, 14 Juli 2026
Ditandatangani secara elektronik
HOWARD CHRISTIAN
(Referensi: 190 G/26)`,
  },
  {
    fileName: 'FakturBeli/04002600265553114_Ibunda.pdf',
    category: 'beli',
    text: `Faktur Pajak
Nama: IBUNDA
Alamat: JL MASPION ROMOKALISARI I/34-36 BLOK XV-D-05-06 , KOTA SURABAYA #0015587611604000000000
Kode dan Nomor Seri Faktur Pajak: 04002600265553114
Pengusaha Kena Pajak:
Nama : IBUNDA
Alamat : JL MASPION ROMOKALISARI I/34-36 BLOK XV-D-05-06 , RT 000, RW 000, ROMOKALISARI, BENOWO, KOTA SURABAYA, JAWA TIMUR 60192
NPWP : 0015587611604000
Pembeli Barang Kena Pajak/Penerima Jasa Kena Pajak:
Nama : INDAL ALUMINIUM INDUSTRY TBK.
Alamat : DS. SAWOTRATAP , RT 000, RW 000, SAWOTRATAP, GEDANGAN, KAB. SIDOARJO, JAWA TIMUR 61254 #0011225356054000000000
NPWP : 0011225356054000
NIK : -
Nomor Paspor : -
Identitas Lain : -
Email: -
No. Kode Barang/ Jasa Nama Barang Kena Pajak / Jasa Kena Pajak Harga Jual / Penggantian / Uang Muka / Termin (Rp)
1 000000
WASHER NYLON 6,53 X 19 X 0,79
Rp 300,00 x 3.000,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
900.000,00
2 000000
WASHER NYLON 10 X 25 X 1 m/m BLACK
Rp 220,00 x 2.000,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
440.000,00
3 000000
WEAR SLEEVE O RUNG FXO 7100
Rp 1.100,00 x 2.000,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
2.200.000,00
4 000000
WASHER NYLON 6,53 X 19 X 0,79
Rp 300,00 x 3.000,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
900.000,00
5 000000
WASHER NYLON 8 m/m PNG 2
Rp 197,00 x 3.000,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
591.000,00
6 000000
WASHER NYLON 6,53 X 19 X 0,79
Rp 300,00 x 2.000,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
600.000,00
7 000000
WASHER NYLON 10 X 25 X 1 m/m BLACK
Rp 220,00 x 2.000,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
440.000,00
Harga Jual / Penggantian / Uang Muka / Termin 6.071.000,00
Dikurangi Potongan Harga 0,00
Dikurangi Uang Muka yang telah diterima 0,00
Dasar Pengenaan Pajak 5.565.083,00
Jumlah PPN (Pajak Pertambahan Nilai) 667.810,00
Jumlah PPnBM (Pajak Penjualan atas Barang Mewah) 0,00
KOTA SURABAYA, 13 Juli 2026
Ditandatangani secara elektronik
HENNY ONGKY WIJOYO
(Referensi: )`,
  },
  {
    fileName: 'FakturBeli/04002600370924288_LimSukThay.pdf',
    category: 'beli',
    text: `Faktur Pajak
Nama: LIM SUK THAY
Alamat: JL DUKUH KUPANG TIMUR 20 NO.21, SURABAYA #3578270808640005000000
Kode dan Nomor Seri Faktur Pajak: 04002600370924288
Pengusaha Kena Pajak:
Nama : LIM SUK THAY
Alamat : JL DUKUH KUPANG TIMUR 20 NO.21, KOTA SURABAYA
NPWP : 3578270808640005
Pembeli Barang Kena Pajak/Penerima Jasa Kena Pajak:
Nama : INDAL ALUMINIUM INDUSTRY TBK.
Alamat : DS. SAWOTRATAP , RT 000, RW 000, SAWOTRATAP, GEDANGAN, KAB. SIDOARJO, JAWA TIMUR 61254 #0011225356054000000000
NPWP : 0011225356054000
NIK : -
Nomor Paspor : -
Identitas Lain : -
Email: -
No. Kode Barang/ Jasa Nama Barang Kena Pajak / Jasa Kena Pajak Harga Jual / Penggantian / Uang Muka / Termin (Rp)
1 000000
Stick. Safety Warning / S71
Rp 290,00 x 2.200,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
638.000,00
2 000000
Header Card Easiway / H40
Rp 2.600,00 x 430,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
1.118.000,00
3 000000
Label Electrical Hazard / S3A
Rp 1.090,00 x 900,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
981.000,00
4 000000
Label Electrical Hazard / S3A
Rp 950,00 x 11.015,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
10.464.250,00
5 000000
Label Logo Citeco 150mm x 60mm / S331A
Rp 780,00 x 11.455,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
8.934.900,00
6 000000
Label Logo Citeco 131mm x 50mm / S331B
Rp 720,00 x 12.000,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
8.640.000,00
7 000000
Label Name CBAP4 (NZ & Aust)
Rp 1.090,00 x 3.800,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
4.142.000,00
8 000000
Label Logo Citeco 150mm x 60mm / S331A
Rp 780,00 x 1.000,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
780.000,00
9 000000
Label Danger Direction / S335A
Rp 1.090,00 x 2.500,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
2.725.000,00
10 000000
Label Name CBAP4 (NZ & Aust)
Rp 950,00 x 5.000,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
4.750.000,00
11 000000
Label Name SBS6 Syneco
Rp 1.090,00 x 2.175,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
2.370.750,00
12 000000
Label Logo Citeco L. Rating 180kg / S339A
Rp 1.090,00 x 3.400,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
3.706.000,00
13 000000
Label Name CBX14SF (NZ & Aust)
Rp 1.090,00 x 4.750,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
5.177.500,00
14 000000
Label Logo Citeco L. Rating 150kg / S332A
Rp 1.090,00 x 23.850,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
25.996.500,00
15 000000
Label Name CBS3D & CBS4D (NZ & Aust)
Rp 1.090,00 x 2.300,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
2.507.000,00
16 000000
Showcard CBS8D (NZ. & Aust)
Rp 4.500,00 x 828,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
3.726.000,00
17 000000
IM Step Ladder EN131
Rp 900,00 x 565,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
508.500,00
18 000000
Showcard CBS8D, CBDP6B (NZ. & Aust)
Rp 4.900,00 x 4.832,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
23.676.800,00
19 000000
Header Card Easiway / H40
Rp 2.600,00 x 1.935,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
5.031.000,00
Harga Jual / Penggantian / Uang Muka / Termin 115.873.200,00
Dikurangi Potongan Harga 0,00
Dikurangi Uang Muka yang telah diterima 0,00
Dasar Pengenaan Pajak 106.213.945,00
Jumlah PPN (Pajak Pertambahan Nilai) 12.746.073,00
Jumlah PPnBM (Pajak Penjualan atas Barang Mewah) 0,00
KOTA SURABAYA, 10 September 2026
Ditandatangani secara elektronik
LIM SUK THAY`,
  },
  {
    fileName: 'FakturBeli/04002600285624727_Mayatama.pdf',
    category: 'beli',
    text: `Faktur Pajak
Nama: MAYATAMA MANUNGGAL SENTOSA
Alamat: JL RAYA RUNGKUT INDUSTRI, SURABAYA #0019910975651000000000
Kode dan Nomor Seri Faktur Pajak: 04002600285624727
Pengusaha Kena Pajak:
Nama : MAYATAMA MANUNGGAL SENTOSA
Alamat : JL RAYA RUNGKUT INDUSTRI, KOTA SURABAYA
NPWP : 0019910975651000
Pembeli Barang Kena Pajak/Penerima Jasa Kena Pajak:
Nama : INDAL ALUMINIUM INDUSTRY TBK.
Alamat : DS. SAWOTRATAP , KAB. SIDOARJO #0011225356054000000000
NPWP : 0011225356054000
No. Kode Barang/ Jasa Nama Barang Kena Pajak / Jasa Kena Pajak Harga Jual / Penggantian / Uang Muka / Termin (Rp)
1 000000
FL6+Pvb SoundControl 1.52+FL6 12 MM (2687 x 426)
Rp 978.784,00 x 1,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
978.784,00
2 000000
FL6+Pvb SoundControl 1.52+FL6 12 MM (2687 x 424)
Rp 974.517,00 x 1,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
974.517,00
3 000000
FL6+Pvb SoundControl 1.52+FL6 12 MM (580 x 422)
Rp 417.655,00 x 1,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
417.655,00
4 000000
FL6+Pvb SoundControl 1.52+FL6 12 MM (2163 x 425)
Rp 788.482,00 x 1,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
788.482,00
5 000000
FLHS8+Pvb SoundControl 1.52+FLHS8 16 MM (1430)
Rp 5.625.906,00 x 1,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
5.625.906,00
6 000000
FLHS8+Pvb SoundControl 1.52+FLHS8 16 MM (1425)
Rp 5.854.206,00 x 1,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
5.854.206,00
Harga Jual / Penggantian / Uang Muka / Termin 14.639.550,00
Dikurangi Potongan Harga 0,00
Dikurangi Uang Muka yang telah diterima 0,00
Dasar Pengenaan Pajak 13.419.588,00
Jumlah PPN (Pajak Pertambahan Nilai) 1.610.351,00
Jumlah PPnBM (Pajak Penjualan atas Barang Mewah) 0,00
KOTA SURABAYA, 10 Juli 2026
Ditandatangani secara elektronik
MAYATAMA`,
  },
  {
    fileName: 'FakturBeli/04002600259459408_MitraAngkasa.pdf',
    category: 'beli',
    text: `Faktur Pajak
Nama: MITRA ANGKASA SEJAHTERA TBK
Alamat: JL VETERAN NO.45, SURABAYA #0032624389037000000000
Kode dan Nomor Seri Faktur Pajak: 04002600259459408
Pengusaha Kena Pajak:
Nama : MITRA ANGKASA SEJAHTERA TBK
Alamat : JL VETERAN NO.45, KOTA SURABAYA
NPWP : 0032624389037000
Pembeli Barang Kena Pajak/Penerima Jasa Kena Pajak:
Nama : INDAL ALUMINIUM INDUSTRY TBK.
Alamat : DS. SAWOTRATAP , KAB. SIDOARJO #0011225356054000000000
NPWP : 0011225356054000
No. Kode Barang/ Jasa Nama Barang Kena Pajak / Jasa Kena Pajak Harga Jual / Penggantian / Uang Muka / Termin (Rp)
1 000000
SS304 FT Baut Hex M.16-P2.00x80-K24 Pcs
Rp 13.239,00 x 16,00 Pcs
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
211.824,00
2 000000
SS304 Mur Hex M.16-P2.00-K24 Pcs
Rp 2.942,00 x 16,00 Pcs
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
47.072,00
3 000000
12.9 (L) Baut L M.8-P1.25x25 HTM Pcs
Rp 762,00 x 100,00 Pcs
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
76.200,00
4 000000
12.9 (L) Baut L M.8-P1.25x35 HTM Pcs
Rp 944,00 x 100,00 Pcs
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
94.400,00
5 000000
12.9 (L) Baut L M.10-P1.50x110 HTM Pcs
Rp 4.048,00 x 20,00 Pcs
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
80.960,00
6 000000
12.9 (L) Baut L M.10-P1.50x80 HTM Pcs
Rp 2.381,00 x 20,00 Pcs
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
47.620,00
7 000000
12.9 (L) Baut L M.12-P1.75x50 HTM Pcs
Rp 2.667,00 x 30,00 Pcs
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
80.010,00
8 000000
12.9 (L) Baut L M.6-P1.00x30 HTM Pcs
Rp 471,00 x 100,00 Pcs
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
47.100,00
Harga Jual / Penggantian / Uang Muka / Termin 685.186,00
Dikurangi Potongan Harga 0,00
Dikurangi Uang Muka yang telah diterima 0,00
Dasar Pengenaan Pajak 628.087,00
Jumlah PPN (Pajak Pertambahan Nilai) 75.370,00
Jumlah PPnBM (Pajak Penjualan atas Barang Mewah) 0,00
KOTA SURABAYA, 01 Juli 2026
Ditandatangani secara elektronik
MITRA ANGKASA`,
  },
  {
    fileName: 'FakturBeli/04002600344953697_Pandulima.pdf',
    category: 'beli',
    text: `Faktur Pajak
Nama: PANDULIMA JAYATEHNIK
Alamat: JL TANJUNG PERAK, SURABAYA #0017161282614000000000
Kode dan Nomor Seri Faktur Pajak: 04002600344953697
Pengusaha Kena Pajak:
Nama : PANDULIMA JAYATEHNIK
Alamat : JL TANJUNG PERAK, KOTA SURABAYA
NPWP : 0017161282614000
Pembeli Barang Kena Pajak/Penerima Jasa Kena Pajak:
Nama : INDAL ALUMINIUM INDUSTRY TBK.
Alamat : DS. SAWOTRATAP , KAB. SIDOARJO #0011225356054000000000
NPWP : 0011225356054000
No. Kode Barang/ Jasa Nama Barang Kena Pajak / Jasa Kena Pajak Harga Jual / Penggantian / Uang Muka / Termin (Rp)
1 000000
COUPLER SANG A MODEL MCH24-S ZNDC
Rp 12.300,00 x 10,00 Set
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
123.000,00
2 000000
COUPLER SANG A MODEL MCM22-S ZNDC
Rp 9.200,00 x 10,00 Set
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
92.000,00
3 000000
COUPLER SELANG TYPE MHH24-S ZNDC
Rp 44.200,00 x 5,00 Set
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
221.000,00
4 000000
COUPLER SELANG TYPE MHM24-S ZNDC
Rp 45.900,00 x 5,00 Set
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
229.500,00
Harga Jual / Penggantian / Uang Muka / Termin 665.500,00
Dikurangi Potongan Harga 0,00
Dikurangi Uang Muka yang telah diterima 0,00
Dasar Pengenaan Pajak 610.042,00
Jumlah PPN (Pajak Pertambahan Nilai) 73.205,00
Jumlah PPnBM (Pajak Penjualan atas Barang Mewah) 0,00
KOTA SURABAYA, 21 Agustus 2026
Ditandatangani secara elektronik
PANDULIMA`,
  },
  {
    fileName: 'FakturBeli/04002600375569329_Triyuda.pdf',
    category: 'beli',
    text: `Faktur Pajak
Nama: TRIYUDA PERKASA
Alamat: JL MARGOMULYO INDAH, SURABAYA #0018293084641000000000
Kode dan Nomor Seri Faktur Pajak: 04002600375569329
Pengusaha Kena Pajak:
Nama : TRIYUDA PERKASA
Alamat : JL MARGOMULYO INDAH, KOTA SURABAYA
NPWP : 0018293084641000
Pembeli Barang Kena Pajak/Penerima Jasa Kena Pajak:
Nama : INDAL ALUMINIUM INDUSTRY TBK.
Alamat : DS. SAWOTRATAP , KAB. SIDOARJO #0011225356054000000000
NPWP : 0011225356054000
No. Kode Barang/ Jasa Nama Barang Kena Pajak / Jasa Kena Pajak Harga Jual / Penggantian / Uang Muka / Termin (Rp)
1 000000
WIRE PIVOT ARM 008117
Rp 10.249,00 x 1.000,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
10.249.000,00
2 000000
BUTT HINGE 2" YOUNGMAN (C.B.Y.M)/TR
Rp 2.835,00 x 3.000,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
8.505.000,00
3 000000
TAPING SCREW 10 X 1 JP(Y.M)TRIYUDA (L-TS10X1-A
Rp 305,00 x 35.000,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
10.675.000,00
4 000000
TAPING SCREW 6 X 3/4 JF(Y.M)TRIYUDA (L-TS6X3/4
Rp 152,00 x 31.000,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
4.712.000,00
5 000000
TAPING SCREW 8 X 3/4 JP(Y.M)TRIYUDA (L-TS8X3/4
Rp 194,00 x 14.000,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
2.716.000,00
Harga Jual / Penggantian / Uang Muka / Termin 36.857.000,00
Dikurangi Potongan Harga 0,00
Dikurangi Uang Muka yang telah diterima 0,00
Dasar Pengenaan Pajak 33.785.583,00
Jumlah PPN (Pajak Pertambahan Nilai) 4.054.270,00
Jumlah PPnBM (Pajak Penjualan atas Barang Mewah) 0,00
KOTA SURABAYA, 10 September 2026
Ditandatangani secara elektronik
TRIYUDA`,
  },
  {
    fileName: 'FakturBeli/04002600365747716_Yunindo.pdf',
    category: 'beli',
    text: `Faktur Pajak
Nama: YUNINDO PLASTIC ENGINEERING
Alamat: JL BERBEK INDUSTRI, SIDOARJO #0018827014052000000000
Kode dan Nomor Seri Faktur Pajak: 04002600365747716
Pengusaha Kena Pajak:
Nama : YUNINDO PLASTIC ENGINEERING
Alamat : JL BERBEK INDUSTRI, KAB. SIDOARJO
NPWP : 0018827014052000
Pembeli Barang Kena Pajak/Penerima Jasa Kena Pajak:
Nama : INDAL ALUMINIUM INDUSTRY TBK.
Alamat : DS. SAWOTRATAP , KAB. SIDOARJO #0011225356054000000000
NPWP : 0011225356054000
No. Kode Barang/ Jasa Nama Barang Kena Pajak / Jasa Kena Pajak Harga Jual / Penggantian / Uang Muka / Termin (Rp)
1 000000
PP PLANK COVER CITECO (ORANGE)
Rp 5.145,00 x 600,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
3.087.000,00
2 000000
CITECO BOOT LEFT (ORANGE)
Rp 4.600,00 x 3.500,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
16.100.000,00
3 000000
SPACER LOCK CLIP TDP ORANGE
Rp 820,00 x 2.000,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
1.640.000,00
4 000000
HINGE SPACER TRADESMANT DP 01 (ORANGE)
Rp 3.540,00 x 1.000,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
3.540.000,00
5 000000
HINGE SPACER TRADESMANT DP 02 (ORANGE)
Rp 3.540,00 x 1.000,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
3.540.000,00
6 000000
TOP TDP CITECO (ORANGE)
Rp 27.760,00 x 1.000,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
27.760.000,00
7 000000
CITECO BOOT RIGHT (ORANGE)
Rp 4.600,00 x 3.500,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
16.100.000,00
Harga Jual / Penggantian / Uang Muka / Termin 71.767.000,00
Dikurangi Potongan Harga 0,00
Dikurangi Uang Muka yang telah diterima 0,00
Dasar Pengenaan Pajak 65.786.416,00
Jumlah PPN (Pajak Pertambahan Nilai) 7.894.370,00
Jumlah PPnBM (Pajak Penjualan atas Barang Mewah) 0,00
KOTA SURABAYA, 07 September 2026
Ditandatangani secara elektronik
YUNINDO`,
  },

  // =========================================================================
  // FAKTUR JUAL (PENJUALAN) - Exactly 89 items (Rows 2 to 90 in Attachment #2)
  // =========================================================================
  {
    fileName: 'FakturJual/04002600326002494_Bahama.pdf',
    category: 'jual',
    text: `Faktur Pajak
Nama: INDAL ALUMINIUM INDUSTRY Tbk.
Alamat: DS. SAWOTRATAP , KAB. SIDOARJO #0011225356054000000000
Kode dan Nomor Seri Faktur Pajak: 04002600326002494
Pengusaha Kena Pajak:
Nama : INDAL ALUMINIUM INDUSTRY TBK.
Alamat : DS. SAWOTRATAP , RT 000, RW 000, SAWOTRATAP, GEDANGAN, KAB. SIDOARJO, JAWA TIMUR 61254
NPWP : 0011225356054000
Pembeli Barang Kena Pajak/Penerima Jasa Kena Pajak:
Nama : BAHAMA SUMBER UTAMA
Alamat : GREEN LAKE CITY RUKAN SENTRA NIAGA D NO.10, RT 000, RW 000, DURI KOSAMBI, CENGKARENG, KOTA ADM. JAKARTA BARAT, DKI JAKARTA 11750 #0023626401031000000000
NPWP : 0023626401031000
No. Kode Barang/ Jasa Nama Barang Kena Pajak / Jasa Kena Pajak Harga Jual / Penggantian / Uang Muka / Termin (Rp)
1 760000
[60137DPJSB-6000A6063T6] 60137 DPJSB 6.000M A6063 T6
Rp 883.163,08 x 122,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
107.745.895,76
2 760000
[60148DPJSB-6000A6063T6] 60148 DPJSB 6.000M A6063 T6
Rp 997.998,31 x 57,00 Lainnya
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
56.885.903,67
3 760000
[60102DPJSB-6000A6063T6] 60102 DPJSB 6.000M A6063 T6
Rp 872.605,62 x 100,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
87.260.562,00
4 760000
[60103DPJSB-6000A6063T6] 60103 DPJSB 6.000M A6063 T6
Rp 1.003.845,98 x 60,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
60.230.758,80
5 760000
[60101DPJSB-6000A6063T6] 60101 DPJSB 6.000M A6063 T6
Rp 1.003.304,83 x 141,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
141.465.981,03
6 760000
[18583DPJSB-6000A6063T6] 18583 DPJSB 6.000M A6063 T6
Rp 531.628,34 x 29,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
15.417.221,86
7 760000
[60119DPJSB-6000A6063T6] 60119 DPJSB 6.000M A6063 T6
Rp 1.602.297,36 x 30,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
48.068.920,80
8 760000
[18461DPJSB-6000A6063T6] 18461 DPJSB 6.000M A6063 T6
Rp 192.267,54 x 141,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
27.109.723,14
9 760000
[18315DPJSB-6000A6063T6] 18315 DPJSB 6.000M A6063 T6
Rp 229.115,49 x 292,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
66.901.723,08
Harga Jual / Penggantian / Uang Muka / Termin 1.670.790.831,00
Dikurangi Potongan Harga 0,00
Dikurangi Uang Muka yang telah diterima 523.162.748,00
Dasar Pengenaan Pajak 14.472.185,00
Jumlah PPN (Pajak Pertambahan Nilai) 1.736.662,00
Jumlah PPnBM (Pajak Penjualan atas Barang Mewah) 0,00
KAB. SIDOARJO, 07 Agustus 2026
Ditandatangani secara elektronik
OKTAVIA DARMAWATI DJAELANI
(Referensi: EX-2603940)`,
  },
  {
    fileName: 'FakturJual/04002600377020615_GrhaSinar.pdf',
    category: 'jual',
    text: `Faktur Pajak
Nama: INDAL ALUMINIUM INDUSTRY Tbk.
Alamat: DS. SAWOTRATAP , KAB. SIDOARJO #0011225356054000000000
Kode dan Nomor Seri Faktur Pajak: 04002600377020615
Pengusaha Kena Pajak:
Nama : INDAL ALUMINIUM INDUSTRY TBK.
Alamat : DS. SAWOTRATAP , RT 000, RW 000, SAWOTRATAP, GEDANGAN, KAB. SIDOARJO, JAWA TIMUR 61254
NPWP : 0011225356054000
Pembeli Barang Kena Pajak/Penerima Jasa Kena Pajak:
Nama : GRHA SINAR ABADI
Alamat : KOMPLEK CBD POLONIA JL PADANG GOLF D NO.91, MEDAN #0762774230121000000000
NPWP : 0762774230121000
No. Kode Barang/ Jasa Nama Barang Kena Pajak / Jasa Kena Pajak Harga Jual / Penggantian / Uang Muka / Termin (Rp)
1 760000
13575T DPC 6.000M A6063
Rp 658.000,00 x 57,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
37.506.000,00
2 760000
13572T DPC 6.000M A6063
Rp 761.600,00 x 115,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
87.584.000,00
3 760000
13580T DPC 6.000M A6063
Rp 287.900,00 x 115,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
33.108.500,00
Harga Jual / Penggantian / Uang Muka / Termin 659.147.600,00
Dikurangi Potongan Harga 0,00
Dikurangi Uang Muka yang telah diterima 0,00
Dasar Pengenaan Pajak 180.846.215,00
Jumlah PPN (Pajak Pertambahan Nilai) 21.701.546,00
Jumlah PPnBM (Pajak Penjualan atas Barang Mewah) 0,00
KAB. SIDOARJO, 07 September 2026
Ditandatangani secara elektronik
CANG KWET PIN,,SE
(Referensi: EX-2604332)`,
  },
  {
    fileName: 'FakturJual/04002600326001122_UtamaKarya.pdf',
    category: 'jual',
    text: `Faktur Pajak
Nama: INDAL ALUMINIUM INDUSTRY Tbk.
Alamat: DS. SAWOTRATAP , KAB. SIDOARJO #0011225356054000000000
Kode dan Nomor Seri Faktur Pajak: 04002600326001122
Pengusaha Kena Pajak:
Nama : INDAL ALUMINIUM INDUSTRY TBK.
Alamat : DS. SAWOTRATAP , KAB. SIDOARJO
NPWP : 0011225356054000
Pembeli Barang Kena Pajak/Penerima Jasa Kena Pajak:
Nama : UTAMA KARYA MANDIRI
Alamat : JL MAYJEND SUNGKONO NO.88, KOTA SURABAYA #0034567890123000000000
NPWP : 0034567890123000
No. Kode Barang/ Jasa Nama Barang Kena Pajak / Jasa Kena Pajak Harga Jual / Penggantian / Uang Muka / Termin (Rp)
1 760000
10101 MF 6.000M A6063
Rp 150.000,00 x 20,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
3.000.000,00
2 760000
10102 MF 6.000M A6063
Rp 165.000,00 x 20,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
3.300.000,00
3 760000
10103 MF 6.000M A6063
Rp 180.000,00 x 25,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
4.500.000,00
4 760000
10104 MF 6.000M A6063
Rp 195.000,00 x 20,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
3.900.000,00
5 760000
10105 MF 6.000M A6063
Rp 210.000,00 x 15,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
3.150.000,00
6 760000
10106 MF 6.000M A6063
Rp 225.000,00 x 30,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
6.750.000,00
7 760000
10107 MF 6.000M A6063
Rp 240.000,00 x 20,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
4.800.000,00
8 760000
10108 MF 6.000M A6063
Rp 255.000,00 x 10,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
2.550.000,00
9 760000
10109 MF 6.000M A6063
Rp 270.000,00 x 12,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
3.240.000,00
10 760000
10110 MF 6.000M A6063
Rp 285.000,00 x 14,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
3.990.000,00
11 760000
10111 MF 6.000M A6063
Rp 300.000,00 x 18,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
5.400.000,00
12 760000
10112 MF 6.000M A6063
Rp 315.000,00 x 16,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
5.040.000,00
13 760000
10113 MF 6.000M A6063
Rp 330.000,00 x 22,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
7.260.000,00
14 760000
10114 MF 6.000M A6063
Rp 345.000,00 x 15,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
5.175.000,00
15 760000
10115 MF 6.000M A6063
Rp 360.000,00 x 20,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
7.200.000,00
16 760000
10116 MF 6.000M A6063
Rp 375.000,00 x 10,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
3.750.000,00
17 760000
10117 MF 6.000M A6063
Rp 390.000,00 x 15,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
5.850.000,00
18 760000
10118 MF 6.000M A6063
Rp 405.000,00 x 12,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
4.860.000,00
19 760000
10119 MF 6.000M A6063
Rp 420.000,00 x 14,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
5.880.000,00
20 760000
10120 MF 6.000M A6063
Rp 435.000,00 x 20,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
8.700.000,00
21 760000
10121 MF 6.000M A6063
Rp 450.000,00 x 15,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
6.750.000,00
22 760000
10122 MF 6.000M A6063
Rp 465.000,00 x 10,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
4.650.000,00
23 760000
10123 MF 6.000M A6063
Rp 480.000,00 x 8,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
3.840.000,00
24 760000
10124 MF 6.000M A6063
Rp 495.000,00 x 12,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
5.940.000,00
25 760000
10125 MF 6.000M A6063
Rp 510.000,00 x 16,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
8.160.000,00
26 760000
10126 MF 6.000M A6063
Rp 525.000,00 x 14,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
7.350.000,00
27 760000
10127 MF 6.000M A6063
Rp 540.000,00 x 10,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
5.400.000,00
28 760000
10128 MF 6.000M A6063
Rp 555.000,00 x 12,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
6.660.000,00
29 760000
10129 MF 6.000M A6063
Rp 570.000,00 x 18,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
10.260.000,00
30 760000
10130 MF 6.000M A6063
Rp 585.000,00 x 20,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
11.700.000,00
31 760000
10131 MF 6.000M A6063
Rp 600.000,00 x 15,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
9.000.000,00
32 760000
10132 MF 6.000M A6063
Rp 615.000,00 x 10,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
6.150.000,00
33 760000
10133 MF 6.000M A6063
Rp 630.000,00 x 14,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
8.820.000,00
Harga Jual / Penggantian / Uang Muka / Termin 206.915.000,00
Dikurangi Potongan Harga 0,00
Dikurangi Uang Muka yang telah diterima 0,00
Dasar Pengenaan Pajak 186.409.910,00
Jumlah PPN (Pajak Pertambahan Nilai) 22.369.189,00
Jumlah PPnBM (Pajak Penjualan atas Barang Mewah) 0,00
KAB. SIDOARJO, 20 Agustus 2026
Ditandatangani secara elektronik
OKTAVIA DARMAWATI DJAELANI`,
  },

  // Invoice 4 Penjualan: MODERN ALUMINIUM (11 items, Rows 47 to 57 in Attachment #2)
  {
    fileName: 'FakturJual/04002600356417631_ModernAluminium.pdf',
    category: 'jual',
    text: `Faktur Pajak
Nama: INDAL ALUMINIUM INDUSTRY Tbk.
Alamat: DS. SAWOTRATAP , KAB. SIDOARJO #0011225356054000000000
Kode dan Nomor Seri Faktur Pajak: 04002600356417631
Pengusaha Kena Pajak:
Nama : INDAL ALUMINIUM INDUSTRY TBK.
Alamat : DS. SAWOTRATAP , RT 000, RW 000, SAWOTRATAP, GEDANGAN, KAB. SIDOARJO, JAWA TIMUR 61254
NPWP : 0011225356054000
Pembeli Barang Kena Pajak/Penerima Jasa Kena Pajak:
Nama : MODERN ALUMINIUM
Alamat : JL KELAPA GADING BOULEVARD, JAKARTA UTARA #0020920971605000000000
NPWP : 0020920971605000
No. Kode Barang/ Jasa Nama Barang Kena Pajak / Jasa Kena Pajak Harga Jual / Penggantian / Uang Muka / Termin (Rp)
1 760000
12502 I CL05 6.000M A6063 T5
Rp 227.300,00 x 39,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
8.864.700,00
2 760000
13706T CL05 6.000M A6063 T5
Rp 319.750,00 x 29,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
9.272.750,00
3 760000
17730A BR10 6.000M A6063 T5
Rp 285.050,00 x 88,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
25.084.400,00
4 760000
2722 BR10 6.000M A6063 T5
Rp 170.100,00 x 75,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
12.757.500,00
5 760000
6665 CL05 6.000M A6063 T5
Rp 833.800,00 x 14,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
11.673.200,00
6 760000
6516 CL05 5.850M A6063 T5
Rp 259.950,00 x 99,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
25.735.050,00
7 760000
13712T CL05 6.000M A6063 T5
Rp 251.400,00 x 60,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
15.084.000,00
8 760000
5239 CL05 5.000M A6063 T5
Rp 133.250,00 x 268,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
35.711.000,00
9 760000
13712T CL05 6.000M A6063 T5
Rp 251.400,00 x 80,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
20.112.000,00
10 760000
12502 I CL05 6.000M A6063 T5
Rp 227.300,00 x 50,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
11.365.000,00
11 760000
27037 CL05 6.000M A6063 T5
Rp 558.300,00 x 48,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
26.798.400,00
Harga Jual / Penggantian / Uang Muka / Termin 202.458.000,00
Dikurangi Potongan Harga 0,00
Dikurangi Uang Muka yang telah diterima 0,00
Dasar Pengenaan Pajak 182.394.595,00
Jumlah PPN (Pajak Pertambahan Nilai) 21.887.351,00
Jumlah PPnBM (Pajak Penjualan atas Barang Mewah) 0,00
KAB. SIDOARJO, 28 Agustus 2026
Ditandatangani secara elektronik
OKTAVIA DARMAWATI DJAELANI`,
  },

  // Invoice 5 Penjualan: NAM BERSATU MITRATAMA (21 items, Rows 58 to 78 in Attachment #2)
  {
    fileName: 'FakturJual/04002600326001389_NamBersatu.pdf',
    category: 'jual',
    text: `Faktur Pajak
Nama: INDAL ALUMINIUM INDUSTRY Tbk.
Alamat: DS. SAWOTRATAP , KAB. SIDOARJO #0011225356054000000000
Kode dan Nomor Seri Faktur Pajak: 04002600326001389
Pengusaha Kena Pajak:
Nama : INDAL ALUMINIUM INDUSTRY TBK.
Alamat : DS. SAWOTRATAP , RT 000, RW 000, SAWOTRATAP, GEDANGAN, KAB. SIDOARJO, JAWA TIMUR 61254
NPWP : 0011225356054000
Pembeli Barang Kena Pajak/Penerima Jasa Kena Pajak:
Nama : NAM BERSATU MITRATAMA
Alamat : JL KALIBUTUH NO.34, SURABAYA #0016775793614000000000
NPWP : 0016775793614000
No. Kode Barang/ Jasa Nama Barang Kena Pajak / Jasa Kena Pajak Harga Jual / Penggantian / Uang Muka / Termin (Rp)
1 760000
2351 BR10 6.000M A6063 T5
Rp 29.850,00 x 30,00 Piece
Potongan Harga = Rp 84.356,00
PPnBM (0,00%) = Rp 0,00
895.500,00
2 760000
2229 CL05 6.000M A6063 T5
Rp 85.050,00 x 27,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
2.296.350,00
3 760000
2331 CL05 6.000M A6063 T5
Rp 72.500,00 x 36,00 Piece
Potongan Harga = Rp 127.368,00
PPnBM (0,00%) = Rp 0,00
2.610.000,00
4 760000
2250 MF 6.000M A6063 T5
Rp 117.150,00 x 55,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
6.443.250,00
5 760000
13714T MF 6.000M A6063 T5
Rp 233.300,00 x 38,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
8.865.400,00
6 760000
13716 CL05 6.000M A6063 T5
Rp 251.450,00 x 42,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
10.560.900,00
7 760000
11555 CL05 6.000M A6063 T5
Rp 96.000,00 x 120,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
11.520.000,00
8 760000
11555 CL05 6.000M A6063 T5
Rp 96.000,00 x 137,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
13.152.000,00
9 760000
2022A CL05 6.000M A6063 T5
Rp 70.450,00 x 250,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
17.612.500,00
10 760000
2331 CL05 6.000M A6063 T5
Rp 70.450,00 x 282,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
19.866.900,00
11 760000
2250 MF 6.000M A6063 T5
Rp 117.150,00 x 183,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
21.438.450,00
12 760000
71804 CL05 5.400M A6005 T6
Rp 253.012,00 x 35,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
8.855.420,00
13 760000
71804 CL05 4.750M A6005 T6
Rp 222.557,00 x 62,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
13.798.534,00
14 760000
2229 CL05 6.000M A6063 T5
Rp 85.050,00 x 270,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
22.963.500,00
15 760000
28102 MF 3.500M A6063 T5
Rp 80.100,00 x 325,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
26.032.500,00
16 760000
12549 CL05 6.000M A6063 T5
Rp 434.000,00 x 63,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
27.342.000,00
17 760000
71804 CL05 5.400M A6005 T6
Rp 253.012,00 x 128,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
32.385.536,00
18 760000
71816 MF 6.000M A6063 T5
Rp 260.400,00 x 130,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
33.852.000,00
19 760000
71804 CL05 4.750M A6005 T6
Rp 222.557,00 x 138,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
30.712.866,00
20 760000
71804 CL05 5.400M A6005 T6
Rp 253.012,00 x 14,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
3.542.168,00
21 760000
2201 MF 6.000M A6063 T5
Rp 108.600,00 x 375,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
40.725.000,00
Harga Jual / Penggantian / Uang Muka / Termin 355.470.774,00
Dikurangi Potongan Harga 211.724,00
Dikurangi Uang Muka yang telah diterima 0,00
Dasar Pengenaan Pajak 325.654.129,00
Jumlah PPN (Pajak Pertambahan Nilai) 39.078.496,00
Jumlah PPnBM (Pajak Penjualan atas Barang Mewah) 0,00
KAB. SIDOARJO, 06 Agustus 2026
Ditandatangani secara elektronik
OKTAVIA DARMAWATI DJAELANI
(Referensi: EX-2603904-3922)`,
  },

  // Invoice 6 Penjualan: PRO BAJA INDONESIA (12 items, Rows 79 to 90 in Attachment #2)
  {
    fileName: 'FakturJual/04002600377020614_ProBaja.pdf',
    category: 'jual',
    text: `Faktur Pajak
Nama: INDAL ALUMINIUM INDUSTRY Tbk.
Alamat: DS. SAWOTRATAP , KAB. SIDOARJO #0011225356054000000000
Kode dan Nomor Seri Faktur Pajak: 04002600377020614
Pengusaha Kena Pajak:
Nama : INDAL ALUMINIUM INDUSTRY TBK.
Alamat : DS. SAWOTRATAP , RT 000, RW 000, SAWOTRATAP, GEDANGAN, KAB. SIDOARJO, JAWA TIMUR 61254
NPWP : 0011225356054000
Pembeli Barang Kena Pajak/Penerima Jasa Kena Pajak:
Nama : PRO BAJA INDONESIA
Alamat : JL KAWASAN INDUSTRI CANDI, SEMARANG #0906438551618000000000
NPWP : 0906438551618000
No. Kode Barang/ Jasa Nama Barang Kena Pajak / Jasa Kena Pajak Harga Jual / Penggantian / Uang Muka / Termin (Rp)
1 760000
71901 MF 6.000M A6063
Rp 907.200,00 x 5,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
4.536.000,00
2 760000
71902 MF 6.000M A6063
Rp 426.300,00 x 5,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
2.131.500,00
3 760000
71903 MF 6.000M A6063
Rp 308.200,00 x 5,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
1.541.000,00
4 760000
71904 MF 6.000M A6063
Rp 334.100,00 x 5,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
1.670.500,00
5 760000
71905 MF 6.000M A6063
Rp 716.200,00 x 5,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
3.581.000,00
6 760000
71906 MF 6.000M A6063
Rp 626.000,00 x 5,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
3.130.000,00
7 760000
71907 MF 6.000M A6063
Rp 96.000,00 x 5,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
480.000,00
8 760000
71908 MF 6.000M A6063
Rp 147.900,00 x 5,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
739.500,00
9 760000
71909 MF 6.000M A6063
Rp 210.800,00 x 5,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
1.054.000,00
10 760000
71910 MF 6.000M A6063
Rp 96.000,00 x 5,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
480.000,00
11 760000
71911 MF 6.000M A6063
Rp 123.900,00 x 5,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
619.500,00
12 760000
71610 MF 6.000M A6063
Rp 144.000,00 x 112,00 Piece
Potongan Harga = Rp 0,00
PPnBM (0,00%) = Rp 0,00
16.128.000,00
Harga Jual / Penggantian / Uang Muka / Termin 36.091.000,00
Dikurangi Potongan Harga 0,00
Dikurangi Uang Muka yang telah diterima 0,00
Dasar Pengenaan Pajak 32.483.784,00
Jumlah PPN (Pajak Pertambahan Nilai) 3.898.054,00
Jumlah PPnBM (Pajak Penjualan atas Barang Mewah) 0,00
KAB. SIDOARJO, 03 September 2026
Ditandatangani secara elektronik
OKTAVIA DARMAWATI DJAELANI`,
  },
];

export function getSampleInvoices(): FakturPajakData[] {
  return RAW_SAMPLES.map((s) => parseFakturText(s.text, s.fileName, s.category));
}
