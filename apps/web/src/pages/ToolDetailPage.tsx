import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight,
  ArrowRight,
  ArrowUpRight,
  Star,
  Bookmark,
  Share2,
  Check,
  Copy,
  MessageCircle,
  HelpCircle,
  BookOpen,
  Minus,
  Plus,
  Sparkles,
} from 'lucide-react'
import { useRouter } from '../lib/router'
import { useI18n } from '../lib/i18n'
import { useAuth } from '../lib/auth'
import { useToast } from '../lib/toast'
import { getToolItem } from '../lib/toolRouter'
import {
  isToolInCollection,
  toggleCollectionTool,
  isToolFavorite,
  toggleFavoriteTool,
} from '../lib/userPreferences'
import { getToolGuide } from '../data/toolGuides'
import { TOOLS_DATA, CATEGORIES } from '../data/tools'
import { ActiveToolWorkspace } from '../components/tools/ActiveToolWorkspace'

interface ToolDetailPageProps {
  toolId: string
  onOpenAuth?: () => void
}

export function ToolDetailPage({ toolId, onOpenAuth }: ToolDetailPageProps) {
  const { navigate } = useRouter()
  const { lang } = useI18n()
  const { user } = useAuth()
  const { showToast } = useToast()

  const tool = useMemo(() => getToolItem(toolId), [toolId])
  const guide = useMemo(() => getToolGuide(toolId, tool?.category || 'dev'), [toolId, tool])

  // Preferences state
  const [inCollection, setInCollection] = useState<boolean>(() => isToolInCollection(toolId, user?.id))
  const [favorite, setFavorite] = useState<boolean>(() => isToolFavorite(toolId, user?.id))
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)

  useEffect(() => {
    const handleSync = () => {
      setInCollection(isToolInCollection(toolId, user?.id))
      setFavorite(isToolFavorite(toolId, user?.id))
    }
    handleSync()
    window.addEventListener('kitto_preferences_changed', handleSync)
    return () => window.removeEventListener('kitto_preferences_changed', handleSync)
  }, [toolId, user?.id])

  const categoryLabel = useMemo(() => {
    if (!tool) return ''
    const cat = CATEGORIES.find((c) => c.id === tool.category)
    return cat ? cat.label : tool.category
  }, [tool])

  const relatedTools = useMemo(() => {
    if (!tool) return []
    return TOOLS_DATA.filter((t) => t.category === tool.category && t.id !== tool.id).slice(0, 3)
  }, [tool])

  if (!tool) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-24 text-center space-y-4">
        <h1 className="text-2xl font-bold text-[#1C1917] dark:text-[#F5F4F0]">
          Alat Tidak Ditemukan
        </h1>
        <p className="text-sm text-[#78716C]">
          Alat yang Anda cari tidak tersedia atau tautan telah dipindahkan.
        </p>
        <button
          type="button"
          onClick={() => navigate('/tools')}
          className="px-5 py-2.5 text-xs font-bold bg-[#E14D2A] text-white rounded-xl cursor-pointer"
        >
          Lihat Katalog Semua Alat &rarr;
        </button>
      </div>
    )
  }

  const handleToggleFavorite = () => {
    if (!user) {
      showToast(
        'Perlu Masuk Akun',
        'Silakan masuk atau daftar akun terlebih dahulu untuk memfavoritkan alat.',
        'info'
      )
      if (onOpenAuth) onOpenAuth()
      return
    }

    const isFav = toggleFavoriteTool(tool.id, user.id)
    setFavorite(isFav)
    showToast(
      isFav ? 'Ditambahkan ke Favorit' : 'Dihapus dari Favorit',
      isFav ? `${tool.title} kini tersimpan di daftar favorit Anda.` : undefined,
      'success'
    )
  }

  const handleToggleCollection = () => {
    if (!user) {
      showToast(
        'Perlu Masuk Akun',
        'Silakan masuk atau daftar akun terlebih dahulu untuk menambahkan alat ke koleksi.',
        'info'
      )
      if (onOpenAuth) onOpenAuth()
      return
    }

    const isSaved = toggleCollectionTool(tool.id, user.id)
    setInCollection(isSaved)
    showToast(
      isSaved ? 'Disimpan ke Koleksi' : 'Dihapus dari Koleksi',
      isSaved ? `${tool.title} berhasil ditambahkan ke koleksi akun Anda.` : undefined,
      'success'
    )
  }

  const handleCopyLink = async () => {
    try {
      const url = window.location.href
      await navigator.clipboard.writeText(url)
      setCopiedLink(true)
      showToast('Tautan Berhasil Disalin', 'Tautan alat telah tersimpan di clipboard.', 'success')
      setTimeout(() => setCopiedLink(false), 2000)
    } catch {
      showToast('Gagal Menyalin Tautan', 'Silakan salin URL langsung dari bilah alamat browser.', 'error')
    }
  }

  const shareText = `Coba ${tool.title} di Kitto — gratis, tanpa watermark, dan langsung diproses di browser:`
  const shareUrl = typeof window !== 'undefined' ? window.location.href : `https://kitto.dev/${tool.id}`
  const waShareUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`
  const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`

  return (
    <div className="max-w-7xl lg:max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-6 sm:py-10 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#78716C] flex-wrap">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="hover:text-[#E14D2A] transition-colors cursor-pointer"
        >
          {lang === 'id' ? 'Beranda' : 'Home'}
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-[#78716C]/60" />
        <button
          type="button"
          onClick={() => navigate('/tools')}
          className="hover:text-[#E14D2A] transition-colors cursor-pointer"
        >
          {lang === 'id' ? 'Katalog Alat' : 'Tools Directory'}
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-[#78716C]/60" />
        <span className="text-[#57534E] dark:text-[#A8A29E] font-medium">{categoryLabel}</span>
        <ChevronRight className="w-3.5 h-3.5 text-[#78716C]/60" />
        <span className="text-[#1C1917] dark:text-[#F5F4F0] font-bold truncate">{tool.title}</span>
      </nav>

      {/* Tool Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4 border-b border-[#EAE5DC] dark:border-[#272A33] pb-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono-code font-bold uppercase tracking-wider bg-[#E14D2A]/10 text-[#E14D2A] border border-[#E14D2A]/25">
              {categoryLabel}
            </span>
            {tool.badge && (
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono-code font-bold uppercase ${
                  tool.badge === 'BARU'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60'
                    : tool.badge === 'PRO'
                    ? 'bg-[#E14D2A]/10 text-[#E14D2A] border border-[#E14D2A]/30'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60'
                }`}
              >
                {tool.badge}
              </span>
            )}
          </div>

          {/* Interactive Action Bar: Favorite, Add to Collection, Share */}
          <div className="flex flex-wrap items-center gap-2 relative">
            {/* Favorite Button */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              type="button"
              onClick={handleToggleFavorite}
              title={favorite ? 'Hapus dari favorit' : 'Simpan ke favorit'}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                favorite
                  ? 'bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-500/25'
                  : 'bg-white dark:bg-[#1A1B20] border-[#EAE5DC] dark:border-[#272A33] text-[#57534E] dark:text-[#A8A29E] hover:border-amber-400'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${favorite ? 'fill-white' : ''}`} />
              <span className="hidden sm:inline">{favorite ? 'Favorit' : 'Favoritkan'}</span>
            </motion.button>

            {/* Add to Collection Button */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              type="button"
              onClick={handleToggleCollection}
              title={
                user
                  ? inCollection
                    ? 'Hapus dari koleksi'
                    : 'Simpan ke koleksi alat Anda'
                  : 'Masuk untuk menambahkan ke koleksi'
              }
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                inCollection
                  ? 'bg-[#E14D2A] text-white border-[#E14D2A] shadow-sm shadow-[#E14D2A]/25'
                  : 'bg-white dark:bg-[#1A1B20] border-[#EAE5DC] dark:border-[#272A33] text-[#57534E] dark:text-[#A8A29E] hover:border-[#E14D2A]'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${inCollection ? 'fill-white' : ''}`} />
              <span className="hidden sm:inline">{inCollection ? 'Tersimpan di Koleksi' : 'Tambah ke Koleksi'}</span>
            </motion.button>

            {/* Share Tool Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsShareOpen(!isShareOpen)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-[#EAE5DC] dark:border-[#272A33] bg-white dark:bg-[#1A1B20] text-[#57534E] dark:text-[#A8A29E] hover:border-[#E14D2A] transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-[#E14D2A]" />
                <span className="hidden sm:inline">Bagikan</span>
              </button>

              {/* Share Dropdown Popover */}
              <AnimatePresence>
                {isShareOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 6 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-2xl p-2 shadow-xl z-30 space-y-1 text-xs"
                  >
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#FAF8F5] dark:hover:bg-[#22242B] text-left font-medium cursor-pointer"
                    >
                      {copiedLink ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-[#78716C]" />
                      )}
                      <span>{copiedLink ? 'Tersalin ke Clipboard!' : 'Salin Tautan'}</span>
                    </button>

                    <a
                      href={waShareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsShareOpen(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#FAF8F5] dark:hover:bg-[#22242B] text-left font-medium text-emerald-700 dark:text-emerald-400"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      <span>Kirim ke WhatsApp</span>
                    </a>

                    <a
                      href={xShareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsShareOpen(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#FAF8F5] dark:hover:bg-[#22242B] text-left font-medium"
                    >
                      <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      <span>Bagikan di X / Twitter</span>
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1C1917] dark:text-[#F5F4F0]">
          {tool.title}
        </h1>

        <p className="text-sm sm:text-base text-[#57534E] dark:text-[#A8A29E] max-w-3xl leading-relaxed">
          {tool.description}
        </p>

        {/* Feature Tags */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {tool.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-mono-code px-2.5 py-1 rounded-lg bg-[#FAF8F5] dark:bg-[#1A1B20] text-[#78716C] border border-[#EAE5DC] dark:border-[#272A33]"
            >
              #{tag}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Main Tool Workspace */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <ActiveToolWorkspace activeToolId={tool.id} />
      </motion.div>

      {/* ========================================================= */}
      {/* PANDUAN CARA MENGGUNAKAN (HOW TO USE SECTION)             */}
      {/* ========================================================= */}
      <div className="pt-8 border-t border-[#EAE5DC] dark:border-[#272A33] space-y-5">
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-5 h-5 text-[#E14D2A]" />
          <h2 className="text-lg sm:text-xl font-extrabold text-[#1C1917] dark:text-[#F5F4F0] tracking-tight">
            Cara Menggunakan {tool.title}
          </h2>
        </div>

        {/* Step-by-Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {guide.steps.map((st) => (
            <div
              key={st.step}
              className="p-5 bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-2xl shadow-xs space-y-2.5 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-[#E14D2A] text-white font-bold flex items-center justify-center text-xs shadow-xs">
                  {st.step}
                </span>
                <span className="text-[10px] font-mono-code font-bold uppercase text-[#78716C]">
                  Langkah {st.step}
                </span>
              </div>
              <h3 className="font-bold text-sm text-[#1C1917] dark:text-[#F5F4F0] leading-snug">
                {st.title}
              </h3>
              <p className="text-xs text-[#57534E] dark:text-[#A8A29E] leading-relaxed">
                {st.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Practical Tips Box */}
        {guide.tips && (
          <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 rounded-2xl flex items-start gap-3 text-xs sm:text-sm text-amber-950 dark:text-amber-100">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-amber-900 dark:text-amber-300 block">
                Tips Praktis:
              </span>
              <p className="leading-relaxed opacity-90 text-xs sm:text-sm">{guide.tips}</p>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* FAQ KHUSUS ALAT (TOOL SPECIFIC FAQ)                       */}
      {/* ========================================================= */}
      {guide.faqs && guide.faqs.length > 0 && (
        <div className="pt-6 border-t border-[#EAE5DC] dark:border-[#272A33] space-y-5">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-5 h-5 text-[#E14D2A]" />
            <h2 className="text-lg sm:text-xl font-extrabold text-[#1C1917] dark:text-[#F5F4F0] tracking-tight">
              Pertanyaan yang Sering Diajukan
            </h2>
          </div>

          <div className="space-y-3">
            {guide.faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx
              return (
                <motion.div
                  key={idx}
                  whileHover={{ x: 4 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className={`border rounded-2xl p-4 sm:p-5 transition-colors cursor-pointer ${
                    isOpen
                      ? 'border-[#E14D2A]/40 bg-[#FAF8F5] dark:bg-[#1A1B20]'
                      : 'border-[#EAE5DC] dark:border-[#272A33] bg-white dark:bg-[#16171B] hover:border-[#E14D2A]/30'
                  }`}
                >
                  <div className="w-full flex items-center justify-between text-left text-sm font-bold text-[#1C1917] dark:text-[#F5F4F0]">
                    <span className="pr-4">{faq.q}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="text-xs font-mono-code text-[#78716C] ml-2 flex items-center justify-center shrink-0 w-6 h-6 rounded-full bg-[#FAF8F5] dark:bg-[#22242B]"
                    >
                      {isOpen ? (
                        <Minus className="w-3.5 h-3.5 text-[#E14D2A]" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 text-[#78716C]" />
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
                        <p className="mt-2.5 text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E] leading-relaxed border-t border-[#EAE5DC] dark:border-[#272A33] pt-2.5 pr-4">
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
      )}

      {/* ========================================================= */}
      {/* RELATED TOOLS / QUICK SWITCHER                            */}
      {/* ========================================================= */}
      {relatedTools.length > 0 && (
        <div className="pt-8 border-t border-[#EAE5DC] dark:border-[#272A33] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-[#1C1917] dark:text-[#F5F4F0]">
                Alat Terkait ({categoryLabel})
              </h3>
              <p className="text-xs text-[#78716C]">
                Coba perangkat utilitas lainnya dalam kategori yang sama.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/tools')}
              className="text-xs font-bold text-[#E14D2A] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>Lihat Semua 26 Alat</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedTools.map((rel) => (
              <motion.div
                key={rel.id}
                whileHover={{ y: -3, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                onClick={() => navigate(`/${rel.id}`)}
                className="p-4 sm:p-5 rounded-2xl border border-[#EAE5DC] dark:border-[#272A33] bg-white dark:bg-[#1A1B20] hover:border-[#E14D2A]/50 transition-all cursor-pointer flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono-code uppercase px-2 py-0.5 rounded-full bg-[#FAF8F5] dark:bg-[#22242B] text-[#78716C]">
                      {rel.category}
                    </span>
                    {rel.badge && (
                      <span className="text-[10px] font-mono-code font-bold text-[#E14D2A]">
                        {rel.badge}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-[#1C1917] dark:text-[#F5F4F0]">
                    {rel.title}
                  </h4>
                  <p className="text-xs text-[#78716C] line-clamp-2 mt-1 leading-relaxed">
                    {rel.description}
                  </p>
                </div>
                <div className="text-xs font-bold text-[#E14D2A] flex items-center gap-1 pt-1">
                  <span>Buka Alat Ini</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

