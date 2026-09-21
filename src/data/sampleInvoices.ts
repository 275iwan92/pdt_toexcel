import { FakturPajakData, parseFakturText } from '../utils/fakturParser';

const RAW_SAMPLES: { fileName: string; category: 'beli' | 'jual'; text: string }[] = [
  {
    fileName: 'FakturBeli/04002600237157125_AsianBearindo.pdf',
    category: 'beli',
    text: `Faktur Pajak
Nama: ASIAN BEARINDO JAYA
Alamat: JL TANJUNGSARI NO.19, KOTA SURABAYA
#0017394099614000000000
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
No.
Kode
Barang/
Jasa
Nama Barang Kena Pajak / Jasa Kena Pajak
Harga Jual / Penggantian /
Uang Muka / Termin
(Rp)
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
Dikurangi Uang Muka yang telah diterima
Dasar Pengenaan Pajak 2.077.350,00
Jumlah PPN (Pajak Pertambahan Nilai) 249.282,00
Jumlah PPnBM (Pajak Penjualan atas Barang Mewah) 0,00
KOTA SURABAYA, 23 Juni 2026
Ditandatangani secara elektronik
PUJI WARASTUTI
(Referensi: INV. ABJ260609083)`
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
No.
Kode
Barang/
Jasa
Nama Barang Kena Pajak / Jasa Kena Pajak
Harga Jual / Penggantian /
Uang Muka / Termin
(Rp)
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
Dikurangi Uang Muka yang telah diterima
Dasar Pengenaan Pajak 6.544.860,00
Jumlah PPN (Pajak Pertambahan Nilai) 785.383,00
Jumlah PPnBM (Pajak Penjualan atas Barang Mewah) 0,00
KOTA SURABAYA, 14 Juli 2026
Ditandatangani secara elektronik
HOWARD CHRISTIAN
(Referensi: 190 G/26)`
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
No.
Kode
Barang/
Jasa
Nama Barang Kena Pajak / Jasa Kena Pajak
Harga Jual / Penggantian /
Uang Muka / Termin
(Rp)
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
Dikurangi Uang Muka yang telah diterima
Dasar Pengenaan Pajak 5.565.083,00
Jumlah PPN (Pajak Pertambahan Nilai) 667.810,00
Jumlah PPnBM (Pajak Penjualan atas Barang Mewah) 0,00
KOTA SURABAYA, 13 Juli 2026
Ditandatangani secara elektronik
HENNY ONGKY WIJOYO
(Referensi: )`
  },
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
NIK : -
Nomor Paspor : -
Identitas Lain : -
Email: -
No.
Kode
Barang/
Jasa
Nama Barang Kena Pajak / Jasa Kena Pajak
Harga Jual / Penggantian /
Uang Muka / Termin
(Rp)
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
(Referensi: EX-2603940)`
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
Alamat : KOMPLEK CBD POLONIA JL PADANG GOLF D NO.91, RT 000, RW 000, SUKA DAMAI, MEDAN POLONIA, KOTA MEDAN, SUMATERA UTARA 20157 #0762774230121000000000
NPWP : 0762774230121000
NIK : -
Nomor Paspor : -
Identitas Lain : -
Email: -
No.
Kode
Barang/
Jasa
Nama Barang Kena Pajak / Jasa Kena Pajak
Harga Jual / Penggantian /
Uang Muka / Termin
(Rp)
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
(Referensi: EX-2604332)`
  },
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
Alamat : JL KALIBUTUH NO.34, RT 000, RW 000, TEMBOK DUKUH, BUBUTAN, KOTA SURABAYA, JAWA TIMUR 60173 #0016775793614000000000
NPWP : 0016775793614000
NIK : -
Nomor Paspor : -
Identitas Lain : -
Email: -
No.
Kode
Barang/
Jasa
Nama Barang Kena Pajak / Jasa Kena Pajak
Harga Jual / Penggantian /
Uang Muka / Termin
(Rp)
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
Harga Jual / Penggantian / Uang Muka / Termin 355.470.774,00
Dikurangi Potongan Harga 211.724,00
Dikurangi Uang Muka yang telah diterima
Dasar Pengenaan Pajak 325.654.129,00
Jumlah PPN (Pajak Pertambahan Nilai) 39.078.496,00
Jumlah PPnBM (Pajak Penjualan atas Barang Mewah) 0,00
KAB. SIDOARJO, 06 Agustus 2026
Ditandatangani secara elektronik
OKTAVIA DARMAWATI DJAELANI
(Referensi: EX-2603904-3922)`
  }
];

export function getSampleInvoices(): FakturPajakData[] {
  return RAW_SAMPLES.map(s => parseFakturText(s.text, s.fileName, s.category));
}
