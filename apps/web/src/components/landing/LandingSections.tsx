import { lazy, Suspense, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Minus,
  Plus,
  ArrowRight,
  ArrowUpRight,
} from 'lucide-react'
import { DotPattern } from '../magicui/dot-pattern'
import { useI18n } from '../../lib/i18n'
import { TOOLS_DATA } from '../../data/tools'

const Hero3DCanvas = lazy(() =>
  import('./Hero3DCanvas').then((module) => ({ default: module.Hero3DCanvas }))
)

interface LandingSectionsProps {
  onOpenStudio: (tool?: 'qr' | 'password' | 'dev') => void
  onOpenTools?: () => void
}

export function BentoFeatures() {
  return (
    <section id="features" className="relative overflow-hidden py-16 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:max-w-[1440px] lg:px-16">
        <div className="mb-10 flex flex-col gap-6 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <span className="text-sm font-semibold text-[#E14D2A]">03 / Kenapa Kitto</span>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-0.04em] text-[#1C1917] dark:text-[#F5F4F0] sm:text-4xl lg:text-5xl">
              Dibangun untuk kerja nyata.
            </h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-[#57534E] dark:text-[#A8A29E]">
              Fokus pada fungsi, tanpa paywall tak terduga, dan hasil yang tetap tajam.
            </p>
          </motion.div>
          <a
            href="#catalog"
            className="group inline-flex w-fit items-center gap-2 rounded-full border border-[#D9D0C4] px-4 py-2 text-sm font-semibold text-[#1C1917] transition-colors hover:border-[#E14D2A] hover:text-[#E14D2A] dark:border-[#353841] dark:text-[#F5F4F0]"
          >
            Lihat semua alat
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <motion.article
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="group relative overflow-hidden rounded-[1.75rem] border border-[#E6DED3] bg-white p-7 transition-colors hover:border-[#E14D2A]/35 dark:border-[#2A2D35] dark:bg-[#1A1B20] sm:col-span-2 sm:p-10"
          >
            <span aria-hidden="true" className="pointer-events-none absolute -right-2 -top-6 select-none text-[7rem] font-extrabold leading-none tracking-tighter text-[#1C1917]/[0.04] dark:text-white/[0.04]">
              01
            </span>
            <div className="relative grid h-full gap-8 sm:grid-cols-[minmax(0,1fr)_160px] sm:items-center">
              <div className="flex flex-col">
                <h3 className="max-w-md text-2xl font-bold leading-tight tracking-tight text-[#1C1917] dark:text-[#F5F4F0] sm:text-3xl">
                  QR yang tetap tajam saat dicetak.
                </h3>
                <p className="mt-3 max-w-md text-base leading-relaxed text-[#57534E] dark:text-[#A8A29E]">
                  Ekspor SVG asli, atur warna, dan tambahkan logo tanpa watermark.
                </p>
                <div className="mt-auto flex flex-wrap gap-2 pt-6 text-sm text-[#57534E] dark:text-[#A8A29E]">
                  {['Vektor asli', 'Warna bebas', 'Siap cetak'].map((chip) => (
                    <span key={chip} className="rounded-full bg-[#F3EFEA] px-3 py-1.5 dark:bg-[#22242B]">
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
              <QrPreviewArt />
            </div>
          </motion.article>

          <motion.article
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="group relative overflow-hidden rounded-[1.75rem] border border-[#E6DED3] bg-white p-7 transition-colors hover:border-[#E14D2A]/35 dark:border-[#2A2D35] dark:bg-[#1A1B20] sm:p-10"
          >
            <span aria-hidden="true" className="pointer-events-none absolute -right-2 -top-6 select-none text-[7rem] font-extrabold leading-none tracking-tighter text-[#1C1917]/[0.04] dark:text-white/[0.04]">
              02
            </span>
            <div className="relative flex h-full flex-col">
              <h3 className="text-2xl font-bold leading-tight tracking-tight text-[#1C1917] dark:text-[#F5F4F0] sm:text-3xl">
                Sandi kuat tanpa drama.
              </h3>
              <p className="mt-3 text-base leading-relaxed text-[#57534E] dark:text-[#A8A29E]">
                Buat sandi acak dan lihat estimasi waktu tebaknya. Semua berjalan di perangkat.
              </p>
              <div className="mt-auto pt-8">
                <div className="flex items-end justify-between gap-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-extrabold tracking-tight text-[#1C1917] dark:text-[#F5F4F0]">96.4</span>
                    <span className="text-sm text-[#78716C]">/ 100</span>
                  </div>
                  <span className="rounded-full bg-[#E14D2A]/10 px-3 py-1 text-sm font-semibold text-[#E14D2A]">Kuat</span>
                </div>
                <div className="mt-4 flex gap-1.5" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((bar) => (
                    <span
                      key={bar}
                      className={`h-1.5 flex-1 rounded-full ${bar < 4 ? 'bg-[#E14D2A]' : 'bg-[#E6DED3] dark:bg-[#353841]'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.article>

          <motion.article
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="group relative overflow-hidden rounded-[1.75rem] border border-[#E6DED3] bg-white p-7 transition-colors hover:border-[#E14D2A]/35 dark:border-[#2A2D35] dark:bg-[#1A1B20] sm:p-10"
          >
            <span aria-hidden="true" className="pointer-events-none absolute -right-2 -top-6 select-none text-[7rem] font-extrabold leading-none tracking-tighter text-[#1C1917]/[0.04] dark:text-white/[0.04]">
              03
            </span>
            <div className="relative flex h-full flex-col">
              <h3 className="text-2xl font-bold leading-tight tracking-tight text-[#1C1917] dark:text-[#F5F4F0] sm:text-3xl">
                ID rapi untuk data.
              </h3>
              <p className="mt-3 text-base leading-relaxed text-[#57534E] dark:text-[#A8A29E]">
                UUID v7 dan v4 siap salin, tanpa alat tambahan.
              </p>
              <div className="mt-auto pt-8">
                <div className="rounded-xl bg-[#1C1917] px-4 py-3 text-[#F5F4F0] dark:bg-[#F3EFEA] dark:text-[#1C1917]">
                  <div className="flex items-center justify-between text-xs opacity-60">
                    <span>UUID v7</span>
                    <span>16 bytes</span>
                  </div>
                  <code className="mt-2 block truncate font-mono-code text-sm">0194e432-8f19-7033-911b-3f...</code>
                </div>
              </div>
            </div>
          </motion.article>

          <motion.article
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="group relative overflow-hidden rounded-[1.75rem] border border-[#E6DED3] bg-white p-7 transition-colors hover:border-[#E14D2A]/35 dark:border-[#2A2D35] dark:bg-[#1A1B20] sm:col-span-2 sm:p-10"
          >
            <span aria-hidden="true" className="pointer-events-none absolute -right-2 -top-6 select-none text-[7rem] font-extrabold leading-none tracking-tighter text-[#1C1917]/[0.04] dark:text-white/[0.04]">
              04
            </span>
            <div className="relative grid h-full gap-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <div className="flex flex-col">
                <h3 className="max-w-md text-2xl font-bold leading-tight tracking-tight text-[#1C1917] dark:text-[#F5F4F0] sm:text-3xl">
                  Kembali, lanjut lagi.
                </h3>
                <p className="mt-3 max-w-md text-base leading-relaxed text-[#57534E] dark:text-[#A8A29E]">
                  Faktur, template, dan QR dinamis tetap ada. Pengalihan tautan bisa diubah kapan saja.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-lg bg-[#F3EFEA] px-3 py-2 text-[#57534E] dark:bg-[#22242B] dark:text-[#A8A29E]">Faktur</span>
                <ArrowRight className="h-4 w-4 text-[#A8A29E]" />
                <span className="rounded-lg bg-[#F3EFEA] px-3 py-2 text-[#57534E] dark:bg-[#22242B] dark:text-[#A8A29E]">QR dinamis</span>
                <ArrowRight className="h-4 w-4 text-[#A8A29E]" />
                <span className="rounded-lg border border-[#E14D2A]/30 bg-[#E14D2A]/5 px-3 py-2 font-semibold text-[#E14D2A]">/r/ab12</span>
              </div>
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  )
}

const QR_PREVIEW = [
  '1111111011101',
  '1000001010001',
  '1011101011101',
  '1011101000101',
  '1011101010101',
  '1000001010001',
  '1111111010101',
  '0000000010100',
  '1101011101011',
  '0010100010100',
  '1110111010111',
  '1000100010001',
  '1111111011111',
]

function QrPreviewArt() {
  return (
    <div className="relative mx-auto w-36 sm:w-40" aria-hidden="true">
      <div className="absolute -inset-2 rotate-3 rounded-2xl bg-[#E14D2A]/10" />
      <div className="relative rounded-2xl bg-[#F3EFEA] p-3 ring-1 ring-[#1C1917]/5 dark:bg-[#22242B]">
        <div className="rounded-xl bg-white p-3">
          <div className="grid gap-[2px]" style={{ gridTemplateColumns: 'repeat(13, minmax(0, 1fr))' }}>
            {QR_PREVIEW.flatMap((row, y) =>
              row.split('').map((cell, x) => (
                <span
                  key={`${x}-${y}`}
                  className={`aspect-square rounded-[1px] ${cell === '1' ? 'bg-[#1C1917]' : 'bg-transparent'}`}
                />
              ))
            )}
          </div>
        </div>
        <p className="mt-2 text-center text-xs text-[#78716C]">SVG · 4096 px</p>
      </div>
    </div>
  )
}

export function ToolMarquee() {
  const items = TOOLS_DATA.map((tool) => tool.title)

  return (
    <section className="relative overflow-hidden py-5 sm:py-6 bg-[#E14D2A] text-white">
      <div className="marquee-track flex w-max items-center gap-8 sm:gap-12">
        {[...items, ...items].map((title, index) => (
          <span
            key={`${title}-${index}`}
            className="flex items-center gap-8 sm:gap-12 whitespace-nowrap text-base sm:text-xl font-semibold tracking-tight"
          >
            {title}
            <span className="w-1.5 h-1.5 rounded-full bg-white/55" />
          </span>
        ))}
      </div>
    </section>
  )
}

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      q: 'Apakah QR Code yang dibuat di sini memiliki batas waktu kadaluarsa?',
      a: 'Tidak. Seluruh QR Code statis (URL, Wi-Fi, WhatsApp, vCard, Teks) bersifat permanen selamanya karena data terkode langsung di dalam modul grafis QR tanpa bergantung pada server mana pun. Untuk Dynamic QR, Anda memiliki kendali penuh atas waktu kedaluwarsa atau proteksi PIN.',
    },
    {
      q: 'Mengapa saya perlu memperhatikan rasio kontras?',
      a: 'Kamera smartphone memerlukan kontras tajam antara modul dot dan latar belakang. Kitto menyematkan kalkulator kontras WCAG real-time untuk memperingatkan jika rasio warna < 4:1 sebelum kamu mencetaknya.',
    },
    {
      q: 'Apakah alat ini bisa dipakai offline?',
      a: 'Ya. Pada mode offline, pembuatan QR, sandi, dan konversi teks berjalan langsung di browser Anda.',
    },
    {
      q: 'Bagaimana cara kerja Dynamic QR dan pengalihan /r/:slug?',
      a: 'Dynamic QR menghasilkan tautan pendek yang mengarah ke server Kitto. Saat tautan dibuka, server langsung mengalihkan pengunjung ke alamat asli sambil mencatat jumlah scan.',
    },
  ]

  return (
    <section id="faq" className="py-16 sm:py-32 border-t border-[#EAE5DC] dark:border-[#272A33]">
      <div className="max-w-5xl lg:max-w-6xl mx-auto px-6 sm:px-10 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="mb-14 text-center"
        >
          <span className="text-sm font-semibold text-[#E14D2A]">04 / Tanya jawab</span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.04em] text-[#1C1917] dark:text-[#F5F4F0]">
            Hal yang sering ditanyakan
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-[#57534E] dark:text-[#A8A29E]">
            Jawaban singkat untuk hal yang paling sering ditanyakan sebelum mulai.
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx
            return (
              <motion.div
                key={idx}
                whileHover={{ x: 6 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className={`border rounded-2xl p-5 sm:p-6 transition-colors cursor-pointer ${
                  isOpen
                    ? 'border-[#E14D2A]/40 bg-[#FAF8F5] dark:bg-[#1A1B20]'
                    : 'border-[#EAE5DC] dark:border-[#272A33] bg-white dark:bg-[#16171B] hover:border-[#E14D2A]/30'
                }`}
                onClick={() => setOpenIndex(isOpen ? null : idx)}
              >
                <div className="w-full flex items-center justify-between text-left text-base sm:text-lg font-bold text-[#1C1917] dark:text-[#F5F4F0] hover:text-[#E14D2A] transition-colors">
                  <span className="pr-4">{faq.q}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="text-base font-mono-code text-[#78716C] ml-2 flex items-center justify-center shrink-0 w-8 h-8 rounded-full bg-[#FAF8F5] dark:bg-[#22242B]"
                  >
                    {isOpen ? (
                      <Minus className="w-4 h-4 text-[#E14D2A]" />
                    ) : (
                      <Plus className="w-4 h-4 text-[#78716C]" />
                    )}
                  </motion.span>
                </div>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                      className="overflow-hidden"
                    >
                      <p className="mt-3.5 text-sm sm:text-base text-[#57534E] dark:text-[#A8A29E] leading-relaxed pr-6 border-t border-[#EAE5DC] dark:border-[#272A33] pt-3">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function HeroSection({ onOpenStudio, onOpenTools }: LandingSectionsProps) {
  const { lang } = useI18n()
  const lines = lang === 'id' ? ['Bikin.', 'Pakai.', 'Selesai.', 'Gratis.'] : ['Make.', 'Use.', 'Done.', 'Free.']
  const toolCount = TOOLS_DATA.length
  const categoryCount = new Set(TOOLS_DATA.map((tool) => tool.category)).size

  return (
    <div className="relative pt-4 pb-16 sm:pt-8 sm:pb-24 overflow-hidden">
      <DotPattern className="[mask-image:radial-gradient(ellipse_at_center,white,transparent_72%)] opacity-55 dark:opacity-20" />

      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full text-[#1C1917] opacity-[0.035] dark:text-white dark:opacity-[0.05]"
      >
        <defs>
          <pattern id="hero-grid" width="72" height="72" patternUnits="userSpaceOnUse">
            <path d="M72 0H0V72" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
      </svg>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-center w-full">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="lg:col-span-6 xl:col-span-5"
        >
          <h1 className="text-[clamp(3.25rem,6.4vw,6.25rem)] font-extrabold tracking-[-0.055em] leading-[0.86] text-[#1C1917] dark:text-[#F5F4F0]">
            {lines.map((line, index) => (
              <motion.span
                key={line}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + index * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className={`block ${index === lines.length - 1 ? 'text-[#E14D2A]' : ''}`}
              >
                {line}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.45 }}
            className="mt-7 sm:mt-9 text-base sm:text-lg text-[#57534E] dark:text-[#A8A29E] leading-relaxed max-w-xl"
          >
            {lang === 'id'
              ? 'QR, dokumen, gambar, keuangan, dan alat harian dalam satu studio. Cepat, rapi, dan langsung jalan di browser tanpa instalasi.'
              : 'QR, documents, images, finance, and daily tools in one studio. Fast, tidy, and ready in your browser without installation.'}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.45 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => onOpenStudio('qr')}
              className="px-7 py-3.5 text-sm sm:text-base font-bold bg-[#E14D2A] hover:bg-[#C83B1B] text-white rounded-xl transition-colors cursor-pointer flex items-center gap-2.5"
            >
              <span>{lang === 'id' ? 'Buka QR Studio' : 'Open QR Studio'}</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>

            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onOpenTools}
              className="px-6 py-3.5 text-sm sm:text-base font-semibold bg-[#F3EFEA] dark:bg-[#22242B] text-[#1C1917] dark:text-[#F5F4F0] rounded-xl transition-colors cursor-pointer flex items-center gap-2.5"
            >
              <span>{lang === 'id' ? 'Lihat semua alat' : 'See all tools'}</span>
              <ArrowUpRight className="w-4 h-4 text-[#78716C]" />
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.4 }}
            className="mt-8 flex flex-wrap items-center gap-2"
          >
            {[
              { value: toolCount, label: lang === 'id' ? 'alat' : 'tools' },
              { value: categoryCount, label: lang === 'id' ? 'kategori' : 'categories' },
              { label: lang === 'id' ? 'Tanpa watermark' : 'No watermark' },
            ].map((stat) => (
              <span
                key={stat.label}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#F3EFEA] px-3 py-1.5 text-sm text-[#57534E] dark:bg-[#22242B] dark:text-[#A8A29E]"
              >
                <span className="size-1.5 rounded-full bg-[#E14D2A]" />
                {stat.value !== undefined && (
                  <strong className="font-bold text-[#1C1917] dark:text-[#F5F4F0]">{stat.value}</strong>
                )}
                <span>{stat.label}</span>
              </span>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.75, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-6 xl:col-span-7 relative w-full"
        >
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative aspect-square w-[92%] max-w-[680px]">
                <div className="absolute inset-0 rounded-full bg-[#F3EFEA] dark:bg-[#1A1B20]" />
                <svg
                  aria-hidden="true"
                  viewBox="0 0 600 600"
                  fill="none"
                  className="absolute inset-0 h-full w-full animate-[spin_55s_linear_infinite] motion-reduce:animate-none"
                >
                  <ellipse
                    cx="300"
                    cy="300"
                    rx="286"
                    ry="196"
                    stroke="#E14D2A"
                    strokeOpacity="0.24"
                    strokeWidth="1.5"
                    strokeDasharray="5 10"
                    transform="rotate(-18 300 300)"
                  />
                  <ellipse
                    cx="300"
                    cy="300"
                    rx="238"
                    ry="292"
                    stroke="#D4A373"
                    strokeOpacity="0.3"
                    strokeWidth="1.2"
                    transform="rotate(24 300 300)"
                  />
                  <circle cx="300" cy="16" r="5" fill="#E14D2A" fillOpacity="0.55" />
                  <circle cx="580" cy="300" r="4" fill="#14B8A6" fillOpacity="0.55" />
                </svg>
              </div>
            </div>
            <div className="relative">
              <Suspense
                fallback={
                  <div className="flex h-[420px] items-center justify-center sm:h-[540px] lg:h-[640px] xl:h-[680px]">
                    <div className="flex aspect-square w-[80%] max-w-[520px] animate-pulse items-center justify-center rounded-full bg-[#F3EFEA] dark:bg-[#1A1B20]">
                      <span className="text-4xl font-black text-[#E14D2A]/35">K</span>
                    </div>
                  </div>
                }
              >
                <Hero3DCanvas />
              </Suspense>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
