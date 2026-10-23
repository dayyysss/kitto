import { neon, type NeonQueryFunction } from '@neondatabase/serverless'
import { hashPassword } from '../utils/crypto'
import { slugify } from '../utils/slug'

const DATABASE_URL = process.env.DATABASE_URL || ''
export let sql: NeonQueryFunction<false, false> | null = null

if (DATABASE_URL) {
  try {
    sql = neon(DATABASE_URL)
    console.log('✓ Connected to Neon Postgres')
  } catch (err) {
    console.error('Failed initializing Neon client:', err)
  }
} else {
  console.warn('! DATABASE_URL belum diatur. Masukkan koneksi Neon Postgres ke .env')
}

// In-Memory Fallbacks if DB is temporarily disconnected
export const memoryStore = {
  users: [] as Array<{ id: number; name: string; email: string; passwordHash: string; role: string; avatar?: string; bio?: string; phone?: string; createdAt: string }>,
  history: [] as Array<{ id: number; tool: string; title: string; payload: string; metadata?: any; createdAt: number }>,
  qrCodes: new Map<string, { targetUrl: string; scans: number; createdAt: number; pin?: string; expiresAt?: string }>(),
  invoices: [] as Array<any>,
  presets: [] as Array<any>,
  blogPosts: [] as Array<any>,
  releases: [] as Array<any>,
  feedbacks: [] as Array<any>,
  settings: {} as Record<string, any>,
  pageViews: [] as Array<{ id: number; path: string; device: string; browser: string; created_at: string }>,
  toolUsage: [] as Array<{ id: number; tool_id: string; created_at: string }>,
}

