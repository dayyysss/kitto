import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Calendar,
  Clock,
  Search,
  BookOpen,
  Share2,
  Check,
  ChevronRight,
  ArrowUpRight,
  QrCode,
} from 'lucide-react'
import { useI18n } from '../lib/i18n'
import { useRouter } from '../lib/router'
import { useToast } from '../lib/toast'
import { DotPattern } from '../components/magicui/dot-pattern'
import { BorderBeam } from '../components/magicui/border-beam'
import { mapBlogPost, type BlogPost } from '../lib/blog'

export function BlogPage() {
  const { lang } = useI18n()
  const { navigate } = useRouter()
  const { showToast } = useToast()

  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string>('all')
  const [copiedId, setCopiedId] = useState<string | number | null>(null)

  useEffect(() => {
    let active = true
    setIsLoading(true)
    fetch('/api/blog')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!active || !Array.isArray(data)) return

        const formatted: BlogPost[] = data.map((d: any) => mapBlogPost(d, lang))

        setPosts(formatted)
      })
      .catch((err) => {
        console.warn('Load blog notice:', err)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [lang])

  // Top featured post is dynamically the first/latest article from database
  const featuredPost = posts.length > 0 ? posts[0] : null

  // Unique tags dynamically extracted from loaded posts
  const availableTags = Array.from(new Set(['all', ...posts.map((p) => p.tag)]))

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.keywords && post.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase())))

    if (!matchesSearch) return false
    if (selectedTag === 'all') return true
    return post.tag === selectedTag
  })

  const copyArticleLink = (e: React.MouseEvent, slug: string) => {
    e.stopPropagation()
    const url = `${window.location.origin}/blog/${slug}`
    navigator.clipboard.writeText(url)
    setCopiedId(slug)
    showToast('Tautan Disalin', 'Tautan artikel berhasil disalin ke papan klip.', 'success')
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
            <span className="font-semibold text-[#E14D2A]">Dokumentasi & Wawasan</span>
            <span className="text-[#78716C]">/</span>
            <span className="text-[#57534E] dark:text-[#A8A29E]">Kitto Blog</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1C1917] dark:text-[#F5F4F0] leading-tight"
          >
            Wawasan teknis &{' '}
            <span className="font-serif-accent italic text-[#E14D2A] font-normal">
              rekayasa utilitas.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-base sm:text-lg text-[#57534E] dark:text-[#A8A29E] leading-relaxed max-w-xl mx-auto"
          >
            Artikel mendalam seputar grafis vektor murni, kekuatan sandi, privasi, dan teknologi web modern.
          </motion.p>

          {/* Quick Search & Tag Filter Pills */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="pt-5 w-full flex flex-col items-center justify-center gap-4"
          >
            {/* Search Bar */}
            <div className="relative w-full max-w-xl">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#78716C] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari topik, kode, atau kata kunci..."
                className="w-full pl-11 pr-4 py-3 text-sm rounded-xl border border-[#EAE5DC] dark:border-[#272A33] bg-white dark:bg-[#1A1B20] text-[#1C1917] dark:text-[#F5F4F0] placeholder-[#78716C] outline-none focus:border-[#E14D2A] transition-colors shadow-xs"
              />
            </div>

            {/* Tag Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 w-full">
              {availableTags.slice(0, 6).map((t) => {
                const isActive = selectedTag === t
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedTag(t)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#E14D2A] border-[#E14D2A] text-white shadow-xs shadow-[#E14D2A]/20'
                        : 'bg-white dark:bg-[#1A1B20] border-[#EAE5DC] dark:border-[#272A33] text-[#57534E] dark:text-[#A8A29E] hover:border-[#E14D2A] hover:text-[#E14D2A]'
                    }`}
                  >
                    {t === 'all' ? 'Semua' : t}
                  </button>
                )
              })}
            </div>
          </motion.div>
        </div>

        {/* ========================================================= */}
        {/* DYNAMIC FEATURED BLOG POST (Hero Spotlight)               */}
        {/* ========================================================= */}
        {featuredPost && searchQuery === '' && selectedTag === 'all' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
              <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#E14D2A] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Artikel Unggulan Terkini</span>
              </span>
              <span className="text-xs font-mono-code text-[#78716C]">Publikasi Resmi Kitto</span>
            </div>

            <div className="relative rounded-3xl border border-[#E14D2A]/30 bg-white dark:bg-[#1A1B20] p-6 sm:p-10 shadow-lg shadow-[#E14D2A]/5 space-y-6 overflow-hidden">
              {/* Border Beam on Featured Template */}
              <BorderBeam size={220} duration={9} colorFrom="#E14D2A" colorTo="#F59E0B" />

              {/* Frontmatter Metadata Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#EAE5DC] dark:border-[#272A33]">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-[10px] font-mono-code font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#E14D2A] text-white shadow-xs shadow-[#E14D2A]/30">
                    {featuredPost.tag}
                  </span>
                  <time className="text-xs font-mono-code text-[#78716C] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#E14D2A]" />
                    <span>{featuredPost.date}</span>
                  </time>
                  <span className="text-xs font-mono-code text-[#78716C] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#78716C]" />
                    <span>{featuredPost.readTime}</span>
                  </span>
                </div>

                {featuredPost.author && (
                  <div className="flex items-center gap-2 text-xs font-medium text-[#57534E] dark:text-[#A8A29E]">
                    <div className="w-6 h-6 rounded-full bg-[#E14D2A]/10 text-[#E14D2A] flex items-center justify-center font-bold text-xs font-mono-code">
                      K
                    </div>
                    <span>{featuredPost.author.name}</span>
                  </div>
                )}
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1C1917] dark:text-[#F5F4F0] tracking-tight leading-snug">
                  {featuredPost.title}
                </h2>
                <p className="text-sm text-[#57534E] dark:text-[#A8A29E] leading-relaxed max-w-3xl">
                  {featuredPost.summary}
                </p>
              </div>

              {/* Showcase Banner / Cover Image */}
              {featuredPost.coverImage ? (
                <div className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-[#EAE5DC] dark:border-[#272A33]">
                  <img
                    src={featuredPost.coverImage}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-[#EAE5DC] dark:border-[#272A33] bg-gradient-to-br from-[#FAF8F5] via-[#F3EFEA] to-[#EAE5DC]/50 dark:from-[#16171D] dark:via-[#1A1B20] dark:to-[#121316] p-6 sm:p-8 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-mono-code font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#E14D2A]/10 text-[#E14D2A] border border-[#E14D2A]/25 flex items-center gap-1.5">
                      <QrCode className="w-3 h-3" />
                      <span>ARSITEKTUR UTAMA</span>
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-bold text-[#1C1917] dark:text-[#F5F4F0]">
                      Pemrosesan Berkas Lokal di Memori Browser
                    </h3>
                    <p className="text-xs text-[#57534E] dark:text-[#A8A29E] leading-relaxed max-w-2xl">
                      Tanpa unggahan berkas ke peladen luar. Seluruh operasi QR, gambar, dan dokumen berjalan langsung di perangkat Anda.
                    </p>
                  </div>

                  {/* Action CTAs */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => navigate(featuredPost.actionLink?.path as any || '/qr')}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#E14D2A] hover:bg-[#C83B1B] text-white text-xs font-semibold shadow-sm shadow-[#E14D2A]/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>{featuredPost.actionLink?.label || 'Buka Alat'}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate(`/blog/${featuredPost.slug}`)}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] text-[#1C1917] dark:text-[#F5F4F0] hover:border-[#E14D2A] text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <span>Baca Artikel Lengkap</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#78716C]" />
                    </button>
                  </div>
                </div>
              )}

              {/* Prose Preview */}
              <div className="space-y-3 text-base sm:text-lg text-[#57534E] dark:text-[#A8A29E] leading-relaxed pt-2 border-t border-[#EAE5DC]/60 dark:border-[#272A33]/60">
                {featuredPost.content.slice(0, 2).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* ALL ARTICLES FEED (Dynamic Cards Grid)                    */}
        {/* ========================================================= */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#EAE5DC] dark:border-[#272A33]">
            <h3 className="text-sm font-bold text-[#1C1917] dark:text-[#F5F4F0] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#E14D2A]" />
              <span>Daftar Artikel ({filteredPosts.length})</span>
            </h3>
            <span className="text-xs font-mono-code text-[#78716C]">
              Kategori: {selectedTag === 'all' ? 'Semua' : selectedTag}
            </span>
          </div>

          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#E14D2A] border-t-transparent animate-spin mx-auto" />
              <p className="text-xs text-[#78716C] font-mono-code">Memuat artikel dokumentasi...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPosts.map((post, idx) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.35, delay: idx * 0.05 }}
                  onClick={() => navigate(`/blog/${post.slug}`)}
                  className="group relative rounded-3xl border border-[#EAE5DC] dark:border-[#272A33] bg-white dark:bg-[#1A1B20] p-6 sm:p-7 shadow-xs hover:border-[#E14D2A] dark:hover:border-[#E14D2A] transition-all cursor-pointer flex flex-col justify-between space-y-4 hover:shadow-md hover:shadow-[#E14D2A]/5"
                >
                  {/* Optional Cover Image */}
                  {post.coverImage && (
                    <div className="h-44 w-full rounded-2xl overflow-hidden border border-[#EAE5DC] dark:border-[#272A33] bg-[#FAF8F5] dark:bg-[#121316]">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  {/* Meta Header */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="text-[10px] font-mono-code font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#E14D2A]/10 text-[#E14D2A] border border-[#E14D2A]/25">
                        {post.tag}
                      </span>
                      <div className="flex items-center gap-2 text-[#78716C] font-mono-code text-xs">
                        <span>{post.date}</span>
                        <span>•</span>
                        <span>{post.readTime}</span>
                      </div>
                    </div>

                    <h4 className="text-lg font-bold text-[#1C1917] dark:text-[#F5F4F0] group-hover:text-[#E14D2A] transition-colors leading-snug">
                      {post.title}
                    </h4>

                    <p className="text-xs text-[#57534E] dark:text-[#A8A29E] leading-relaxed line-clamp-3">
                      {post.summary}
                    </p>
                  </div>

                  {/* Keywords Chips if available */}
                  {post.keywords && post.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {post.keywords.slice(0, 4).map((kw, kIdx) => (
                        <span
                          key={kIdx}
                          className="text-[10px] font-mono-code px-1.5 py-0.5 rounded bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] text-[#78716C]"
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer: Author & Read CTA */}
                  <div className="pt-3 border-t border-[#EAE5DC]/60 dark:border-[#272A33]/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-xs text-[#78716C]">
                      <div className="w-5 h-5 rounded-full bg-[#FAF8F5] dark:bg-[#121316] text-[#1C1917] dark:text-[#F5F4F0] flex items-center justify-center font-bold text-[10px] font-mono-code border border-[#EAE5DC] dark:border-[#272A33]">
                        K
                      </div>
                      <span className="truncate max-w-[120px]">{post.author?.name || 'Kitto Team'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => copyArticleLink(e, post.slug)}
                        title="Salin Tautan"
                        className="p-1.5 rounded-lg text-[#78716C] hover:text-[#E14D2A] hover:bg-[#FAF8F5] dark:hover:bg-[#121316] transition-colors cursor-pointer"
                      >
                        {copiedId === post.slug ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Share2 className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <span className="font-mono-code text-xs font-semibold text-[#E14D2A] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>{lang === 'id' ? 'Baca' : 'Read'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}

          {!isLoading && filteredPosts.length === 0 && (
            <div className="p-12 text-center text-xs text-[#78716C] border border-dashed border-[#EAE5DC] dark:border-[#272A33] rounded-3xl bg-white dark:bg-[#1A1B20]">
              Tidak ada artikel yang cocok dengan pencarian "{searchQuery}".
            </div>
          )}
        </div>

        

        {/* Footer Note */}
        <div className="pt-8 text-center text-xs text-[#78716C] border-t border-[#EAE5DC] dark:border-[#272A33]">
          Punya topik atau ide utilitas yang ingin dibahas? Kirimkan masukan melalui{' '}
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
