import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  ArrowRight,
  QrCode,
  Receipt,
  Palette,
} from 'lucide-react'
import { useI18n } from '../../lib/i18n'
import { useRouter } from '../../lib/router'
import { getToolIdFromPath } from '../../lib/toolRouter'

interface ToolsMegaMenuProps {
  currentPath: string
}

export function ToolsMegaMenu({ currentPath }: ToolsMegaMenuProps) {
  const { lang, t } = useI18n()
  const { navigate } = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isToolRoute = currentPath === '/tools' || Boolean(getToolIdFromPath(currentPath))

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSelect = (path: string) => {
    navigate(path as any)
    setIsOpen(false)
  }

  // Curated column items matching the user's screenshot format
  const visualTools = [
    { id: 'background-remover', name: lang === 'id' ? 'Hapus Background Foto' : 'Background Remover', badge: 'NEW' },
    { id: 'image-compressor', name: lang === 'id' ? 'Kompresi Foto' : 'Image Compressor', badge: 'HOT' },
    { id: 'screenshot-beautifier', name: lang === 'id' ? 'Percantik Screenshot 3D' : 'Screenshot Beautifier', badge: 'HOT' },
    { id: 'gradient-generator', name: lang === 'id' ? 'Bikin Gradien CSS' : 'CSS Gradient Maker', badge: 'NEW' },
    { id: 'palette-generator', name: lang === 'id' ? 'Ekstrak Palet Warna' : 'Palette Generator', badge: 'HOT' },
    { id: 'image-resizer', name: lang === 'id' ? 'Ubah Ukuran Foto' : 'Image Resizer', badge: 'NEW' },
  ]

  const devQrTools = [
    { id: 'qr', name: lang === 'id' ? 'Studio QR Vektor' : 'QR Vector Studio', badge: 'HOT' },
    { id: 'bulk-qr', name: lang === 'id' ? 'Bikin Banyak QR Sekaligus' : 'Batch QR Generator', badge: 'PRO' },
    { id: 'password', name: lang === 'id' ? 'Generator Sandi Kuat' : 'Password Generator', badge: 'NEW' },
    { id: 'whatsapp-link', name: lang === 'id' ? 'Tautan Chat WhatsApp' : 'WhatsApp Link Maker', badge: 'HOT' },
    { id: 'uuid', name: lang === 'id' ? 'Generator UUID v7 / v4' : 'UUID v7 / v4 Generator', badge: 'NEW' },
    { id: 'regex-tester', name: lang === 'id' ? 'Penguji Pola Regex' : 'Regex Tester & Cheatsheet', badge: 'PRO' },
    { id: 'json-prettify', name: lang === 'id' ? 'JSON ke TypeScript' : 'JSON to TypeScript', badge: 'PRO' },
  ]

  const financeDocTools = [
    { id: 'invoice-gen', name: lang === 'id' ? 'Faktur & Invoice Vault' : 'Invoice Generator', badge: 'HOT' },
    { id: 'receipt-printer', name: lang === 'id' ? 'Struk Kasir Thermal' : 'Thermal Receipt 58/80mm', badge: 'NEW' },
    { id: 'bill-splitter', name: lang === 'id' ? 'Bagi Tagihan WhatsApp' : 'WhatsApp Bill Splitter', badge: 'HOT' },
    { id: 'file-to-pdf', name: lang === 'id' ? 'Ubah Gambar ke PDF' : 'Image to PDF Converter', badge: 'HOT' },
    { id: 'pdf-tools', name: lang === 'id' ? 'Pisah & Gabung PDF' : 'PDF Split & Merge', badge: 'HOT' },
    { id: 'tax-calc', name: lang === 'id' ? 'Kalkulator Pajak PPh 21' : 'Income Tax Calculator', badge: 'PRO' },
    { id: 'bmi-calc', name: lang === 'id' ? 'Kalkulator BMI Ideal' : 'BMI Health Calculator', badge: 'HOT' },
  ]

  const renderBadge = (badge?: string) => {
    if (!badge) return null
    if (badge === 'HOT') {
      return (
        <span className="text-[10px] font-mono-code font-bold uppercase px-1.5 py-0.2 rounded bg-rose-500 text-white shadow-2xs">
          HOT
        </span>
      )
    }
    if (badge === 'NEW') {
      return (
        <span className="text-[10px] font-mono-code font-bold uppercase px-1.5 py-0.2 rounded bg-[#3B82F6] text-white shadow-2xs">
          NEW
        </span>
      )
    }
    return (
      <span className="text-[10px] font-mono-code font-bold uppercase px-1.5 py-0.2 rounded bg-amber-500 text-white shadow-2xs">
        PRO
      </span>
    )
  }

  return (
    <div ref={menuRef} className="relative">
      {/* Trigger Button with Animated Chevron */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className={`px-3.5 py-2 text-sm rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
          isOpen || isToolRoute
            ? 'text-[#E14D2A] font-bold bg-[#E14D2A]/10 dark:bg-[#E14D2A]/20'
            : 'text-[#57534E] dark:text-[#A8A29E] hover:text-[#E14D2A] dark:hover:text-[#F5F4F0]'
        }`}
      >
        <span>{t('nav.tools')}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 opacity-70 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Mega Menu Dropdown Box */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            onMouseLeave={() => setIsOpen(false)}
            className="absolute left-1/2 -translate-x-1/2 mt-2 w-[840px] max-w-[95vw] bg-white dark:bg-[#16171D] border border-[#EAE5DC] dark:border-[#272A33] rounded-3xl shadow-2xl p-6 sm:p-7 z-50 text-left"
          >
            {/* Multi-column Grid (Exact Style from User Screenshot) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Column 1: Foto & Visual */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#EAE5DC] dark:border-[#272A33]">
                  <Palette className="w-4 h-4 text-[#E14D2A]" />
                  <h3 className="font-bold text-sm text-[#1C1917] dark:text-[#F5F4F0] tracking-tight">
                    {lang === 'id' ? 'Foto & Visual' : 'Image & Visual'}
                  </h3>
                </div>

                <div className="space-y-2">
                  {visualTools.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleSelect(`/${t.id}`)}
                      className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#FAF8F5] dark:hover:bg-[#20222B] text-left transition-colors cursor-pointer group"
                    >
                      <span className="text-xs font-semibold text-[#1C1917] dark:text-[#E2E1DC] group-hover:text-[#E14D2A] transition-colors">
                        {t.name}
                      </span>
                      {renderBadge(t.badge)}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleSelect('/tools')}
                  className="text-xs font-bold text-[#E14D2A] hover:underline pt-2 block cursor-pointer"
                >
                  {lang === 'id' ? 'Lihat Semua Visual →' : 'View All Visuals →'}
                </button>
              </div>

              {/* Column 2: QR & Kode / Dev */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#EAE5DC] dark:border-[#272A33]">
                  <QrCode className="w-4 h-4 text-[#E14D2A]" />
                  <h3 className="font-bold text-sm text-[#1C1917] dark:text-[#F5F4F0] tracking-tight">
                    {lang === 'id' ? 'QR & Developer' : 'QR & Developer'}
                  </h3>
                </div>

                <div className="space-y-2">
                  {devQrTools.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleSelect(`/${t.id}`)}
                      className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#FAF8F5] dark:hover:bg-[#20222B] text-left transition-colors cursor-pointer group"
                    >
                      <span className="text-xs font-semibold text-[#1C1917] dark:text-[#E2E1DC] group-hover:text-[#E14D2A] transition-colors">
                        {t.name}
                      </span>
                      {renderBadge(t.badge)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Column 3: Keuangan, Kasir & Dokumen */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#EAE5DC] dark:border-[#272A33]">
                  <Receipt className="w-4 h-4 text-[#E14D2A]" />
                  <h3 className="font-bold text-sm text-[#1C1917] dark:text-[#F5F4F0] tracking-tight">
                    {lang === 'id' ? 'Bisnis & Dokumen' : 'Business & Docs'}
                  </h3>
                </div>

                <div className="space-y-2">
                  {financeDocTools.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleSelect(`/${t.id}`)}
                      className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#FAF8F5] dark:hover:bg-[#20222B] text-left transition-colors cursor-pointer group"
                    >
                      <span className="text-xs font-semibold text-[#1C1917] dark:text-[#E2E1DC] group-hover:text-[#E14D2A] transition-colors">
                        {t.name}
                      </span>
                      {renderBadge(t.badge)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Footer Bar of Mega Menu */}
            <div className="mt-6 pt-4 border-t border-[#EAE5DC] dark:border-[#272A33] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-[#FAF8F5] dark:bg-[#121316] -mx-6 -mb-6 sm:-mx-7 sm:-mb-7 p-4 sm:px-7 rounded-b-3xl">
              <div className="flex items-center gap-2 text-[#78716C]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>26 Alat Praktis • Tanpa Watermark</span>
              </div>

              <button
                type="button"
                onClick={() => handleSelect('/tools')}
                className="px-4 py-2 rounded-xl bg-[#E14D2A] hover:bg-[#C83B1B] text-white font-bold text-xs shadow-sm shadow-[#E14D2A]/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>{lang === 'id' ? 'Buka Direktori Lengkap (26 Alat)' : 'Explore All 26 Tools'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
