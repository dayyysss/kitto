import { FileText, Shield, CheckCircle2, AlertTriangle, Scale, Lock } from 'lucide-react'
import { useI18n } from '../lib/i18n'

export function TermsPage() {
  const { lang } = useI18n()

  const sections = [
    {
      icon: Scale,
      title: lang === 'id' ? '1. Penerimaan Syarat & Ketentuan' : '1. Acceptance of Terms',
      content:
        lang === 'id' ? (
          <div className="space-y-3 leading-relaxed">
            <p>
              Dengan mengakses atau menggunakan platform <strong>Kitto</strong> (termasuk 26 alat utilitas digital, Dynamic QR Studio, dan Member Area), Anda menyatakan telah membaca, memahami, dan menyetujui untuk terikat dengan Syarat dan Ketentuan ini.
            </p>
            <p>
              Jika Anda tidak menyetujui sebagian atau seluruh ketentuan ini, Anda disarankan untuk tidak melanjutkan penggunaan layanan Kitto.
            </p>
          </div>
        ) : (
          <div className="space-y-3 leading-relaxed">
            <p>
              By accessing or utilizing <strong>Kitto</strong> (including all 26 precision utilities, Dynamic QR Studio, and Member Area), you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service.
            </p>
            <p>
              If you disagree with any portion of these terms, please discontinue access to the platform.
            </p>
          </div>
        ),
    },
    {
      icon: Shield,
      title: lang === 'id' ? '2. Kepemilikan Penuh Hasil Karya (100% User Ownership)' : '2. Complete User Ownership of Generated Content',
      content:
        lang === 'id' ? (
          <div className="space-y-3 leading-relaxed">
            <p>
              Seluruh berkas, grafik, dan dokumen yang Anda hasilkan melalui Kitto—seperti <strong>Kode QR Vektor (SVG/PNG), Faktur Tagihan PDF, Struk Bon Kasir, Gambar Terkompresi, dan Sandi Kriptografis</strong>—adalah <strong>100% hak milik Anda sepenuhnya</strong>.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
              <li>Kitto <strong>tidak pernah menempelkan watermark paksa</strong> pada hasil karya Anda.</li>
              <li>Anda bebas menggunakan hasil karya untuk kepentingan personal, komersial, materi promosi UMKM, sablon kemasan produk, maupun publikasi cetak tanpa royalti.</li>
              <li>Karena pemrosesan berlangsung di peramban Anda, Kitto tidak mengklaim hak cipta atau kepemilikan apa pun atas dokumen Anda.</li>
            </ul>
          </div>
        ) : (
          <div className="space-y-3 leading-relaxed">
            <p>
              All output generated via Kitto—including <strong>Vector QR codes (SVG/PNG), PDF Invoices, Thermal Receipts, Compressed Media, and Cryptographic Passwords</strong>—remains <strong>100% your exclusive property</strong>.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
              <li>Kitto <strong>never forces watermarks or branding</strong> onto your downloads.</li>
              <li>You possess complete freedom to use generated assets for commercial products, retail packaging, client billing, or merchandise without royalties.</li>
              <li>Because compute occurs client-side, Kitto claims zero intellectual property rights over your inputs or generated outputs.</li>
            </ul>
          </div>
        ),
    },
    {
      icon: AlertTriangle,
      title: lang === 'id' ? '3. Larangan Penggunaan (Acceptable Use Policy)' : '3. Prohibited Activities & Security Standard',
      content:
        lang === 'id' ? (
          <div className="space-y-3 leading-relaxed">
            <p>
              Anda setuju untuk menggunakan Kitto secara bertanggung jawab dan sah menurut hukum yang berlaku di wilayah yurisdiksi Anda. Pengguna <strong>dilarang keras</strong>:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
              <li>Menggunakan fitur <strong>Dynamic QR Redirect</strong> untuk mengarahkan pengguna ke situs web phishing, penyebaran malware, penipuan finansial, atau konten ilegal.</li>
              <li>Mencoba melakukan serangan penolakan layanan (DDoS), peretasan basis data, atau eksploitasi API serverless Kitto.</li>
              <li>Menyalahgunakan generator faktur untuk memalsukan transaksi perpajakan atau penipuan hukum.</li>
            </ul>
            <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold pt-1">
              Kitto berhak mencabut dan menghapus tautan Dynamic QR yang terbukti melanggar hukum tanpa pemberitahuan sebelumnya.
            </p>
          </div>
        ) : (
          <div className="space-y-3 leading-relaxed">
            <p>
              You agree to use Kitto legally and ethically under applicable laws. You are <strong>strictly prohibited</strong> from:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
              <li>Configuring <strong>Dynamic QR Redirects</strong> to destination URLs containing phishing traps, malware distribution, financial fraud, or illegal material.</li>
              <li>Attempting distributed denial-of-service (DDoS) attacks, unauthorized database penetrations, or reverse-engineering protected server endpoints.</li>
              <li>Utilizing the invoice generator to fabricate fraudulent tax claims or criminal transactions.</li>
            </ul>
          </div>
        ),
    },
    {
      icon: Lock,
      title: lang === 'id' ? '4. Akun Member & Keamanan Kredensial' : '4. Member Accounts & Credential Security',
      content:
        lang === 'id' ? (
          <div className="space-y-3 leading-relaxed">
            <p>
              Pendaftaran akun kreator di Member Area bersifat opsional namun memberikan akses ke sinkronisasi Dynamic QR dan arsip faktur tagihan:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
              <li>Anda bertanggung jawab penuh menjaga kerahasiaan kata sandi akun Anda.</li>
              <li>Kata sandi Anda disimpan menggunakan enkripsi hashing <strong>PBKDF2 dengan 100.000 iterasi</strong>, sehingga tidak dapat dibaca bahkan oleh tim Kitto.</li>
              <li>Anda dapat meminta penghapusan akun dan data Anda secara permanen kapan saja.</li>
            </ul>
          </div>
        ) : (
          <div className="space-y-3 leading-relaxed">
            <p>
              Creator registration in the Member Area is optional but enables editable dynamic redirection and invoice vaults:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
              <li>You are responsible for maintaining the confidentiality of your authentication credentials.</li>
              <li>Passwords are hashed via <strong>PBKDF2 with 100,000 iterations</strong>, remaining unreadable even to database administrators.</li>
              <li>You reserve the right to wipe your user account and linked assets permanently at any time.</li>
            </ul>
          </div>
        ),
    },
    {
      icon: CheckCircle2,
      title: lang === 'id' ? '5. Batasan Tanggung Jawab & Garansi Komputasi' : '5. Disclaimer of Warranties & Computation Limits',
      content:
        lang === 'id' ? (
          <div className="space-y-3 leading-relaxed">
            <p>
              Seluruh kalkulasi teknis (seperti rasio kontras WCAG, entropi sandi Shannon, estimasi pajak progresif, dan simulasi amortisasi cicilan) disediakan dengan niat baik dan formula matematika berstandar industri.
            </p>
            <p>
              Namun demikian, layanan ini disediakan atas dasar <em>"sebagaimana adanya" (as is)</em> tanpa jaminan mutlak bahwa layanan akan bebas dari interupsi jaringan atau bahwa hasil kalkulasi keuangan dapat menggantikan nasihat konsultan pajak atau penasihat hukum profesional berlisensi.
            </p>
          </div>
        ) : (
          <div className="space-y-3 leading-relaxed">
            <p>
              All mathematical calculations (including WCAG contrast thresholds, Shannon entropy bits, tax calculators, and loan schedules) follow verified formulas.
            </p>
            <p>
              The platform is provided on an <em>"as is"</em> basis without warranties that network connectivity will be uninterrupted. Financial calculations do not constitute certified tax or legal counsel.
            </p>
          </div>
        ),
    },
  ]

  return (
    <div className="px-4 py-12 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-4xl rounded-[28px] border border-[#EAE5DC] bg-white p-6 dark:border-[#272A33] dark:bg-[#1A1B20] sm:p-10 lg:p-12">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE5DC] pb-6 dark:border-[#272A33]">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#E14D2A]">
            <FileText className="h-4 w-4" />
            <span>{lang === 'id' ? 'Ketentuan layanan' : 'Terms of service'}</span>
          </div>
          <span className="text-xs text-[#78716C]">
            {lang === 'id' ? 'Diperbarui 18 Oktober 2026' : 'Updated October 18, 2026'}
          </span>
        </div>

        <h1 className="mt-8 text-4xl font-extrabold leading-[0.95] tracking-[-0.05em] text-[#1C1917] dark:text-[#F5F4F0] sm:text-5xl">
          {lang === 'id' ? 'Syarat &' : 'Terms of'}{' '}
          <span className="font-serif-accent italic text-[#E14D2A] font-normal">
            {lang === 'id' ? 'ketentuan.' : 'service.'}
          </span>
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#57534E] dark:text-[#A8A29E]">
          {lang === 'id'
            ? 'Pedoman penggunaan platform Kitto, jaminan kepemilikan penuh 100% atas karya Anda, dan komitmen keamanan sistem.'
            : 'Operational guidelines for using Kitto, full ownership guarantee over your assets, and platform security standards.'}
        </p>

        <div className="mt-10">
          {sections.map((sec, idx) => {
            const Icon = sec.icon
            return (
              <section
                key={idx}
                className="grid gap-4 border-t border-[#EAE5DC] py-7 dark:border-[#272A33] sm:grid-cols-[72px_1fr] sm:gap-6"
              >
                <div className="flex items-center gap-2 sm:block">
                  <span className="font-mono-code text-xs font-bold text-[#E14D2A]">0{idx + 1}</span>
                  <span className="mt-0 flex h-8 w-8 items-center justify-center rounded-lg bg-[#E14D2A]/10 text-[#E14D2A] sm:mt-2">
                    <Icon className="h-4 w-4" />
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-[#1C1917] dark:text-[#F5F4F0] sm:text-xl">
                    {sec.title}
                  </h2>
                  <div className="mt-3 text-sm leading-relaxed text-[#57534E] dark:text-[#A8A29E] sm:text-base">
                    {sec.content}
                  </div>
                </div>
              </section>
            )
          })}
        </div>

        <div className="mt-2 flex items-center justify-between border-t border-[#EAE5DC] pt-5 text-xs text-[#78716C] dark:border-[#272A33]">
          <span>Kitto</span>
          <span>{lang === 'id' ? 'Dokumen resmi' : 'Official document'}</span>
        </div>
      </div>
    </div>
  )
}
