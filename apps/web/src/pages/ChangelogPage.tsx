import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Zap,
  Bug,
  Calendar,
  ArrowUpRight,
  ExternalLink,
  Check,
  Search,
  Share2,
  QrCode,
} from 'lucide-react'
import { useRouter } from '../lib/router'
import { useToast } from '../lib/toast'
import { DotPattern } from '../components/magicui/dot-pattern'
import { BorderBeam } from '../components/magicui/border-beam'

interface ChangeItem {
  type: string
  label: string
  text: string
}

interface Release {
  id: string | number
  version?: string
  title: string
  date: string
  badge?: string
  author?: {
    name: string
    role?: string
  }
  description: string
  showcase?: {
    tag: string
    title: string
    desc: string
    primaryBtn?: { label: string; path: string }
    secondaryBtn?: { label: string; path: string }
  }
  changes: ChangeItem[]
}

export function ChangelogPage() {
  const { navigate } = useRouter()
  const { showToast } = useToast()

  const [releases, setReleases] = useState<Release[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'new' | 'improve' | 'fix'>('all')
  const [copiedId, setCopiedId] = useState<string | number | null>(null)

  useEffect(() => {
    let active = true
    setIsLoading(true)
    fetch('/api/releases')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!active || !Array.isArray(data)) return

        const formatted: Release[] = data.map((d: any, idx: number) => {
          // Parse version number if present (e.g. "v1.4.0 — Title")
          let version = `v1.${Math.max(1, 4 - idx)}.0`
          let cleanTitle = d.title || ''
          const vMatch = cleanTitle.match(/^(v\d+\.\d+(?:\.\d+)?)\s*[-—:]?\s*(.*)$/i)
          if (vMatch) {
            version = vMatch[1]
            cleanTitle = vMatch[2] || vMatch[1]
          }

          // Build showcase data for top releases
          const isLatest = idx === 0
          const showcase = isLatest
            ? {
                tag: 'RILIS PRODUKSI TERKINI',
                title: 'Kitto Precision Suite',
                desc: 'Seluruh sistem utilitas web, generator QR kustom, pengukur kekuatan sandi, dan analitik pengunjung berjalan mandiri di browser Anda.',
                primaryBtn: { label: 'Buka Studio QR', path: '/qr' },
                secondaryBtn: { label: 'Jelajahi 26 Utilitas', path: '/tools' },
              }
            : undefined

          return {
            id: d.id || `rel-${idx}`,
            version,
            title: cleanTitle,
            date: d.date || 'Terbaru',
            badge: d.badge || (isLatest ? 'TERBARU' : 'STABIL'),
            author: {
              name: 'Tim Pengembang Kitto',
              role: 'Core Engineering',
            },
            description: d.highlights || '',
            showcase,
            changes: Array.isArray(d.changes) ? d.changes : [],
          }
        })

        setReleases(formatted)
      })
      .catch((err) => {
        console.warn('Load releases notice:', err)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  // Filter based on search & category
  const filteredReleases = releases.filter((rel) => {
    const matchesSearch =
      rel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rel.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rel.version && rel.version.toLowerCase().includes(searchQuery.toLowerCase())) ||
      rel.changes.some((c) => c.text.toLowerCase().includes(searchQuery.toLowerCase()))

    if (!matchesSearch) return false

    if (selectedCategory === 'all') return true
    return rel.changes.some((c) => c.type === selectedCategory)
  })

  const copyReleaseLink = (id: string | number) => {
    const url = `${window.location.origin}/changelog#${id}`
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    showToast('Tautan Disalin', 'Tautan catatan rilis berhasil disalin ke papan klip.', 'success')
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] dark:bg-[#121316] text-[#1C1917] dark:text-[#F5F4F0] relative overflow-hidden transition-colors">
      {/* Background Dot Pattern with radial fade */}
      <DotPattern className="opacity-70 dark:opacity-40" />

      {/* Main Container */}
      <div className="max-w-6xl lg:max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-12 sm:py-20 relative z-10 space-y-12">
        {/* ========================================================= */}
        {/* HERO SECTION                                              */}
        {/* ========================================================= */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#EAE5DC] dark:border-[#272A33] bg-white/80 dark:bg-[#1A1B20]/80 backdrop-blur-md shadow-xs text-xs font-mono-code"
          >
            <span className="w-2 h-2 rounded-full bg-[#E14D2A] animate-pulse" />
            <span className="font-semibold text-[#E14D2A]">Catatan Rilis Kitto</span>
            <span className="text-[#78716C]">/</span>
            <span className="text-[#57534E] dark:text-[#A8A29E]">Changelog</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1C1917] dark:text-[#F5F4F0] leading-tight"
          >
            Riwayat rilis &{' '}
            <span className="font-serif-accent italic text-[#E14D2A] font-normal">
              pembaruan sistem.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-base sm:text-lg text-[#57534E] dark:text-[#A8A29E] leading-relaxed max-w-xl mx-auto"
          >
            Transparansi penuh atas setiap penambahan alat utilitas, perbaikan algoritma, dan peningkatan pengalaman pengguna Kitto.
          </motion.p>

          {/* Quick Search & Category Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            {/* Search Bar */}
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78716C] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari fitur, versi, atau perbaikan..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-full border border-[#EAE5DC] dark:border-[#272A33] bg-white dark:bg-[#1A1B20] text-[#1C1917] dark:text-[#F5F4F0] placeholder-[#78716C] outline-none focus:border-[#E14D2A] transition-colors shadow-xs"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center justify-center gap-1.5 p-1 bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-full shadow-xs flex-wrap max-w-full">
              {[
                { id: 'all' as const, label: 'Semua' },
                { id: 'new' as const, label: 'Fitur Baru' },
                { id: 'improve' as const, label: 'Peningkatan' },
                { id: 'fix' as const, label: 'Perbaikan' },
              ].map((cat) => {
                const isActive = selectedCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#E14D2A] text-white shadow-xs'
                        : 'text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F4F0]'
                    }`}
                  >
                    {cat.label}
                  </button>
                )
              })}
            </div>
          </motion.div>
        </div>

        {/* ========================================================= */}
        {/* TIMELINE FEED (Two-Column Connected Timeline)             */}
        {/* ========================================================= */}
        <div className="relative pt-6">
          {/* Vertical Timeline Track Line */}
          <div className="hidden md:block absolute left-[220px] top-6 bottom-6 w-[2px] bg-gradient-to-b from-[#E14D2A] via-[#EAE5DC] to-transparent dark:via-[#272A33]" />

          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#E14D2A] border-t-transparent animate-spin mx-auto" />
              <p className="text-xs text-[#78716C] font-mono-code">Memuat riwayat rilis resmi...</p>
            </div>
          ) : (
            <div className="space-y-16">
              {filteredReleases.map((rel, index) => {
                const isFirst = index === 0
                const newChanges = rel.changes.filter((c) => c.type === 'new')
                const improveChanges = rel.changes.filter((c) => c.type === 'improve')
                const fixChanges = rel.changes.filter((c) => c.type === 'fix' || c.type === 'remove')

                return (
                  <motion.article
                    key={rel.id}
                    id={String(rel.id)}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="flex flex-col md:flex-row gap-6 md:gap-12 relative"
                  >
                    {/* Left Column: Sticky Release Meta (Date, Version, Badge, Author) */}
                    <div className="md:w-[200px] shrink-0 md:sticky md:top-28 self-start space-y-3">
                      <div className="flex md:flex-col items-center md:items-start justify-between md:justify-start gap-2">
                        {/* Version Pill */}
                        <div className="flex items-center gap-2">
                          <span className="font-mono-code font-extrabold text-sm sm:text-base text-[#1C1917] dark:text-[#F5F4F0] tracking-tight">
                            {rel.version || 'Update'}
                          </span>
                          {rel.badge && (
                            <span
                              className={`text-[10px] font-mono-code font-bold uppercase px-2 py-0.5 rounded-full ${
                                rel.badge === 'TERBARU'
                                  ? 'bg-[#E14D2A] text-white shadow-xs shadow-[#E14D2A]/30'
                                  : 'bg-[#EAE5DC] dark:bg-[#272A33] text-[#57534E] dark:text-[#A8A29E]'
                              }`}
                            >
                              {rel.badge}
                            </span>
                          )}
                        </div>

                        {/* Date */}
                        <time className="text-xs font-mono-code text-[#78716C] flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-[#E14D2A]" />
                          <span>{rel.date}</span>
                        </time>
                      </div>

                      {/* Author Tag */}
                      {rel.author && (
                        <div className="hidden md:flex items-center gap-2 p-1.5 rounded-xl bg-white/60 dark:bg-[#1A1B20]/60 border border-[#EAE5DC] dark:border-[#272A33] text-xs">
                          <div className="w-5 h-5 rounded-full bg-[#E14D2A]/10 text-[#E14D2A] flex items-center justify-center font-bold text-[10px] font-mono-code">
                            K
                          </div>
                          <div className="truncate">
                            <span className="font-semibold text-[#1C1917] dark:text-[#F5F4F0] block leading-tight">
                              {rel.author.name}
                            </span>
                            <span className="text-[10px] text-[#78716C] leading-none">
                              {rel.author.role || 'Kitto Contributor'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Timeline Node Dot */}
                    <div className="hidden md:flex absolute left-[214px] top-1.5 z-20 items-center justify-center">
                      <div
                        className={`w-3.5 h-3.5 rounded-full border-2 bg-white dark:bg-[#121316] transition-all ${
                          isFirst
                            ? 'border-[#E14D2A] ring-4 ring-[#E14D2A]/20 scale-110'
                            : 'border-[#A8A29E] dark:border-[#78716C]'
                        }`}
                      />
                    </div>

                    {/* Right Column: Main Release Content Card */}
                    <div className="flex-1 space-y-6">
                      <div
                        className={`relative p-6 sm:p-8 rounded-3xl border bg-white dark:bg-[#1A1B20] shadow-sm space-y-6 transition-all ${
                          isFirst
                            ? 'border-[#E14D2A]/40 shadow-md shadow-[#E14D2A]/5'
                            : 'border-[#EAE5DC] dark:border-[#272A33]'
                        }`}
                      >
                        {/* Border Beam on the newest release card */}
                        {isFirst && (
                          <BorderBeam
                            size={180}
                            duration={8}
                            colorFrom="#E14D2A"
                            colorTo="#F59E0B"
                          />
                        )}

                        {/* Header Title & Share Link */}
                        <div className="flex items-start justify-between gap-4 pb-2 border-b border-[#EAE5DC]/60 dark:border-[#272A33]/60">
                          <div className="space-y-1">
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1C1917] dark:text-[#F5F4F0] tracking-tight leading-snug">
                              {rel.title}
                            </h2>
                            <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E] leading-relaxed">
                              {rel.description}
                            </p>
                          </div>

                          {/* Copy Link button */}
                          <button
                            type="button"
                            onClick={() => copyReleaseLink(rel.id)}
                            title="Salin Tautan Rilis"
                            className="p-2 rounded-xl text-[#78716C] hover:text-[#E14D2A] hover:bg-[#FAF8F5] dark:hover:bg-[#121316] transition-colors cursor-pointer shrink-0"
                          >
                            {copiedId === rel.id ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Share2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        {/* Interactive Showcase Box for Top Releases */}
                        {rel.showcase && (
                          <div className="relative rounded-2xl overflow-hidden border border-[#EAE5DC] dark:border-[#272A33] bg-gradient-to-br from-[#FAF8F5] via-[#F3EFEA] to-[#EAE5DC]/50 dark:from-[#16171D] dark:via-[#1A1B20] dark:to-[#121316] p-6 sm:p-7 space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-[10px] font-mono-code font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#E14D2A]/10 text-[#E14D2A] border border-[#E14D2A]/25 flex items-center gap-1.5">
                                <QrCode className="w-3 h-3" />
                                <span>{rel.showcase.tag}</span>
                              </span>

                            </div>

                            <div className="space-y-1">
                              <h3 className="text-base sm:text-lg font-bold text-[#1C1917] dark:text-[#F5F4F0]">
                                {rel.showcase.title}
                              </h3>
                              <p className="text-xs text-[#57534E] dark:text-[#A8A29E] leading-relaxed">
                                {rel.showcase.desc}
                              </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                              {rel.showcase.primaryBtn && (
                                <button
                                  type="button"
                                  onClick={() => navigate(rel.showcase!.primaryBtn!.path as any)}
                                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#E14D2A] hover:bg-[#C83B1B] text-white text-xs font-semibold shadow-sm shadow-[#E14D2A]/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                  <span>{rel.showcase.primaryBtn.label}</span>
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {rel.showcase.secondaryBtn && (
                                <button
                                  type="button"
                                  onClick={() => navigate(rel.showcase!.secondaryBtn!.path as any)}
                                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] text-[#1C1917] dark:text-[#F5F4F0] hover:border-[#E14D2A] text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                                >
                                  <span>{rel.showcase.secondaryBtn.label}</span>
                                  <ExternalLink className="w-3.5 h-3.5 text-[#78716C]" />
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Categorized Change Points */}
                        <div className="space-y-5">
                          {/* 1. New Features */}
                          {newChanges.length > 0 && (
                            <div className="space-y-2.5">
                              <h4 className="text-xs font-bold font-mono-code uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Fitur Baru</span>
                              </h4>
                              <div className="space-y-2">
                                {newChanges.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-start gap-2.5 text-xs text-[#1C1917] dark:text-[#F5F4F0] leading-relaxed"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                                    <span>{item.text}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 2. Improvements */}
                          {improveChanges.length > 0 && (
                            <div className="space-y-2.5">
                              <h4 className="text-xs font-bold font-mono-code uppercase tracking-wider text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
                                <Zap className="w-3.5 h-3.5" />
                                <span>Peningkatan & Optimasi</span>
                              </h4>
                              <div className="space-y-2">
                                {improveChanges.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-start gap-2.5 text-xs text-[#1C1917] dark:text-[#F5F4F0] leading-relaxed"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2 shrink-0" />
                                    <span>{item.text}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 3. Bug Fixes */}
                          {fixChanges.length > 0 && (
                            <div className="space-y-2.5">
                              <h4 className="text-xs font-bold font-mono-code uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                                <Bug className="w-3.5 h-3.5" />
                                <span>Perbaikan Bug</span>
                              </h4>
                              <div className="space-y-2">
                                {fixChanges.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-start gap-2.5 text-xs text-[#1C1917] dark:text-[#F5F4F0] leading-relaxed"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                                    <span>{item.text}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  </motion.article>
                )
              })}

              {filteredReleases.length === 0 && (
                <div className="p-12 text-center text-xs text-[#78716C] border border-dashed border-[#EAE5DC] dark:border-[#272A33] rounded-3xl bg-white dark:bg-[#1A1B20]">
                  Tidak ada catatan rilis yang cocok dengan pencarian "{searchQuery}".
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="pt-8 text-center text-xs text-[#78716C] border-t border-[#EAE5DC] dark:border-[#272A33]">
          Ingin menyarankan fitur baru untuk rilis berikutnya? Kirimkan ide Anda melalui{' '}
          <button
            type="button"
            onClick={() => navigate('/feedback')}
            className="text-[#E14D2A] hover:underline font-semibold cursor-pointer"
          >
            halaman ulasan & saran
          </button>
          .
        </div>
      </div>
    </div>
  )
}
