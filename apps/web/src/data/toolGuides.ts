export interface ToolStep {
  step: number
  title: string
  desc: string
}

export interface ToolFaq {
  q: string
  a: string
}

export interface ToolGuideData {
  steps: ToolStep[]
  tips: string
  faqs: ToolFaq[]
}

const SPECIFIC_GUIDES: Record<string, ToolGuideData> = {
  qr: {
    steps: [
      {
        step: 1,
        title: 'Pilih Tipe Isi QR',
        desc: 'Tentukan apakah kamu ingin membuat QR untuk link website, chat WhatsApp, Wi-Fi otomatis, atau kartu nama.',
      },
      {
        step: 2,
        title: 'Kustomisasi Desain & Logo',
        desc: 'Atur warna barcode, model bintik titik/kotak, bingkai tulisan (cth: SCAN SAYA), serta unggah logo tokomu di tengah.',
      },
      {
        step: 3,
        title: 'Unduh Sesuai Kebutuhan',
        desc: 'Pilih format PNG untuk dipajang di media sosial/layar HP, atau format Vektor SVG jika ingin dicetak pada spanduk & baliho besar.',
      },
    ],
    tips: 'Pastikan warna barcode selalu lebih gelap dari warna latar belakang agar kamera HP dapat memindai dengan cepat.',
    faqs: [
      {
        q: 'Apakah QR Code statis memiliki masa kedaluwarsa?',
        a: 'Tidak sama sekali. Seluruh QR Code statis berlaku selamanya karena data terkode langsung di modul grafis tanpa ketergantungan server.',
      },
      {
        q: 'Apakah gambar QR akan pecah saat dicetak di banner atau stiker besar?',
        a: 'Tidak akan pecah jika kamu memilih format unduhan Vektor SVG. Format vektor menjaga ketajaman garis geometris di ukuran cetak berapa pun.',
      },
      {
        q: 'Bagaimana cara mengubah link tujuan pada Dynamic QR?',
        a: 'Jika kamu memakai Dynamic QR dan sudah masuk akun, kamu cukup buka menu Dashboard dan klik "Ubah Target" kapan saja tanpa perlu cetak ulang.',
      },
      {
        q: 'Apakah data saya dikirim ke server?',
        a: 'Tidak. Seluruh pembuatan QR statis berjalan lokal di browser perangkatmu.',
      },
    ],
  },

  'image-compressor': {
    steps: [
      {
        step: 1,
        title: 'Pilih atau Tarik Berkas Foto',
        desc: 'Unggah file gambar berformat JPG, PNG, atau WEBP yang ingin kamu perkecil ukurannya.',
      },
      {
        step: 2,
        title: 'Atur Kualitas & Skala Dimensi',
        desc: 'Geser slider kualitas atau turunkan skala resolusi. Gunakan tombol perbandingan visual 50/50 untuk mengecek ketajaman foto.',
      },
      {
        step: 3,
        title: 'Unduh Hasil yang Hemat Memori',
        desc: 'Klik tombol unduh untuk menyimpan foto hasil kompresi berukuran jauh lebih ringan dan siap kirim via email atau WhatsApp.',
      },
    ],
    tips: 'Format WEBP biasanya menghemat hingga 70% lebih banyak memori dibanding JPG biasa dengan kualitas visual yang sama tajam.',
    faqs: [
      {
        q: 'Apakah foto saya diunggah ke internet atau server orang lain?',
        a: 'Tidak sama sekali. Kompresi gambar berjalan 100% di memori browser perangkatmu. Foto KTP, dokumen rahasia, atau foto pribadi tidak pernah keluar dari perangkatmu.',
      },
      {
        q: 'Apakah foto akan terlihat buram setelah dikompres?',
        a: 'Tidak. Kitto menggunakan pereduksi metadata cerdas. Kualitas 80% adalah standar optimal di mana mata manusia hampir tidak bisa membedakan penurunannya.',
      },
      {
        q: 'Berapa batas ukuran foto yang bisa diproses?',
        a: 'Karena diproses di browsermu, tidak ada batasan ketat dari server. Kamu bisa memproses foto resolusi kamera tinggi hingga puluhan megabyte.',
      },
    ],
  },

  'background-remover': {
    steps: [
      {
        step: 1,
        title: 'Pilih Foto Subjek',
        desc: 'Unggah foto produk, potret, atau objek dengan format PNG, JPG, atau WEBP.',
      },
      {
        step: 2,
        title: 'Jalankan Penghapusan Latar',
        desc: 'Klik tombol Hapus Latar Belakang. Model AI diunduh sekali ke browser lalu memproses foto secara lokal.',
      },
      {
        step: 3,
        title: 'Unduh PNG Transparan',
        desc: 'Bandingkan hasil dengan foto asli, lalu unduh PNG dengan latar transparan siap dipakai untuk katalog atau desain.',
      },
    ],
    tips: 'Foto dengan subjek jelas dan kontras terhadap latar biasanya menghasilkan tepi yang paling rapi. Proses pertama lebih lama karena mengunduh model AI.',
    faqs: [
      {
        q: 'Apakah foto saya diunggah ke server?',
        a: 'Tidak. Seluruh proses segmentasi berjalan di browser perangkatmu. Kitto tidak menyimpan atau menerima file fotomu.',
      },
      {
        q: 'Kenapa proses pertama lambat?',
        a: 'Model AI perlu diunduh sekali ke cache browser. Setelah itu pemrosesan berikutnya jauh lebih cepat dan bisa dipakai offline.',
      },
    ],
  },

  password: {
    steps: [
      {
        step: 1,
        title: 'Pilih Model Sandi',
        desc: 'Pilih antara karakter acak, kata kamus bahasa Indonesia (Passphrase) yang mudah diingat, atau PIN 6 digit.',
      },
      {
        step: 2,
        title: 'Tentukan Panjang & Karakter',
        desc: 'Atur panjang sandi dan centang kombinasi huruf besar, angka, serta simbol unik yang diinginkan.',
      },
      {
        step: 3,
        title: 'Periksa Kekuatan & Salin',
        desc: 'Pantau kekuatan sandi dan estimasi waktu retas, lalu klik Salin untuk menggunakannya.',
      },
    ],
    tips: 'Untuk akun penting seperti email atau perbankan, gunakan panjang minimal 16 karakter dengan kombinasi simbol.',
    faqs: [
      {
        q: 'Apakah kata sandi yang dibuat tersimpan di server?',
        a: 'Tidak. Sandi dibuat langsung di perangkatmu. Tidak ada yang bisa melihat sandi tersebut selain kamu.',
      },
      {
        q: 'Apa itu Passphrase bahasa Indonesia?',
        a: 'Passphrase menggabungkan 4 atau lebih kata acak bahasa Indonesia (misal: "kopi-mentari-samudra-roket-42"). Sangat mudah diketik di HP namun mustahil ditebak hacker.',
      },
      {
        q: 'Apa arti 64 bits?',
        a: 'Standar keamanan menyarankan kekuatan minimal 64 bits agar sandi membutuhkan waktu sangat lama untuk dibobol komputer super.',
      },
    ],
  },

  'invoice-gen': {
    steps: [
      {
        step: 1,
        title: 'Isi Informasi Usaha & Klien',
        desc: 'Masukkan nama usahamu, nomor faktur tagihan, serta nama klien atau perusahaan yang dituju.',
      },
      {
        step: 2,
        title: 'Tambahkan Rincian Barang / Jasa',
        desc: 'Tulis nama barang/layanan, jumlah pesanan, harga satuan, dan atur persentase pajak PPN jika ada.',
      },
      {
        step: 3,
        title: 'Cetak atau Simpan ke Cloud',
        desc: 'Klik Simpan ke Vault jika memiliki akun, atau klik Cetak/Simpan PDF untuk mengirimkannya langsung ke pelanggan.',
      },
    ],
    tips: 'Beri tanda Lunas / Belum Lunas langsung dari daftar arsip untuk melacak pembayaran klien dengan rapi.',
    faqs: [
      {
        q: 'Apakah faktur tagihan ini resmi dan sah?',
        a: 'Ya, faktur ini mengikuti struktur standar penagihan niaga lengkap dengan nomor referensi unik, rincian subtotal, dan pajak.',
      },
      {
        q: 'Apakah faktur yang saya buat tersimpan?',
        a: 'Jika kamu masuk ke akun Kreator, seluruh faktur tersimpan di database cloud pribadimu dan bisa dimuat ulang dalam 1 klik.',
      },
    ],
  },

  'receipt-gen': {
    steps: [
      {
        step: 1,
        title: 'Tentukan Lebar Kertas Struk',
        desc: 'Pilih antara ukuran kasir portabel 58mm atau kasir restoran 80mm.',
      },
      {
        step: 2,
        title: 'Isi Data Toko & Pesanan',
        desc: 'Tulis nama toko, alamat, kasir, dan daftar menu atau barang yang dibeli oleh pelanggan.',
      },
      {
        step: 3,
        title: 'Masukkan Uang Bayar & Cetak',
        desc: 'Masukkan nominal uang yang dibayarkan untuk menghitung uang kembalian otomatis, lalu klik Cetak Struk.',
      },
    ],
    tips: 'Gunakan printer thermal Bluetooth atau USB standar mini POS untuk hasil cetak struk kasir yang autentik.',
    faqs: [
      {
        q: 'Apakah bisa langsung disambungkan ke printer kasir mini?',
        a: 'Bisa. Klik tombol "Cetak Struk", lalu pilih printer thermal yang terhubung ke laptop atau komputermu.',
      },
    ],
  },

  'pdf-merger': {
    steps: [
      {
        step: 1,
        title: 'Pilih File-File PDF',
        desc: 'Pilih dua atau lebih dokumen PDF dari laptop atau ponselmu.',
      },
      {
        step: 2,
        title: 'Urutkan Dokumen',
        desc: 'Pastikan urutan file sesuai dengan susunan halaman yang kamu inginkan.',
      },
      {
        step: 3,
        title: 'Satukan & Unduh',
        desc: 'Klik tombol Gabungkan untuk menyatukan seluruh lembar PDF menjadi satu file utuh.',
      },
    ],
    tips: 'Kamu tidak perlu mengunggah file ke server pihak ketiga. Dokumen lamaran kerja atau berkas rahasia tetap diproses di perangkatmu.',
    faqs: [
      {
        q: 'Apakah ada batasan jumlah halaman?',
        a: 'Tidak ada batas buatan. Jumlah halaman dibatasi hanya oleh kapasitas memori browser perangkatmu.',
      },
    ],
  },
}

