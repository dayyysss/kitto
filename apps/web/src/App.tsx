import { lazy, Suspense, useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sun,
  Moon,
  ChevronDown,
  Lock,
  Menu,
  X as CloseIcon,
  Search,
  LogOut,
  Bookmark,
  Star,
  ArrowRight,
  ShieldCheck,
  LayoutDashboard,
  House,
  LayoutGrid,
  QrCode,
  User as UserIcon,
  BookOpen,
  Megaphone,
  MessageCircle,
  Cookie,
  Scale,
  ChevronRight,
  Ellipsis,
} from 'lucide-react'
import { ToolCatalog } from './components/catalog/ToolCatalog'
import { AuthModal } from './components/auth/AuthModal'
import { CommandPalette } from './components/search/CommandPalette'
import { HeroSection, BentoFeatures, FaqSection, ToolMarquee } from './components/landing/LandingSections'
import { ToolsMegaMenu } from './components/navigation/ToolsMegaMenu'
import { TOOLS_DATA } from './data/tools'
import { useRouter } from './lib/router'
import { getToolIdFromPath } from './lib/toolRouter'
import { useI18n } from './lib/i18n'
import { useAuth } from './lib/auth'
import { useSiteSettings } from './lib/settings'
import { useConfirm } from './lib/confirm'
import { getCollectionTools, getFavoriteTools } from './lib/userPreferences'
import { ToastContainer } from './components/ui/ToastContainer'
import { ConfirmDialog } from './components/ui/ConfirmDialog'
import { PwaInstallPrompt } from './components/ui/PwaInstallPrompt'

const QrGenerator = lazy(() => import('./components/qr/QrGenerator').then((m) => ({ default: m.QrGenerator })))
const PasswordTool = lazy(() => import('./components/tools/PasswordTool').then((m) => ({ default: m.PasswordTool })))
const DevTools = lazy(() => import('./components/tools/DevTools').then((m) => ({ default: m.DevTools })))
const VisualTools = lazy(() => import('./components/tools/VisualTools').then((m) => ({ default: m.VisualTools })))
const FinanceTools = lazy(() => import('./components/tools/FinanceTools').then((m) => ({ default: m.FinanceTools })))
const DocAcademicTools = lazy(() => import('./components/tools/DocAcademicTools').then((m) => ({ default: m.DocAcademicTools })))
const LifestyleTools = lazy(() => import('./components/tools/LifestyleTools').then((m) => ({ default: m.LifestyleTools })))
const DevExtraTools = lazy(() => import('./components/tools/DevExtraTools').then((m) => ({ default: m.DevExtraTools })))
const BulkQrGenerator = lazy(() => import('./components/tools/BulkQrGenerator').then((m) => ({ default: m.BulkQrGenerator })))
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const ChangelogPage = lazy(() => import('./pages/ChangelogPage').then((m) => ({ default: m.ChangelogPage })))
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })))
const BlogPage = lazy(() => import('./pages/BlogPage').then((m) => ({ default: m.BlogPage })))
const BlogDetailPage = lazy(() => import('./pages/BlogDetailPage').then((m) => ({ default: m.BlogDetailPage })))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage })))
const CookiePolicyPage = lazy(() => import('./pages/CookiePolicyPage').then((m) => ({ default: m.CookiePolicyPage })))
const TermsPage = lazy(() => import('./pages/TermsPage').then((m) => ({ default: m.TermsPage })))
const FeedbackPage = lazy(() => import('./pages/FeedbackPage').then((m) => ({ default: m.FeedbackPage })))
const AtelierOpsPage = lazy(() => import('./pages/AtelierOpsPage').then((m) => ({ default: m.AtelierOpsPage })))
const ToolsPage = lazy(() => import('./pages/ToolsPage').then((m) => ({ default: m.ToolsPage })))
const ToolDetailPage = lazy(() => import('./pages/ToolDetailPage').then((m) => ({ default: m.ToolDetailPage })))

const CURRENT_YEAR = new Date().getFullYear()

