import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { CATEGORIES, TOOLS_DATA, type ToolCategory, type ToolItem } from '../../data/tools'
import { useI18n } from '../../lib/i18n'

interface ToolCatalogProps {
  onSelectTool: (toolId: string) => void
  onRequestTool?: () => void
  activeToolId?: string
}

export function ToolCatalog({ onSelectTool, onRequestTool, activeToolId }: ToolCatalogProps) {
  const { lang } = useI18n()
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAll, setShowAll] = useState(false)

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

  const isSearching = searchQuery.trim().length > 0
  const visibleTools = showAll || isSearching ? filteredTools : filteredTools.slice(0, 6)
  const hiddenCount = filteredTools.length - visibleTools.length

  return (
    <section id="catalog" className="relative overflow-hidden py-16 sm:py-32 border-t border-[#EAE5DC] dark:border-[#272A33]">
      <svg
        aria-hidden="true"
        viewBox="0 0 200 200"
        fill="none"
        className="pointer-events-none absolute -right-24 top-24 h-80 w-80 text-[#E14D2A] opacity-[0.08] animate-[spin_70s_linear_infinite] motion-reduce:animate-none"
      >
        <circle cx="100" cy="100" r="82" stroke="currentColor" strokeWidth="1" strokeDasharray="3 9" />
        <circle cx="100" cy="100" r="58" stroke="currentColor" strokeWidth="1.2" />
      </svg>
      <svg
        aria-hidden="true"
        viewBox="0 0 200 200"
        fill="none"
        className="pointer-events-none absolute -left-20 bottom-16 h-56 w-56 text-[#D4A373] opacity-[0.14]"
      >
        <rect x="40" y="40" width="120" height="120" rx="28" stroke="currentColor" strokeWidth="1.5" transform="rotate(18 100 100)" />
        <rect x="62" y="62" width="76" height="76" rx="18" stroke="currentColor" strokeWidth="1" transform="rotate(18 100 100)" />
      </svg>
      <div className="relative z-10 max-w-7xl lg:max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-sm font-semibold text-[#E14D2A]">01 / Katalog alat</span>
            <h2 className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-[-0.04em] text-[#1C1917] dark:text-[#F5F4F0]">
              {TOOLS_DATA.length} alat.
              <br />
              Satu tempat.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#57534E] dark:text-[#A8A29E] max-w-lg">
              Pilih kategori atau cari langsung. Semua alat terbuka tanpa akun.
            </p>
          </div>

          <div className="w-full md:w-96 space-y-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setShowAll(false)
              }}
              placeholder="Cari alat (cth: kecilkan foto, struk kasir, pdf, qr)..."
              className="w-full px-4 py-3 text-sm bg-[#F3EFEA] dark:bg-[#22242B] rounded-xl outline-none focus:ring-2 focus:ring-[#E14D2A]/30 transition-shadow"
            />
            {onRequestTool && (
              <button
                type="button"
                onClick={onRequestTool}
                className="text-sm font-semibold text-[#E14D2A] hover:text-[#C83B1B] transition-colors cursor-pointer"
              >
                Butuh alat lain? Ajukan di sini &rarr;
              </button>
            )}
          </div>
        </div>

        {/* Category Pills with Framer Motion LayoutId */}
        <div className="flex flex-wrap items-center gap-2 pb-2">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id
            const count =
              cat.id === 'all'
                ? TOOLS_DATA.length
                : TOOLS_DATA.filter((tool) => tool.category === cat.id).length
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id)
                  setShowAll(false)
                }}
                className={`relative isolate px-4 py-2 text-sm font-semibold rounded-full transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'text-white'
                    : 'text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeCategoryPill"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    className="absolute inset-0 bg-[#E14D2A] rounded-full -z-10 shadow-sm shadow-[#E14D2A]/25"
                  />
                )}
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#F3EFEA] dark:bg-[#22242B] text-[#78716C]'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Tools Grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {visibleTools.map((tool: ToolItem) => {
              const isCurrent = activeToolId === tool.id
              return (
                <motion.div
                  layout
                  key={tool.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  whileHover={{ y: -6, rotateX: 3, rotateY: -3 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                  style={{ transformPerspective: 900 }}
                  onClick={() => onSelectTool(tool.id)}
                  className={`p-6 rounded-2xl transition-colors cursor-pointer group flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-[#E14D2A]/10 ring-2 ring-[#E14D2A]/30'
                      : 'bg-[#F3EFEA] dark:bg-[#22242B] hover:bg-[#EAE5DC] dark:hover:bg-[#2A2D36]'
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

                  <div className="pt-5 flex items-center justify-between mt-5 text-xs sm:text-sm text-[#E14D2A] font-semibold">
                    <span>Buka Alat</span>
                    <span className="group-hover:translate-x-1.5 transition-transform">&rarr;</span>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>

        {filteredTools.length === 0 && (
          <div className="text-center py-16 text-xs text-[#8F8E8A] border border-dashed border-[#EAEAEA] dark:border-[#232326] rounded-xl">
            Tidak ditemukan alat dengan kata kunci "{searchQuery}".
          </div>
        )}

        {hiddenCount > 0 && (
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="inline-flex items-center gap-2 rounded-full bg-[#1C1917] px-5 py-3 text-sm font-semibold text-[#FAF8F5] transition-colors hover:bg-[#E14D2A] dark:bg-[#F5F4F0] dark:text-[#1C1917] dark:hover:bg-[#E14D2A] dark:hover:text-white cursor-pointer"
            >
              {lang === 'id' ? `Jelajahi ${hiddenCount} alat lainnya` : `Explore ${hiddenCount} more tools`}
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        )}

        {showAll && !isSearching && filteredTools.length > 6 && (
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={() => setShowAll(false)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#78716C] transition-colors hover:text-[#E14D2A] cursor-pointer"
            >
              {lang === 'id' ? 'Tampilkan lebih sedikit' : 'Show less'}
              <ChevronUp className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