export async function initDatabase() {
  if (!sql) return
  try {
    // 1. History Table
    await sql`
      CREATE TABLE IF NOT EXISTS history (
        id SERIAL PRIMARY KEY,
        tool TEXT NOT NULL,
        title TEXT NOT NULL,
        payload TEXT NOT NULL,
        metadata JSONB,
        created_at BIGINT NOT NULL
      );
    `

    // 2. Users Table with Role
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'kreator',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'kreator';`
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;`
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;`
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;`

    // 3. QR Codes Table
    await sql`
      CREATE TABLE IF NOT EXISTS qr_codes (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE SET NULL,
        title TEXT DEFAULT 'Untitled QR',
        slug TEXT UNIQUE NOT NULL,
        target_url TEXT NOT NULL,
        payload_type TEXT NOT NULL,
        style_config JSONB,
        pin TEXT,
        expires_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    // 4. Scans Table
    await sql`
      CREATE TABLE IF NOT EXISTS scans (
        id BIGSERIAL PRIMARY KEY,
        qr_slug TEXT NOT NULL,
        scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        country TEXT,
        device TEXT
      );
    `

    // 5. Invoices Table
    await sql`
      CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE SET NULL,
        invoice_num TEXT NOT NULL,
        from_company TEXT NOT NULL,
        client_name TEXT NOT NULL,
        total_amount NUMERIC NOT NULL,
        status TEXT DEFAULT 'unpaid',
        items JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    // 6. Presets Table
    await sql`
      CREATE TABLE IF NOT EXISTS presets (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE SET NULL,
        type TEXT NOT NULL,
        name TEXT NOT NULL,
        config JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    // 7. Blog Posts Table
    await sql`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        tag TEXT NOT NULL,
        read_time TEXT DEFAULT '4 min read',
        summary TEXT NOT NULL,
        content JSONB NOT NULL,
        keywords TEXT,
        cover_image TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
    await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS keywords TEXT;`
    await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS cover_image TEXT;`
    await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS slug TEXT;`

    const postsWithoutSlug = await sql`SELECT id, title FROM blog_posts WHERE slug IS NULL OR slug = '';`
    for (const row of postsWithoutSlug) {
      const base = slugify(row.title) || `artikel-${row.id}`
      const clash = await sql`SELECT id FROM blog_posts WHERE slug = ${base} AND id <> ${row.id} LIMIT 1;`
      await sql`UPDATE blog_posts SET slug = ${clash.length > 0 ? `${base}-${row.id}` : base} WHERE id = ${row.id};`
    }
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS blog_posts_slug_idx ON blog_posts(slug);`

    // 8. Release Notes Table
    await sql`
      CREATE TABLE IF NOT EXISTS release_notes (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        date TEXT NOT NULL,
        badge TEXT,
        highlights TEXT NOT NULL,
        changes JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    // 9. Feedback Table
    await sql`
      CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        type TEXT NOT NULL DEFAULT 'review',
        name TEXT NOT NULL,
        role TEXT,
        rating INT,
        comment TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    // 10. Site Settings Table
    await sql`
      CREATE TABLE IF NOT EXISTS site_settings (
        key TEXT PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    // 11. Page Views & Visitor Statistics Table (Zero Tracking First-Party)
    await sql`
      CREATE TABLE IF NOT EXISTS page_views (
        id BIGSERIAL PRIMARY KEY,
        path TEXT NOT NULL,
        device TEXT DEFAULT 'desktop',
        browser TEXT DEFAULT 'other',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    // 12. Tool Usage Tracking Table (Anonymous aggregate)
    await sql`
      CREATE TABLE IF NOT EXISTS tool_usage (
        id BIGSERIAL PRIMARY KEY,
        tool_id TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
    await sql`CREATE INDEX IF NOT EXISTS tool_usage_tool_idx ON tool_usage(tool_id);`
    await sql`CREATE INDEX IF NOT EXISTS tool_usage_created_idx ON tool_usage(created_at);`

    // 13. Durable Rate Limits (survives serverless instance restarts)
    await sql`
      CREATE TABLE IF NOT EXISTS rate_limits (
        key TEXT PRIMARY KEY,
        count INT NOT NULL DEFAULT 0,
        reset_at TIMESTAMP WITH TIME ZONE NOT NULL
      );
    `
    await sql`DELETE FROM rate_limits WHERE reset_at < NOW() - INTERVAL '1 day';`

    // Auto-seed Default Administrator if not exists
    const adminEmail = 'admin@kitto.dev'
    const existingAdmin = await sql`SELECT id FROM users WHERE email = ${adminEmail} LIMIT 1;`
    if (existingAdmin.length === 0) {
      const defaultAdminPass = 'admin12345'
      const hashed = await hashPassword(defaultAdminPass)
      await sql`
        INSERT INTO users (name, email, password_hash, role)
        VALUES ('Administrator Kitto', ${adminEmail}, ${hashed}, 'admin');
      `
      console.log(`✓ Default Administrator created: ${adminEmail} (password: ${defaultAdminPass})`)
    }

    // Auto-seed Authentic Kitto Releases if empty
    const existingReleases = await sql`SELECT id FROM release_notes LIMIT 1;`
    if (existingReleases.length === 0) {
      await sql`
        INSERT INTO release_notes (title, date, badge, highlights, changes)
        VALUES
        (
          'v1.4.0 — Analitik Mandiri & Konsol Operasi Lanjutan',
          '18 Oktober 2026',
          'TERBARU',
          'Sistem pemantauan pengunjung tanpa cookie pihak ketiga, moderasi massal pengguna, dan integrasi catatan rilis dinamis.',
          ${JSON.stringify([
            { type: 'new', label: 'BARU', text: 'Sistem statistik pengunjung mandiri dengan grafik 7 hari dan distribusi perangkat.' },
            { type: 'new', label: 'BARU', text: 'Manajemen pengguna konsol: seleksi massal dengan kotak centang, pembaruan peran instan, dan pengurutan dinamis.' },
            { type: 'improve', label: 'PENINGKATAN', text: 'Editor artikel blog kini dilengkapi bilah format teks (tebal, miring, judul, kutipan, dan kode).' },
            { type: 'improve', label: 'PENINGKATAN', text: 'Perataan logo brand dinamis pada konsol operasional admin.' }
          ])}
        ),
        (
          'v1.3.0 — Rute Mandiri 26 Alat & Dialog Konfirmasi Kustom',
          '16 Oktober 2026',
          'STABIL',
          'Setiap alat kini punya halaman sendiri dengan panduan langkah dan FAQ interaktif.',
          ${JSON.stringify([
            { type: 'new', label: 'BARU', text: 'Halaman khusus per-alat dengan navigasi, panduan langkah interaktif, dan FAQ presisi.' },
            { type: 'new', label: 'BARU', text: 'Dialog konfirmasi kustom yang lebih rapi menggantikan pop-up bawaan browser.' },
            { type: 'improve', label: 'PENINGKATAN', text: 'Fitur koleksi dan favorit alat tersimpan per-akun di area anggota.' },
            { type: 'fix', label: 'PERBAIKAN', text: 'Perbaikan cache aplikasi agar tidak error saat membuka tautan tertentu.' }
          ])}
        ),
        (
          'v1.2.0 — Arsitektur Hanko Vermilion & Dukungan Dwibahasa',
          '15 Oktober 2026',
          'STABIL',
          'Pembaruan identitas visual bernuansa stempel Hanko Jepang, pencarian cepat, dan saklar dwibahasa ID/EN instan.',
          ${JSON.stringify([
            { type: 'new', label: 'BARU', text: 'Pencarian cepat untuk navigasi seluruh 26 utilitas dalam sekejap.' },
            { type: 'new', label: 'BARU', text: 'Dukungan dwibahasa (Bahasa Indonesia & English) tanpa memuat ulang halaman.' },
            { type: 'improve', label: 'PENINGKATAN', text: 'Generator QR Pro kini mendukung 3 mode pratinjau simultan (Flyer, Meja Cafe, Stiker Kemasan).' }
          ])}
        ),
        (
          'v1.0.0 — Peluncuran Perdana: Suite 26 Alat Presisi',
          '14 Oktober 2026',
          'MAYOR',
          'Rilis publik perdana Kitto: Generator QR vektor murni, pengukur kekuatan sandi, serta utilitas keuangan dan developer lengkap.',
          ${JSON.stringify([
            { type: 'new', label: 'BARU', text: 'Studio Kode QR Pro dengan ekspor vektor tajam, bingkai teks, dan peringatan kontras warna.' },
            { type: 'new', label: 'BARU', text: 'Pembuat Sandi acak yang berjalan offline dengan pengukur kekuatan.' },
            { type: 'new', label: 'BARU', text: 'Suite Keuangan: Faktur tagihan PDF, struk bon thermal kasir, dan simulasi cicilan pinjaman.' }
          ])}
        );
      `
      console.log('✓ Initial Kitto release notes seeded into Neon Postgres.')
    }

    // Nightly features release (idempotent for already-seeded databases)
    const existingV15 = await sql`SELECT id FROM release_notes WHERE title LIKE 'v1.5.0%' LIMIT 1;`
    if (existingV15.length === 0) {
      await sql`
        INSERT INTO release_notes (title, date, badge, highlights, changes)
        VALUES (
          'v1.5.0 - Penghapus Latar AI & Blog Reader',
          '22 Oktober 2026',
          'TERBARU',
          'Rilis malam ini menghadirkan penghapus latar belakang foto berbasis AI lokal, halaman detail blog, katalog alat di beranda, dan prompt pemasangan aplikasi.',
          ${JSON.stringify([
            { type: 'new', label: 'BARU', text: 'Alat Hapus Latar Belakang Foto dengan model AI lokal, kuas hapus/pulihkan, latar transparan/warna/foto, serta efek blur, bayangan, dan cahaya.' },
            { type: 'new', label: 'BARU', text: 'Halaman detail artikel blog dengan navigasi baca, tautan bagikan, dan rekomendasi alat terkait.' },
            { type: 'new', label: 'BARU', text: 'Katalog alat di halaman utama untuk menjelajah dan mencari seluruh utilitas langsung dari beranda.' },
            { type: 'new', label: 'BARU', text: 'Prompt pemasangan aplikasi dengan dukungan Android/desktop dan panduan Tambahkan ke Layar Utama untuk iOS.' },
            { type: 'improve', label: 'PENINGKATAN', text: 'Ruang kerja alat aktif di halaman Tools, sehingga alat bisa dipakai tanpa berpindah halaman.' }
          ])}
        );
      `
      await sql`UPDATE release_notes SET badge = 'STABIL' WHERE title LIKE 'v1.4.0%';`
    }

    // Clean legacy release notes that still expose internal tech terms
    await sql`
      UPDATE release_notes SET
        highlights = 'Sistem pemantauan pengunjung tanpa cookie pihak ketiga, moderasi massal pengguna, dan integrasi catatan rilis dinamis.',
        changes = ${JSON.stringify([
          { type: 'new', label: 'BARU', text: 'Sistem statistik pengunjung mandiri dengan grafik 7 hari dan distribusi perangkat.' },
          { type: 'new', label: 'BARU', text: 'Manajemen pengguna konsol: seleksi massal dengan kotak centang, pembaruan peran instan, dan pengurutan dinamis.' },
          { type: 'improve', label: 'PENINGKATAN', text: 'Editor artikel blog kini dilengkapi bilah format teks (tebal, miring, judul, kutipan, dan kode).' },
          { type: 'improve', label: 'PENINGKATAN', text: 'Perataan logo brand dinamis pada konsol operasional admin.' }
        ])}
      WHERE title LIKE 'v1.4.0%' AND changes::text LIKE '%Rich Text Markdown%';
    `
    await sql`
      UPDATE release_notes SET
        highlights = 'Setiap alat kini punya halaman sendiri dengan panduan langkah dan FAQ interaktif.',
        changes = ${JSON.stringify([
          { type: 'new', label: 'BARU', text: 'Halaman khusus per-alat dengan navigasi, panduan langkah interaktif, dan FAQ presisi.' },
          { type: 'new', label: 'BARU', text: 'Dialog konfirmasi kustom yang lebih rapi menggantikan pop-up bawaan browser.' },
          { type: 'improve', label: 'PENINGKATAN', text: 'Fitur koleksi dan favorit alat tersimpan per-akun di area anggota.' },
          { type: 'fix', label: 'PERBAIKAN', text: 'Perbaikan cache aplikasi agar tidak error saat membuka tautan tertentu.' }
        ])}
      WHERE title LIKE 'v1.3.0%' AND changes::text LIKE '%Framer Motion%';
    `
    await sql`
      UPDATE release_notes SET
        highlights = 'Pembaruan identitas visual bernuansa stempel Hanko Jepang, pencarian cepat, dan saklar dwibahasa ID/EN instan.',
        changes = ${JSON.stringify([
          { type: 'new', label: 'BARU', text: 'Pencarian cepat untuk navigasi seluruh 26 utilitas dalam sekejap.' },
          { type: 'new', label: 'BARU', text: 'Dukungan dwibahasa (Bahasa Indonesia & English) tanpa memuat ulang halaman.' },
          { type: 'improve', label: 'PENINGKATAN', text: 'Generator QR Pro kini mendukung 3 mode pratinjau simultan (Flyer, Meja Cafe, Stiker Kemasan).' }
        ])}
      WHERE title LIKE 'v1.2.0%' AND highlights LIKE '%Command Palette%';
    `
    await sql`
      UPDATE release_notes SET
        highlights = 'Rilis publik perdana Kitto: Generator QR vektor murni, pengukur kekuatan sandi, serta utilitas keuangan dan developer lengkap.',
        changes = ${JSON.stringify([
          { type: 'new', label: 'BARU', text: 'Studio Kode QR Pro dengan ekspor vektor tajam, bingkai teks, dan peringatan kontras warna.' },
          { type: 'new', label: 'BARU', text: 'Pembuat Sandi acak yang berjalan offline dengan pengukur kekuatan.' },
          { type: 'new', label: 'BARU', text: 'Suite Keuangan: Faktur tagihan PDF, struk bon thermal kasir, dan simulasi cicilan pinjaman.' }
        ])}
      WHERE title LIKE 'v1.0.0%' AND changes::text LIKE '%CSPRNG%';
    `

    // Auto-seed Authentic Kitto Blog Posts if empty
    const existingBlog = await sql`SELECT id FROM blog_posts LIMIT 1;`
    if (existingBlog.length === 0) {
      await sql`
        INSERT INTO blog_posts (title, slug, tag, read_time, summary, content, keywords)
        VALUES
        (
          'Panduan Scannability QR: Mengapa Rasio Kontras & Margin Logo Sangat Krusial',
          'panduan-scannability-qr-mengapa-rasio-kontras-margin-logo-sangat-krusial',
          'TUTORIAL',
          '4 min read',
          'Memahami alasan teknis mengapa sensor kamera smartphone sering gagal membaca QR code kustom dan bagaimana kalkulator kontras WCAG menyelamatkan desain Anda.',
          ${JSON.stringify([
            'Kode QR (Quick Response) bergantung pada modul kontras tinggi (area gelap dan terang) untuk memungkinkan algoritma Reed-Solomon mengenali pola orientasi tiga sudut finder pattern.',
            'Masalah umum pada generator QR online biasa adalah mereka membiarkan pengguna memilih warna foreground dan background dengan rasio kontras rendah (seperti abu-abu muda di atas putih). Kitto mengintegrasikan validasi WCAG 2.1 real-time untuk memastikan rasio kontras modul selalu >= 4.0:1.',
            'Ketika menyematkan logo di tengah QR, tingkat error correction harus dikunci minimal level Q (25%) atau H (30%). Batasi ukuran logo maksimal 30% dari total area modul agar area data redundan tidak terhapus melebihi toleransi koreksi kesalahan.'
          ])},
          'qr code, wcag, rasio kontras, reed solomon, vektor svg'
        ),
        (
          'Shannon Entropy: Mengapa Pengukur Sandi Biasa Sering Menyesatkan',
          'shannon-entropy-mengapa-pengukur-sandi-biasa-sering-menyesatkan',
          'KRIPTOGRAFI',
          '5 min read',
          'Banyak aplikasi hanya menghitung panjang karakter untuk mengukur kekuatan sandi. Pelajari formulasi matematika bit entropi Shannon yang digunakan pakar keamanan siber.',
          ${JSON.stringify([
            'Entropi informasi Shannon mengukur tingkat ketidakpastian atau keacakan suatu deret karakter dalam satuan "bits". Rumusnya: H = L * log2(N), di mana L adalah panjang karakter dan N adalah ukuran pool karakter yang digunakan.',
            'Password dengan 16 karakter yang hanya berisi angka memiliki entropi sekitar 53.1 bits, sementara 16 karakter campuran huruf besar, kecil, angka, dan simbol memiliki entropi lebih dari 104 bits. Angka ini menjadikannya mustahil di-brute force oleh superkomputer modern sekalipun.',
            'Dengan mengeksekusi Web Crypto API secara offline di browser, Kitto memastikan kunci atau sandi pribadi Anda tidak pernah transit di kabel jaringan publik.'
          ])},
          'shannon entropy, kriptografi, csprng, kekuatan sandi, brute force'
        ),
        (
          'Arsitektur Zero-Tracking: Menjalankan Utilitas Digital 100% Client-Side',
          'arsitektur-zero-tracking-menjalankan-utilitas-digital-100-client-side',
          'ARSITEKTUR',
          '4 min read',
          'Mengapa memproses dokumen, gambar, dan kompresi berkas langsung di RAM browser tanpa transit server adalah standar baru privasi web modern.',
          ${JSON.stringify([
            'Mayoritas web converter tradisional mewajibkan pengguna mengunggah dokumen PDF atau gambar ke server mereka. Ini menimbulkan risiko kebocoran data, pemindaian dokumen rahasia, serta konsumsi bandwidth yang besar.',
            'Dengan HTML5 Canvas, IndexedDB, dan WebAssembly modern, seluruh konversi dapat diselesaikan dalam fraksi milidetik di perangkat Anda sendiri tanpa server pengintai.',
            'Filosofi Kitto adalah zero footprint: apa yang Anda proses di komputer Anda, tetap berada di komputer Anda.'
          ])},
          'zero tracking, client side, privasi, indexeddb, webassembly'
        ),
        (
          'Optimasi Vektor SVG Murni untuk Cetak Presisi Resolusi Tinggi',
          'optimasi-vektor-svg-murni-untuk-cetak-presisi-resolusi-tinggi',
          'DESAIN',
          '3 min read',
          'Perbandingan mendalam antara raster PNG resolusi tinggi vs path vektor SVG murni saat mencetak barcode QR di kemasan produk dan papan reklame.',
          ${JSON.stringify([
            'Gambar berbasis piksel (PNG/JPG) rentan mengalami artefak pixelation saat diperbesar dalam proses cetak offset atau sablon merchandise.',
            'Kitto mengekspor kode QR langsung sebagai kurva vektor matematika SVG (<path d="...">) murni tanpa wrapper bitmap, memastikan ketajaman mikron pada ukuran cetak berapa pun.',
            'Dilengkapi dengan frame banner yang dapat disesuaikan untuk kebutuhan etalase toko, kafe, dan packaging produk retail.'
          ])},
          'svg vektor, cetak kemasan, resolusi qr, desain presisi, hanko'
        );
      `
      console.log('✓ Initial Kitto educational blog posts seeded into Neon Postgres.')
    }

    console.log('✓ All Neon Postgres tables & Admin seed ready.')
  } catch (err) {
    console.error('Failed auto-initializing database tables:', err)
  }
}