export function getToolGuide(toolId: string, _category: string): ToolGuideData {
  if (SPECIFIC_GUIDES[toolId]) {
    return SPECIFIC_GUIDES[toolId]
  }

  // Sensible, friendly general guide per category
  return {
    steps: [
      {
        step: 1,
        title: 'Masukkan Data atau Pilih Berkas',
        desc: 'Isi kolom formulir yang tersedia atau pilih file dari komputermu untuk mulai memproses.',
      },
      {
        step: 2,
        title: 'Sesuaikan Opsi & Pantau Hasil',
        desc: 'Pilih pengaturan yang sesuai dan periksa hasil perubahan secara instan pada tampilan pratinjau.',
      },
      {
        step: 3,
        title: 'Unduh Hasil atau Salin Seketika',
        desc: 'Klik tombol aksi untuk mengunduh berkas jadi atau menyalin teks hasil kalkulasi ke clipboard.',
      },
    ],
    tips: 'Semua proses berjalan langsung di browser perangkat Anda.',
    faqs: [
      {
        q: 'Apakah penggunaan alat ini gratis dan bebas watermark?',
        a: 'Ya, seluruh 26 utilitas di Kitto dapat digunakan secara gratis tanpa watermark dan tanpa biaya tersembunyi.',
      },
      {
        q: 'Apakah berkas saya dikirim ke server?',
        a: 'Tidak. Berkas diproses langsung di browser perangkat Anda.',
      },
      {
        q: 'Apakah bisa digunakan di layar ponsel atau tablet?',
        a: 'Bisa, seluruh tampilan dirancang responsif dan nyaman digunakan di ponsel, tablet, maupun komputer desktop.',
      },
    ],
  }
}
