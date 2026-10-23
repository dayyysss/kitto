import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Calendar,
  Check,
  Clock,
  Compass,
  Share2,
} from 'lucide-react'
import { useI18n } from '../lib/i18n'
import { useRouter } from '../lib/router'
import { useToast } from '../lib/toast'
import { DotPattern } from '../components/magicui/dot-pattern'
import { mapBlogPost, type BlogPost } from '../lib/blog'

function isVideo(src?: string) {
  return !!src && /\.(mp4|webm|ogg)(\?|$)/i.test(src)
}

function headingOf(text: string) {
  const match = text.match(/^(#{1,3})\s+(.+)/)
  return match ? { level: match[1].length, label: match[2] } : null
}

function Block({ id, text }: { id: string; text: string }) {
  const lines = text.split('\n')
  const heading = headingOf(text)

  if (heading) {
    const Tag = heading.level === 1 ? 'h2' : heading.level === 2 ? 'h2' : 'h3'
    return (
      <Tag
        id={id}
        className={
          heading.level === 3
            ? 'text-lg sm:text-xl font-bold text-[#1C1917] dark:text-[#F5F4F0] pt-2 scroll-mt-24'
            : 'text-xl sm:text-2xl font-bold text-[#1C1917] dark:text-[#F5F4F0] pt-2 scroll-mt-24'
        }
      >
        {heading.label}
      </Tag>
    )
  }

  if (lines.length > 1 && lines.every((l) => l.trim() === '' || l.trim().startsWith('- '))) {
    return (
      <ul id={id} className="list-disc pl-5 space-y-1 scroll-mt-24">
        {lines
          .filter((l) => l.trim().startsWith('- '))
          .map((l, i) => (
            <li key={i}>{l.trim().slice(2)}</li>
          ))}
      </ul>
    )
  }

  return (
    <p id={id} className="whitespace-pre-line leading-relaxed scroll-mt-24">
      {text}
    </p>
  )
}

export function BlogDetailPage({ slug }: { slug: string }) {
  const { lang } = useI18n()
  const { navigate } = useRouter()
  const { showToast } = useToast()

  const [post, setPost] = useState<BlogPost | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let active = true
    setIsLoading(true)

    fetch(`/api/blog/${encodeURIComponent(slug)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active) return
        setPost(data && !data.error ? mapBlogPost(data, lang) : null)
      })
      .catch(() => {
        if (active) setPost(null)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [slug, lang])

  useEffect(() => {
    if (!post) return
    const previousTitle = document.title
    document.title = `${post.title} — Kitto Blog`
    return () => {
      document.title = previousTitle
    }
  }, [post])

  const sections = useMemo(() => {
    if (!post) return []
    const headings = post.content
      .map((block, i) => {
        const h = headingOf(block)
        return h ? { id: `section-${i}`, label: h.label } : null
      })
      .filter(Boolean) as Array<{ id: string; label: string }>

    if (headings.length > 0) return headings

    return post.content
      .slice(0, 4)
      .map((block, i) => {
        const label = block.replace(/[#*_`]/g, '').split(/[.!?\n]/)[0].trim()
        if (!label) return null
        return { id: `section-${i}`, label: label.length > 54 ? `${label.slice(0, 54).trim()}…` : label }
      })
      .filter(Boolean) as Array<{ id: string; label: string }>
  }, [post])

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/blog/${slug}`)
    setCopied(true)
    showToast('Tautan Disalin', 'Tautan artikel berhasil disalin ke papan klip.', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#FAF8F5] dark:bg-[#121316] flex items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#E14D2A] border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-[#78716C] font-mono-code">Memuat artikel...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="w-full min-h-screen bg-[#FAF8F5] dark:bg-[#121316] px-6 py-24">
        <div className="max-w-md mx-auto text-center space-y-4">
          <BookOpen className="w-10 h-10 text-[#E14D2A] mx-auto" />
          <h1 className="text-2xl font-bold text-[#1C1917] dark:text-[#F5F4F0]">Artikel tidak ditemukan</h1>
          <p className="text-sm text-[#57534E] dark:text-[#A8A29E]">
            Artikel ini mungkin sudah dihapus atau tautannya tidak valid.
          </p>
          <button
            type="button"
            onClick={() => navigate('/blog')}
            className="px-5 py-2 text-xs font-semibold bg-[#E14D2A] hover:bg-[#C83B1B] text-white rounded-xl cursor-pointer"
          >
            Kembali ke Blog
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] dark:bg-[#121316] text-[#1C1917] dark:text-[#F5F4F0] relative overflow-hidden transition-colors">
      <DotPattern className="opacity-70 dark:opacity-40" />

      <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-12 py-8 sm:py-12 relative z-10">
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <button
            type="button"
            onClick={() => navigate('/blog')}
            aria-label="Kembali ke Blog"
            className="w-8 h-8 rounded-lg border border-[#EAE5DC] dark:border-[#272A33] bg-white dark:bg-[#1A1B20] flex items-center justify-center text-[#57534E] dark:text-[#A8A29E] hover:text-[#E14D2A] hover:border-[#E14D2A] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-[#1C1917] text-white dark:bg-white dark:text-[#1C1917]">
            {post.tag}
          </span>

          {post.keywords?.slice(0, 2).map((kw) => (
            <span
              key={kw}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] text-[#57534E] dark:text-[#A8A29E]"
            >
              {kw}
            </span>
          ))}

          <span className="text-xs text-[#78716C] sm:ml-1">{post.date}</span>
        </div>

        <header className="max-w-3xl space-y-4 pb-8">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.12]"
          >
            {post.title}
          </motion.h1>

          {post.summary && (
            <p className="text-sm sm:text-base text-[#57534E] dark:text-[#A8A29E] leading-relaxed">
              {post.summary}
            </p>
          )}
        </header>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_280px] gap-8 lg:gap-12 items-start">
          <article className="min-w-0 space-y-8">
            {post.coverImage && (
              <div className="w-full rounded-xl border border-[#EAE5DC] dark:border-[#272A33] overflow-hidden bg-white dark:bg-[#1A1B20]">
                {isVideo(post.coverImage) ? (
                  <video autoPlay loop muted playsInline src={post.coverImage} className="w-full" />
                ) : (
                  <img src={post.coverImage} alt={post.title} className="w-full object-cover" />
                )}
              </div>
            )}

            <div className="space-y-5 text-base text-[#3F3B37] dark:text-[#C7C2BA] border-t border-[#EAE5DC] dark:border-[#272A33] pt-8">
              {post.content.map((block, i) => (
                <Block key={i} id={`section-${i}`} text={block} />
              ))}
            </div>

            <div className="pt-6 border-t border-[#EAE5DC] dark:border-[#272A33] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={copyLink}
                className="text-xs text-[#78716C] hover:text-[#E14D2A] flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin' : 'Bagikan Tautan'}</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/blog')}
                className="px-5 py-2 text-xs font-semibold bg-[#1C1917] text-white dark:bg-white dark:text-[#1C1917] rounded-xl hover:opacity-90 cursor-pointer transition-opacity"
              >
                Semua Artikel
              </button>
            </div>
          </article>

          <aside className="lg:sticky lg:top-24 space-y-5">
            <div className="rounded-xl border border-[#EAE5DC] dark:border-[#272A33] bg-white dark:bg-[#1A1B20] p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-[#E14D2A]/10 text-[#E14D2A] flex items-center justify-center font-bold font-mono-code shrink-0">
                K
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold truncate">{post.author?.name}</div>
                <div className="text-[11px] text-[#78716C] font-mono-code truncate">{post.author?.role}</div>
              </div>
            </div>

            {sections.length > 0 && (
              <nav className="rounded-xl border border-[#EAE5DC] dark:border-[#272A33] bg-white dark:bg-[#1A1B20] p-4 space-y-2">
                <div className="text-xs font-bold pb-2 border-b border-[#EAE5DC] dark:border-[#272A33]">
                  On this page
                </div>
                <ul className="space-y-1.5">
                  {sections.map((section, i) => (
                    <li key={section.id}>
                      <button
                        type="button"
                        onClick={() => scrollTo(section.id)}
                        className={`text-left text-xs leading-snug transition-colors cursor-pointer ${
                          i === 0
                            ? 'font-semibold text-[#1C1917] dark:text-[#F5F4F0] underline underline-offset-4 decoration-[#1C1917] dark:decoration-[#F5F4F0]'
                            : 'text-[#78716C] hover:text-[#E14D2A]'
                        }`}
                      >
                        {section.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            {post.actionLink && (
              <div className="rounded-xl border border-[#E14D2A]/25 bg-white dark:bg-[#1A1B20] p-5 space-y-3 overflow-hidden relative">
                <div className="w-9 h-9 rounded-lg bg-[#E14D2A]/10 text-[#E14D2A] flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-bold">Coba Fitur yang Dibahas</div>
                  <div className="text-[11px] text-[#78716C] leading-relaxed">
                    Gunakan alat utilitas terkait langsung di Kitto, tanpa unggah ke server.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(post.actionLink!.path as any)}
                  className="w-full px-4 py-2 rounded-lg bg-[#E14D2A] hover:bg-[#C83B1B] text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{post.actionLink.label}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 text-[11px] text-[#78716C] font-mono-code px-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{post.readTime}</span>
              <span className="mx-1">·</span>
              <Calendar className="w-3.5 h-3.5" />
              <span>{post.date}</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
