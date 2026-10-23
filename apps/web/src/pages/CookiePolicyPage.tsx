import { Cookie, ShieldCheck, Database, Ban, Laptop } from 'lucide-react'
import { useI18n } from '../lib/i18n'
import { DotPattern } from '../components/magicui/dot-pattern'

export function CookiePolicyPage() {
  const { lang } = useI18n()

  const sections = [
    {
      icon: Ban,
      title: lang === 'id' ? '1. Kebijakan Nol Cookie Pihak Ketiga (Zero Third-Party Cookies)' : '1. Zero Third-Party Cookies Guarantee',
      content:
        lang === 'id' ? (
          <div className="space-y-3 leading-relaxed">
            <p>
              Kitto menganut filosofi <strong>privasi mutlak</strong>. Kami <strong>tidak pernah menggunakan cookie pihak ketiga</strong> (third-party tracking cookies) untuk keperluan periklanan, penargetan ulang (retargeting), maupun pelacakan lintas situs web.
            </p>
            <p>
              Ketika Anda mengakses situs Kitto:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
              <li>Tidak ada cookie dari Google AdSense, Meta/Facebook, TikTok, atau jaringan periklanan mana pun.</li>
              <li>Tidak ada pelacak klik tersembunyi yang merekam perilaku mouse atau rekaman sesi Anda.</li>
              <li>Kami tidak menjual atau membagikan data penjelajahan Anda kepada pialang data (data brokers).</li>
            </ul>
          </div>
        ) : (
          <div className="space-y-3 leading-relaxed">
            <p>
              Kitto operates under a strict <strong>zero-surveillance</strong> standard. We <strong>never employ third-party tracking cookies</strong> for advertising, cross-site profiling, or retargeting campaigns.
            </p>
            <p>
              When browsing Kitto:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
              <li>Zero cookies from ad networks like Google AdSense, Meta, or TikTok.</li>
              <li>No session replay or invasive clickstream trackers.</li>
              <li>We never sell or distribute your browsing activity to commercial data brokers.</li>
            </ul>
          </div>
        ),
    },
    {
      icon: Laptop,
      title: lang === 'id' ? '2. Penyimpanan Lokal Fungsional (Essential LocalStorage)' : '2. Essential Functional LocalStorage',
      content:
        lang === 'id' ? (
          <div className="space-y-3 leading-relaxed">
            <p>
              Alih-alih mengandalkan cookie server yang mengonsumsi bandwidth, Kitto hanya memanfaatkan penyimpanan lokal peramban (<strong>HTML5 LocalStorage</strong> dan <strong>SessionStorage</strong>) semata-mata untuk fungsi teknis berikut:
            </p>
            <div className="space-y-2 pt-1">
              <div className="p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] text-xs space-y-1">
                <span className="font-mono-code font-bold text-[#E14D2A]">qt_theme</span>
                <p className="text-slate-600 dark:text-slate-300">Menyimpan preferensi mode tampilan Anda (Mode Terang atau Mode Gelap).</p>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] text-xs space-y-1">
                <span className="font-mono-code font-bold text-[#E14D2A]">qt_lang</span>
                <p className="text-slate-600 dark:text-slate-300">Menyimpan preferensi bahasa yang Anda pilih (Bahasa Indonesia atau English).</p>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] text-xs space-y-1">
                <span className="font-mono-code font-bold text-[#E14D2A]">qt_user & user_preferences</span>
                <p className="text-slate-600 dark:text-slate-300">Menyimpan token sesi aktif dan koleksi alat favorit jika Anda memilih mendaftar/masuk ke Member Area.</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 pt-1">
              Data di atas disimpan secara lokal di perangkat Anda sendiri dan dapat dihapus kapan saja melalui setelan peramban Anda.
            </p>
          </div>
        ) : (
          <div className="space-y-3 leading-relaxed">
            <p>
              Rather than server cookies, Kitto utilizes local browser storage (<strong>HTML5 LocalStorage</strong> and <strong>SessionStorage</strong>) strictly for essential functionality:
            </p>
            <div className="space-y-2 pt-1">
              <div className="p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] text-xs space-y-1">
                <span className="font-mono-code font-bold text-[#E14D2A]">qt_theme</span>
                <p className="text-slate-600 dark:text-slate-300">Stores your visual theme preference (Light or Dark mode).</p>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] text-xs space-y-1">
                <span className="font-mono-code font-bold text-[#E14D2A]">qt_lang</span>
                <p className="text-slate-600 dark:text-slate-300">Remembers your preferred language selection (ID or EN).</p>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] text-xs space-y-1">
                <span className="font-mono-code font-bold text-[#E14D2A]">qt_user & user_preferences</span>
                <p className="text-slate-600 dark:text-slate-300">Stores active session credentials and favorite tools when signed in to the Member Area.</p>
              </div>
            </div>
          </div>
        ),
    },
    {
      icon: Database,
      title: lang === 'id' ? '3. Cache Penyimpanan Offline (PWA Cache Storage)' : '3. Progressive Web App (PWA) Offline Cache',
      content:
        lang === 'id' ? (
          <div className="space-y-3 leading-relaxed">
            <p>
              Kitto dilengkapi kemampuan Progressive Web App (PWA). Pustaka <strong>Cache API</strong> di peramban Anda digunakan untuk menyimpan berkas aset web statis (CSS, Javascript, font huruf, ikon favicon).
            </p>
            <p>
              Tujuannya agar seluruh 26 perangkat utilitas dapat dibuka secara instan secepat kilat dan tetap bisa digunakan secara utuh saat perangkat Anda tidak terhubung ke jaringan internet (mode offline).
            </p>
          </div>
        ) : (
          <div className="space-y-3 leading-relaxed">
            <p>
              Kitto incorporates PWA capabilities. The browser's <strong>Cache Storage API</strong> caches static application assets (CSS bundles, JavaScript modules, fonts, and favicon icons).
            </p>
            <p>
              This ensures that our 26 precision utilities load in microseconds and remain fully functional even when disconnected from the internet.
            </p>
          </div>
        ),
    },
    {
      icon: ShieldCheck,
      title: lang === 'id' ? '4. Cara Mengontrol & Menghapus Penyimpanan' : '4. How to Manage or Clear Local Data',
      content:
        lang === 'id' ? (
          <div className="space-y-3 leading-relaxed">
            <p>
              Karena Kitto tidak menyimpan cookie pelacak, Anda tidak perlu khawatir tentang privasi Anda. Namun, jika Anda ingin menghapus preferensi tema atau sesi login:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
              <li>Tekan tombol <strong>Logout</strong> di menu profil untuk membersihkan sesi akun Anda.</li>
              <li>Buka setelan browser Anda &rarr; <em>Hapus Data Penjelajahan (Clear Browsing Data / Cookies & Site Data)</em>.</li>
              <li>Atau gunakan mode <em>Incognito / Private Browsing</em> peramban Anda jika tidak ingin ada data tersisa setelah sesi selesai.</li>
            </ul>
          </div>
        ) : (
          <div className="space-y-3 leading-relaxed">
            <p>
              Because Kitto avoids surveillance cookies, your privacy is safeguarded by default. If you wish to wipe local preferences:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
              <li>Click <strong>Logout</strong> in your profile menu to immediately invalidate local authentication tokens.</li>
              <li>Clear your browser's site data under <em>Settings &rarr; Privacy & Security &rarr; Clear Cookies & Site Data</em>.</li>
              <li>Use your browser's <em>Incognito / Private Window</em> for sessions that leave zero footprint upon closing.</li>
            </ul>
          </div>
        ),
    },
  ]

  return (
    <div className="relative overflow-hidden py-12 sm:py-20">
      <DotPattern className="opacity-50 dark:opacity-20" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#EAE5DC] bg-white/80 px-3 py-1 text-xs font-semibold text-[#E14D2A] dark:border-[#272A33] dark:bg-[#1A1B20]/80">
              <Cookie className="h-3.5 w-3.5" />
              <span>{lang === 'id' ? 'Kebijakan cookie' : 'Cookie policy'}</span>
              <span className="text-[#78716C]">/</span>
              <span className="font-normal text-[#57534E] dark:text-[#A8A29E]">Zero surveillance</span>
            </div>

            <h1 className="mt-5 text-5xl font-extrabold leading-[0.95] tracking-[-0.05em] text-[#1C1917] dark:text-[#F5F4F0] sm:text-6xl">
              {lang === 'id' ? 'Cookie &' : 'Cookies &'}{' '}
              <span className="font-serif-accent italic text-[#E14D2A] font-normal">
                {lang === 'id' ? 'penyimpanan lokal.' : 'local storage.'}
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#57534E] dark:text-[#A8A29E] sm:text-lg">
              {lang === 'id'
                ? 'Penjelasan transparan mengapa Kitto bebas 100% dari cookie pelacak pihak ketiga dan bagaimana kami hanya memanfaatkan penyimpanan lokal yang benar-benar esensial.'
                : 'Transparent explanation of why Kitto is 100% free of commercial tracking cookies and how we only use strictly necessary browser storage.'}
            </p>

            <p className="mt-3 text-xs text-[#78716C]">
              {lang === 'id' ? 'Terakhir diperbarui 18 Oktober 2026' : 'Last updated October 18, 2026'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-[#EAE5DC] bg-[#EAE5DC] dark:border-[#272A33] dark:bg-[#272A33] lg:w-[400px]">
            {[
              { value: '0', label: lang === 'id' ? 'cookie pihak ketiga' : 'third-party cookies' },
              { value: '3', label: lang === 'id' ? 'kunci lokal' : 'local keys' },
              { value: '1', label: lang === 'id' ? 'cache PWA' : 'PWA cache' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white p-4 dark:bg-[#1A1B20]">
                <div className="text-3xl font-extrabold tracking-tight text-[#E14D2A]">{stat.value}</div>
                <div className="mt-1 text-xs leading-snug text-[#78716C]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16">
          {sections.map((sec, idx) => {
            const Icon = sec.icon
            return (
              <section
                key={idx}
                className="grid gap-6 border-t border-[#EAE5DC] py-8 dark:border-[#272A33] lg:grid-cols-[220px_1fr] lg:gap-12"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono-code text-xs font-bold text-[#E14D2A]">0{idx + 1}</span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E14D2A]/10 text-[#E14D2A]">
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>
                  <h2 className="mt-3 text-xl font-bold tracking-tight text-[#1C1917] dark:text-[#F5F4F0]">
                    {sec.title}
                  </h2>
                </div>
                <div className="text-sm leading-relaxed text-[#57534E] dark:text-[#A8A29E] sm:text-base">
                  {sec.content}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}
