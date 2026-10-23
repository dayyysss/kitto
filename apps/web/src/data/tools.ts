export type ToolCategory = 'all' | 'visual' | 'dev' | 'finance' | 'document' | 'lifestyle'

export interface ToolItem {
  id: string
  title: string
  description: string
  category: Exclude<ToolCategory, 'all'>
  badge?: 'BARU' | 'POPULER' | 'PRO'
  tags: string[]
}

export const CATEGORIES: { id: ToolCategory; label: string }[] = [
  { id: 'all', label: 'Semua Alat' },
  { id: 'visual', label: 'Foto & Gambar' },
  { id: 'dev', label: 'Kode & Keamanan' },
  { id: 'finance', label: 'Uang & Kasir' },
  { id: 'document', label: 'PDF & Dokumen' },
  { id: 'lifestyle', label: 'Gaya Hidup & Harian' },
]

export const TOOLS_DATA: ToolItem[] = [
  // Core & Dev / Keamanan
  {
    id: 'qr',
    title: 'Bikin Kode QR Kustom',
    description: 'Buat kode QR untuk website, Wi-Fi kafe, WhatsApp, atau kontak bisnis dengan logomu.',
    category: 'dev',
    badge: 'POPULER',
    tags: ['qr', 'generator', 'svg', 'wifi', 'whatsapp', 'vcard', 'barcode'],
  },
  {
    id: 'bulk-qr',
    title: 'Bikin Banyak QR Sekaligus',
    description: 'Buat puluhan kode QR sekaligus dari tabel CSV atau teks untuk nomor meja & tiket.',
    category: 'dev',
    badge: 'PRO',
    tags: ['bulk', 'batch', 'qr', 'csv', 'multi', 'excel'],
  },
  {
    id: 'whatsapp-link',
    title: 'Bikin Link Chat WhatsApp',
    description: 'Buat tautan langsung chat WA tanpa orang lain perlu menyimpan nomormu terlebih dahulu.',
    category: 'dev',
    tags: ['whatsapp', 'link', 'chat', 'direct'],
  },
  {
    id: 'password',
    title: 'Bikin Sandi Super Kuat',
    description: 'Buat kata sandi acak anti-retas dan cek berapa lama waktu membobolnya.',
    category: 'dev',
    badge: 'BARU',
    tags: ['password', 'keamanan', 'sandi', 'crypto'],
  },
  {
    id: 'regex-tester',
    title: 'Tester Pola Teks (Regex)',
    description: 'Uji pola pencarian teks (email, nomor HP, URL) secara otomatis dan instan.',
    category: 'dev',
    tags: ['regex', 'pattern', 'cari teks', 'tester'],
  },
  {
    id: 'json-format',
    title: 'Rapikan Data JSON & TS',
    description: 'Rapikan susunan data JSON dan buat tipe TypeScript interface dalam satu klik.',
    category: 'dev',
    tags: ['json', 'format', 'minify', 'typescript'],
  },
  {
    id: 'base64-codec',
    title: 'Pengubah Kode Base64 & URL',
    description: 'Ubah teks biasa menjadi kode Base64 atau URL untuk pengiriman data.',
    category: 'dev',
    tags: ['base64', 'url', 'encode', 'decode'],
  },
  {
    id: 'code-snap',
    title: 'Foto Cuplikan Kode Cantik',
    description: 'Buat gambar cuplikan kodingan yang rapi dengan bingkai laptop macOS siap pamer.',
    category: 'dev',
    badge: 'BARU',
    tags: ['code', 'snippet', 'snap', 'screenshot', 'carbon'],
  },
  {
    id: 'uuid-v7',
    title: 'Pembuat ID Unik (UUID v7/v4)',
    description: 'Buat ID unik terurut waktu untuk database lengkap dengan tanggal pembuatannya.',
    category: 'dev',
    tags: ['uuid', 'v7', 'v4', 'guid', 'id unik'],
  },

  // Foto & Gambar
  {
    id: 'screenshot-beautifier',
    title: 'Percantik Tangkapan Layar (Screenshot)',
    description: 'Beri bingkai laptop/HP elegan dan latar belakang estetik pada tangkapan layarmu.',
    category: 'visual',
    badge: 'POPULER',
    tags: ['screenshot', 'mockup', 'visual', 'gambar', 'foto'],
  },
  {
    id: 'image-compressor',
    title: 'Kecilkan Ukuran Foto (Kompres)',
    description: 'Perkecil ukuran file foto (KB/MB) agar hemat memori dan cepat dikirim di WA/email.',
    category: 'visual',
    badge: 'POPULER',
    tags: ['image', 'compress', 'foto', 'ukuran', 'kecilkan foto'],
  },
  {
    id: 'image-resizer',
    title: 'Ubah Ukuran Foto (Sosmed)',
    description: 'Sesuaikan ukuran foto pas untuk postingan Instagram, Story, YouTube, atau banner.',
    category: 'visual',
    tags: ['resize', 'dimensi', 'pixel', 'gambar', 'instagram'],
  },
  {
    id: 'background-remover',
    title: 'Hapus Latar Belakang Foto',
    description: 'Hapus background foto produk atau potret otomatis dan unduh PNG transparan langsung di browser.',
    category: 'visual',
    badge: 'BARU',
    tags: ['background remover', 'hapus latar', 'transparan', 'png', 'foto produk'],
  },
  {
    id: 'color-palette',
    title: 'Pencari Paduan Warna',
    description: 'Dapatkan kombinasi warna serasi untuk desain grafis, baju, atau presentasi.',
    category: 'visual',
    tags: ['color', 'palette', 'warna', 'hex', 'kombinasi warna'],
  },
  {
    id: 'gradient-maker',
    title: 'Pembuat Warna Gradasi',
    description: 'Campurkan dua warna jadi gradasi indah dan salin kodenya untuk website.',
    category: 'visual',
    tags: ['gradient', 'css', 'warna', 'gradasi'],
  },

  // Uang & Kasir
  {
    id: 'invoice-gen',
    title: 'Bikin Nota Tagihan (Invoice)',
    description: 'Buat faktur tagihan resmi PDF lengkap dengan rincian barang, pajak, dan rekening transfer.',
    category: 'finance',
    badge: 'PRO',
    tags: ['invoice', 'faktur', 'tagihan', 'pdf', 'bisnis', 'nota'],
  },
  {
    id: 'receipt-gen',
    title: 'Bikin Struk Kasir (Bon Belanja)',
    description: 'Buat struk belanja format thermal kasir untuk warung, toko kelontong, atau kafe.',
    category: 'finance',
    badge: 'BARU',
    tags: ['struk', 'bon', 'kasir', 'warung', 'toko'],
  },
  {
    id: 'loan-calculator',
    title: 'Kalkulator Cicilan & KPR',
    description: 'Hitung besaran cicilan bulanan, bunga, dan jadwal pembayaran pinjaman atau KPR.',
    category: 'finance',
    tags: ['pinjaman', 'cicilan', 'bunga', 'kpr', 'kredit'],
  },
  {
    id: 'tax-calculator',
    title: 'Kalkulator Gaji & Pajak PPh 21',
    description: 'Hitung potongan pajak penghasilan dan berapa uang bersih yang kamu bawa pulang.',
    category: 'finance',
    tags: ['pajak', 'pph', 'gaji', 'bersih', 'gaji bersih'],
  },
  {
    id: 'currency-converter',
    title: 'Konverter Kurs Mata Uang',
    description: 'Hitung nilai tukar mata uang asing (Dolar, Euro, Yen, Ringgit, Rupiah).',
    category: 'finance',
    tags: ['kurs', 'mata uang', 'valas', 'rupiah', 'dollar'],
  },

  // PDF & Dokumen
  {
    id: 'pdf-merger',
    title: 'Gabung Banyak File PDF',
    description: 'Satukan beberapa berkas PDF menjadi satu file rapi tanpa aplikasi tambahan.',
    category: 'document',
    badge: 'POPULER',
    tags: ['pdf', 'merge', 'gabung', 'dokumen', 'gabung pdf'],
  },
  {
    id: 'pdf-splitter',
    title: 'Pisah Halaman PDF',
    description: 'Ambil atau pisahkan halaman tertentu dari file PDF dengan mudah.',
    category: 'document',
    tags: ['pdf', 'split', 'pisah', 'halaman', 'potong pdf'],
  },
  {
    id: 'file-to-pdf',
    title: 'Ubah Foto/Gambar ke PDF',
    description: 'Satukan foto atau gambar hasil scan menjadi satu dokumen PDF resmi siap kirim.',
    category: 'document',
    badge: 'BARU',
    tags: ['convert', 'jpg to pdf', 'png to pdf', 'cetak', 'dokumen'],
  },
  {
    id: 'pdf-to-img',
    title: 'Ubah PDF Jadi Gambar Foto',
    description: 'Simpan tiap lembar halaman PDF menjadi file gambar foto (PNG/JPG).',
    category: 'document',
    badge: 'BARU',
    tags: ['pdf to jpg', 'pdf to png', 'extract', 'gambar', 'halaman'],
  },
  {
    id: 'pdf-compressor',
    title: 'Kecilkan Ukuran PDF',
    description: 'Kurangi ukuran file dokumen PDF agar mudah diunggah ke formulir lowongan kerja.',
    category: 'document',
    tags: ['pdf', 'compress', 'dokumen', 'ukuran', 'kompres pdf'],
  },
  {
    id: 'pdf-protect',
    title: 'Kunci PDF dengan Password',
    description: 'Beri kata sandi pengaman agar dokumen PDF rahasia tidak bisa dibuka sembarang orang.',
    category: 'document',
    tags: ['pdf', 'protect', 'password', 'kunci', 'sandi pdf'],
  },
  {
    id: 'word-counter',
    title: 'Penghitung Kata & Waktu Baca',
    description: 'Hitung jumlah kata, huruf, dan estimasi waktu baca untuk tugas skripsi atau artikel.',
    category: 'document',
    tags: ['kata', 'karakter', 'baca', 'teks', 'paragraf', 'skripsi'],
  },

  // Gaya Hidup & Harian
  {
    id: 'bill-split',
    title: 'Hitung Patungan & Format WA',
    description: 'Bagi rata tagihan makan bersama teman dan salin rinciannya langsung ke grup WA.',
    category: 'lifestyle',
    badge: 'POPULER',
    tags: ['patungan', 'bill', 'split', 'makan', 'tip', 'nongkrong'],
  },
  {
    id: 'bmi-calc',
    title: 'Cek Berat Badan Ideal (BMI)',
    description: 'Ketahui apakah berat badanmu ideal, kurang, atau berlebih menurut standar kesehatan.',
    category: 'lifestyle',
    tags: ['bmi', 'kesehatan', 'berat', 'tinggi', 'berat ideal'],
  },
  {
    id: 'greeting-card',
    title: 'Bikin Kartu Ucapan Digital',
    description: 'Buat kartu ucapan mewah untuk Lebaran, Ulang Tahun, atau perayaan siap kirim.',
    category: 'lifestyle',
    badge: 'BARU',
    tags: ['kartu', 'greeting', 'idul fitri', 'ucapan', 'lebaran'],
  },
  {
    id: 'calorie-tracker',
    title: 'Catatan Kalori Makanan',
    description: 'Pantau jumlah kalori makanan yang kamu santap untuk jaga pola makan sehat.',
    category: 'lifestyle',
    tags: ['kalori', 'diet', 'nutrisi', 'makanan'],
  },
  {
    id: 'habit-tracker',
    title: 'Catatan Kebiasaan Harian',
    description: 'Bangun dan centang rutinitas positif harianmu agar konsisten setiap hari.',
    category: 'lifestyle',
    tags: ['habit', 'kebiasaan', 'rutinitas', 'streak'],
  },
]
