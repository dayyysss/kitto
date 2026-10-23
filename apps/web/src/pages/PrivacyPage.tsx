import { ShieldCheck, EyeOff, Cpu, Database, Lock, UserCheck, HelpCircle } from 'lucide-react'
import { useI18n } from '../lib/i18n'

export function PrivacyPage() {
  const { lang } = useI18n()

  const sections = [
    {
      icon: EyeOff,
      title: lang === 'id' ? '1. Apa itu "Zero Tracking" di Kitto?' : '1. What is "Zero Tracking" at Kitto?',
      content:
        lang === 'id' ? (
          <div className="space-y-3 leading-relaxed">
            <p>
              <strong>Zero Tracking</strong> adalah filosofi rekayasa privasi mutlak di mana platform secara sadar dan sengaja <strong>tidak mengumpulkan, tidak merekam, dan tidak memprofilkan</strong> aktivitas digital pengguna.
            </p>
            <p>
              Pada sebagian besar situs converter atau generator online di internet, setiap teks yang Anda ketik, file yang Anda unggah, dan alamat IP Anda dipasangi pelacak (tracker) untuk dijual ke pialang data periklanan atau dijadikan target iklan invasif. Di Kitto:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
              <li><strong>Tanpa Skrip Analitik Komersial:</strong> Kami tidak memasang Google Analytics, Meta (Facebook) Pixel, TikTok Pixel, Hotjar, atau pelacak klik mouse lainnya.</li>
              <li><strong>Tanpa Browser Fingerprinting:</strong> Kami tidak pernah mengumpulkan tanda sidik peramban (Canvas/WebGL/Audio fingerprint) untuk melacak Anda lintas web.</li>
              <li><strong>Tanpa Riwayat Aktivitas Alat (No Tool History Logging):</strong> Kami tidak menyimpan teks yang Anda masukkan ke generator QR, password yang Anda acak, atau file yang Anda konversi.</li>
            </ul>
          </div>
        ) : (
          <div className="space-y-3 leading-relaxed">
            <p>
              <strong>Zero Tracking</strong> is our core privacy engineering standard where the platform intentionally <strong>never monitors, logs, or profiles</strong> your digital activity.
            </p>
            <p>
              Unlike conventional online utilities that harvest your text, uploaded files, and IP addresses for advertising networks:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
              <li><strong>No Commercial Analytics:</strong> We never embed Google Analytics, Meta Pixel, tracking pixels, or session recording scripts.</li>
              <li><strong>No Browser Fingerprinting:</strong> We do not gather device canvas or audio signatures to track you across websites.</li>
              <li><strong>No Tool Activity Logs:</strong> We never record the text you generate, passwords you create, or documents you convert.</li>
            </ul>
          </div>
        ),
    },
    {
      icon: Cpu,
      title: lang === 'id' ? '2. Pemrosesan di Sisi Klien (Client-Side & Offline-First)' : '2. Client-Side & Offline-First Execution',
      content:
        lang === 'id' ? (
          <div className="space-y-3 leading-relaxed">
            <p>
              Hampir seluruh perangkat di Kitto—termasuk <em>Generator Kode QR, Generator Sandi Kriptografis, Kompresi Gambar, Konverter PDF ke Gambar, Gambar ke PDF, Analisis Kata, dan Pengujian Regex</em>—dieksekusi <strong>100% di dalam perangkat memori RAM browser Anda sendiri</strong>.
            </p>
            <p>
              Artinya:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
              <li>Kata sandi pribadi dan data teks kontak vCard Anda <strong>tidak pernah dikirimkan melalui kabel jaringan internet</strong> ke server mana pun.</li>
              <li>File foto dan dokumen rahasia Anda diproses secara lokal menggunakan HTML5 Canvas dan Web Crypto API tanpa proses pengunggahan (upload) jarak jauh.</li>
              <li>Alat-alat ini bahkan tetap berfungsi penuh saat koneksi internet Anda diputus total (mode offline).</li>
            </ul>
          </div>
        ) : (
          <div className="space-y-3 leading-relaxed">
            <p>
              Nearly all tools on Kitto—including <em>QR Studio, Password Generator, Image Compression, PDF Converters, Word Analysis, and Regex Testers</em>—run <strong>100% in your local device memory (RAM)</strong>.
            </p>
            <p>
              This means:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
              <li>Your sensitive text and passwords <strong>never travel across public internet cables</strong> to any remote server.</li>
              <li>Your images and documents are processed locally via HTML5 Canvas and native Web APIs without remote file transfers.</li>
              <li>Core tools continue to work even when your internet connection is entirely disconnected.</li>
            </ul>
          </div>
        ),
    },
    {
      icon: Database,
      title: lang === 'id' ? '3. Data Apa Saja yang Disimpan di Database Server?' : '3. What Data is Stored on the Cloud Server?',
      content:
        lang === 'id' ? (
          <div className="space-y-3 leading-relaxed">
            <p>
              Kitto hanya berinteraksi dengan server database cloud dalam 3 skenario yang Anda lakukan secara sadar dan sukarela:
            </p>
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1A1B20] border border-slate-200/80 dark:border-slate-800">
                <strong className="text-slate-900 dark:text-white">a. Saat Anda Mendaftarkan Akun (Kreator / Admin):</strong>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Kami hanya menyimpan Nama, Alamat Email, dan Sandi Terenkripsi (Hash PBKDF2) untuk keperluan otentikasi login.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1A1B20] border border-slate-200/80 dark:border-slate-800">
                <strong className="text-slate-900 dark:text-white">b. Saat Anda Menggunakan Fitur Dynamic QR:</strong>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Server menyimpan <em>Slug tautan pendek</em> (contoh: <code>/r/promo</code>) dan <em>Target URL tujuan</em> agar pengalihan redirect dapat berfungsi. Server juga mencatat angka total pindaian (scan count) dan perangkat umum pengunjung untuk statistik dasbor pemilik QR.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1A1B20] border border-slate-200/80 dark:border-slate-800">
                <strong className="text-slate-900 dark:text-white">c. Saat Anda Mengarsipkan Faktur atau Template Brand:</strong>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Data faktur tagihan dan setelan warna template yang Anda simpan secara eksplisit disimpan di database terenkripsi agar dapat Anda muat kembali di perangkat lain.
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              *Tamu yang menggunakan fitur statis offline tidak memiliki data apa pun yang tersimpan di server.
            </p>
          </div>
        ) : (
          <div className="space-y-3 leading-relaxed">
            <p>
              Kitto only communicates with cloud servers in three specific scenarios you initiate voluntarily:
            </p>
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1A1B20] border border-slate-200/80 dark:border-slate-800">
                <strong className="text-slate-900 dark:text-white">a. Account Registration:</strong>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  We store only your Name, Email, and One-Way Salted Password Hash (PBKDF2) for sign-in verification.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1A1B20] border border-slate-200/80 dark:border-slate-800">
                <strong className="text-slate-900 dark:text-white">b. Dynamic QR Generation:</strong>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  The server stores the shortlink slug and destination URL to perform redirects, along with anonymized device scan counts for the owner's dashboard.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1A1B20] border border-slate-200/80 dark:border-slate-800">
                <strong className="text-slate-900 dark:text-white">c. Invoice Vault & Brand Presets:</strong>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Invoices and color palettes you explicitly click to save are stored so you can access them across your devices.
                </p>
              </div>
            </div>
          </div>
        ),
    },
    {
      icon: Lock,
      title: lang === 'id' ? '4. Standar Enkripsi & Keamanan Kriptografis' : '4. Cryptographic Security Standards',
      content:
        lang === 'id' ? (
          <div className="space-y-3 leading-relaxed">
            <p>
              Seluruh infrastruktur Kitto dibangun dengan standar keamanan modern:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
              <li><strong>Protokol TLS 1.3:</strong> Seluruh pertukaran data web dienkripsi dengan sertifikat SSL/TLS mutakhir berkecepatan tinggi.</li>
              <li><strong>PBKDF2 Password Hashing:</strong> Kata sandi akun dienkripsi satu arah menggunakan algoritma derivasi kunci PBKDF2 dengan 100.000 putaran iterasi SHA-256 dan 16-byte cryptographic salt acak. Bahkan administrator kami tidak dapat melihat atau mendekripsi kata sandi asli Anda.</li>
              <li><strong>Koneksi Database Terenkripsi:</strong> Komunikasi ke database menggunakan koneksi SSL enforced (<code>sslmode=require</code>).</li>
            </ul>
          </div>
        ) : (
          <div className="space-y-3 leading-relaxed">
            <p>
              All Kitto infrastructure adheres to modern cryptographic standards:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
              <li><strong>TLS 1.3 Encryption:</strong> All web traffic is strictly encrypted end-to-end.</li>
              <li><strong>PBKDF2 Password Hashing:</strong> User passwords are encrypted with 100,000 SHA-256 iterations and random 16-byte salt, making plaintext retrieval impossible.</li>
              <li><strong>Enforced SSL Database Connections:</strong> Database queries are executed with TLS certificate enforcement.</li>
            </ul>
          </div>
        ),
    },
    {
      icon: UserCheck,
      title: lang === 'id' ? '5. Hak Pengguna: Penghapusan Data Total' : '5. User Rights & Data Erasure',
      content:
        lang === 'id' ? (
          <div className="space-y-3 leading-relaxed">
            <p>
              Kami menjunjung tinggi hak Anda atas privasi dan kepemilikan data pribadi (<em>Right to be Forgotten</em>):
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
              <li>Anda berhak menghapus Dynamic QR, arsip faktur, atau template brand Anda kapan saja langsung dari dasbor Anda.</li>
              <li>Penghapusan data dilakukan secara permanen dari tabel database aktif tanpa cadangan tersembunyi yang ditahan.</li>
              <li>Jika Anda ingin menghapus seluruh akun Anda, silakan hubungi tim kami dan seluruh data terkait akun Anda akan dihapus bersih.</li>
            </ul>
          </div>
        ) : (
          <div className="space-y-3 leading-relaxed">
            <p>
              We fully uphold your rights to data sovereignty and erasure (<em>Right to be Forgotten</em>):
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
              <li>You can permanently delete any saved Dynamic QR, invoice draft, or preset directly from your dashboard.</li>
              <li>Deletions are instantaneous and permanent with no hidden secondary backups.</li>
              <li>Full account deletion requests can be submitted anytime to purge all associated records.</li>
            </ul>
          </div>
        ),
    },
    {
      icon: HelpCircle,
      title: lang === 'id' ? '6. Pertanyaan & Kontak Privasi' : '6. Inquiries & Privacy Contact',
      content:
        lang === 'id' ? (
          <p className="leading-relaxed">
            Jika Anda memiliki pertanyaan seputar audit arsitektur keamanan, kepatuhan privasi, atau permintaan penghapusan data, silakan sampaikan melalui formulir di halaman <strong>Saran & Review</strong> atau kirimkan email ke tim pengembang kami di <code>privacy@kitto.dev</code>.
          </p>
        ) : (
          <p className="leading-relaxed">
            For inquiries regarding security audits, privacy verification, or data erasure requests, please contact our team via the <strong>Requests & Reviews</strong> portal or email <code>privacy@kitto.dev</code>.
          </p>
        ),
    },
  ]

  const toc = lang === 'id'
    ? ['Zero tracking', 'Pemrosesan lokal', 'Data server', 'Keamanan', 'Hak pengguna', 'Kontak']
    : ['Zero tracking', 'Local processing', 'Server data', 'Security', 'User rights', 'Contact']

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10 sm:py-24 lg:px-16">
      <div className="grid gap-12 lg:grid-cols-12">
        <aside className="lg:col-span-4">
          <div className="space-y-6 lg:sticky lg:top-28">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>{lang === 'id' ? 'Zero tracking · Privasi mutlak' : 'Zero tracking · Absolute privacy'}</span>
            </div>

            <h1 className="text-5xl font-extrabold leading-[0.95] tracking-[-0.05em] text-[#1C1917] dark:text-[#F5F4F0] sm:text-6xl">
              {lang === 'id' ? 'Kebijakan' : 'Privacy'}{' '}
              <span className="font-serif-accent italic text-[#E14D2A] font-normal">
                {lang === 'id' ? 'privasi.' : 'policy.'}
              </span>
            </h1>

            <p className="max-w-md text-base leading-relaxed text-[#57534E] dark:text-[#A8A29E]">
              {lang === 'id'
                ? 'Penjelasan transparan seputar komitmen Zero-Tracking, eksekusi pemrosesan data lokal di peramban, dan keamanan tanpa kompromi.'
                : 'Transparent disclosure of our Zero-Tracking standard, local client-side processing, and uncompromised cryptographic privacy.'}
            </p>

            <p className="text-xs text-[#78716C]">
              {lang === 'id' ? 'Terakhir diperbarui 16 Oktober 2026' : 'Last updated October 16, 2026'}
            </p>

            <nav className="hidden border-l border-[#EAE5DC] pl-5 dark:border-[#272A33] lg:block">
              <ul className="space-y-3">
                {toc.map((label, index) => (
                  <li key={label}>
                    <a
                      href={`#privacy-${index + 1}`}
                      className="group flex items-center gap-3 text-sm text-[#78716C] transition-colors hover:text-[#E14D2A]"
                    >
                      <span className="font-mono-code text-[10px] text-[#D4A373]">0{index + 1}</span>
                      <span>{label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        <div className="lg:col-span-8">
          {sections.map((sec, idx) => {
            const Icon = sec.icon
            return (
              <section
                id={`privacy-${idx + 1}`}
                key={idx}
                className="scroll-mt-28 border-t border-[#EAE5DC] py-8 first:border-t-0 first:pt-0 dark:border-[#272A33]"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E14D2A]/10 text-[#E14D2A]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-bold tracking-tight text-[#1C1917] dark:text-[#F5F4F0] sm:text-2xl">
                      {sec.title}
                    </h2>
                    <div className="mt-3 text-sm leading-relaxed text-[#57534E] dark:text-[#A8A29E] sm:text-base">
                      {sec.content}
                    </div>
                  </div>
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}
