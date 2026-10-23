<div align="center">
  <a href="https://github.com/dayyysss/kitto">
    <img src="apps/web/public/favicon.svg" width="80" height="80" alt="Logo Kitto" />
  </a>

  <h1>Kitto</h1>

  <p><strong>Studio utilitas web untuk kerja yang lebih cepat.</strong></p>

  <p>
    <a href="https://github.com/dayyysss/kitto/issues">Laporkan bug</a>
    &middot;
    <a href="https://github.com/dayyysss/kitto/issues">Ajukan fitur</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/TypeScript-6-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Bun-1.3-000000?style=for-the-badge&logo=bun&logoColor=white" alt="Bun" />
  </p>
</div>

---

<details>
  <summary>Daftar Isi</summary>
  <ol>
    <li><a href="#tentang-kitto">Tentang Kitto</a></li>
    <li><a href="#memulai">Memulai</a></li>
    <li><a href="#penggunaan">Penggunaan</a></li>
    <li><a href="#kontribusi">Kontribusi</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#kontak">Kontak</a></li>
    <li><a href="#kredit">Kredit</a></li>
  </ol>
</details>

## Tentang Kitto

Kitto adalah kumpulan alat web untuk membuat QR code, mengolah dokumen dan PDF, merapikan teks, serta menyelesaikan tugas kecil sehari-hari dalam satu tempat.

Sebagian besar alat berjalan langsung di browser. File tidak perlu diunggah, proses tetap cepat, dan privasi tetap terjaga.

### Yang bisa dilakukan

- Membuat dan menyesuaikan QR code untuk tautan, Wi-Fi, vCard, WhatsApp, dan kebutuhan cetak.
- Menggabung, memisah, dan mengompres PDF tanpa meninggalkan browser.
- Membuat invoice, struk, dan perhitungan bisnis sederhana.
- Membersihkan format JSON, menguji regex, membuat password, dan alat developer lainnya.
- Menghitung kebutuhan harian seperti BMI, kalori, hidrasi, dan split bill.

### Dibangun dengan

- React 19
- Vite 8
- TypeScript
- Tailwind CSS v4
- Bun
- Hono dan Neon Postgres untuk API

## Memulai

### Prasyarat

- [Bun](https://bun.com) versi 1.2 atau lebih baru

### Instalasi

```bash
git clone https://github.com/dayyysss/kitto.git
cd kitto
bun install
```

### Environment

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Isi secret server di `apps/api/.env`. Isi `apps/web/.env` hanya variabel `VITE_*`, karena nilainya publik dan ikut ke bundle.

### Menjalankan

Frontend:

```bash
bun run dev
```

Buka `http://localhost:5173`.

API:

```bash
bun run dev:api
```

API berjalan di `http://localhost:3000`.

### Build

```bash
bun run build
```

## Penggunaan

1. Buka Kitto di browser.
2. Pilih alat yang dibutuhkan.
3. Kerjakan langsung di browser tanpa upload file ke server.

## Kontribusi

Kontribusi terbuka untuk siapa saja.

1. Fork repository.
2. Buat branch baru.
3. Commit perubahan.
4. Push branch.
5. Buka pull request.

## Roadmap

Rencana fitur dan perbaikan dikelola melalui [Issues](https://github.com/dayyysss/kitto/issues). Punya ide alat baru? Buka issue agar bisa dibahas.

## Kontak

- GitHub: [dayyysss](https://github.com/dayyysss)
- Bug dan permintaan fitur: [Kitto Issues](https://github.com/dayyysss/kitto/issues)

