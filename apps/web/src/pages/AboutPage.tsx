import { motion } from 'framer-motion'
import { useI18n } from '../lib/i18n'
import { TOOLS_DATA } from '../data/tools'
import { DotPattern } from '../components/magicui/dot-pattern'

export function AboutPage() {
  const { lang } = useI18n()

  const principles = [
    {
      number: '01',
      title: lang === 'id' ? 'Filosofi Desain Presisi' : 'Precision Design Ethos',
      desc:
        lang === 'id'
          ? 'Kami menolak antarmuka AI generik yang dipenuhi gradien neon norak, kartu bertumpuk tanpa guna, dan klaim palsu. Kitto mengedepankan tipografi terkalibrasi, palet warm vermilion hanko, dan ruang bernapas yang lega.'
          : 'We reject generic AI interfaces cluttered with gratuitous neon gradients, nested cards, and buzzwords. Kitto prioritizes calibrated typography, warm vermilion hanko surfaces, and functional whitespace.',
    },
    {
      number: '02',
      title: lang === 'id' ? 'Pemrosesan di Browser' : 'Browser-Based Processing',
      desc:
        lang === 'id'
          ? 'Seluruh modul inti (pembuatan QR, pengujian kekuatan sandi, konversi teks, kompresi gambar) berjalan di browser Anda, tanpa perlu mengunggah berkas.'
          : 'All core modules (QR generation, password strength checks, text codecs, image resizing) run inside your browser without uploading files.',
    },
    {
      number: '03',
      title: lang === 'id' ? 'Kualitas Vektor & Matematika Murni' : 'Pure Vector & Mathematical Rigor',
      desc:
        lang === 'id'
          ? 'QR Code kami diekspor dalam format SVG geometris murni untuk kebutuhan percetakan berskala besar. Kekuatan sandi dihitung dengan rumus yang teruji, bukan estimasi tebakan acak.'
          : 'Our QR codes are exported as true geometric vector SVGs suited for large-scale physical printing. Password strength uses a tested formula instead of arbitrary estimates.',
    },
  ]

  return (
    <div className="relative overflow-hidden py-14 sm:py-24">
      <DotPattern className="opacity-40 dark:opacity-15" />
      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="grid items-end gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <span className="text-sm font-semibold text-[#E14D2A]">
              {lang === 'id' ? 'Manifesto' : 'Manifesto'}
            </span>
            <h1 className="mt-4 text-5xl font-extrabold leading-[0.9] tracking-[-0.05em] text-[#1C1917] dark:text-[#F5F4F0] sm:text-6xl lg:text-7xl">
              {lang === 'id' ? 'Tentang' : 'About'}{' '}
              <span className="font-serif-accent italic text-[#E14D2A] font-normal">Kitto.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#57534E] dark:text-[#A8A29E]">
              {lang === 'id'
                ? 'Perangkat lunak utilitas modern yang menghargai waktu dan bandwidth Anda. Semua diproses di browser tanpa watermark.'
                : 'Modern web utilities engineered to respect your time and bandwidth. Everything runs in your browser with no watermarks.'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-[#EAE5DC] pt-6 dark:border-[#272A33] lg:col-span-5 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            {[
              { value: TOOLS_DATA.length, label: lang === 'id' ? 'alat' : 'tools' },
              { value: 5, label: lang === 'id' ? 'kategori' : 'categories' },
              { value: 0, label: lang === 'id' ? 'watermark' : 'watermarks' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-extrabold tracking-tight text-[#1C1917] dark:text-[#F5F4F0] sm:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-[#78716C]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-3">
            <h2 className="text-sm font-semibold text-[#E14D2A]">
              {lang === 'id' ? 'Prinsip rekayasa' : 'Engineering principles'}
            </h2>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#57534E] dark:text-[#A8A29E]">
              {lang === 'id'
                ? 'Tiga aturan yang menjaga setiap alat tetap cepat, jujur, dan berguna.'
                : 'Three rules that keep every tool fast, honest, and useful.'}
            </p>
          </div>

          <div className="lg:col-span-9">
            {principles.map((p, i) => (
              <motion.div
                key={p.number}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ delay: i * 0.06 }}
                className="group grid gap-4 border-t border-[#EAE5DC] py-8 first:border-t-0 first:pt-0 dark:border-[#272A33] sm:grid-cols-[80px_1fr] sm:gap-8"
              >
                <span className="text-3xl font-extrabold tracking-tight text-[#E14D2A]/35 transition-colors group-hover:text-[#E14D2A]">
                  {p.number}
                </span>
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-[#1C1917] dark:text-[#F5F4F0]">
                    {p.title}
                  </h3>
                  <p className="mt-3 max-w-3xl text-base leading-relaxed text-[#57534E] dark:text-[#A8A29E]">
                    {p.desc}
                  </p>
                </div>
              </motion.div>
            ))}
            <div className="border-t border-[#EAE5DC] dark:border-[#272A33]" />
          </div>
        </div>
      </div>
    </div>
  )
}
