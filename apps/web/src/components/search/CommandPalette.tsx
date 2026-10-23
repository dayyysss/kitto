import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TOOLS_DATA, type ToolItem } from '../../data/tools'
import { useRouter, type RoutePath } from '../../lib/router'
import { useI18n } from '../../lib/i18n'
import { useAuth } from '../../lib/auth'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onSelectTool: (toolId: string) => void
}

export function CommandPalette({ isOpen, onClose, onSelectTool: _onSelectTool }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const { navigate } = useRouter()
  const { lang } = useI18n()

  const { user } = useAuth()

  const pages = useMemo(() => {
    const list = [
      { id: 'page-home', title: lang === 'id' ? 'Halaman Utama / Studio' : 'Home / Studio', path: '/' as RoutePath },
      { id: 'page-tools', title: lang === 'id' ? 'Katalog Semua Alat (Tools Directory)' : 'All Tools Directory', path: '/tools' as RoutePath },
      { id: 'page-changelog', title: lang === 'id' ? 'Catatan Rilis (Changelog)' : 'Changelog & Updates', path: '/changelog' as RoutePath },
      { id: 'page-blog', title: lang === 'id' ? 'Blog & Panduan Teknik' : 'Blog & Technical Guides', path: '/blog' as RoutePath },
      { id: 'page-feedback', title: lang === 'id' ? 'Saran Tools & Ulasan Pengguna' : 'Tool Requests & Reviews', path: '/feedback' as RoutePath },
      { id: 'page-privacy', title: lang === 'id' ? 'Kebijakan Privasi' : 'Privacy Policy', path: '/privacy' as RoutePath },
      { id: 'page-cookies', title: lang === 'id' ? 'Kebijakan Cookie' : 'Cookie Policy', path: '/cookies' as RoutePath },
      { id: 'page-terms', title: lang === 'id' ? 'Syarat & Ketentuan Layanan' : 'Terms of Service', path: '/terms' as RoutePath },
      { id: 'page-about', title: lang === 'id' ? 'Tentang Kitto' : 'About Kitto', path: '/about' as RoutePath },
    ]

    if (user) {
      list.splice(1, 0, {
        id: 'page-member',
        title: lang === 'id' ? 'Member Area / Dashboard' : 'Member Area / Dashboard',
        path: '/member' as RoutePath,
      })
    }

    return list
  }, [lang, user])

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) {
      return [
        ...pages.map((p) => ({ type: 'page' as const, ...p })),
        ...TOOLS_DATA.slice(0, 6).map((t) => ({ type: 'tool' as const, ...t })),
      ]
    }

    const matchedPages = pages
      .filter((p) => p.title.toLowerCase().includes(q))
      .map((p) => ({ type: 'page' as const, ...p }))

    const matchedTools = TOOLS_DATA.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
    ).map((t) => ({ type: 'tool' as const, ...t }))

    return [...matchedPages, ...matchedTools]
  }, [query, pages])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  const handleClose = () => {
    setQuery('')
    onClose()
  }

  const handleSelect = (item: (typeof searchResults)[number]) => {
    if (item.type === 'page') {
      navigate(item.path)
    } else {
      navigate(`/${item.id}`)
    }
    handleClose()
  }

  // Handle keyboard arrow keys
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, searchResults.length))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + searchResults.length) % Math.max(1, searchResults.length))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (searchResults[selectedIndex]) {
        handleSelect(searchResults[selectedIndex])
      }
    } else if (e.key === 'Escape') {
      handleClose()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div
        onClick={handleClose}
        className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-xs"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.98, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -10 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-xl bg-white dark:bg-[#141415] border border-[#EAEAEA] dark:border-[#232326] rounded-xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Search Header */}
          <div className="p-3.5 border-b border-[#EAEAEA] dark:border-[#232326] flex items-center gap-3">
            <svg
              className="w-4 h-4 text-[#8F8E8A]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setSelectedIndex(0)
              }}
              onKeyDown={handleKeyDown}
              placeholder={lang === 'id' ? 'Cari alat, dokumen, halaman...' : 'Search tools, docs, pages...'}
              className="flex-1 text-xs sm:text-sm bg-transparent outline-none text-[#111111] dark:text-[#EDEDED]"
            />
            <button
              type="button"
              onClick={handleClose}
              className="px-1.5 py-0.5 text-[10px] font-mono-code bg-[#FBFBFA] dark:bg-[#0C0C0D] border border-[#EAEAEA] dark:border-[#232326] rounded text-[#8F8E8A] hover:text-[#111111] dark:hover:text-white cursor-pointer"
            >
              ESC
            </button>
          </div>

          {/* Results list */}
          <div className="max-h-80 overflow-y-auto p-2 space-y-1">
            {searchResults.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#8F8E8A]">
                {lang === 'id' ? 'Tidak ada hasil untuk pencarian ini.' : 'No results found.'}
              </div>
            ) : (
              searchResults.map((item, idx) => {
                const isSelected = selectedIndex === idx
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`p-2.5 rounded-lg flex items-center justify-between text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111]'
                        : 'text-[#111111] dark:text-[#EDEDED] hover:bg-[#F4F4F3] dark:hover:bg-[#1C1C1F]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-mono-code uppercase opacity-60">
                        {item.type === 'page' ? 'NAV' : (item as ToolItem).category}
                      </span>
                      <span className="font-medium">{item.title}</span>
                    </div>

                    <span className="text-xs font-mono-code opacity-70">
                      {item.type === 'page' ? 'Buka Halaman' : 'Buka Alat'} &rarr;
                    </span>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer note */}
          <div className="px-3.5 py-2 bg-[#FBFBFA] dark:bg-[#0C0C0D] border-t border-[#EAEAEA] dark:border-[#232326] text-[10px] font-mono-code text-[#8F8E8A] flex justify-between">
            <span>↑ ↓ untuk memilih</span>
            <span>ENTER untuk membuka</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
