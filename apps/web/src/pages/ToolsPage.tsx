import { useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Sparkles, ArrowUpRight, X, ChevronUp, ChevronDown } from 'lucide-react'
import { CATEGORIES, TOOLS_DATA, type ToolCategory, type ToolItem } from '../data/tools'
import { ActiveToolWorkspace } from '../components/tools/ActiveToolWorkspace'
import { useI18n } from '../lib/i18n'
import { useRouter } from '../lib/router'

interface ToolsPageProps {
  activeToolId: string
  onSelectTool: (id: string) => void
}

export function ToolsPage({ activeToolId, onSelectTool: _onSelectTool }: ToolsPageProps) {
  const { lang } = useI18n()
  const { navigate } = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showWorkspace, setShowWorkspace] = useState(true)
  const workspaceRef = useRef<HTMLDivElement>(null)

  const filteredTools = useMemo(() => {
    return TOOLS_DATA.filter((tool) => {
      const matchCat = selectedCategory === 'all' || tool.category === selectedCategory
      const matchSearch =
        !searchQuery ||
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchCat && matchSearch
    })
  }, [selectedCategory, searchQuery])

  const currentToolMeta = TOOLS_DATA.find((t) => t.id === activeToolId) || TOOLS_DATA[0]

  const handleToolClick = (toolId: string) => {
    navigate(`/${toolId}`)
  }

  return (
    <div className="max-w-7xl lg:max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-12 sm:py-16 space-y-16">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#E14D2A]/30 bg-[#E14D2A]/10 text-xs sm:text-sm font-mono-code text-[#E14D2A] font-semibold">
          <Sparkles className="w-4 h-4 text-[#E14D2A]" />
          <span>DIREKTORI RESMI • {TOOLS_DATA.length} PERANGKAT UTILITAS</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1C1917] dark:text-[#F5F4F0] leading-tight">
          {lang === 'id' ? 'Katalog Seluruh' : 'All Digital'}{' '}
          <span className="font-serif-accent italic text-[#E14D2A] font-normal">
            {lang === 'id' ? 'Perangkat Kitto' : 'Utilities Directory'}
          </span>
        </h1>

        <p className="text-base sm:text-lg text-[#57534E] dark:text-[#A8A29E] leading-relaxed">
          {lang === 'id'
            ? 'Akses dan gunakan seluruh alat utilitas web presisi secara gratis. Semua diproses di browser Anda tanpa watermark dan tanpa iklan pop-up.'
            : 'Access and use all precision web utilities for free. Everything runs in your browser with no watermarks or pop-ups.'}
        </p>
      </div>

      {/* Embedded Active Tool Workspace Section */}
      <div ref={workspaceRef} className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-2xl shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E14D2A] animate-pulse" />
            <span className="text-xs font-mono-code uppercase text-[#78716C]">
              {lang === 'id' ? 'Alat Aktif' : 'Active Tool'}:
            </span>
            <span className="text-sm font-bold text-[#1C1917] dark:text-[#F5F4F0]">
              {currentToolMeta.title}
            </span>
            <span className="text-[10px] font-mono-code font-bold uppercase px-2 py-0.5 rounded-full bg-[#E14D2A]/10 text-[#E14D2A]">
              {currentToolMeta.category}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowWorkspace(!showWorkspace)}
            className="text-xs font-semibold text-[#57534E] dark:text-[#A8A29E] hover:text-[#E14D2A] cursor-pointer flex items-center gap-1.5"
          >
            {showWorkspace ? (
              <>
                <span>{lang === 'id' ? 'Sembunyikan Workspace' : 'Hide Workspace'}</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>{lang === 'id' ? 'Tampilkan Workspace' : 'Show Workspace'}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        <AnimatePresence>
          {showWorkspace && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-6 sm:p-8 bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-3xl shadow-sm"
            >
              <ActiveToolWorkspace activeToolId={activeToolId} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Directory & Filter Search Section */}
      <div className="space-y-8 pt-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-[#EAE5DC] dark:border-[#272A33]">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1C1917] dark:text-[#F5F4F0] tracking-tight">
              {lang === 'id' ? 'Jelajahi Direktori Alat' : 'Browse All Tools'}
            </h2>
            <p className="text-sm text-[#78716C] mt-1">
              {lang === 'id'
                ? `Menampilkan ${filteredTools.length} dari total ${TOOLS_DATA.length} alat yang tersedia`
                : `Showing ${filteredTools.length} of ${TOOLS_DATA.length} available tools`}
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78716C] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'id' ? 'Cari alat (cth: perkecil foto, kode qr, struk kasir, hitung kata)...' : 'Search tools (e.g. compress image, qr, receipt, pdf)...'}
              className="w-full pl-10 pr-9 py-2.5 text-sm rounded-xl bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] text-[#1C1917] dark:text-[#F5F4F0] placeholder-[#78716C] outline-none focus:border-[#E14D2A] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#1C1917] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pb-2">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id
            const count =
              cat.id === 'all'
                ? TOOLS_DATA.length
                : TOOLS_DATA.filter((t) => t.category === cat.id).length

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`relative isolate px-4 py-2 text-sm font-semibold rounded-full transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'text-white'
                    : 'text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="toolsCategoryPill"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    className="absolute inset-0 bg-[#E14D2A] rounded-full -z-10 shadow-sm shadow-[#E14D2A]/25"
                  />
                )}
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] font-mono-code px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-[#FAF8F5] dark:bg-[#121316] text-[#78716C] border border-[#EAE5DC] dark:border-[#272A33]'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Tools Cards Grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <AnimatePresence mode="popLayout">
            {filteredTools.map((tool: ToolItem) => {
              const isCurrent = activeToolId === tool.id
              return (
                <motion.div
                  layout
                  key={tool.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  onClick={() => handleToolClick(tool.id)}
                  className={`p-6 rounded-2xl border bg-white dark:bg-[#1A1B20] transition-all cursor-pointer group flex flex-col justify-between ${
                    isCurrent
                      ? 'border-[#E14D2A] shadow-md ring-2 ring-[#E14D2A]/20'
                      : 'border-[#EAE5DC] dark:border-[#272A33] hover:border-[#E14D2A]/50 hover:shadow-sm'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono-code uppercase px-2.5 py-0.5 rounded-full bg-[#FAF8F5] dark:bg-[#22242B] text-[#57534E] dark:text-[#A8A29E] font-medium">
                        {tool.category}
                      </span>
                      {tool.badge && (
                        <span
                          className={`text-[10px] font-mono-code font-bold uppercase px-2 py-0.5 rounded-full ${
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

                    <h3 className="text-base sm:text-lg font-bold text-[#1C1917] dark:text-[#F5F4F0] group-hover:text-[#E14D2A] transition-colors">
                      {tool.title}
                    </h3>

                    <p className="text-sm text-[#57534E] dark:text-[#A8A29E] leading-relaxed line-clamp-2">
                      {tool.description}
                    </p>
                  </div>

                  <div className="pt-5 flex items-center justify-between border-t border-[#EAE5DC]/80 dark:border-[#272A33] mt-5 text-xs sm:text-sm font-mono-code text-[#E14D2A] font-semibold">
                    <span>{isCurrent ? 'Sedang Digunakan' : 'Buka Alat'}</span>
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>

        {filteredTools.length === 0 && (
          <div className="text-center py-16 text-sm text-[#78716C] border border-dashed border-[#EAE5DC] dark:border-[#272A33] rounded-2xl bg-white dark:bg-[#1A1B20]">
            Tidak ditemukan alat dengan kata kunci "{searchQuery}".
          </div>
        )}
      </div>
    </div>
  )
}