export default function App() {
  const [activeToolId, setActiveToolId] = useState<string>('qr')
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('qt_theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const { currentPath, navigate } = useRouter()
  const { lang, setLang, t } = useI18n()
  const { user, logout } = useAuth()
  const { settings, fetchSettings } = useSiteSettings()
  const { ask } = useConfirm()

  const handleLogoutWithConfirm = () => {
    setIsProfileOpen(false)
    setIsMobileMenuOpen(false)
    ask({
      title: 'Keluar dari Akun?',
      message: 'Apakah Anda yakin ingin keluar dari sesi akun Kitto saat ini?',
      confirmText: 'Ya, Keluar Akun',
      variant: 'danger',
      onConfirm: () => {
        logout()
      },
    })
  }

  const handleMobileNavigate = (path: string) => {
    setIsMobileMenuOpen(false)
    setIsMobileMoreOpen(false)
    setIsProfileOpen(false)
    setIsMoreOpen(false)
    navigate(path)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev)
  }

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  useEffect(() => {
    if (!isMobileMenuOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false)
        setIsMobileMoreOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMobileMenuOpen])

  // Close menus on browser history navigation
  useEffect(() => {
    const handlePopState = () => {
      setIsMobileMenuOpen(false)
      setIsProfileOpen(false)
      setIsMoreOpen(false)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  // Track page view for privacy-first internal analytics
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (currentPath === '/atelier-ops') return
    fetch('/api/stats/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: currentPath }),
    }).catch(() => {})
  }, [currentPath])

  const currentLogo = isDark ? (settings.logoDark || settings.logoLight) : (settings.logoLight || settings.logoDark)

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keep DOM, state, and localStorage in lockstep
  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
      root.setAttribute('data-theme', 'dark')
      localStorage.setItem('qt_theme', 'dark')
    } else {
      root.classList.remove('dark')
      root.setAttribute('data-theme', 'light')
      localStorage.setItem('qt_theme', 'light')
    }
  }, [isDark])

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const matchedToolId = useMemo(() => getToolIdFromPath(currentPath), [currentPath])

  // Track tool opens once per browser session
  useEffect(() => {
    if (typeof window === 'undefined' || !matchedToolId) return
    const key = `kitto_tool_tracked_${matchedToolId}`
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
    fetch('/api/stats/tool', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toolId: matchedToolId }),
    }).catch(() => {})
  }, [matchedToolId])

  const handleSelectTool = (toolId: string) => {
    setActiveToolId(toolId)
    navigate(`/${toolId}`)
  }

  // Active Tool Title
  const currentToolMeta = TOOLS_DATA.find((t) => t.id === activeToolId) || TOOLS_DATA[0]
  const isAdminOps = currentPath === '/atelier-ops'

  const mobileNavItems = [
    { path: '/', label: t('nav.home'), icon: House },
    { path: '/about', label: t('nav.about'), icon: UserIcon },
    { path: '/tools', label: t('nav.tools'), icon: LayoutGrid },
    { path: '/blog', label: t('nav.blog'), icon: BookOpen },
    { path: '/changelog', label: t('nav.changelog'), icon: Megaphone },
    ...(user ? [{ path: '/member', label: lang === 'id' ? 'Area Member' : 'Member Area', icon: LayoutDashboard }] : []),
  ]

  const mobileLegalItems = [
    { path: '/feedback', label: lang === 'id' ? 'Bantuan & Saran' : 'Help & Feedback', icon: MessageCircle },
    { path: '/privacy', label: lang === 'id' ? 'Kebijakan Privasi' : 'Privacy Policy', icon: ShieldCheck },
    { path: '/cookies', label: lang === 'id' ? 'Kebijakan Cookie' : 'Cookie Policy', icon: Cookie },
    { path: '/terms', label: lang === 'id' ? 'Syarat & Ketentuan' : 'Terms of Service', icon: Scale },
  ]
  const isMobileMoreActive = mobileLegalItems.some((item) => item.path === currentPath)

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF8F5] dark:bg-[#121316] text-[#1C1917] dark:text-[#F5F4F0] transition-colors duration-150">
      {/* Navigation Header (Hidden only on Admin Console /atelier-ops) */}
      {!isAdminOps && (
        <header className="border-b border-[#EAE5DC] dark:border-[#272A33] bg-[#FAF8F5]/90 dark:bg-[#121316]/90 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-7xl lg:max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 h-16 sm:h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                {currentLogo ? (
                  <img
                    src={currentLogo}
                    alt={settings.title || 'Kitto'}
                    className="h-9 sm:h-11 max-w-[120px] sm:max-w-[160px] object-contain"
                  />
                ) : (
                  <>
                    {/* Hanko Vermilion Seal Icon */}
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#E14D2A] rounded-xl flex items-center justify-center shadow-md shadow-[#E14D2A]/25 group-hover:scale-105 transition-transform">
                      <span className="text-base sm:text-lg font-black text-white font-mono-code leading-none">K</span>
                    </div>
                    <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-[#1C1917] dark:text-[#F5F4F0]">
                      Kitto
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center gap-1 2xl:gap-2">
              {/* 1. Beranda / Home */}
              <button
                type="button"
                onClick={() => navigate('/')}
                className={`px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                  currentPath === '/'
                    ? 'text-[#E14D2A] font-bold bg-[#E14D2A]/10 dark:bg-[#E14D2A]/20'
                    : 'text-[#57534E] dark:text-[#A8A29E] hover:text-[#E14D2A] dark:hover:text-[#F5F4F0]'
                }`}
              >
                {t('nav.home')}
              </button>

              {/* 2. Tentang Kami / About */}
              <button
                type="button"
                onClick={() => navigate('/about')}
                className={`px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                  currentPath === '/about'
                    ? 'text-[#E14D2A] font-bold bg-[#E14D2A]/10 dark:bg-[#E14D2A]/20'
                    : 'text-[#57534E] dark:text-[#A8A29E] hover:text-[#E14D2A] dark:hover:text-[#F5F4F0]'
                }`}
              >
                {t('nav.about')}
              </button>

              {/* 3. Semua Alat / Tools (Mega Menu Dropdown) */}
              <ToolsMegaMenu currentPath={currentPath} />

              {/* 4. Catatan Rilis / Changelog */}
              <button
                type="button"
                onClick={() => navigate('/changelog')}
                className={`px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                  currentPath === '/changelog'
                    ? 'text-[#E14D2A] font-bold bg-[#E14D2A]/10 dark:bg-[#E14D2A]/20'
                    : 'text-[#57534E] dark:text-[#A8A29E] hover:text-[#E14D2A] dark:hover:text-[#F5F4F0]'
                }`}
              >
                {t('nav.changelog')}
              </button>

              {/* 6. Member Area (if logged in) */}
              {user && (
                <button
                  type="button"
                  onClick={() => navigate('/member')}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                    currentPath === '/member' || currentPath === '/dashboard'
                      ? 'text-[#E14D2A] font-bold bg-[#E14D2A]/10 dark:bg-[#E14D2A]/20'
                      : 'text-[#57534E] dark:text-[#A8A29E] hover:text-[#E14D2A] dark:hover:text-[#F5F4F0]'
                  }`}
                >
                  Member Area
                </button>
              )}

              {/* 7. Lainnya ▾ (More) Dropdown for Blog, Feedback & Legal */}
              <div ref={moreRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsMoreOpen((prev) => !prev)}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    ['/blog', '/feedback', '/privacy', '/cookies', '/terms'].includes(currentPath)
                      ? 'text-[#E14D2A] font-bold bg-[#E14D2A]/10 dark:bg-[#E14D2A]/20'
                      : 'text-[#57534E] dark:text-[#A8A29E] hover:text-[#E14D2A] dark:hover:text-[#F5F4F0]'
                  }`}
                >
                  <span>{t('nav.more')}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                </button>

                <AnimatePresence>
                  {isMoreOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96, y: 4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96, y: 4 }}
                      transition={{ duration: 0.12 }}
                      className="absolute left-0 mt-2 w-52 bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-2xl shadow-xl py-2 z-50 text-sm"
                    >
                      {[
                        { path: '/blog', label: t('nav.blog') },
                        { path: '/feedback', label: t('nav.feedback') },
                        { path: '/privacy', label: t('nav.privacy') },
                        { path: '/cookies', label: t('nav.cookies') },
                        { path: '/terms', label: t('nav.terms') },
                      ].map((item) => (
                        <button
                          key={item.path}
                          type="button"
                          onClick={() => {
                            navigate(item.path as any)
                            setIsMoreOpen(false)
                          }}
                          className={`w-full text-left px-4 py-2.5 transition-colors cursor-pointer ${
                            currentPath === item.path
                              ? 'bg-[#E14D2A]/10 font-bold text-[#E14D2A]'
                              : 'text-[#57534E] dark:text-[#A8A29E] hover:bg-[#FAF8F5] dark:hover:bg-[#22242B] hover:text-[#1C1917] dark:hover:text-[#F5F4F0]'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            {/* Quick action triggers */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Quick Search Button */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E] border border-[#EAE5DC] dark:border-[#272A33] rounded-xl hover:bg-[#F3EFEA] dark:hover:bg-[#22242B] cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E14D2A]" />
                <span className="hidden sm:inline">{lang === 'id' ? 'Cari' : 'Search'}</span>
                <kbd className="hidden md:inline-block px-1.5 text-[10px] font-mono-code bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-md text-[#78716C]">
                  Ctrl K
                </kbd>
              </button>

              {/* Language Switcher */}
              <button
                type="button"
                onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
                aria-label="Switch language"
                className="hidden sm:block px-2 sm:px-2.5 py-1.5 text-xs font-mono-code font-bold uppercase border border-[#EAE5DC] dark:border-[#272A33] rounded-xl hover:bg-[#F3EFEA] dark:hover:bg-[#22242B] transition-colors cursor-pointer"
              >
                {lang}
              </button>

              {/* Dark / Light Mode Switcher */}
              <button
                type="button"
                onClick={() => setIsDark((prev) => !prev)}
                aria-label="Toggle dark mode"
                title={isDark ? 'Mode Terang' : 'Mode Gelap'}
                className="w-8 h-8 flex items-center justify-center text-sm border border-[#EAE5DC] dark:border-[#272A33] rounded-xl hover:bg-[#F3EFEA] dark:hover:bg-[#22242B] text-[#1C1917] dark:text-[#F5F4F0] transition-colors cursor-pointer"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-400" />}
              </button>

              {user ? (
                <div ref={profileRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen((prev) => !prev)}
                    className="flex items-center gap-2 py-1 px-2 sm:px-2.5 rounded-2xl border border-[#EAE5DC] dark:border-[#272A33] hover:border-[#E14D2A]/50 bg-white dark:bg-[#1A1B20] transition-all cursor-pointer shadow-xs"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-[#E14D2A] to-[#D4A373] text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs shrink-0 overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user.name.charAt(0)
                      )}
                    </div>
                    <div className="hidden sm:block text-left pr-1">
                      <div className="text-xs font-bold text-[#1C1917] dark:text-[#F5F4F0] leading-tight max-w-[85px] truncate">
                        {user.name.split(' ')[0]}
                      </div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono-code font-bold leading-none">
                        Member
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-[#78716C] hidden sm:block" />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-3xl shadow-2xl p-4 z-50 space-y-3"
                      >
                        {/* User Profile Info Card */}
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33]">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#E14D2A] to-[#D4A373] text-white flex items-center justify-center font-black text-base uppercase shadow-md shadow-[#E14D2A]/20 shrink-0 overflow-hidden">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              user.name.charAt(0)
                            )}
                          </div>
                          <div className="truncate">
                            <div className="font-extrabold text-sm text-[#1C1917] dark:text-[#F5F4F0] truncate">
                              {user.name}
                            </div>
                            <div className="text-xs text-[#78716C] font-mono-code truncate">
                              {user.email}
                            </div>
                            <div className="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-full bg-[#E14D2A]/10 text-[#E14D2A] font-bold text-[10px] font-mono-code">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>{user.role === 'admin' ? 'Administrator' : 'Member Kreator'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Navigation Links inside Profile Menu */}
                        <div className="space-y-1 text-xs sm:text-sm font-semibold">
                          <button
                            type="button"
                            onClick={() => {
                              navigate('/member')
                              setIsProfileOpen(false)
                            }}
                            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF8F5] dark:hover:bg-[#22242B] text-left text-[#1C1917] dark:text-[#F5F4F0] cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <UserIcon className="w-4 h-4 text-[#E14D2A]" />
                              <span>Edit Profil & Foto Akun</span>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-[#78716C]" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              navigate('/member')
                              setIsProfileOpen(false)
                            }}
                            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF8F5] dark:hover:bg-[#22242B] text-left text-[#1C1917] dark:text-[#F5F4F0] cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <LayoutDashboard className="w-4 h-4 text-[#E14D2A]" />
                              <span>Buka Member Area</span>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-[#78716C]" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              navigate('/member')
                              setIsProfileOpen(false)
                            }}
                            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF8F5] dark:hover:bg-[#22242B] text-left text-[#1C1917] dark:text-[#F5F4F0] cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <Bookmark className="w-4 h-4 text-[#E14D2A]" />
                              <span>Koleksi Alat Tersimpan</span>
                            </div>
                            <span className="text-xs font-mono-code font-bold px-2 py-0.5 rounded-full bg-[#E14D2A]/10 text-[#E14D2A]">
                              {getCollectionTools(user.id).length}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              navigate('/member')
                              setIsProfileOpen(false)
                            }}
                            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF8F5] dark:hover:bg-[#22242B] text-left text-[#1C1917] dark:text-[#F5F4F0] cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                              <span>Alat Favorit</span>
                            </div>
                            <span className="text-xs font-mono-code font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600">
                              {getFavoriteTools(user.id).length}
                            </span>
                          </button>

                          {user.role === 'admin' && (
                            <button
                              type="button"
                              onClick={() => {
                                navigate('/atelier-ops')
                                setIsProfileOpen(false)
                              }}
                              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF8F5] dark:hover:bg-[#22242B] text-left text-[#E14D2A] cursor-pointer transition-colors"
                            >
                              <div className="flex items-center gap-2.5">
                                <ShieldCheck className="w-4 h-4 text-[#E14D2A]" />
                                <span>Panel Pengelola</span>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-[#E14D2A]" />
                            </button>
                          )}
                        </div>

                        {/* Divider & Logout Button */}
                        <div className="pt-2 border-t border-[#EAE5DC] dark:border-[#272A33]">
                          <button
                            type="button"
                            onClick={handleLogoutWithConfirm}
                            className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs sm:text-sm cursor-pointer transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Keluar dari Akun (Logout)</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAuthOpen(true)}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold bg-[#E14D2A] hover:bg-[#C83B1B] text-white rounded-xl active:scale-[0.98] transition-all cursor-pointer shadow-sm shadow-[#E14D2A]/20"
                >
                  {t('nav.login')}
                </button>
              )}
            </div>
          </div>

        </header>
      )}

      {/* Mobile Bottom Navigation */}
      {!isAdminOps && (
        <nav className="xl:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[#EAE5DC] dark:border-[#272A33] bg-[#FAF8F5]/95 dark:bg-[#121316]/95 backdrop-blur-md">
          <div className="grid grid-cols-4 px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={() => handleMobileNavigate('/')}
              className={`flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-xl transition-colors cursor-pointer ${
                currentPath === '/' ? 'text-[#E14D2A]' : 'text-[#78716C] dark:text-[#A8A29E]'
              }`}
            >
              <House className="w-5 h-5" />
              <span className={`text-[11px] ${currentPath === '/' ? 'font-bold' : 'font-medium'}`}>
                {lang === 'id' ? 'Beranda' : 'Home'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleMobileNavigate('/tools')}
              className={`flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-xl transition-colors cursor-pointer ${
                currentPath === '/tools' || matchedToolId
                  ? 'text-[#E14D2A]'
                  : 'text-[#78716C] dark:text-[#A8A29E]'
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
              <span className={`text-[11px] ${currentPath === '/tools' || matchedToolId ? 'font-bold' : 'font-medium'}`}>
                {lang === 'id' ? 'Alat' : 'Tools'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleMobileNavigate('/qr')}
              className={`flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-xl transition-colors cursor-pointer ${
                currentPath === '/qr' ? 'text-[#E14D2A]' : 'text-[#78716C] dark:text-[#A8A29E]'
              }`}
            >
              <QrCode className="w-5 h-5" />
              <span className={`text-[11px] ${currentPath === '/qr' ? 'font-bold' : 'font-medium'}`}>
                QR Studio
              </span>
            </button>

            <button
              type="button"
              onClick={toggleMobileMenu}
              className={`flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-xl transition-colors cursor-pointer ${
                isMobileMenuOpen
                  ? 'text-[#E14D2A]'
                  : 'text-[#78716C] dark:text-[#A8A29E]'
              }`}
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <CloseIcon className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              <span className={`text-[11px] ${isMobileMenuOpen ? 'font-bold' : 'font-medium'}`}>
                Menu
              </span>
            </button>
          </div>
        </nav>
      )}

      {/* Mobile Menu Bottom Sheet */}
      {!isAdminOps && (
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                key="menu-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  setIsMobileMoreOpen(false)
                }}
                className="xl:hidden fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px]"
              />
              <motion.div
                key="menu-sheet"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 320, damping: 34 }}
                className="xl:hidden fixed bottom-0 inset-x-0 z-50 bg-[#FAF8F5] dark:bg-[#121316] border-t border-[#EAE5DC] dark:border-[#272A33] rounded-t-[2rem] shadow-2xl max-h-[88vh] overflow-y-auto overscroll-contain"
              >
                <div className="px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
                  <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#EAE5DC] dark:bg-[#272A33]" />

                  <div className="mb-4 flex items-center justify-between px-1">
                    <div>
                      <p className="text-lg font-extrabold tracking-tight text-[#1C1917] dark:text-[#F5F4F0]">
                        {lang === 'id' ? 'Menu' : 'Menu'}
                      </p>
                      <p className="text-xs text-[#78716C]">
                        {lang === 'id' ? 'Jelajahi Kitto' : 'Explore Kitto'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        setIsMobileMoreOpen(false)
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3EFEA] text-[#57534E] transition-colors hover:text-[#E14D2A] dark:bg-[#22242B] dark:text-[#A8A29E]"
                      aria-label="Close menu"
                    >
                      <CloseIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      setIsSearchOpen(true)
                    }}
                    className="mb-3 flex w-full items-center gap-3 rounded-2xl border border-[#EAE5DC] bg-white p-3 text-left text-sm text-[#78716C] transition-colors hover:border-[#E14D2A]/40 dark:border-[#272A33] dark:bg-[#1A1B20]"
                  >
                    <Search className="h-4 w-4 text-[#E14D2A]" />
                    <span className="flex-1">{lang === 'id' ? 'Cari alat...' : 'Search tools...'}</span>
                    <kbd className="rounded-md border border-[#EAE5DC] px-1.5 py-0.5 font-mono-code text-[10px] dark:border-[#272A33]">Ctrl K</kbd>
                  </button>

                  {!user && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        setIsAuthOpen(true)
                      }}
                      className="mb-3 flex w-full items-center justify-between rounded-2xl bg-[#E14D2A] p-4 text-left text-white"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                          <UserIcon className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-sm font-bold">{lang === 'id' ? 'Masuk / Daftar' : 'Sign In / Register'}</p>
                          <p className="text-[11px] text-white/70">
                            {lang === 'id' ? 'Simpan koleksi & QR dinamis' : 'Save collections & dynamic QR'}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-white/80" />
                    </button>
                  )}

                  {user && (
                    <div className="mb-3 flex items-center justify-between rounded-2xl border border-[#EAE5DC] bg-white p-3 dark:border-[#272A33] dark:bg-[#1A1B20]">
                      <div className="flex min-w-0 items-center gap-2.5 pr-2">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-tr from-[#E14D2A] to-[#D4A373] text-xs font-black uppercase text-white">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                          ) : (
                            user.name.charAt(0)
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-xs font-bold text-[#1C1917] dark:text-[#F5F4F0]">
                            {user.name}
                          </div>
                          <div className="truncate font-mono-code text-[10px] text-[#78716C]">
                            {user.email}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleLogoutWithConfirm}
                        className="shrink-0 px-2.5 py-1 text-xs font-bold text-rose-600 hover:underline dark:text-rose-400"
                      >
                        {lang === 'id' ? 'Keluar' : 'Logout'}
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    {mobileNavItems.map((item) => {
                      const Icon = item.icon
                      const isActive =
                        currentPath === item.path ||
                        (item.path === '/member' && currentPath === '/dashboard')
                      return (
                        <motion.button
                          key={item.path}
                          type="button"
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleMobileNavigate(item.path)}
                          className={`flex min-h-[94px] flex-col justify-between rounded-2xl border p-3.5 text-left transition-colors ${
                            isActive
                              ? 'border-[#E14D2A] bg-[#E14D2A] text-white'
                              : 'border-[#EAE5DC] bg-white text-[#1C1917] hover:border-[#E14D2A]/40 dark:border-[#272A33] dark:bg-[#1A1B20] dark:text-[#F5F4F0]'
                          }`}
                        >
                          <span
                            className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                              isActive
                                ? 'bg-white/15 text-white'
                                : 'bg-[#E14D2A]/10 text-[#E14D2A]'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="flex w-full items-center justify-between gap-2 pt-3">
                            <span className="text-sm font-semibold">{item.label}</span>
                            <ChevronRight
                              className={`h-3.5 w-3.5 shrink-0 ${
                                isActive ? 'text-white/70' : 'text-[#A8A29E]'
                              }`}
                            />
                          </span>
                        </motion.button>
                      )
                    })}

                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setIsMobileMoreOpen((prev) => !prev)}
                      className={`flex min-h-[94px] flex-col justify-between rounded-2xl border p-3.5 text-left transition-colors ${
                        isMobileMoreActive || isMobileMoreOpen
                          ? 'border-[#E14D2A] bg-[#E14D2A] text-white'
                          : 'border-[#EAE5DC] bg-white text-[#1C1917] hover:border-[#E14D2A]/40 dark:border-[#272A33] dark:bg-[#1A1B20] dark:text-[#F5F4F0]'
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                          isMobileMoreActive || isMobileMoreOpen
                            ? 'bg-white/15 text-white'
                            : 'bg-[#E14D2A]/10 text-[#E14D2A]'
                        }`}
                      >
                        <Ellipsis className="h-4 w-4" />
                      </span>
                      <span className="flex w-full items-center justify-between gap-2 pt-3">
                        <span className="text-sm font-semibold">{t('nav.more')}</span>
                        <ChevronDown
                          className={`h-3.5 w-3.5 shrink-0 transition-transform ${
                            isMobileMoreOpen
                              ? 'rotate-180 text-white/70'
                              : isMobileMoreActive
                                ? 'text-white/70'
                                : 'text-[#A8A29E]'
                          }`}
                        />
                      </span>
                    </motion.button>

                    <AnimatePresence initial={false}>
                      {isMobileMoreOpen && (
                        <motion.div
                          key="mobile-more"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="col-span-2 overflow-hidden"
                        >
                          <div className="mt-2 grid grid-cols-2 gap-1 rounded-2xl border border-[#EAE5DC] bg-white p-2 dark:border-[#272A33] dark:bg-[#1A1B20]">
                            {mobileLegalItems.map((item) => {
                              const Icon = item.icon
                              return (
                                <button
                                  key={item.path}
                                  type="button"
                                  onClick={() => handleMobileNavigate(item.path)}
                                  className="flex items-center gap-2 rounded-xl px-2.5 py-2.5 text-left text-xs text-[#57534E] transition-colors hover:bg-[#F3EFEA] hover:text-[#E14D2A] dark:text-[#A8A29E] dark:hover:bg-[#22242B] dark:hover:text-[#F5F4F0]"
                                >
                                  <Icon className="h-3.5 w-3.5 shrink-0" />
                                  <span>{item.label}</span>
                                </button>
                              )
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="mt-3">
                    <p className="px-1 text-xs font-semibold text-[#1C1917] dark:text-[#F5F4F0]">
                      {lang === 'id' ? 'Alat cepat' : 'Quick tools'}
                    </p>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {[
                        { id: 'qr', label: 'QR Studio', icon: QrCode },
                        { id: 'password', label: lang === 'id' ? 'Sandi' : 'Password', icon: Lock },
                        { id: 'invoice-gen', label: 'Invoice', icon: Bookmark },
                      ].map((tool) => {
                        const Icon = tool.icon
                        return (
                          <button
                            key={tool.id}
                            type="button"
                            onClick={() => handleMobileNavigate(`/${tool.id}`)}
                            className="flex items-center gap-2 rounded-xl border border-[#EAE5DC] bg-white px-2.5 py-2.5 text-left text-xs font-semibold text-[#57534E] transition-colors hover:border-[#E14D2A]/40 hover:text-[#E14D2A] dark:border-[#272A33] dark:bg-[#1A1B20] dark:text-[#A8A29E]"
                          >
                            <Icon className="h-3.5 w-3.5 shrink-0 text-[#E14D2A]" />
                            <span>{tool.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="mt-3 rounded-2xl border border-[#EAE5DC] bg-white p-3 dark:border-[#272A33] dark:bg-[#1A1B20]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-[#1C1917] dark:text-[#F5F4F0]">
                          {lang === 'id' ? 'Bahasa antarmuka' : 'Interface language'}
                        </p>
                        <p className="text-[11px] text-[#78716C]">ID / EN</p>
                      </div>
                      <div className="flex rounded-full bg-[#F3EFEA] p-1 dark:bg-[#22242B]">
                        {(['id', 'en'] as const).map((code) => (
                          <button
                            key={code}
                            type="button"
                            onClick={() => setLang(code)}
                            className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                              lang === code
                                ? 'bg-white text-[#E14D2A] shadow-sm dark:bg-[#1A1B20]'
                                : 'text-[#78716C]'
                            }`}
                          >
                            {code.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#EAE5DC] pt-3 dark:border-[#272A33]">
                      <div>
                        <p className="text-xs font-semibold text-[#1C1917] dark:text-[#F5F4F0]">
                          {lang === 'id' ? 'Tema tampilan' : 'Appearance'}
                        </p>
                        <p className="text-[11px] text-[#78716C]">
                          {isDark ? (lang === 'id' ? 'Mode gelap' : 'Dark mode') : (lang === 'id' ? 'Mode terang' : 'Light mode')}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsDark((prev) => !prev)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F3EFEA] text-[#57534E] transition-colors hover:text-[#E14D2A] dark:bg-[#22242B] dark:text-[#A8A29E]"
                        aria-label="Toggle theme"
                      >
                        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleMobileNavigate('/feedback')}
                    className="mt-3 flex w-full items-center justify-between rounded-2xl bg-[#1C1917] p-4 text-left text-white transition-colors hover:bg-[#2A2622] dark:bg-[#22242B] dark:hover:bg-[#2A2D36]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E14D2A]">
                        <MessageCircle className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold">
                          {lang === 'id' ? 'Punya ide alat baru?' : 'Have a tool idea?'}
                        </p>
                        <p className="text-[11px] text-white/60">
                          {lang === 'id' ? 'Kirim lewat Saran & Review' : 'Send it via Feedback'}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-white/70" />
                  </button>

                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}

      {/* Main Content Router */}
      <main className="w-full flex-1">
        <Suspense
          fallback={
            <div className="flex min-h-[50vh] items-center justify-center text-sm text-[#78716C]">
              {lang === 'id' ? 'Memuat halaman...' : 'Loading page...'}
            </div>
          }
        >
        {matchedToolId ? (
          <ToolDetailPage key={matchedToolId} toolId={matchedToolId} onOpenAuth={() => setIsAuthOpen(true)} />
        ) : (currentPath === '/member' || currentPath === '/dashboard') ? (
          user ? (
            <DashboardPage />
          ) : (
            <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#E14D2A]/10 text-[#E14D2A] flex items-center justify-center mx-auto shadow-xs">
                <Lock className="w-6 h-6 text-[#E14D2A]" />
              </div>
              <h2 className="text-xl font-semibold text-[#1C1917] dark:text-[#F5F4F0]">
                {lang === 'id' ? 'Member Area Khusus Pengguna Terdaftar' : 'Member Area Requires Account'}
              </h2>
              <p className="text-xs text-[#57534E] dark:text-[#A8A29E] leading-relaxed">
                {lang === 'id'
                  ? 'Sebagai tamu, Anda bebas menggunakan seluruh alat di Studio. Untuk memantau koleksi alat, Dynamic QR, dan analitik scan terpusat, silakan masuk ke akun Anda.'
                  : 'As a guest, you have full offline access to all tools in the Studio. To access your Member Area, saved tool collections, and scan analytics, please sign in.'}
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAuthOpen(true)}
                  className="px-5 py-2 text-xs font-semibold bg-[#E14D2A] hover:bg-[#C83B1B] text-white rounded-lg shadow-sm cursor-pointer"
                >
                  {t('nav.login')}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="px-4 py-2 text-xs font-medium border border-[#EAE5DC] dark:border-[#272A33] rounded-lg hover:bg-[#F3EFEA] dark:hover:bg-[#22242B] cursor-pointer"
                >
                  Kembali ke Beranda
                </button>
              </div>
            </div>
          )
        ) : currentPath === '/tools' ? (
          <ToolsPage
            activeToolId={activeToolId}
            onSelectTool={(id) => navigate(`/${id}`)}
          />
        ) : currentPath === '/changelog' ? (
          <ChangelogPage />
        ) : currentPath === '/about' ? (
          <AboutPage />
        ) : currentPath.startsWith('/blog/') ? (
          <BlogDetailPage key={currentPath} slug={currentPath.slice('/blog/'.length)} />
        ) : currentPath === '/blog' ? (
          <BlogPage />
        ) : currentPath === '/privacy' ? (
          <PrivacyPage />
        ) : currentPath === '/cookies' ? (
          <CookiePolicyPage />
        ) : currentPath === '/terms' ? (
          <TermsPage />
        ) : currentPath === '/feedback' ? (
          <FeedbackPage />
        ) : currentPath === '/atelier-ops' ? (
          <AtelierOpsPage />
        ) : (
          <>
            {/* Hero Section (Full Desktop Width) */}
            <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20 2xl:px-24">
              <HeroSection
                onOpenStudio={(t) => navigate(t === 'password' ? '/password' : '/qr')}
                onOpenTools={() => navigate('/tools')}
              />
            </div>

            {/* Complete Interactive Tool Catalog Hub */}
            <ToolCatalog
              onSelectTool={(id) => navigate(`/${id}`)}
              onRequestTool={() => navigate('/feedback')}
              activeToolId={activeToolId}
            />

            <ToolMarquee />

            {/* Studio / Interactive Workspace */}
            <section
              id="studio"
              className="py-16 sm:py-24 border-t border-[#EAE5DC] dark:border-[#272A33] bg-white dark:bg-[#1A1B20]"
            >
              <div className="max-w-7xl lg:max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
                <div className="flex flex-col items-center mb-10 text-center space-y-3">
                  <span className="text-sm font-semibold text-[#E14D2A]">02 / Studio langsung</span>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1C1917] dark:text-[#F5F4F0] tracking-tight">
                    {currentToolMeta.title}
                  </h2>
                  <p className="text-sm sm:text-base text-[#57534E] dark:text-[#A8A29E] max-w-lg leading-relaxed">
                    {currentToolMeta.description}
                  </p>

                  {/* Quick Switcher for Popular Tools */}
                  <div className="pt-4 flex flex-wrap items-center justify-center gap-2">
                    {[
                      { id: 'qr', label: 'QR Pro' },
                      { id: 'bulk-qr', label: 'Batch QR' },
                      { id: 'screenshot-beautifier', label: 'Percantik Screenshot' },
                      { id: 'password', label: 'Password Kuat' },
                      { id: 'invoice-gen', label: 'Invoice Vault' },
                      { id: 'tax-calculator', label: 'Pajak PPh 21' },
                      { id: 'word-counter', label: 'Hitung Kata' },
                      { id: 'file-to-pdf', label: 'Gambar ke PDF' },
                      { id: 'pdf-to-img', label: 'PDF ke Gambar' },
                      { id: 'image-compressor', label: 'Kompres Gambar' },
                    ].map((tool) => (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => navigate(`/${tool.id}`)}
                        className={`px-4 py-2 text-sm rounded-full transition-all cursor-pointer ${
                          activeToolId === tool.id
                            ? 'bg-[#E14D2A] text-white font-bold shadow-md shadow-[#E14D2A]/25'
                            : 'border border-[#EAE5DC] dark:border-[#272A33] text-[#57534E] dark:text-[#A8A29E] hover:text-[#E14D2A] dark:hover:text-[#F5F4F0] hover:bg-[#F3EFEA] dark:hover:bg-[#22242B] font-medium'
                        }`}
                      >
                        {tool.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Studio View with smooth Framer Motion transition */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeToolId}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Suspense
                      fallback={
                        <div className="flex min-h-[320px] items-center justify-center text-sm text-[#78716C]">
                          {lang === 'id' ? 'Memuat alat...' : 'Loading tool...'}
                        </div>
                      }
                    >
                    {/* QR Suite */}
                    {activeToolId === 'qr' && <QrGenerator />}
                    {activeToolId === 'bulk-qr' && <BulkQrGenerator />}

                    {/* Password Tool */}
                    {activeToolId === 'password' && <PasswordTool />}

                    {/* Dev Codec & UUID */}
                    {(activeToolId === 'dev' ||
                      activeToolId === 'uuid-v7' ||
                      activeToolId === 'json-format' ||
                      activeToolId === 'base64-codec') && <DevTools />}

                    {/* Visual Suite */}
                    {(activeToolId === 'screenshot-beautifier' ||
                      activeToolId === 'color-palette' ||
                      activeToolId === 'gradient-maker' ||
                      activeToolId === 'image-compressor' ||
                      activeToolId === 'image-resizer') && (
                      <VisualTools
                        initialTool={
                          activeToolId === 'color-palette'
                            ? 'palette'
                            : activeToolId === 'gradient-maker'
                            ? 'gradient'
                            : activeToolId === 'image-resizer'
                            ? 'resizer'
                            : activeToolId === 'image-compressor'
                            ? 'compress'
                            : 'screenshot'
                        }
                      />
                    )}

                    {/* Finance Suite */}
                    {(activeToolId === 'invoice-gen' ||
                      activeToolId === 'receipt-gen' ||
                      activeToolId === 'currency-converter' ||
                      activeToolId === 'loan-calculator' ||
                      activeToolId === 'tax-calculator') && (
                      <FinanceTools
                        initialTool={
                          activeToolId === 'receipt-gen'
                            ? 'receipt'
                            : activeToolId === 'currency-converter'
                            ? 'currency'
                            : activeToolId === 'tax-calculator'
                            ? 'tax'
                            : activeToolId === 'loan-calculator'
                            ? 'loan'
                            : 'invoice'
                        }
                      />
                    )}

                    {/* Document Suite */}
                    {(activeToolId === 'word-counter' ||
                      activeToolId === 'pdf-merger' ||
                      activeToolId === 'pdf-splitter' ||
                      activeToolId === 'pdf-compressor' ||
                      activeToolId === 'pdf-protect' ||
                      activeToolId === 'file-to-pdf' ||
                      activeToolId === 'pdf-to-img') && (
                      <DocAcademicTools initialTool={activeToolId} />
                    )}

                    {/* Lifestyle Suite */}
                    {(activeToolId === 'bill-split' ||
                      activeToolId === 'bmi-calc' ||
                      activeToolId === 'calorie-tracker' ||
                      activeToolId === 'habit-tracker' ||
                      activeToolId === 'greeting-card') && (
                      <LifestyleTools
                        initialTool={
                          activeToolId === 'bmi-calc'
                            ? 'bmi'
                            : activeToolId === 'calorie-tracker'
                            ? 'calorie-tracker'
                            : activeToolId === 'habit-tracker'
                            ? 'habit-tracker'
                            : activeToolId === 'greeting-card'
                            ? 'greeting-card'
                            : 'bill'
                        }
                      />
                    )}

                    {/* Dev Extra Suite */}
                    {(activeToolId === 'regex-tester' ||
                      activeToolId === 'code-snap' ||
                      activeToolId === 'whatsapp-link') && (
                      <DevExtraTools
                        initialTool={
                          activeToolId === 'code-snap'
                            ? 'codesnap'
                            : activeToolId === 'whatsapp-link'
                            ? 'whatsapp'
                            : 'regex'
                        }
                      />
                    )}
                    </Suspense>
                  </motion.div>
                </AnimatePresence>
              </div>
            </section>

            {/* Bento Features Section */}
            <BentoFeatures />

            {/* FAQ Accordion Section */}
            <FaqSection />
          </>
        )}
        </Suspense>
      </main>

      {/* Standard Modern Footer (Hidden only on Admin Console /atelier-ops) */}
      {!isAdminOps && (
        <footer className="border-t border-[#EAE5DC] dark:border-[#272A33] bg-[#F3EFEA] dark:bg-[#16171B] text-[#57534E] dark:text-[#A8A29E] transition-colors">
          <div className="max-w-7xl lg:max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 pt-16 pb-28 xl:pb-12">
            {/* Top Multi-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[#EAE5DC] dark:border-[#272A33]">
              {/* Column 1: Brand Info & Description (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="inline-block cursor-pointer group"
                >
                  {currentLogo ? (
                    <img
                      src={currentLogo}
                      alt="Kitto"
                      className="h-10 sm:h-12 max-w-[190px] sm:max-w-[220px] object-contain group-hover:scale-105 transition-transform"
                    />
                  ) : (
            <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 bg-[#E14D2A] rounded-xl flex items-center justify-center shadow-md shadow-[#E14D2A]/25 group-hover:scale-105 transition-transform">
                        <span className="text-base sm:text-lg font-black text-white font-mono-code leading-none">K</span>
                      </div>
                      <span className="font-extrabold text-2xl sm:text-3xl tracking-tight text-[#1C1917] dark:text-[#F5F4F0]">
                        Kitto
                      </span>
                    </div>
                  )}
                </button>

                <p className="text-sm sm:text-base text-[#78716C] leading-relaxed max-w-md">
                  {lang === 'id'
                    ? (settings.desc || 'Koleksi perangkat utilitas web presisi. Cepat dan ringan.')
                    : 'Precision suite of web utilities. Fast and lightweight.'}
                </p>
              </div>

              {/* Column 2: Utilitas Populer (3 cols) */}
              <div className="lg:col-span-3 space-y-3.5">
                <h4 className="text-xs sm:text-sm font-bold font-mono-code uppercase tracking-wider text-[#1C1917] dark:text-[#F5F4F0]">
                  {lang === 'id' ? 'Utilitas Populer' : 'Popular Tools'}
                </h4>
                <ul className="space-y-2.5 text-sm sm:text-base font-medium">
                  <li>
                    <button
                      type="button"
                      onClick={() => handleSelectTool('qr')}
                      className="hover:text-[#E14D2A] transition-colors cursor-pointer"
                    >
                      {lang === 'id' ? 'Generator QR Pro' : 'QR Pro Studio'}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => handleSelectTool('bulk-qr')}
                      className="hover:text-[#E14D2A] transition-colors cursor-pointer"
                    >
                      {lang === 'id' ? 'Batch QR Generator (Bulk)' : 'Batch QR Generator'}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => handleSelectTool('password')}
                      className="hover:text-[#E14D2A] transition-colors cursor-pointer"
                    >
                      {lang === 'id' ? 'Pembuat Sandi' : 'Password Generator'}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => handleSelectTool('invoice-gen')}
                      className="hover:text-[#E14D2A] transition-colors cursor-pointer"
                    >
                      {lang === 'id' ? 'Faktur & Invoice Vault' : 'Invoice Generator'}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => handleSelectTool('file-to-pdf')}
                      className="hover:text-[#E14D2A] transition-colors cursor-pointer"
                    >
                      {lang === 'id' ? 'Gambar ke PDF' : 'Image to PDF'}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => handleSelectTool('image-compressor')}
                      className="hover:text-[#E14D2A] transition-colors cursor-pointer"
                    >
                      {lang === 'id' ? 'Kompresi Gambar' : 'Image Compressor'}
                    </button>
                  </li>
                </ul>
              </div>

              {/* Column 3: Sumber Daya & Komunitas (2 cols) */}
              <div className="lg:col-span-2 space-y-3.5">
                <h4 className="text-xs sm:text-sm font-bold font-mono-code uppercase tracking-wider text-[#1C1917] dark:text-[#F5F4F0]">
                  {lang === 'id' ? 'Sumber Daya' : 'Resources'}
                </h4>
                <ul className="space-y-2.5 text-sm sm:text-base font-medium">
                  <li>
                    <button
                      type="button"
                      onClick={() => navigate('/tools')}
                      className="hover:text-[#E14D2A] transition-colors cursor-pointer font-semibold text-[#E14D2A]"
                    >
                      {lang === 'id' ? 'Katalog 26 Alat' : 'All 26 Tools Catalog'}
                    </button>
                  </li>
                  {user && (
                    <li>
                      <button
                        type="button"
                        onClick={() => navigate('/member')}
                        className="hover:text-[#E14D2A] transition-colors cursor-pointer"
                      >
                        Member Area
                      </button>
                    </li>
                  )}
                  <li>
                    <button
                      type="button"
                      onClick={() => navigate('/blog')}
                      className="hover:text-[#E14D2A] transition-colors cursor-pointer"
                    >
                      {lang === 'id' ? 'Blog & Panduan' : 'Blog & Guides'}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => navigate('/changelog')}
                      className="hover:text-[#E14D2A] transition-colors cursor-pointer"
                    >
                      {lang === 'id' ? 'Catatan Rilis' : 'Changelog'}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => navigate('/feedback')}
                      className="hover:text-[#E14D2A] transition-colors cursor-pointer"
                    >
                      {lang === 'id' ? 'Saran & Review' : 'Feedback & Review'}
                    </button>
                  </li>
                </ul>
              </div>

              {/* Column 4: Perusahaan & Kebijakan (2 cols) */}
              <div className="lg:col-span-2 space-y-3.5">
                <h4 className="text-xs sm:text-sm font-bold font-mono-code uppercase tracking-wider text-[#1C1917] dark:text-[#F5F4F0]">
                  {lang === 'id' ? 'Kebijakan' : 'Policy'}
                </h4>
                <ul className="space-y-2.5 text-sm sm:text-base font-medium">
                  <li>
                    <button
                      type="button"
                      onClick={() => navigate('/about')}
                      className="hover:text-[#E14D2A] transition-colors cursor-pointer"
                    >
                      {lang === 'id' ? 'Tentang Kitto' : 'About Kitto'}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => navigate('/privacy')}
                      className="hover:text-[#E14D2A] transition-colors cursor-pointer"
                    >
                      {lang === 'id' ? 'Kebijakan Privasi' : 'Privacy Policy'}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => navigate('/cookies')}
                      className="hover:text-[#E14D2A] transition-colors cursor-pointer"
                    >
                      {lang === 'id' ? 'Kebijakan Cookie' : 'Cookie Policy'}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => navigate('/terms')}
                      className="hover:text-[#E14D2A] transition-colors cursor-pointer"
                    >
                      {lang === 'id' ? 'Ketentuan Layanan' : 'Terms of Service'}
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Row: Copyright & Tags */}
            <div className="pt-8 sm:pt-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm font-mono-code text-[#78716C]">
              <div>
                &copy; {CURRENT_YEAR} Kitto. {lang === 'id' ? 'Hak cipta dilindungi undang-undang.' : 'All rights reserved.'}
              </div>
              <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-4 text-xs sm:text-sm">
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#E14D2A] transition-colors"
                >
                  {lang === 'id' ? 'Peta Situs (Sitemap)' : 'Sitemap'}
                </a>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => navigate('/privacy')}
                  className="hover:text-[#E14D2A] transition-colors cursor-pointer"
                >
                  {lang === 'id' ? 'Kebijakan Privasi' : 'Privacy Policy'}
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => navigate('/cookies')}
                  className="hover:text-[#E14D2A] transition-colors cursor-pointer"
                >
                  {lang === 'id' ? 'Kebijakan Cookie' : 'Cookie Policy'}
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => navigate('/terms')}
                  className="hover:text-[#E14D2A] transition-colors cursor-pointer"
                >
                  {lang === 'id' ? 'Ketentuan Layanan' : 'Terms'}
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => navigate('/feedback')}
                  className="hover:text-[#E14D2A] transition-colors cursor-pointer"
                >
                  {lang === 'id' ? 'Bantuan & Saran' : 'Help & Feedback'}
                </button>
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* Slide-over Drawers & Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTool={handleSelectTool}
      />

      {/* Global Floating Toast Alert Notification */}
      <ToastContainer />

      {/* Global Custom Confirmation Dialog */}
      <ConfirmDialog />

      {/* PWA Install Notification Prompt */}
      {!isAdminOps && <PwaInstallPrompt />}
    </div>
  )
}
