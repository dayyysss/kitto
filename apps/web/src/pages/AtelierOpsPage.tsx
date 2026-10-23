import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Plus,
  ArrowUpRight,
  Sparkles,
  Send,
  MoreHorizontal,
  Flame,
  Trash2,
  Save,
  Star,
  Image as ImageIcon,
  Globe,
  UploadCloud,
  RefreshCw,
  LogOut,
  Users,
  BookOpen,
  PackagePlus,
  MessageSquare,
  Settings,
  CheckSquare,
  Square,
  Shield,
  Bold,
  Italic,
  Heading2,
  List,
  ListOrdered,
  Link2,
  Quote,
  Code,
  Minus,
  Bug,
  Zap,
  X,
  Filter,
  ArrowUpDown,
  Eye,
  EyeOff,
  BarChart3,
  Activity,
  TrendingUp,
  Laptop,
  Smartphone,
  Tablet,
} from 'lucide-react'
import { useRouter } from '../lib/router'
import { useSiteSettings } from '../lib/settings'
import { useI18n } from '../lib/i18n'
import { useToast } from '../lib/toast'
import { useConfirm } from '../lib/confirm'
import { NumberTicker } from '../components/magicui/number-ticker'
import { CATEGORIES, TOOLS_DATA } from '../data/tools'

interface BlogPost {
  id: number
  title: string
  tag: string
  read_time: string
  summary: string
  keywords?: string
  cover_image?: string
  created_at: string
}

interface ReleaseNote {
  id: number
  title: string
  date: string
  badge?: string
  highlights: string
  changes?: Array<{ type: string; label: string; text: string }>
}

interface FeedbackItem {
  id: number
  type: string
  name: string
  role?: string
  rating?: number
  comment: string
  created_at: string
}

interface UserAccount {
  id: number
  name: string
  email: string
  role: string
  created_at: string
}

interface VisitorStats {
  totalViews: number
  todayViews: number
  last7Days: Array<{ date_label: string; views: number }>
  topPages: Array<{ path: string; views: number }>
  devices: Array<{ device: string; count: number }>
  browsers: Array<{ browser: string; count: number }>
  recentVisits: Array<{ path: string; device: string; browser: string; created_at: string }>
}

interface ToolUsageStats {
  totalUses: number
  todayUses: number
  uniqueTools: number
  last7Days: Array<{ date_label: string; uses: number }>
  tools: Array<{ tool_id: string; uses: number; last_used_at: string }>
  recent: Array<{ tool_id: string; created_at: string }>
}

export function AtelierOpsPage() {
  const { navigate } = useRouter()
  const { settings, setSettings } = useSiteSettings()
  const { lang, setLang } = useI18n()
  const { showToast } = useToast()
  const { ask } = useConfirm()

  // Administrator Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return typeof window !== 'undefined' && Boolean(sessionStorage.getItem('kitto_admin_token'))
  })
  const [adminEmail, setAdminEmail] = useState('admin@kitto.dev')
  const [adminPassword, setAdminPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [showAdminPassword, setShowAdminPassword] = useState(false)
  const [adminProfile, setAdminProfile] = useState<any>(() => {
    const saved = typeof window !== 'undefined' ? sessionStorage.getItem('kitto_admin_profile') : null
    return saved ? JSON.parse(saved) : null
  })

  // Active Admin Menu Tab (Mirroring Home, Healthy Menu, Calendar, Progress, AI Chat in reference)
  const [activeTab, setActiveTab] = useState<'overview' | 'visitors' | 'tools' | 'users' | 'blog' | 'releases' | 'feedback' | 'settings'>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Data Collections
  const [userList, setUserList] = useState<UserAccount[]>([])
  const [blogList, setBlogList] = useState<BlogPost[]>([])
  const [relList, setRelList] = useState<ReleaseNote[]>([])
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([])
  const [visitorStats, setVisitorStats] = useState<VisitorStats>({
    totalViews: 0,
    todayViews: 0,
    last7Days: [],
    topPages: [],
    devices: [],
    browsers: [],
    recentVisits: [],
  })
  const [toolUsageStats, setToolUsageStats] = useState<ToolUsageStats>({
    totalUses: 0,
    todayUses: 0,
    uniqueTools: 0,
    last7Days: [],
    tools: [],
    recent: [],
  })

  // Blog Form State
  const [blogTitle, setBlogTitle] = useState('')
  const [blogTag, setBlogTag] = useState('PANDUAN')
  const [blogReadTime, setBlogReadTime] = useState('4 min read')
  const [blogSummary, setBlogSummary] = useState('')
  const [blogContentText, setBlogContentText] = useState('')
  const [blogKeywords, setBlogKeywords] = useState('')
  const [blogCoverImage, setBlogCoverImage] = useState('')
  const [blogMsg, setBlogMsg] = useState('')

  // Release Form State
  const [relTitle, setRelTitle] = useState('')
  const [relDate, setRelDate] = useState('')
  const [relBadge, setRelBadge] = useState('TERBARU')
  const [relHighlights, setRelHighlights] = useState('')
  const [relChangesText, setRelChangesText] = useState('')
  const [relChangeType, setRelChangeType] = useState<'new' | 'fix' | 'improve' | 'remove'>('new')
  const [relVersion, setRelVersion] = useState('')
  const [relMsg, setRelMsg] = useState('')

  // User Management State
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set())
  const [userSortField, setUserSortField] = useState<'name' | 'email' | 'created_at'>('created_at')
  const [userSortDir, setUserSortDir] = useState<'asc' | 'desc'>('desc')
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'kreator' | 'admin'>('all')

  // Feedback State
  const [feedbackFilter, setFeedbackFilter] = useState<'all' | 'review' | 'idea' | 'bug'>('all')
  const [feedbackSort, setFeedbackSort] = useState<'newest' | 'oldest' | 'rating'>('newest')
  const [selectedFeedbacks, setSelectedFeedbacks] = useState<Set<number>>(new Set())

  // Settings & Branding State
  const [logoLight, setLogoLight] = useState('')
  const [logoDark, setLogoDark] = useState('')
  const [favicon, setFavicon] = useState('')
  const [ogImage, setOgImage] = useState('')

  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  const currentLogo = isDark
    ? (logoDark || settings.logoDark || logoLight || settings.logoLight)
    : (logoLight || settings.logoLight || logoDark || settings.logoDark)
  const [siteTitle, setSiteTitle] = useState('Kitto — Precision QR & Utilities')
  const [siteDesc, setSiteDesc] = useState(
    'Generator QR kustom vektor murni, kalkulator entropi sandi, dan 25+ perangkat utilitas presisi.'
  )
  const [siteKeywords, setSiteKeywords] = useState('kitto, qr vector, password generator, uuid, pph 21')
  const [siteAuthor, setSiteAuthor] = useState('Kitto Team')
  const [siteTwitter, setSiteTwitter] = useState('@kitto_dev')
  const [siteCanonical, setSiteCanonical] = useState('https://kitto.dev')
  const [settingsMsg, setSettingsMsg] = useState('')

  // Assistant prompt in column 3
  const [assistantPrompt, setAssistantPrompt] = useState('')
  const [assistantResponse, setAssistantResponse] = useState<string | null>(null)

  // Calendar dates reactive to current language
  const currentDate = useMemo(() => {
    const d = new Date()
    const locale = lang === 'id' ? 'id-ID' : 'en-US'
    return {
      dayDate: d.getDate(),
      dayName: d.toLocaleDateString(locale, { weekday: 'short' }),
      monthName: d.toLocaleDateString(locale, { month: 'long' }),
    }
  }, [lang])

  const weekDays = useMemo(() => {
    const today = new Date()
    const locale = lang === 'id' ? 'id-ID' : 'en-US'
    return [-3, -2, -1, 0, 1, 2, 3].map((offset) => {
      const d = new Date()
      d.setDate(today.getDate() + offset)
      return {
        name: d.toLocaleDateString(locale, { weekday: 'short' }),
        date: d.getDate(),
      }
    })
  }, [lang])

  const toolUsageRows = useMemo(() => {
    const byId = new Map(TOOLS_DATA.map((tool) => [tool.id, tool]))
    return toolUsageStats.tools.flatMap((row) => {
      const tool = byId.get(row.tool_id)
      return tool ? [{ ...row, tool }] : []
    })
  }, [toolUsageStats.tools])

  const usageByCategory = useMemo(() => {
    const totals = new Map<string, number>()
    toolUsageRows.forEach((row) => {
      totals.set(row.tool.category, (totals.get(row.tool.category) || 0) + row.uses)
    })
    return CATEGORIES.filter((category) => category.id !== 'all').map((category) => ({
      ...category,
      uses: totals.get(category.id) || 0,
    }))
  }, [toolUsageRows])

  const newTools = useMemo(() => {
    const totals = new Map(toolUsageRows.map((row) => [row.tool_id, row.uses]))
    return TOOLS_DATA.filter((tool) => tool.badge === 'BARU').map((tool) => ({
      tool,
      uses: totals.get(tool.id) || 0,
    }))
  }, [toolUsageRows])

  const allToolRows = useMemo(() => {
    const byId = new Map(toolUsageRows.map((row) => [row.tool_id, row]))
    return TOOLS_DATA.map((tool) => ({
      tool,
      uses: byId.get(tool.id)?.uses || 0,
      last_used_at: byId.get(tool.id)?.last_used_at || '',
    })).sort((a, b) => b.uses - a.uses)
  }, [toolUsageRows])

  const maxToolUses = Math.max(...toolUsageRows.map((row) => row.uses), 1)

  // Image file handler helper
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void, assetName: string) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      showToast('Ukuran Terlalu Besar', 'Ukuran berkas maksimal 2MB.', 'error')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setter(reader.result as string)
      showToast('Berkas Berhasil Dimuat', `${assetName} siap disimpan ke database.`, 'success')
    }
    reader.readAsDataURL(file)
  }

  const getAdminToken = () => {
    return typeof window !== 'undefined' ? sessionStorage.getItem('kitto_admin_token') : null
  }

  const adminFetch = async (url: string, init?: RequestInit) => {
    const token = getAdminToken()
    const headers = new Headers(init?.headers || {})
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    const res = await fetch(url, { ...init, headers })
    if (res.status === 401) {
      sessionStorage.removeItem('kitto_admin_token')
      sessionStorage.removeItem('kitto_admin_profile')
      setIsAuthenticated(false)
      setAdminProfile(null)
      showToast('Sesi Berakhir', 'Sesi administrator Anda telah kedaluwarsa. Silakan masuk kembali.', 'error')
    }
    return res
  }

  // Load All Data
  const loadAdminData = async () => {
    setIsLoading(true)
    try {
      const [uRes, bRes, rRes, fRes, sRes, vRes, tRes] = await Promise.all([
        adminFetch('/api/auth/users').then((r) => (r.ok ? r.json() : [])),
        fetch('/api/blog').then((r) => (r.ok ? r.json() : [])),
        fetch('/api/releases').then((r) => (r.ok ? r.json() : [])),
        fetch('/api/feedback').then((r) => (r.ok ? r.json() : [])),
        fetch('/api/settings').then((r) => (r.ok ? (r.json() as Promise<any>) : {})),
        adminFetch('/api/stats/overview').then((r) => (r.ok ? r.json() : null)),
        adminFetch('/api/stats/tools').then((r) => (r.ok ? r.json() : null)),
      ])

      if (Array.isArray(uRes)) setUserList(uRes)
      if (Array.isArray(bRes)) setBlogList(bRes)
      if (Array.isArray(rRes)) setRelList(rRes)
      if (Array.isArray(fRes)) setFeedbacks(fRes)
      if (vRes) setVisitorStats(vRes)
      if (tRes) setToolUsageStats(tRes)

      const s = sRes as any
      if (s) {
        if (s.title) setSiteTitle(s.title)
        if (s.desc) setSiteDesc(s.desc)
        if (s.keywords) setSiteKeywords(s.keywords)
        if (s.logoLight) setLogoLight(s.logoLight)
        if (s.logoDark) setLogoDark(s.logoDark)
        if (s.favicon) setFavicon(s.favicon)
        if (s.ogImage) setOgImage(s.ogImage)
        if (s.author) setSiteAuthor(s.author)
        if (s.twitterHandle) setSiteTwitter(s.twitterHandle)
        if (s.canonicalUrl) setSiteCanonical(s.canonicalUrl)
      }
    } catch (err) {
      console.warn('Admin load data notice:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!isAuthenticated) return

    // Verify token validity with backend on mount
    const token = getAdminToken()
    if (!token) {
      setIsAuthenticated(false)
      return
    }

    fetch('/api/auth/admin-verify', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) {
          sessionStorage.removeItem('kitto_admin_token')
          sessionStorage.removeItem('kitto_admin_profile')
          setIsAuthenticated(false)
          setAdminProfile(null)
          showToast('Sesi Kedaluwarsa', 'Silakan masuk kembali ke konsol admin.', 'info')
        } else {
          loadAdminData()
        }
      })
      .catch(() => {
        loadAdminData()
      })
  }, [isAuthenticated])

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setIsVerifying(true)
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      })
      const data = await res.json()
      if (res.ok && data.token) {
        sessionStorage.setItem('kitto_admin_token', data.token)
        sessionStorage.setItem('kitto_admin_profile', JSON.stringify(data.admin))
        setAdminProfile(data.admin)
        setIsAuthenticated(true)
        setAdminPassword('')
        showToast('Akses Diberikan', 'Selamat datang di Konsol Administrator Kitto.', 'success')
      } else {
        setAuthError(data.error || 'Kredensial administrator tidak valid.')
        showToast('Akses Ditolak', data.error || 'Email atau kata sandi admin salah.', 'error')
      }
    } catch {
      setAuthError('Gagal menghubungi server database.')
      showToast('Koneksi Gagal', 'Tidak dapat terhubung ke server database.', 'error')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('kitto_admin_token')
    sessionStorage.removeItem('kitto_admin_profile')
    setIsAuthenticated(false)
    setAdminProfile(null)
    showToast('Keluar', 'Konsol administrator berhasil dikunci.', 'info')
    navigate('/')
  }

  const handleDeleteUser = (id: number) => {
    ask({
      title: 'Hapus Akun Pengguna?',
      message: 'Akun pengguna ini akan dihapus secara permanen dari database.',
      confirmText: 'Ya, Hapus Pengguna',
      variant: 'danger',
      onConfirm: async () => {
        await adminFetch(`/api/auth/users/${id}`, { method: 'DELETE' })
        showToast('Pengguna Dihapus', 'Akun pengguna berhasil dihapus.', 'info')
        loadAdminData()
      },
    })
  }

  const handlePostBlog = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!blogTitle.trim() || !blogSummary.trim()) return
    setBlogMsg('Menyimpan...')

    const contentParagraphs = blogContentText
      .split('\n\n')
      .map((p) => p.trim())
      .filter(Boolean)

    try {
      const res = await adminFetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: blogTitle.trim(),
          tag: blogTag,
          readTime: blogReadTime,
          summary: blogSummary.trim(),
          content: contentParagraphs,
          keywords: blogKeywords.trim() || undefined,
          coverImage: blogCoverImage || undefined,
        }),
      })
      if (res.ok) {
        showToast('Artikel Diterbitkan!', `Artikel "${blogTitle}" berhasil dipublikasikan.`, 'success')
        setBlogTitle('')
        setBlogSummary('')
        setBlogContentText('')
        setBlogKeywords('')
        setBlogCoverImage('')
        loadAdminData()
        setTimeout(() => setBlogMsg(''), 2500)
      } else {
        showToast('Gagal Memposting', 'Terjadi kesalahan saat menyimpan artikel.', 'error')
      }
    } catch {
      showToast('Koneksi Gagal', 'Tidak dapat terhubung ke server API.', 'error')
    }
  }

  const handleDeleteBlog = (id: number) => {
    ask({
      title: 'Hapus Artikel Ini?',
      message: 'Artikel blog ini akan dihapus secara permanen dari database situs.',
      confirmText: 'Ya, Hapus Artikel',
      variant: 'danger',
      onConfirm: async () => {
        await adminFetch(`/api/blog/${id}`, { method: 'DELETE' })
        showToast('Artikel Dihapus', 'Artikel berhasil dihapus dari database.', 'info')
        loadAdminData()
      },
    })
  }

  const handlePostRelease = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!relTitle.trim()) return
    setRelMsg('Menyimpan...')

    const changeItems = relChangesText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((line) => {
        const typeMatch = line.match(/^\[(new|fix|improve|remove)\]\s*/i)
        if (typeMatch) {
          const t = typeMatch[1].toLowerCase()
          const labelMap: Record<string, string> = { new: 'BARU', fix: 'PERBAIKAN', improve: 'PENINGKATAN', remove: 'DIHAPUS' }
          return { type: t, label: labelMap[t] || 'BARU', text: line.slice(typeMatch[0].length) }
        }
        return { type: relChangeType, label: relChangeType === 'fix' ? 'PERBAIKAN' : relChangeType === 'improve' ? 'PENINGKATAN' : relChangeType === 'remove' ? 'DIHAPUS' : 'BARU', text: line }
      })

    try {
      const res = await adminFetch('/api/releases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: relVersion.trim() ? `${relVersion.trim()} — ${relTitle.trim()}` : relTitle.trim(),
          date: relDate.trim() || new Date().toLocaleDateString('id-ID'),
          badge: relBadge,
          highlights: relHighlights.trim(),
          changes: changeItems,
        }),
      })
      if (res.ok) {
        showToast('Rilis Diterbitkan!', `Catatan rilis "${relTitle}" berhasil disimpan.`, 'success')
        setRelTitle('')
        setRelHighlights('')
        setRelChangesText('')
        loadAdminData()
        setTimeout(() => setRelMsg(''), 2500)
      } else {
        showToast('Gagal Menyimpan', 'Terjadi kesalahan saat menyimpan rilis.', 'error')
      }
    } catch {
      showToast('Koneksi Gagal', 'Tidak dapat terhubung ke server API.', 'error')
    }
  }

  const handleDeleteRelease = (id: number) => {
    ask({
      title: 'Hapus Catatan Rilis Ini?',
      message: 'Catatan rilis ini akan dihapus dari changelog publik.',
      confirmText: 'Ya, Hapus Rilis',
      variant: 'danger',
      onConfirm: async () => {
        await adminFetch(`/api/releases/${id}`, { method: 'DELETE' })
        showToast('Rilis Dihapus', 'Catatan rilis berhasil dihapus.', 'info')
        loadAdminData()
      },
    })
  }

  const handleDeleteFeedback = (id: number) => {
    ask({
      title: 'Hapus Ulasan Ini?',
      message: 'Ulasan atau masukan pengguna ini akan dihapus permanen.',
      confirmText: 'Ya, Hapus Ulasan',
      variant: 'danger',
      onConfirm: async () => {
        await adminFetch(`/api/feedback/${id}`, { method: 'DELETE' })
        showToast('Ulasan Dihapus', 'Ulasan berhasil dihapus.', 'info')
        loadAdminData()
      },
    })
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSettingsMsg('Menyimpan setelan...')
    try {
      await Promise.all([
        adminFetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'title', value: siteTitle }),
        }),
        adminFetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'desc', value: siteDesc }),
        }),
        adminFetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'keywords', value: siteKeywords }),
        }),
        adminFetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'logoLight', value: logoLight }),
        }),
        adminFetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'logoDark', value: logoDark }),
        }),
        adminFetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'favicon', value: favicon }),
        }),
        adminFetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'ogImage', value: ogImage }),
        }),
        adminFetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'author', value: siteAuthor }),
        }),
        adminFetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'twitterHandle', value: siteTwitter }),
        }),
        adminFetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'canonicalUrl', value: siteCanonical }),
        }),
      ])

      setSettings({
        title: siteTitle,
        desc: siteDesc,
        keywords: siteKeywords,
        logoLight,
        logoDark,
        favicon,
        ogImage,
        author: siteAuthor,
        twitterHandle: siteTwitter,
        canonicalUrl: siteCanonical,
      })

      showToast('Setelan Berhasil Disimpan!', 'Logo, Favicon, dan metadata SEO berhasil diperbarui ke database.', 'success')
      setSettingsMsg('Berhasil diperbarui!')
      setTimeout(() => setSettingsMsg(''), 2500)
    } catch {
      showToast('Gagal Menyimpan', 'Terjadi kesalahan saat menyimpan setelan.', 'error')
    }
  }

  const handleAssistantSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!assistantPrompt.trim()) return
    const p = assistantPrompt.toLowerCase()
    if (p.includes('pengunjung') || p.includes('visitor') || p.includes('traffic') || p.includes('statistik')) {
      setActiveTab('visitors')
      setAssistantResponse('Membuka statistik pengunjung & analitik website...')
    } else if (p.includes('blog') || p.includes('artikel') || p.includes('tulis')) {
      setActiveTab('blog')
      setAssistantResponse('Membuka editor publikasi artikel blog...')
    } else if (p.includes('rilis') || p.includes('update') || p.includes('changelog')) {
      setActiveTab('releases')
      setAssistantResponse('Membuka editor catatan rilis...')
    } else if (p.includes('user') || p.includes('pengguna') || p.includes('akun')) {
      setActiveTab('users')
      setAssistantResponse('Membuka tabel manajemen pengguna...')
    } else if (p.includes('seo') || p.includes('logo') || p.includes('favicon')) {
      setActiveTab('settings')
      setAssistantResponse('Membuka setelan brand & upload logo/favicon...')
    } else {
      setAssistantResponse(`Perintah "${assistantPrompt}" diproses di konsol Kitto Ops.`)
    }
    setTimeout(() => setAssistantResponse(null), 3000)
    setAssistantPrompt('')
  }

  // Filtered users for search bar
  const filteredUsers = userList
    .filter(
      (u) =>
        (u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (userRoleFilter === 'all' || u.role === userRoleFilter)
    )
    .sort((a, b) => {
      const dir = userSortDir === 'asc' ? 1 : -1
      if (userSortField === 'name') return a.name.localeCompare(b.name) * dir
      if (userSortField === 'email') return a.email.localeCompare(b.email) * dir
      return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir
    })

  const filteredFeedbacks = feedbacks
    .filter((f) => feedbackFilter === 'all' || f.type === feedbackFilter)
    .sort((a, b) => {
      if (feedbackSort === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      if (feedbackSort === 'rating') return (b.rating || 0) - (a.rating || 0)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  const toggleUserSelect = (id: number) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAllUsers = () => {
    const nonAdmins = filteredUsers.filter((u) => u.role !== 'admin')
    if (selectedUsers.size >= nonAdmins.length) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(nonAdmins.map((u) => u.id)))
    }
  }

  const handleBulkDeleteUsers = () => {
    if (selectedUsers.size === 0) return
    ask({
      title: `Hapus ${selectedUsers.size} Pengguna?`,
      message: `${selectedUsers.size} akun pengguna yang dipilih akan dihapus secara permanen dari database.`,
      confirmText: `Ya, Hapus ${selectedUsers.size} Pengguna`,
      variant: 'danger',
      onConfirm: async () => {
        await adminFetch('/api/auth/users/bulk-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: Array.from(selectedUsers) }),
        })
        showToast('Pengguna Dihapus', `${selectedUsers.size} akun berhasil dihapus.`, 'info')
        setSelectedUsers(new Set())
        loadAdminData()
      },
    })
  }

  const handleChangeRole = async (userId: number, newRole: string) => {
    await adminFetch(`/api/auth/users/${userId}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })
    showToast('Peran Diubah', `Peran pengguna berhasil diubah ke ${newRole}.`, 'success')
    loadAdminData()
  }

  const toggleFeedbackSelect = (id: number) => {
    setSelectedFeedbacks((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleBulkDeleteFeedback = () => {
    if (selectedFeedbacks.size === 0) return
    ask({
      title: `Hapus ${selectedFeedbacks.size} Ulasan?`,
      message: `${selectedFeedbacks.size} ulasan yang dipilih akan dihapus permanen.`,
      confirmText: `Ya, Hapus ${selectedFeedbacks.size} Ulasan`,
      variant: 'danger',
      onConfirm: async () => {
        await Promise.all(
          Array.from(selectedFeedbacks).map((id) =>
            adminFetch(`/api/feedback/${id}`, { method: 'DELETE' })
          )
        )
        showToast('Ulasan Dihapus', `${selectedFeedbacks.size} ulasan berhasil dihapus.`, 'info')
        setSelectedFeedbacks(new Set())
        loadAdminData()
      },
    })
  }

  const insertAtCursor = useCallback((prefix: string, suffix = '') => {
    const el = document.getElementById('blog-editor') as HTMLTextAreaElement | null
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const text = el.value
    const selected = text.substring(start, end)
    const replacement = `${prefix}${selected || 'teks'}${suffix}`
    setBlogContentText(text.substring(0, start) + replacement + text.substring(end))
    setTimeout(() => {
      el.focus()
      el.selectionStart = start + prefix.length
      el.selectionEnd = start + prefix.length + (selected || 'teks').length
    }, 0)
  }, [])

  // Simple & Balanced Administrator Login Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#FAF8F5] dark:bg-[#121316] transition-colors">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-[440px] p-5 sm:p-9 bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-[28px] shadow-2xl space-y-5 sm:space-y-6 text-center"
        >
          {/* Logo Brand Resmi */}
          <div className="flex justify-center pb-1">
            {currentLogo ? (
              <img
                src={currentLogo}
                alt={siteTitle || 'Kitto'}
                className="h-11 sm:h-12 max-w-[200px] object-contain transition-transform hover:scale-105"
              />
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#E14D2A] text-white flex items-center justify-center font-bold font-mono-code text-base shadow-md shadow-[#E14D2A]/25">
                  K
                </div>
                <span className="font-extrabold text-2xl tracking-tight text-[#1C1917] dark:text-[#F5F4F0]">
                  Kitto
                </span>
              </div>
            )}
          </div>

          <div className="space-y-0.5">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#1C1917] dark:text-[#F5F4F0]">
              Portal Masuk Administrator
            </h1>
            <p className="text-xs text-[#78716C]">
              Hanya untuk pengelola resmi Kitto
            </p>
          </div>

          <form onSubmit={handleAdminAuth} className="space-y-3.5 text-xs text-left">
            <div className="space-y-1">
              <label className="block text-[#57534E] dark:text-[#A8A29E] font-semibold text-sm">
                Email Administrator
              </label>
              <input
                type="email"
                required
                autoFocus
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@kitto.dev"
                className="w-full px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm border border-[#EAE5DC] dark:border-[#272A33] rounded-xl bg-[#FAF8F5] dark:bg-[#121316] outline-none font-mono-code text-[#1C1917] dark:text-[#F5F4F0] focus:border-[#E14D2A] focus:ring-2 focus:ring-[#E14D2A]/20 transition-all placeholder:text-[#78716C]/60"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[#57534E] dark:text-[#A8A29E] font-semibold text-sm">
                Kata Sandi Administrator
              </label>
              <div className="relative">
                <input
                  type={showAdminPassword ? 'text' : 'password'}
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 sm:py-3 pr-10 text-xs sm:text-sm border border-[#EAE5DC] dark:border-[#272A33] rounded-xl bg-[#FAF8F5] dark:bg-[#121316] outline-none font-mono-code text-[#1C1917] dark:text-[#F5F4F0] focus:border-[#E14D2A] focus:ring-2 focus:ring-[#E14D2A]/20 transition-all placeholder:text-[#78716C]/60"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#1C1917] dark:hover:text-white p-0.5 cursor-pointer"
                >
                  {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="p-2.5 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/60 rounded-xl font-medium">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3 font-bold text-xs sm:text-sm bg-[#E14D2A] hover:bg-[#C83B1B] text-white rounded-xl active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-[#E14D2A]/20 mt-1"
            >
              {isVerifying ? 'Memverifikasi...' : 'Masuk Konsol Administrator'}
            </button>
          </form>

          <div className="pt-1 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-[#78716C] hover:text-[#E14D2A] hover:underline cursor-pointer font-medium"
            >
              &larr; {lang === 'id' ? 'Kembali ke Beranda' : 'Back to Home'}
            </button>
            <button
              type="button"
              onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
              title={lang === 'id' ? 'Ganti ke Bahasa Inggris' : 'Switch to Indonesian'}
              className="px-2 py-0.5 rounded-lg border border-[#EAE5DC] dark:border-[#272A33] font-mono-code font-bold uppercase text-xs text-[#57534E] dark:text-[#A8A29E] hover:border-[#E14D2A] cursor-pointer"
            >
              {lang}
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="w-full flex-1 flex flex-col bg-[#FAF8F5] dark:bg-[#121316] text-[#1C1917] dark:text-[#F5F4F0] transition-colors">
      {/* ========================================================= */}
      {/* TOP FULL-WIDTH STICKY ADMIN NAVBAR                        */}
      {/* ========================================================= */}
      <header className="w-full border-b border-[#EAE5DC] dark:border-[#272A33] bg-[#FAF8F5]/95 dark:bg-[#121316]/95 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3">
        <div className="w-full flex flex-wrap items-center justify-between gap-4">
          {/* Left: Brand Logo */}
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            {currentLogo ? (
              <img
                src={currentLogo}
                alt={siteTitle || 'Kitto'}
                className="h-9 sm:h-10 max-w-[160px] object-contain"
              />
            ) : (
              <>
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#E14D2A] rounded-xl flex items-center justify-center shadow-md shadow-[#E14D2A]/25 group-hover:scale-105 transition-transform">
                  <span className="text-base sm:text-lg font-black text-white font-mono-code leading-none">K</span>
                </div>
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-[#1C1917] dark:text-[#F5F4F0]">
                  Kitto
                </span>
              </>
            )}
          </button>

          {/* Middle: Integrated Admin Tabs as Capsule Pills */}
          <nav className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 p-1 bg-[#F3EFEA] dark:bg-[#1A1B20] rounded-2xl sm:rounded-full overflow-x-auto max-w-full">
            {[
              { id: 'overview', label: lang === 'id' ? 'Ringkasan' : 'Overview' },
              { id: 'visitors', label: `${lang === 'id' ? 'Pengunjung' : 'Visitors'} (${visitorStats.totalViews})` },
              { id: 'tools', label: `${lang === 'id' ? 'Alat' : 'Tools'} (${toolUsageStats.totalUses})` },
              { id: 'users', label: `${lang === 'id' ? 'Pengguna' : 'Users'} (${userList.length})` },
              { id: 'blog', label: `${lang === 'id' ? 'Artikel' : 'Articles'} (${blogList.length})` },
              { id: 'releases', label: `${lang === 'id' ? 'Rilis' : 'Releases'} (${relList.length})` },
              { id: 'feedback', label: `${lang === 'id' ? 'Saran' : 'Feedback'} (${feedbacks.length})` },
              { id: 'settings', label: 'Branding' },
            ].map((m) => {
              const isActive = activeTab === m.id
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setActiveTab(m.id as any)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#E14D2A] text-white shadow-sm shadow-[#E14D2A]/20'
                      : 'text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              )
            })}
          </nav>

          {/* Right: Search, Language Switcher, Quick +, and Admin Profile Pill */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto sm:ml-0">
            {/* Search Input Pill */}
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-3 text-[#78716C] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'id' ? 'Cari di konsol...' : 'Search console...'}
                className="pl-8 pr-3 py-1.5 w-32 sm:w-44 text-xs rounded-full bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] text-[#1C1917] dark:text-[#F5F4F0] placeholder-[#78716C] outline-none focus:border-[#E14D2A] transition-colors"
              />
            </div>

            {/* Language Switcher */}
            <button
              type="button"
              onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
              aria-label="Ganti bahasa"
              title={lang === 'id' ? 'Ubah ke Bahasa Inggris (EN)' : 'Switch to Indonesian (ID)'}
              className="px-2.5 py-1 text-xs font-mono-code font-bold uppercase rounded-full bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] text-[#1C1917] dark:text-[#F5F4F0] hover:border-[#E14D2A] transition-colors cursor-pointer shadow-xs"
            >
              {lang}
            </button>

            {/* Quick Action (+) Button -> Jumps to create blog */}
            <button
              type="button"
              onClick={() => setActiveTab('blog')}
              title={lang === 'id' ? 'Tulis Artikel Blog Baru' : 'Write New Blog Article'}
              className="w-8 h-8 rounded-full bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] text-[#1C1917] dark:text-[#F5F4F0] flex items-center justify-center hover:bg-[#E14D2A] hover:text-white hover:border-[#E14D2A] transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Admin Profile Pill with Instant Lock / Logout */}
            <div className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-full bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] shadow-xs">
              <div className="w-7 h-7 rounded-full bg-[#E14D2A] text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                {(adminProfile?.name || 'A').charAt(0)}
              </div>
              <div className="text-left hidden sm:block pr-1">
                <div className="text-xs font-bold text-[#1C1917] dark:text-[#F5F4F0] leading-tight">
                  {adminProfile?.name || 'Administrator'}
                </div>
                <div className="text-[10px] text-[#E14D2A] font-semibold leading-none">
                  {adminProfile?.email || 'Master Ops'}
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                title="Kunci & Keluar dari Konsol Admin"
                className="p-1 text-[#78716C] hover:text-rose-600 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

        {/* ========================================================= */}
        {/* MAIN ADMIN DASHBOARD BODY (Full Width, Standard Admin)     */}
        {/* ========================================================= */}
        <div className="w-full flex-1 px-4 sm:px-8 py-6 space-y-6 sm:space-y-8">
          {/* ========================================================= */}
          {/* WELCOME GREETING & DATE BAR                                */}
          {/* ========================================================= */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
          <div>
            <div className="text-xs font-mono-code text-[#78716C]">
              {lang === 'id' ? 'Pusat Manajemen Kitto' : "Let's Manage today."}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1917] dark:text-[#F5F4F0] tracking-tight flex items-center gap-2 mt-0.5">
              <span>{lang === 'id' ? 'Selamat Datang Kembali, Administrator Kitto' : 'Welcome Back, Administrator Kitto'}</span>
              <Sparkles className="w-5 h-5 text-[#E14D2A]" />
            </h1>
          </div>

          {/* Right: Date Badge & Action Pill */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] px-3.5 py-1.5 rounded-2xl shadow-xs">
              <div className="w-8 h-8 rounded-full bg-[#FAF8F5] dark:bg-[#121316] text-[#1C1917] dark:text-[#F5F4F0] font-bold font-mono-code text-sm flex items-center justify-center border border-[#EAE5DC] dark:border-[#272A33]">
                {currentDate.dayDate}
              </div>
              <div className="text-xs leading-tight">
                <div className="font-semibold text-[#1C1917] dark:text-[#F5F4F0]">{currentDate.dayName},</div>
                <div className="text-[#78716C]">{currentDate.monthName}</div>
              </div>
            </div>

            {/* Primary Action Button (Coral Pill) */}
            <button
              type="button"
              onClick={() => setActiveTab('blog')}
              className="px-5 py-2.5 rounded-full bg-[#E14D2A] hover:bg-[#C83B1B] text-white text-xs font-semibold shadow-md shadow-[#E14D2A]/25 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
            >
              <span>{lang === 'id' ? 'Publikasikan Konten' : 'Publish Content'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={loadAdminData}
              title={lang === 'id' ? 'Segarkan Data' : 'Refresh Data'}
              className="w-9 h-9 rounded-2xl bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] text-[#57534E] dark:text-[#A8A29E] flex items-center justify-center hover:bg-[#F3EFEA] dark:hover:bg-[#22242B] transition-colors cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TOP 5 STATS CARDS ROW (1 Coral Hero + 4 Neutral Cards)    */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1: Coral Hero Card (Total Kunjungan Web) */}
          <div
            onClick={() => setActiveTab('visitors')}
            className="bg-[#E14D2A] text-white rounded-[22px] p-5 shadow-md shadow-[#E14D2A]/20 relative overflow-hidden flex flex-col justify-between min-h-[120px] cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <div className="flex items-center justify-between z-10">
              <span className="text-xs font-medium opacity-90">{lang === 'id' ? 'Kunjungan Website' : 'Website Visitors'}</span>
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <Eye className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="flex items-end justify-between z-10 mt-3">
              <div>
                <div className="text-3xl font-extrabold font-mono-code leading-none">
                  <NumberTicker value={visitorStats.totalViews} />
                  <span className="text-sm font-normal ml-1">views</span>
                </div>
                <div className="text-[10px] text-white/80 font-mono-code mt-1">
                  +{visitorStats.todayViews} {lang === 'id' ? 'hari ini' : 'today'}
                </div>
              </div>

              {/* Decorative mini wave SVG */}
              <svg className="w-16 h-8 opacity-80" viewBox="0 0 100 40" fill="none">
                <path
                  d="M0 25 C20 10, 40 35, 60 15 C80 -5, 90 20, 100 15"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Card 2: Total Pengguna Terdaftar */}
          <div
            onClick={() => setActiveTab('users')}
            className="bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-[22px] p-5 shadow-xs flex flex-col justify-between min-h-[120px] cursor-pointer hover:border-[#E14D2A] transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#78716C]">{lang === 'id' ? 'Pengguna Akun' : 'User Accounts'}</span>
              <span className="w-6 h-6 rounded-full bg-[#FAF8F5] dark:bg-[#121316] text-[#78716C] flex items-center justify-center border border-[#EAE5DC] dark:border-[#272A33]">
                <Users className="w-3 h-3" />
              </span>
            </div>

            <div className="flex items-end justify-between mt-3">
              <div className="text-3xl font-extrabold font-mono-code text-[#1C1917] dark:text-[#F5F4F0] leading-none">
                <NumberTicker value={userList.length} />
                <span className="text-sm font-normal text-[#78716C] ml-1">{lang === 'id' ? 'akun' : 'users'}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Neutral Card with Mini Bar Sparklines (Total Artikel Blog) */}
          <div className="bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-[22px] p-5 shadow-xs flex flex-col justify-between min-h-[120px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#78716C]">{lang === 'id' ? 'Artikel Blog Diterbitkan' : 'Blog Articles Published'}</span>
              <span className="w-6 h-6 rounded-full bg-[#FAF8F5] dark:bg-[#121316] text-[#78716C] flex items-center justify-center border border-[#EAE5DC] dark:border-[#272A33]">
                <BookOpen className="w-3 h-3" />
              </span>
            </div>

            <div className="flex items-end justify-between mt-3">
              <div className="text-3xl font-extrabold font-mono-code text-[#1C1917] dark:text-[#F5F4F0] leading-none">
                <NumberTicker value={blogList.length} />
                <span className="text-sm font-normal text-[#78716C] ml-1">{lang === 'id' ? 'pos' : 'posts'}</span>
              </div>

              <div className="flex items-end gap-1 h-7">
                {[35, 70, 45, 95, 60, 80, 50].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}%` }}
                    className="w-1.5 rounded-full bg-[#E14D2A] opacity-80"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Card 4: Neutral Card with Status Indicators (Catatan Rilis) */}
          <div className="bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-[22px] p-5 shadow-xs flex flex-col justify-between min-h-[120px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#78716C]">{lang === 'id' ? 'Catatan Rilis / Changelog' : 'Release Notes / Changelog'}</span>
              <span className="w-6 h-6 rounded-full bg-[#FAF8F5] dark:bg-[#121316] text-[#78716C] flex items-center justify-center border border-[#EAE5DC] dark:border-[#272A33]">
                <PackagePlus className="w-3 h-3" />
              </span>
            </div>

            <div className="flex items-end justify-between mt-3">
              <div className="text-3xl font-extrabold font-mono-code text-[#1C1917] dark:text-[#F5F4F0] leading-none">
                <NumberTicker value={relList.length} />
                <span className="text-sm font-normal text-[#78716C] ml-1">{lang === 'id' ? 'rilis' : 'releases'}</span>
              </div>

              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <span
                    key={i}
                    className={`w-1.5 h-3.5 rounded-full ${
                      i <= Math.min(6, relList.length) ? 'bg-emerald-500' : 'bg-[#EAE5DC] dark:bg-[#272A33]'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Card 5: Neutral Card with Soft Wave (Ulasan & Saran) */}
          <div className="bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-[22px] p-5 shadow-xs flex flex-col justify-between min-h-[120px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#78716C]">{lang === 'id' ? 'Ulasan & Ide Komunitas' : 'Reviews & Suggestions'}</span>
              <span className="w-6 h-6 rounded-full bg-[#FAF8F5] dark:bg-[#121316] text-[#78716C] flex items-center justify-center border border-[#EAE5DC] dark:border-[#272A33]">
                <MessageSquare className="w-3 h-3" />
              </span>
            </div>

            <div className="flex items-end justify-between mt-3">
              <div className="text-3xl font-extrabold font-mono-code text-[#1C1917] dark:text-[#F5F4F0] leading-none">
                <NumberTicker value={feedbacks.length} />
                <span className="text-sm font-normal text-[#78716C] ml-1">{lang === 'id' ? 'ulasan' : 'reviews'}</span>
              </div>

              <svg className="w-16 h-6 text-[#D4A373] opacity-60" viewBox="0 0 100 40" fill="currentColor">
                <path d="M0 25 C30 15, 70 35, 100 20 L100 40 L0 40 Z" />
              </svg>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MAIN 3-COLUMN BENTO GRID (Visible on 'overview')          */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            
            {/* COLUMN 1 (LEFT 4-cols): Quick Actions & User Roster */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-[24px] p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-1">
                  <h3 className="text-xs font-bold text-[#1C1917] dark:text-[#F5F4F0] uppercase tracking-wider">
                    {lang === 'id' ? 'Aksi Cepat Admin' : 'Quick Admin Actions'}
                  </h3>
                  <MoreHorizontal className="w-4 h-4 text-[#78716C]" />
                </div>

                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveTab('blog')}
                    className="p-2.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] flex flex-col items-center justify-center hover:border-[#E14D2A] transition-colors cursor-pointer group"
                  >
                    <BookOpen className="w-4 h-4 text-[#E14D2A] group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-semibold text-[#1C1917] dark:text-[#F5F4F0] mt-1">{lang === 'id' ? '+ Artikel' : '+ Article'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('releases')}
                    className="p-2.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] flex flex-col items-center justify-center hover:border-[#E14D2A] transition-colors cursor-pointer group"
                  >
                    <PackagePlus className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-semibold text-[#1C1917] dark:text-[#F5F4F0] mt-1">{lang === 'id' ? '+ Rilis' : '+ Release'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('visitors')}
                    className="p-2.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] flex flex-col items-center justify-center hover:border-[#E14D2A] transition-colors cursor-pointer group"
                  >
                    <Eye className="w-4 h-4 text-sky-600 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-semibold text-[#1C1917] dark:text-[#F5F4F0] mt-1">{lang === 'id' ? 'Trafik' : 'Traffic'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('settings')}
                    className="p-2.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] flex flex-col items-center justify-center hover:border-[#E14D2A] transition-colors cursor-pointer group"
                  >
                    <Settings className="w-4 h-4 text-[#D4A373] group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-semibold text-[#1C1917] dark:text-[#F5F4F0] mt-1">Branding</span>
                  </button>
                </div>

                {/* Activity Dots Bar */}
                <div className="p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono-code">
                    <div className="flex items-center gap-1.5 text-[#57534E] dark:text-[#A8A29E]">
                      <Flame className="w-3.5 h-3.5 text-[#E14D2A]" />
                      <span>{lang === 'id' ? 'Ulasan Masuk' : 'Feedback Received'}</span>
                    </div>
                    <span className="font-bold text-[#1C1917] dark:text-[#F5F4F0]">{feedbacks.length} {lang === 'id' ? 'Feedback' : 'Feedback'}</span>
                  </div>
                  <div className="flex justify-between items-center gap-1 pt-1">
                    {Array.from({ length: 18 }).map((_, idx) => (
                      <span
                        key={idx}
                        className={`h-2 w-2 rounded-full ${
                          idx < Math.min(18, feedbacks.length + 3)
                            ? 'bg-[#E14D2A]'
                            : 'bg-[#EAE5DC] dark:bg-[#272A33]'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Box 2: Recent Registered Users Preview */}
              <div className="bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-[24px] p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <h3 className="text-xs font-bold text-[#1C1917] dark:text-[#F5F4F0] uppercase tracking-wider">
                    {lang === 'id' ? 'Pengguna Terkini' : 'Recent Users'} ({userList.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('users')}
                    className="text-[10px] font-mono-code text-[#E14D2A] hover:underline"
                  >
                    {lang === 'id' ? 'Lihat Semua →' : 'View All →'}
                  </button>
                </div>

                {userList.slice(0, 3).map((usr) => (
                  <div
                    key={usr.id}
                    className="p-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-8 h-8 rounded-full bg-[#E14D2A]/10 text-[#E14D2A] flex items-center justify-center font-bold font-mono-code shrink-0">
                        {usr.name.charAt(0)}
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-[#1C1917] dark:text-[#F5F4F0] truncate">
                          {usr.name}
                        </div>
                        <div className="text-[10px] font-mono-code text-[#78716C] truncate max-w-[140px]">
                          {usr.email}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-mono-code font-bold uppercase px-2 py-0.5 rounded-full ${
                        usr.role === 'admin'
                          ? 'bg-[#E14D2A]/10 text-[#E14D2A]'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {usr.role}
                    </span>
                  </div>
                ))}
              </div>

              {/* Box 3: Covert Security Reminder */}
              <div className="bg-[#FAF8F5] dark:bg-[#16171D] border border-[#EAE5DC] dark:border-[#272A33] rounded-[24px] p-5 relative overflow-hidden flex items-center justify-between shadow-xs">
                <div>
                  <h4 className="text-sm font-bold text-[#1C1917] dark:text-[#F5F4F0] leading-snug">
                    {lang === 'id' ? 'Pusat Kendali Operasi Kitto' : 'Kitto Operations Control'}
                  </h4>
                  <p className="text-xs text-[#78716C] mt-1 max-w-[190px]">
                    {lang === 'id' ? 'Sesi aman konsol. Terhubung langsung ke tabel database terenkripsi.' : 'Secure console session. Connected directly to encrypted database tables.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('settings')}
                  className="w-9 h-9 rounded-full bg-[#E14D2A] text-white flex items-center justify-center hover:scale-105 transition-transform cursor-pointer shadow-sm"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* COLUMN 2 (CENTER 5-cols): Calendar & Circular Donut Distribution */}
            <div className="lg:col-span-5 bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-[28px] p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#1C1917] dark:text-[#F5F4F0]">
                    {lang === 'id' ? 'Statistik & Distribusi Konten' : 'Content Stats & Distribution'}
                  </h3>
                  <p className="text-xs text-[#78716C]">{lang === 'id' ? 'Rasio pembaruan seluruh entitas data' : 'Update distribution across all data entities'}</p>
                </div>
                <MoreHorizontal className="w-4 h-4 text-[#78716C]" />
              </div>

              {/* Calendar strip */}
              <div className="flex items-center justify-between gap-1 p-2 bg-[#FAF8F5] dark:bg-[#121316] rounded-2xl border border-[#EAE5DC] dark:border-[#272A33]">
                {weekDays.map((d, i) => {
                  const isToday = i === 3
                  return (
                    <div
                      key={i}
                      className={`flex-1 flex flex-col items-center py-1.5 rounded-xl transition-all ${
                        isToday
                          ? 'bg-[#E14D2A] text-white shadow-sm'
                          : 'text-[#57534E] dark:text-[#A8A29E]'
                      }`}
                    >
                      <span className="text-[10px] font-mono-code uppercase font-medium">{d.name}</span>
                      <span className="text-xs font-bold font-mono-code mt-0.5">{d.date}</span>
                    </div>
                  )
                })}
              </div>

              {/* Circular Donut Gauge Progress Chart */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2">
                <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-[#EAE5DC] dark:text-[#272A33]"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#E14D2A"
                      strokeWidth="8"
                      strokeDasharray="251.2"
                      strokeDashoffset="120"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#D4A373"
                      strokeWidth="8"
                      strokeDasharray="251.2"
                      strokeDashoffset="180"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#10B981"
                      strokeWidth="8"
                      strokeDasharray="251.2"
                      strokeDashoffset="220"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>

                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-mono-code font-bold px-2 py-0.5 rounded-full bg-[#E14D2A] text-white">
                      {lang === 'id' ? 'Aktif' : 'Active'}
                    </span>
                    <div className="text-2xl font-extrabold font-mono-code text-[#1C1917] dark:text-[#F5F4F0] mt-1">
                      {userList.length + blogList.length + relList.length}
                    </div>
                    <span className="text-[10px] text-[#78716C]">{lang === 'id' ? 'Total Entitas' : 'Total Entities'}</span>
                  </div>
                </div>

                {/* Progress bars list */}
                <div className="flex-1 w-full space-y-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between font-mono-code text-xs">
                      <span className="text-[#57534E] dark:text-[#A8A29E]">{lang === 'id' ? 'Pengguna Terdaftar' : 'Registered Users'}</span>
                      <span className="font-bold text-[#E14D2A]">{userList.length} {lang === 'id' ? 'user' : 'users'}</span>
                    </div>
                    <div className="w-full bg-[#FAF8F5] dark:bg-[#121316] h-2 rounded-full overflow-hidden border border-[#EAE5DC] dark:border-[#272A33]">
                      <div
                        className="bg-[#E14D2A] h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, userList.length * 15)}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-mono-code text-xs">
                      <span className="text-[#57534E] dark:text-[#A8A29E]">{lang === 'id' ? 'Artikel Blog' : 'Blog Articles'}</span>
                      <span className="font-bold text-emerald-600">{blogList.length} {lang === 'id' ? 'artikel' : 'articles'}</span>
                    </div>
                    <div className="w-full bg-[#FAF8F5] dark:bg-[#121316] h-2 rounded-full overflow-hidden border border-[#EAE5DC] dark:border-[#272A33]">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, blogList.length * 20)}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-mono-code text-xs">
                      <span className="text-[#57534E] dark:text-[#A8A29E]">{lang === 'id' ? 'Catatan Rilis' : 'Release Notes'}</span>
                      <span className="font-bold text-[#D4A373]">{relList.length} {lang === 'id' ? 'rilis' : 'releases'}</span>
                    </div>
                    <div className="w-full bg-[#FAF8F5] dark:bg-[#121316] h-2 rounded-full overflow-hidden border border-[#EAE5DC] dark:border-[#272A33]">
                      <div
                        className="bg-[#D4A373] h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, relList.length * 25)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Summary Bar */}
              <div className="pt-4 border-t border-[#EAE5DC] dark:border-[#272A33] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-[#78716C] uppercase font-mono-code">{lang === 'id' ? 'Status Sinkronisasi' : 'Sync Status'}</span>
                  <div className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>{lang === 'id' ? 'Tersambung Real-Time' : 'Connected Real-Time'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#78716C] uppercase font-mono-code">{lang === 'id' ? 'Total Feedback' : 'Total Feedback'}</span>
                  <div className="text-base font-bold font-mono-code text-[#E14D2A]">
                    {feedbacks.length} {lang === 'id' ? 'masukan' : 'items'}
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 3 (RIGHT 3-cols): Admin AI Assistant & Recent Feedback Feed */}
            <div className="lg:col-span-3 space-y-4">
              {/* Studio AI Assistant with Glossy 3D Coral Sphere */}
              <div className="bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-[24px] p-5 shadow-xs space-y-4 text-center">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1C1917] dark:text-[#F5F4F0] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#E14D2A]" />
                    <span>{lang === 'id' ? 'Asisten Admin' : 'Admin Assistant'}</span>
                  </span>
                  <MoreHorizontal className="w-4 h-4 text-[#78716C]" />
                </div>

                {/* Floating 3D Glossy Coral Sphere (Mirroring screenshot) */}
                <div className="py-2 flex justify-center">
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                    className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#C83B1B] via-[#E14D2A] to-[#F59E0B] shadow-[0_12px_30px_rgba(225,77,42,0.35)] relative flex items-center justify-center overflow-hidden"
                  >
                    <div className="w-8 h-8 rounded-full bg-white/30 blur-xs absolute -top-1 left-3" />
                    <div className="w-14 h-14 rounded-full border border-white/20" />
                  </motion.div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[#1C1917] dark:text-[#F5F4F0]">
                    {lang === 'id' ? 'Pusat Operasional' : 'Operations Center'}
                  </h4>
                  <p className="text-xs text-[#78716C] mt-0.5">
                    {lang === 'id' ? 'Ketik perintah atau pilih tab di atas' : 'Type a command or pick a tab above'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 justify-center text-[10px]">
                  <button
                    type="button"
                    onClick={() => setActiveTab('blog')}
                    className="px-2.5 py-1 rounded-full bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] text-[#57534E] dark:text-[#A8A29E] hover:border-[#E14D2A]"
                  >
                    {lang === 'id' ? '+ Artikel Blog' : '+ Blog Article'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('settings')}
                    className="px-2.5 py-1 rounded-full bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] text-[#57534E] dark:text-[#A8A29E] hover:border-[#E14D2A]"
                  >
                    {lang === 'id' ? 'Upload Logo/SEO' : 'Upload Logo/SEO'}
                  </button>
                </div>

                <form onSubmit={handleAssistantSubmit} className="relative flex items-center">
                  <input
                    type="text"
                    value={assistantPrompt}
                    onChange={(e) => setAssistantPrompt(e.target.value)}
                    placeholder={lang === 'id' ? 'Buka blog / rilis / branding...' : 'Open blog / releases / branding...'}
                    className="w-full pl-3 pr-9 py-2 text-xs rounded-full bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] outline-none text-[#1C1917] dark:text-[#F5F4F0] placeholder-[#78716C]"
                  />
                  <button
                    type="submit"
                    className="w-6 h-6 rounded-full bg-[#E14D2A] text-white flex items-center justify-center absolute right-1.5 hover:bg-[#C83B1B] cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                  </button>
                </form>

                {assistantResponse && (
                  <div className="p-2 rounded-xl text-xs bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {assistantResponse}
                  </div>
                )}
              </div>

              {/* Box 2: Recent Feedbacks */}
              <div className="bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-[24px] p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <h3 className="text-xs font-bold text-[#1C1917] dark:text-[#F5F4F0] uppercase tracking-wider">
                    {lang === 'id' ? 'Ulasan & Saran' : 'Reviews & Feedback'} ({feedbacks.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('feedback')}
                    className="text-[#E14D2A] hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {feedbacks.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#78716C]">
                    {lang === 'id' ? 'Belum ada ulasan baru.' : 'No recent feedback.'}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto">
                    {feedbacks.slice(0, 3).map((f) => (
                      <div
                        key={f.id}
                        className="p-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#1C1917] dark:text-[#F5F4F0] truncate max-w-[120px]">
                            {f.name}
                          </span>
                          {f.rating && (
                            <div className="flex items-center gap-0.5 text-[#F59E0B]">
                              {Array.from({ length: f.rating }).map((_, sIdx) => (
                                <Star key={sIdx} className="w-2.5 h-2.5 fill-[#F59E0B]" />
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] text-[#57534E] dark:text-[#A8A29E] line-clamp-2">
                          "{f.comment}"
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB VIEWS: VISITORS / USERS / BLOG / RELEASES / FEEDBACK   */}
        {/* ========================================================= */}

        {/* TAB: VISITOR ANALYTICS */}
        {activeTab === 'visitors' && (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-[28px] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#1C1917] dark:text-[#F5F4F0] flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#E14D2A]" />
                    <span>{lang === 'id' ? 'Statistik Pengunjung & Analitik Website' : 'Visitor Analytics & Website Traffic'}</span>
                  </h3>
                  <span className="text-[10px] font-mono-code font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Real-Time</span>
                  </span>
                </div>
                <p className="text-xs text-[#78716C] mt-1">
                  {lang === 'id'
                    ? 'Pelacakan pengunjung anonim, tanpa cookie pihak ketiga, tanpa profiling pengguna.'
                    : 'Anonymous visitor analytics: zero third-party cookies, zero invasive profiling.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadAdminData}
                  className="px-3.5 py-2 rounded-xl border border-[#EAE5DC] dark:border-[#272A33] bg-[#FAF8F5] dark:bg-[#121316] text-[#57534E] dark:text-[#A8A29E] text-xs font-semibold hover:border-[#E14D2A] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{lang === 'id' ? 'Segarkan' : 'Refresh'}</span>
                </button>
              </div>
            </div>

            {/* 4 KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-[22px] bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs text-[#78716C]">
                  <span>{lang === 'id' ? 'Total Kunjungan' : 'Total Pageviews'}</span>
                  <Eye className="w-4 h-4 text-[#E14D2A]" />
                </div>
                <div className="text-2xl font-extrabold font-mono-code text-[#1C1917] dark:text-[#F5F4F0]">
                  <NumberTicker value={visitorStats.totalViews} />
                  <span className="text-xs font-normal text-[#78716C] ml-1">{lang === 'id' ? 'tayangan' : 'views'}</span>
                </div>
                <span className="text-[10px] text-[#78716C]">{lang === 'id' ? 'Sejak pelacakan aktif' : 'Since telemetry started'}</span>
              </div>

              <div className="p-5 rounded-[22px] bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs text-[#78716C]">
                  <span>{lang === 'id' ? 'Kunjungan Hari Ini' : "Today's Visits"}</span>
                  <Activity className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-extrabold font-mono-code text-[#1C1917] dark:text-[#F5F4F0]">
                  <NumberTicker value={visitorStats.todayViews} />
                  <span className="text-xs font-normal text-[#78716C] ml-1">{lang === 'id' ? 'sesi' : 'sessions'}</span>
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold">{lang === 'id' ? 'Trafik hari ini' : "Today's traffic"}</span>
              </div>

              <div className="p-5 rounded-[22px] bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs text-[#78716C]">
                  <span>{lang === 'id' ? 'Halaman Teratas' : 'Top Page'}</span>
                  <TrendingUp className="w-4 h-4 text-sky-600" />
                </div>
                <div className="text-lg font-extrabold font-mono-code text-[#1C1917] dark:text-[#F5F4F0] truncate" title={visitorStats.topPages[0]?.path || '/'}>
                  {visitorStats.topPages[0]?.path || '/'}
                </div>
                <span className="text-[10px] text-[#78716C]">
                  {visitorStats.topPages[0]?.views || 0} {lang === 'id' ? 'tayangan' : 'views'} ({visitorStats.totalViews > 0 ? Math.round(((visitorStats.topPages[0]?.views || 0) / visitorStats.totalViews) * 100) : 0}%)
                </span>
              </div>

              <div className="p-5 rounded-[22px] bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs text-[#78716C]">
                  <span>{lang === 'id' ? 'Perangkat Dominan' : 'Top Device'}</span>
                  <Laptop className="w-4 h-4 text-[#D4A373]" />
                </div>
                <div className="text-2xl font-extrabold font-mono-code text-[#1C1917] dark:text-[#F5F4F0] capitalize">
                  {visitorStats.devices[0]?.device || 'Desktop'}
                </div>
                <span className="text-[10px] text-[#78716C]">
                  {visitorStats.totalViews > 0 ? Math.round(((visitorStats.devices[0]?.count || 0) / visitorStats.totalViews) * 100) : 100}% {lang === 'id' ? 'pengguna' : 'users'}
                </span>
              </div>
            </div>

            {/* Middle Section: Chart & Top Pages */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* 7-Day Visits Bar Chart */}
              <div className="lg:col-span-7 bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-[28px] p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#EAE5DC] dark:border-[#272A33]">
                  <div>
                    <h4 className="text-sm font-bold text-[#1C1917] dark:text-[#F5F4F0]">
                      {lang === 'id' ? 'Grafik Kunjungan 7 Hari Terakhir' : '7-Day Pageviews Trend'}
                    </h4>
                    <p className="text-xs text-[#78716C]">{lang === 'id' ? 'Tren frekuensi pageviews harian' : 'Daily visitor frequency trend'}</p>
                  </div>
                  <span className="text-xs font-mono-code font-bold text-[#E14D2A]">
                    {visitorStats.last7Days.reduce((acc, d) => acc + (d.views || 0), 0)} {lang === 'id' ? 'views minggu ini' : 'views this week'}
                  </span>
                </div>

                {/* SVG / Flex Bar Chart */}
                <div className="pt-4 pb-2">
                  <div className="h-48 flex items-end justify-between gap-1 sm:gap-3 px-0 sm:px-2">
                    {visitorStats.last7Days.map((d, i) => {
                      const maxViews = Math.max(...visitorStats.last7Days.map((x) => x.views), 1)
                      const heightPercent = Math.max(12, Math.round((d.views / maxViews) * 100))
                      const isToday = i === visitorStats.last7Days.length - 1

                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                          {/* Value Tooltip pill */}
                          <span className="text-[10px] font-mono-code font-bold text-[#E14D2A] opacity-0 group-hover:opacity-100 transition-opacity">
                            {d.views}
                          </span>
                          {/* Bar */}
                          <div className="w-full max-w-[40px] bg-[#FAF8F5] dark:bg-[#121316] rounded-t-xl overflow-hidden flex items-end border border-[#EAE5DC] dark:border-[#272A33] h-full">
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${heightPercent}%` }}
                              transition={{ duration: 0.5, delay: i * 0.05 }}
                              className={`w-full rounded-t-xl transition-all ${
                                isToday
                                  ? 'bg-gradient-to-t from-[#C83B1B] to-[#E14D2A] shadow-md shadow-[#E14D2A]/30'
                                  : 'bg-[#E14D2A]/70 hover:bg-[#E14D2A]'
                              }`}
                            />
                          </div>
                          {/* Label */}
                          <span className={`text-[9px] sm:text-[10px] font-mono-code whitespace-nowrap mt-1 ${isToday ? 'font-bold text-[#E14D2A]' : 'text-[#78716C]'}`}>
                            {d.date_label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Top Pages Table */}
              <div className="lg:col-span-5 bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-[28px] p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#EAE5DC] dark:border-[#272A33]">
                  <div>
                    <h4 className="text-sm font-bold text-[#1C1917] dark:text-[#F5F4F0]">
                      {lang === 'id' ? 'Halaman Terpopuler' : 'Top Visited Pages'}
                    </h4>
                    <p className="text-xs text-[#78716C]">{lang === 'id' ? 'Rute URL dengan impresi tertinggi' : 'Highest impression URL routes'}</p>
                  </div>
                  <span className="text-xs font-mono-code text-[#78716C]">
                    Top {visitorStats.topPages.length}
                  </span>
                </div>

                {visitorStats.topPages.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#78716C]">
                    {lang === 'id' ? 'Belum ada data halaman terekam.' : 'No page data recorded yet.'}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {visitorStats.topPages.map((page, idx) => {
                      const pct = visitorStats.totalViews > 0
                        ? Math.round((page.views / visitorStats.totalViews) * 100)
                        : 0
                      return (
                        <div key={idx} className="space-y-1 text-xs">
                          <div className="flex items-center justify-between font-mono-code">
                            <div className="flex items-center gap-2 truncate">
                              <span className="w-5 text-[10px] text-[#78716C] font-bold">#{idx + 1}</span>
                              <span className="font-semibold text-[#1C1917] dark:text-[#F5F4F0] truncate">
                                {page.path}
                              </span>
                            </div>
                            <span className="font-bold text-[#E14D2A] shrink-0 ml-2">
                              {page.views} <span className="text-[10px] text-[#78716C] font-normal">({pct}%)</span>
                            </span>
                          </div>
                          <div className="w-full bg-[#FAF8F5] dark:bg-[#121316] h-1.5 rounded-full overflow-hidden border border-[#EAE5DC] dark:border-[#272A33]">
                            <div
                              className="bg-[#E14D2A] h-full rounded-full transition-all"
                              style={{ width: `${Math.max(4, pct)}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Row: Devices, Browsers, and Live Feed */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Devices */}
              <div className="bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-[28px] p-6 shadow-xs space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1917] dark:text-[#F5F4F0] flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-[#E14D2A]" />
                  <span>{lang === 'id' ? 'Distribusi Perangkat' : 'Device Distribution'}</span>
                </h4>
                <div className="space-y-3 pt-1">
                  {['desktop', 'mobile', 'tablet'].map((dev) => {
                    const found = visitorStats.devices.find((d) => d.device.toLowerCase() === dev)
                    const count = found?.count || 0
                    const pct = visitorStats.totalViews > 0 ? Math.round((count / visitorStats.totalViews) * 100) : 0
                    const IconComp = dev === 'mobile' ? Smartphone : dev === 'tablet' ? Tablet : Laptop

                    return (
                      <div key={dev} className="space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 capitalize text-[#57534E] dark:text-[#A8A29E]">
                            <IconComp className="w-3.5 h-3.5 text-[#78716C]" />
                            <span>{dev}</span>
                          </span>
                          <span className="font-mono-code font-bold text-[#1C1917] dark:text-[#F5F4F0]">
                            {count} <span className="text-[10px] text-[#78716C] font-normal">({pct}%)</span>
                          </span>
                        </div>
                        <div className="w-full bg-[#FAF8F5] dark:bg-[#121316] h-1.5 rounded-full overflow-hidden border border-[#EAE5DC] dark:border-[#272A33]">
                          <div
                            className="bg-[#E14D2A] h-full rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Browsers */}
              <div className="bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-[28px] p-6 shadow-xs space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1917] dark:text-[#F5F4F0] flex items-center gap-2">
                  <Globe className="w-4 h-4 text-sky-600" />
                  <span>{lang === 'id' ? 'Distribusi Browser' : 'Browser Distribution'}</span>
                </h4>
                <div className="space-y-3 pt-1">
                  {visitorStats.browsers.length === 0 ? (
                    <div className="p-4 text-center text-xs text-[#78716C]">{lang === 'id' ? 'Belum ada data browser' : 'No browser data yet'}</div>
                  ) : (
                    visitorStats.browsers.map((b, i) => {
                      const pct = visitorStats.totalViews > 0 ? Math.round((b.count / visitorStats.totalViews) * 100) : 0
                      return (
                        <div key={i} className="space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[#57534E] dark:text-[#A8A29E] font-medium">{b.browser}</span>
                            <span className="font-mono-code font-bold text-[#1C1917] dark:text-[#F5F4F0]">
                              {b.count} <span className="text-[10px] text-[#78716C] font-normal">({pct}%)</span>
                            </span>
                          </div>
                          <div className="w-full bg-[#FAF8F5] dark:bg-[#121316] h-1.5 rounded-full overflow-hidden border border-[#EAE5DC] dark:border-[#272A33]">
                            <div className="bg-sky-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Live Traffic Feed */}
              <div className="bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-[28px] p-6 shadow-xs space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1917] dark:text-[#F5F4F0] flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>{lang === 'id' ? 'Aktivitas Kunjungan Terkini' : 'Recent Pageview Activity'}</span>
                </h4>
                {visitorStats.recentVisits.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#78716C]">{lang === 'id' ? 'Belum ada aktivitas terekam' : 'No recent activity recorded'}</div>
                ) : (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {visitorStats.recentVisits.map((v, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] text-xs flex items-center justify-between gap-2"
                      >
                        <div className="truncate font-mono-code font-semibold text-[#1C1917] dark:text-[#F5F4F0]">
                          {v.path}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-mono-code px-1.5 py-0.5 rounded bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] text-[#78716C] capitalize">
                            {v.device}
                          </span>
                          <span className="text-[10px] font-mono-code px-1.5 py-0.5 rounded bg-[#E14D2A]/10 text-[#E14D2A] font-semibold">
                            {v.browser}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: TOOL USAGE */}
        {activeTab === 'tools' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-[28px] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-[#1C1917] dark:text-[#F5F4F0] flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#E14D2A]" />
                  <span>{lang === 'id' ? 'Statistik Penggunaan Alat' : 'Tool Usage Analytics'}</span>
                </h3>
                <p className="text-xs text-[#78716C] mt-1">
                  {lang === 'id'
                    ? 'Pantau alat yang paling sering dipakai, alat baru, dan aktivitas terbaru.'
                    : 'Monitor the most used tools, new tools, and recent activity.'}
                </p>
              </div>
              <button
                type="button"
                onClick={loadAdminData}
                className="px-3.5 py-2 rounded-xl border border-[#EAE5DC] dark:border-[#272A33] bg-[#FAF8F5] dark:bg-[#121316] text-[#57534E] dark:text-[#A8A29E] text-xs font-semibold hover:border-[#E14D2A] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{lang === 'id' ? 'Segarkan' : 'Refresh'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-[22px] bg-[#E14D2A] text-white shadow-md shadow-[#E14D2A]/20 space-y-2">
                <div className="flex items-center justify-between text-xs opacity-90">
                  <span>{lang === 'id' ? 'Total Pemakaian' : 'Total Uses'}</span>
                  <Zap className="w-4 h-4" />
                </div>
                <div className="text-3xl font-extrabold font-mono-code leading-none">
                  <NumberTicker value={toolUsageStats.totalUses} />
                  <span className="text-sm font-normal ml-1">{lang === 'id' ? 'kali' : 'uses'}</span>
                </div>
              </div>

              <div className="p-5 rounded-[22px] bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs text-[#78716C]">
                  <span>{lang === 'id' ? 'Hari Ini' : 'Today'}</span>
                  <Activity className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-extrabold font-mono-code text-[#1C1917] dark:text-[#F5F4F0]">
                  <NumberTicker value={toolUsageStats.todayUses} />
                  <span className="text-xs font-normal text-[#78716C] ml-1">{lang === 'id' ? 'pemakaian' : 'uses'}</span>
                </div>
              </div>

              <div className="p-5 rounded-[22px] bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs text-[#78716C]">
                  <span>{lang === 'id' ? 'Alat Terpakai' : 'Tools Used'}</span>
                  <BarChart3 className="w-4 h-4 text-sky-600" />
                </div>
                <div className="text-2xl font-extrabold font-mono-code text-[#1C1917] dark:text-[#F5F4F0]">
                  <NumberTicker value={toolUsageStats.uniqueTools} />
                  <span className="text-xs font-normal text-[#78716C] ml-1">/ {TOOLS_DATA.length}</span>
                </div>
              </div>

              <div className="p-5 rounded-[22px] bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs text-[#78716C]">
                  <span>{lang === 'id' ? 'Paling Populer' : 'Most Popular'}</span>
                  <Flame className="w-4 h-4 text-[#E14D2A]" />
                </div>
                <div className="text-base font-extrabold text-[#1C1917] dark:text-[#F5F4F0] truncate">
                  {toolUsageRows[0]?.tool.title || '-'}
                </div>
                <span className="text-[10px] text-[#78716C]">
                  {toolUsageRows[0]?.uses || 0} {lang === 'id' ? 'pemakaian' : 'uses'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-[28px] p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#EAE5DC] dark:border-[#272A33]">
                  <div>
                    <h4 className="text-sm font-bold text-[#1C1917] dark:text-[#F5F4F0]">
                      {lang === 'id' ? 'Pemakaian 7 Hari Terakhir' : '7-Day Usage Trend'}
                    </h4>
                    <p className="text-xs text-[#78716C]">{lang === 'id' ? 'Frekuensi alat dibuka per hari' : 'Daily tool opens'}</p>
                  </div>
                  <span className="text-xs font-mono-code font-bold text-[#E14D2A]">
                    {toolUsageStats.last7Days.reduce((acc, day) => acc + (day.uses || 0), 0)} {lang === 'id' ? 'minggu ini' : 'this week'}
                  </span>
                </div>
                <div className="h-48 flex items-end justify-between gap-1 sm:gap-3 px-0 sm:px-2 pt-4">
                  {toolUsageStats.last7Days.map((day, index) => {
                    const maxUses = Math.max(...toolUsageStats.last7Days.map((item) => item.uses), 1)
                    const height = Math.max(12, Math.round((day.uses / maxUses) * 100))
                    const isToday = index === toolUsageStats.last7Days.length - 1
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                        <span className="text-[10px] font-mono-code font-bold text-[#E14D2A] opacity-0 group-hover:opacity-100 transition-opacity">
                          {day.uses}
                        </span>
                        <div className="w-full max-w-[40px] bg-[#FAF8F5] dark:bg-[#121316] rounded-t-xl overflow-hidden flex items-end border border-[#EAE5DC] dark:border-[#272A33] h-full">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                            className={`w-full rounded-t-xl ${isToday ? 'bg-[#E14D2A]' : 'bg-[#E14D2A]/60 hover:bg-[#E14D2A]'}`}
                          />
                        </div>
                        <span className={`text-[9px] sm:text-[10px] font-mono-code whitespace-nowrap mt-1 ${isToday ? 'font-bold text-[#E14D2A]' : 'text-[#78716C]'}`}>
                          {day.date_label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="lg:col-span-5 bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-[28px] p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#EAE5DC] dark:border-[#272A33]">
                  <div>
                    <h4 className="text-sm font-bold text-[#1C1917] dark:text-[#F5F4F0]">
                      {lang === 'id' ? 'Alat Terpopuler' : 'Popular Tools'}
                    </h4>
                    <p className="text-xs text-[#78716C]">{lang === 'id' ? 'Berdasarkan jumlah pemakaian' : 'Ranked by usage count'}</p>
                  </div>
                  <span className="text-xs font-mono-code text-[#78716C]">Top {Math.min(6, toolUsageRows.length)}</span>
                </div>
                {toolUsageRows.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#78716C]">
                    {lang === 'id' ? 'Belum ada pemakaian alat terekam.' : 'No tool usage recorded yet.'}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {toolUsageRows.slice(0, 6).map((row, index) => {
                      const pct = Math.round((row.uses / maxToolUses) * 100)
                      return (
                        <div key={row.tool_id} className="space-y-1 text-xs">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-5 shrink-0 text-[10px] text-[#78716C] font-bold">#{index + 1}</span>
                              <span className="font-semibold text-[#1C1917] dark:text-[#F5F4F0] truncate">{row.tool.title}</span>
                              {row.tool.badge && (
                                <span className="shrink-0 rounded-full bg-[#E14D2A]/10 px-1.5 py-0.5 text-[9px] font-bold text-[#E14D2A]">
                                  {row.tool.badge}
                                </span>
                              )}
                            </div>
                            <span className="font-bold text-[#E14D2A] shrink-0">{row.uses}</span>
                          </div>
                          <div className="w-full bg-[#FAF8F5] dark:bg-[#121316] h-1.5 rounded-full overflow-hidden border border-[#EAE5DC] dark:border-[#272A33]">
                            <div className="bg-[#E14D2A] h-full rounded-full" style={{ width: `${Math.max(4, pct)}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-[28px] p-6 shadow-xs space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1917] dark:text-[#F5F4F0] flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#E14D2A]" />
                  <span>{lang === 'id' ? 'Per Kategori' : 'By Category'}</span>
                </h4>
                <div className="space-y-3 pt-1">
                  {usageByCategory.map((category) => {
                    const pct = toolUsageStats.totalUses > 0 ? Math.round((category.uses / toolUsageStats.totalUses) * 100) : 0
                    return (
                      <div key={category.id} className="space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[#57534E] dark:text-[#A8A29E]">{category.label}</span>
                          <span className="font-mono-code font-bold text-[#1C1917] dark:text-[#F5F4F0]">
                            {category.uses} <span className="text-[10px] text-[#78716C] font-normal">({pct}%)</span>
                          </span>
                        </div>
                        <div className="w-full bg-[#FAF8F5] dark:bg-[#121316] h-1.5 rounded-full overflow-hidden border border-[#EAE5DC] dark:border-[#272A33]">
                          <div className="bg-[#E14D2A] h-full rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-[28px] p-6 shadow-xs space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1917] dark:text-[#F5F4F0] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D4A373]" />
                  <span>{lang === 'id' ? 'Alat Baru' : 'New Tools'}</span>
                </h4>
                <div className="space-y-2">
                  {newTools.slice(0, 6).map(({ tool, uses }) => (
                    <div key={tool.id} className="flex items-center justify-between gap-2 rounded-xl bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] px-3 py-2">
                      <span className="text-xs font-semibold text-[#1C1917] dark:text-[#F5F4F0] truncate">{tool.title}</span>
                      <span className="text-xs font-mono-code font-bold text-[#E14D2A] shrink-0">{uses}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-[28px] p-6 shadow-xs space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1917] dark:text-[#F5F4F0] flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>{lang === 'id' ? 'Aktivitas Terbaru' : 'Recent Activity'}</span>
                </h4>
                {toolUsageStats.recent.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#78716C]">{lang === 'id' ? 'Belum ada aktivitas.' : 'No activity yet.'}</div>
                ) : (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {toolUsageStats.recent.map((row, index) => {
                      const tool = TOOLS_DATA.find((item) => item.id === row.tool_id)
                      if (!tool) return null
                      return (
                        <div key={`${row.tool_id}-${index}`} className="rounded-xl bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] px-3 py-2 text-xs">
                          <div className="font-semibold text-[#1C1917] dark:text-[#F5F4F0] truncate">{tool.title}</div>
                          <div className="text-[10px] text-[#78716C] mt-0.5">
                            {new Date(row.created_at).toLocaleString(lang === 'id' ? 'id-ID' : 'en-US', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-[28px] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#EAE5DC] dark:border-[#272A33]">
                <div>
                  <h4 className="text-sm font-bold text-[#1C1917] dark:text-[#F5F4F0]">
                    {lang === 'id' ? 'Semua Alat' : 'All Tools'}
                  </h4>
                  <p className="text-xs text-[#78716C]">
                    {lang === 'id' ? 'Pemakaian seluruh katalog, termasuk yang belum pernah dibuka.' : 'Usage across the whole catalog, including tools never opened.'}
                  </p>
                </div>
                <span className="text-xs font-mono-code text-[#78716C]">{allToolRows.length} {lang === 'id' ? 'alat' : 'tools'}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-xs">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-wider text-[#78716C]">
                      <th className="py-2 pr-4 font-semibold">#</th>
                      <th className="py-2 pr-4 font-semibold">{lang === 'id' ? 'Alat' : 'Tool'}</th>
                      <th className="py-2 pr-4 font-semibold">{lang === 'id' ? 'Kategori' : 'Category'}</th>
                      <th className="py-2 pr-4 font-semibold text-right">{lang === 'id' ? 'Pemakaian' : 'Uses'}</th>
                      <th className="py-2 font-semibold">{lang === 'id' ? 'Terakhir' : 'Last Used'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allToolRows.map((row, index) => (
                      <tr key={row.tool.id} className="border-t border-[#EAE5DC] dark:border-[#272A33]">
                        <td className="py-2.5 pr-4 text-[10px] text-[#78716C] font-mono-code">{index + 1}</td>
                        <td className="py-2.5 pr-4">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-semibold text-[#1C1917] dark:text-[#F5F4F0] truncate">{row.tool.title}</span>
                            {row.tool.badge && (
                              <span className="shrink-0 rounded-full bg-[#E14D2A]/10 px-1.5 py-0.5 text-[9px] font-bold text-[#E14D2A]">
                                {row.tool.badge}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 pr-4 text-[#57534E] dark:text-[#A8A29E]">
                          {CATEGORIES.find((category) => category.id === row.tool.category)?.label}
                        </td>
                        <td className="py-2.5 pr-4 text-right font-mono-code font-bold text-[#E14D2A]">{row.uses}</td>
                        <td className="py-2.5 text-[#78716C]">
                          {row.last_used_at
                            ? new Date(row.last_used_at).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: USERS MANAGER */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-[28px] p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE5DC] dark:border-[#272A33]">
              <div>
                <h3 className="text-sm font-bold text-[#1C1917] dark:text-[#F5F4F0]">
                  {lang === 'id' ? 'Manajemen Pengguna & Kreator Terdaftar' : 'Registered Creators & User Management'}
                </h3>
                <p className="text-xs text-[#78716C]">
                  {lang === 'id' ? 'Seluruh akun terdaftar di database' : 'All user accounts stored in the database'}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Role Filter */}
                <div className="relative">
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value as any)}
                    className="text-xs pl-7 pr-3 py-1.5 rounded-lg border border-[#EAE5DC] dark:border-[#272A33] bg-[#FAF8F5] dark:bg-[#121316] text-[#1C1917] dark:text-[#F5F4F0] appearance-none cursor-pointer"
                  >
                    <option value="all">{lang === 'id' ? 'Semua Peran' : 'All Roles'}</option>
                    <option value="kreator">Kreator</option>
                    <option value="admin">Admin</option>
                  </select>
                  <Filter className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#78716C] pointer-events-none" />
                </div>

                {/* Sort */}
                <button
                  type="button"
                  onClick={() => {
                    if (userSortField === 'created_at') {
                      setUserSortField('name')
                      setUserSortDir('asc')
                    } else if (userSortField === 'name') {
                      setUserSortField('email')
                      setUserSortDir('asc')
                    } else {
                      setUserSortField('created_at')
                      setUserSortDir('desc')
                    }
                  }}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-[#EAE5DC] dark:border-[#272A33] bg-[#FAF8F5] dark:bg-[#121316] text-[#57534E] dark:text-[#A8A29E] hover:border-[#E14D2A] transition-colors cursor-pointer flex items-center gap-1"
                >
                  <ArrowUpDown className="w-3 h-3" />
                  <span>
                    {lang === 'id'
                      ? (userSortField === 'name' ? 'Nama' : userSortField === 'email' ? 'Email' : 'Terbaru')
                      : (userSortField === 'name' ? 'Name' : userSortField === 'email' ? 'Email' : 'Newest')}
                  </span>
                </button>

                {/* Bulk Actions */}
                {selectedUsers.size > 0 && (
                  <button
                    type="button"
                    onClick={handleBulkDeleteUsers}
                    className="text-xs px-3 py-1.5 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{lang === 'id' ? `Hapus ${selectedUsers.size} Dipilih` : `Delete ${selectedUsers.size} Selected`}</span>
                  </button>
                )}

                <span className="text-xs font-mono-code font-bold text-[#E14D2A]">
                  {filteredUsers.length} {lang === 'id' ? 'Pengguna' : 'Users'}
                </span>
              </div>
            </div>

            <div className="border border-[#EAE5DC] dark:border-[#272A33] rounded-2xl overflow-x-auto text-xs">
              {/* Table Header */}
              <div className="grid grid-cols-12 p-3.5 bg-[#FAF8F5] dark:bg-[#121316] border-b border-[#EAE5DC] dark:border-[#272A33] font-semibold text-[#1C1917] dark:text-[#F5F4F0] items-center min-w-[620px]">
                <div className="col-span-1 flex items-center justify-center">
                  <button type="button" onClick={toggleAllUsers} className="cursor-pointer text-[#78716C] hover:text-[#E14D2A] transition-colors">
                    {selectedUsers.size > 0 && selectedUsers.size >= filteredUsers.filter((u) => u.role !== 'admin').length ? (
                      <CheckSquare className="w-4 h-4 text-[#E14D2A]" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="col-span-3">{lang === 'id' ? 'Nama Pengguna' : 'User Name'}</div>
                <div className="col-span-3">Email</div>
                <div className="col-span-2 text-center">{lang === 'id' ? 'Peran' : 'Role'}</div>
                <div className="col-span-2 text-center hidden sm:block">{lang === 'id' ? 'Terdaftar' : 'Registered'}</div>
                <div className="col-span-1 text-right">{lang === 'id' ? 'Aksi' : 'Action'}</div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-[#EAE5DC] dark:divide-[#272A33] min-w-[620px]">
                {filteredUsers.map((usr) => {
                  const isSelected = selectedUsers.has(usr.id)
                  return (
                    <div
                      key={usr.id}
                      className={`grid grid-cols-12 p-3.5 items-center transition-colors ${isSelected ? 'bg-[#E14D2A]/5' : 'hover:bg-[#FAF8F5] dark:hover:bg-[#16171D]'}`}
                    >
                      <div className="col-span-1 flex items-center justify-center">
                        {usr.role !== 'admin' ? (
                          <button type="button" onClick={() => toggleUserSelect(usr.id)} className="cursor-pointer text-[#78716C] hover:text-[#E14D2A] transition-colors">
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-[#E14D2A]" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        ) : (
                          <Shield className="w-4 h-4 text-[#E14D2A]" />
                        )}
                      </div>
                      <div className="col-span-3 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#E14D2A]/10 text-[#E14D2A] flex items-center justify-center font-bold font-mono-code text-xs shrink-0">
                          {usr.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-[#1C1917] dark:text-[#F5F4F0] truncate">{usr.name}</span>
                      </div>
                      <div className="col-span-3 font-mono-code text-[#57534E] dark:text-[#A8A29E] truncate">
                        {usr.email}
                      </div>
                      <div className="col-span-2 text-center">
                        {usr.role === 'admin' ? (
                          <span className="text-[10px] font-mono-code font-bold uppercase px-2 py-0.5 rounded-full bg-[#E14D2A]/10 text-[#E14D2A] border border-[#E14D2A]/25">
                            admin
                          </span>
                        ) : (
                          <select
                            value={usr.role}
                            onChange={(e) => handleChangeRole(usr.id, e.target.value)}
                            className="text-[10px] font-mono-code font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 appearance-none cursor-pointer text-center"
                          >
                            <option value="kreator">kreator</option>
                            <option value="admin">admin</option>
                          </select>
                        )}
                      </div>
                      <div className="col-span-2 text-center text-[10px] font-mono-code text-[#78716C] hidden sm:block">
                        {new Date(usr.created_at).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="col-span-1 text-right">
                        {usr.role !== 'admin' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(usr.id)}
                            className="text-[#78716C] hover:text-rose-600 cursor-pointer transition-colors p-1"
                            title={lang === 'id' ? 'Hapus Akun' : 'Delete Account'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}

                {filteredUsers.length === 0 && (
                  <div className="p-8 text-center text-xs text-[#78716C]">
                    {lang === 'id' ? 'Tidak ada pengguna yang cocok dengan filter.' : 'No users match the active filter.'}
                  </div>
                )}
              </div>
            </div>

            {/* User Stats Footer */}
            <div className="flex items-center gap-4 pt-2 text-[10px] font-mono-code text-[#78716C]">
              <span>Total: {userList.length} {lang === 'id' ? 'pengguna' : 'users'}</span>
              <span>Admin: {userList.filter((u) => u.role === 'admin').length}</span>
              <span>Kreator: {userList.filter((u) => u.role === 'kreator').length}</span>
              {selectedUsers.size > 0 && (
                <span className="text-[#E14D2A] font-semibold">{selectedUsers.size} {lang === 'id' ? 'dipilih' : 'selected'}</span>
              )}
            </div>
          </div>
        )}

        {/* TAB: BLOG MANAGER */}
        {activeTab === 'blog' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <form
              onSubmit={handlePostBlog}
              className="lg:col-span-7 p-6 bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-[28px] shadow-xs space-y-4 text-xs"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#EAE5DC] dark:border-[#272A33]">
                <div>
                  <h3 className="font-bold text-sm text-[#1C1917] dark:text-[#F5F4F0]">
                    {lang === 'id' ? 'Publikasikan Artikel Baru ke /blog' : 'Publish New Article to /blog'}
                  </h3>
                  <p className="text-xs text-[#78716C]">{lang === 'id' ? 'Artikel akan langsung tayang ke publik' : 'Article will be published live immediately'}</p>
                </div>
                {blogMsg && <span className="text-xs text-emerald-600 font-semibold">{blogMsg}</span>}
              </div>

              {/* Cover Image Upload */}
              <div>
                <label className="text-sm block text-[#57534E] dark:text-[#A8A29E] mb-1 font-medium">{lang === 'id' ? 'Gambar Sampul Artikel' : 'Article Cover Image'}</label>
                {blogCoverImage ? (
                  <div className="relative h-32 w-full rounded-xl overflow-hidden border border-[#EAE5DC] dark:border-[#272A33]">
                    <img src={blogCoverImage} alt="Cover" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setBlogCoverImage(''); showToast('Gambar Dihapus', 'Gambar sampul berhasil dihapus.', 'info') }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer hover:bg-black/80"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="text-sm h-24 w-full border-2 border-dashed border-[#EAE5DC] dark:border-[#272A33] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#E14D2A] transition-colors gap-1">
                    <UploadCloud className="w-5 h-5 text-[#E14D2A]" />
                    <span className="text-xs text-[#78716C]">{lang === 'id' ? 'Unggah gambar sampul (PNG/JPG, maks 2MB)' : 'Upload cover image (PNG/JPG, max 2MB)'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, setBlogCoverImage, 'Gambar Sampul')}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div>
                <label className="text-sm block text-[#57534E] dark:text-[#A8A29E] mb-1 font-medium">{lang === 'id' ? 'Judul Artikel' : 'Article Title'}</label>
                <input
                  type="text"
                  required
                  value={blogTitle}
                  onChange={(e) => setBlogTitle(e.target.value)}
                  placeholder={lang === 'id' ? 'Panduan Teknis Vektor QR...' : 'Technical Vector QR Guide...'}
                  className="w-full px-3 py-2 border border-[#EAE5DC] dark:border-[#272A33] rounded-xl bg-transparent"
                />
              </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm block text-[#57534E] dark:text-[#A8A29E] mb-1 font-medium">{lang === 'id' ? 'Tag / Kategori' : 'Tag / Category'}</label>
                  <select
                    value={blogTag}
                    onChange={(e) => setBlogTag(e.target.value)}
                    className="w-full px-3 py-2 border border-[#EAE5DC] dark:border-[#272A33] rounded-xl bg-transparent"
                  >
                    <option value="PANDUAN">{lang === 'id' ? 'PANDUAN' : 'GUIDE'}</option>
                    <option value="TUTORIAL">{lang === 'id' ? 'TUTORIAL & TEKNIS' : 'TUTORIAL & TECHNICAL'}</option>
                    <option value="KRIPTOGRAFI">{lang === 'id' ? 'KRIPTOGRAFI' : 'CRYPTOGRAPHY'}</option>
                    <option value="ARSITEKTUR">{lang === 'id' ? 'ARSITEKTUR WEB' : 'WEB ARCHITECTURE'}</option>
                    <option value="DESAIN">{lang === 'id' ? 'DESAIN & BRANDING' : 'DESIGN & BRANDING'}</option>
                    <option value="PRODUK">{lang === 'id' ? 'PRODUK & FITUR' : 'PRODUCT & FEATURES'}</option>
                    <option value="TIPS">{lang === 'id' ? 'TIPS & TRIK' : 'TIPS & TRICKS'}</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm block text-[#57534E] dark:text-[#A8A29E] mb-1 font-medium">{lang === 'id' ? 'Waktu Baca' : 'Read Time'}</label>
                  <input
                    type="text"
                    value={blogReadTime}
                    onChange={(e) => setBlogReadTime(e.target.value)}
                    placeholder="4 min read"
                    className="w-full px-3 py-2 border border-[#EAE5DC] dark:border-[#272A33] rounded-xl bg-transparent font-mono-code"
                  />
                </div>
              </div>

              {/* Keywords */}
              <div>
                <label className="text-sm block text-[#57534E] dark:text-[#A8A29E] mb-1 font-medium">{lang === 'id' ? 'Kata Kunci (Keywords SEO)' : 'Keywords (SEO)'}</label>
                <input
                  type="text"
                  value={blogKeywords}
                  onChange={(e) => setBlogKeywords(e.target.value)}
                  placeholder="qr code, generator, vektor, svg, panduan..."
                  className="w-full px-3 py-2 border border-[#EAE5DC] dark:border-[#272A33] rounded-xl bg-transparent font-mono-code"
                />
                <span className="text-[10px] text-[#78716C] mt-0.5 block">{lang === 'id' ? 'Pisahkan kata kunci dengan koma' : 'Separate keywords with commas'}</span>
              </div>

              <div>
                <label className="text-sm block text-[#57534E] dark:text-[#A8A29E] mb-1 font-medium">{lang === 'id' ? 'Ringkasan / Deskripsi Singkat' : 'Summary / Short Description'}</label>
                <textarea
                  rows={2}
                  required
                  value={blogSummary}
                  onChange={(e) => setBlogSummary(e.target.value)}
                  placeholder={lang === 'id' ? 'Rangkuman 1-2 kalimat untuk pratinjau kartu dan meta description...' : '1-2 sentence summary for card preview and meta description...'}
                  className="w-full p-3 border border-[#EAE5DC] dark:border-[#272A33] rounded-xl bg-transparent"
                />
              </div>

              {/* Rich Text Toolbar */}
              <div>
                <label className="text-sm block text-[#57534E] dark:text-[#A8A29E] mb-1 font-medium">
                  {lang === 'id' ? 'Isi Artikel Lengkap' : 'Full Article Content'}
                </label>
                <div className="border border-[#EAE5DC] dark:border-[#272A33] rounded-xl overflow-hidden">
                  <div className="flex items-center gap-0.5 p-1.5 bg-[#FAF8F5] dark:bg-[#121316] border-b border-[#EAE5DC] dark:border-[#272A33] flex-wrap">
                    {[
                      { icon: Bold, action: () => insertAtCursor('**', '**'), title: lang === 'id' ? 'Tebal' : 'Bold' },
                      { icon: Italic, action: () => insertAtCursor('*', '*'), title: lang === 'id' ? 'Miring' : 'Italic' },
                      { icon: Heading2, action: () => insertAtCursor('\n## ', '\n'), title: 'Heading' },
                      { icon: List, action: () => insertAtCursor('\n- ', ''), title: lang === 'id' ? 'Daftar' : 'List' },
                      { icon: ListOrdered, action: () => insertAtCursor('\n1. ', ''), title: lang === 'id' ? 'Daftar Nomor' : 'Numbered List' },
                      { icon: Quote, action: () => insertAtCursor('\n> ', '\n'), title: lang === 'id' ? 'Kutipan' : 'Quote' },
                      { icon: Code, action: () => insertAtCursor('`', '`'), title: lang === 'id' ? 'Kode Inline' : 'Inline Code' },
                      { icon: Link2, action: () => insertAtCursor('[', '](https://)'), title: lang === 'id' ? 'Tautan' : 'Link' },
                      { icon: Minus, action: () => insertAtCursor('\n---\n', ''), title: lang === 'id' ? 'Garis Pemisah' : 'Divider' },
                    ].map((btn, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={btn.action}
                        title={btn.title}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[#57534E] dark:text-[#A8A29E] hover:bg-white dark:hover:bg-[#1A1B20] hover:text-[#E14D2A] transition-colors cursor-pointer"
                      >
                        <btn.icon className="w-3.5 h-3.5" />
                      </button>
                    ))}
                  </div>
                  <textarea
                    id="blog-editor"
                    rows={10}
                    required
                    value={blogContentText}
                    onChange={(e) => setBlogContentText(e.target.value)}
                    placeholder={lang === 'id' ? "Tulis isi artikel di sini...\n\nGunakan format Markdown:\n**tebal**, *miring*, ## heading\n- daftar item\n> kutipan\n`kode`\n[teks link](url)\n\nPisahkan paragraf dengan baris kosong ganda." : "Write article content here...\n\nSupports Markdown:\n**bold**, *italic*, ## heading\n- bullet items\n> quote\n`code`\n[link text](url)\n\nSeparate paragraphs with double blank lines."}
                    className="w-full p-3 bg-transparent font-mono-code text-[#1C1917] dark:text-[#F5F4F0] placeholder-[#A8A29E] outline-none resize-y min-h-[200px]"
                  />
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] text-[#78716C]">{lang === 'id' ? 'Mendukung format Markdown' : 'Supports Markdown format'}</span>
                  <span className="text-[10px] font-mono-code text-[#78716C]">{blogContentText.length} {lang === 'id' ? 'karakter' : 'characters'}</span>
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 font-semibold bg-[#E14D2A] hover:bg-[#C83B1B] text-white rounded-xl cursor-pointer shadow-sm shadow-[#E14D2A]/20 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{lang === 'id' ? 'Simpan & Tayangkan Artikel' : 'Save & Publish Article'}</span>
              </button>
            </form>

            <div className="lg:col-span-5 space-y-3">
              <span className="text-xs font-semibold text-[#1C1917] dark:text-[#F5F4F0]">
                {lang === 'id' ? 'Daftar Artikel di Database' : 'Articles in Database'} ({blogList.length})
              </span>

              {blogList.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#78716C] border border-dashed border-[#EAE5DC] dark:border-[#272A33] rounded-2xl">
                  {lang === 'id' ? 'Belum ada artikel tambahan yang disimpan di database.' : 'No articles stored in database yet.'}
                </div>
              ) : (
                <div className="space-y-2 max-h-[700px] overflow-y-auto">
                  {blogList.map((post) => (
                    <div
                      key={post.id}
                      className="p-3.5 bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-2xl text-xs space-y-2"
                    >
                      {(post as any).cover_image && (
                        <div className="h-20 w-full rounded-lg overflow-hidden border border-[#EAE5DC] dark:border-[#272A33]">
                          <img src={(post as any).cover_image} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono-code font-bold uppercase text-[#E14D2A]">
                            {post.tag}
                          </span>
                          <span className="text-[10px] text-[#78716C]">{post.read_time}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteBlog(post.id)}
                          className="text-[#78716C] hover:text-rose-600 cursor-pointer transition-colors p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="font-semibold text-[#1C1917] dark:text-[#F5F4F0] leading-snug">
                        {post.title}
                      </div>
                      <p className="text-xs text-[#57534E] dark:text-[#A8A29E] line-clamp-2">
                        {post.summary}
                      </p>
                      {(post as any).keywords && (
                        <div className="flex flex-wrap gap-1">
                          {((post as any).keywords as string).split(',').map((kw: string, i: number) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] text-[#78716C] font-mono-code">
                              {kw.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="text-[10px] font-mono-code text-[#78716C]">
                        {new Date(post.created_at).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: RELEASES MANAGER */}
        {activeTab === 'releases' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <form
              onSubmit={handlePostRelease}
              className="lg:col-span-7 p-6 bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-[28px] shadow-xs space-y-4 text-xs"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#EAE5DC] dark:border-[#272A33]">
                <div>
                  <h3 className="font-bold text-sm text-[#1C1917] dark:text-[#F5F4F0]">
                    {lang === 'id' ? 'Publikasikan Catatan Rilis Baru ke /changelog' : 'Publish New Release Note to /changelog'}
                  </h3>
                  <p className="text-xs text-[#78716C]">{lang === 'id' ? 'Catatan rilis akan langsung tampil pada riwayat pembaruan' : 'Release notes will appear immediately on the changelog timeline'}</p>
                </div>
                {relMsg && <span className="text-xs text-emerald-600 font-semibold">{relMsg}</span>}
              </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm block text-[#57534E] dark:text-[#A8A29E] mb-1 font-medium">{lang === 'id' ? 'Nomor Versi' : 'Version Number'}</label>
                  <input
                    type="text"
                    value={relVersion}
                    onChange={(e) => setRelVersion(e.target.value)}
                    placeholder="v1.2.0"
                    className="w-full px-3 py-2 border border-[#EAE5DC] dark:border-[#272A33] rounded-xl bg-transparent font-mono-code"
                  />
                </div>
                <div>
                  <label className="text-sm block text-[#57534E] dark:text-[#A8A29E] mb-1 font-medium">Badge</label>
                  <select
                    value={relBadge}
                    onChange={(e) => setRelBadge(e.target.value)}
                    className="w-full px-3 py-2 border border-[#EAE5DC] dark:border-[#272A33] rounded-xl bg-transparent"
                  >
                    <option value="TERBARU">{lang === 'id' ? 'TERBARU' : 'LATEST'}</option>
                    <option value="STABIL">{lang === 'id' ? 'STABIL' : 'STABLE'}</option>
                    <option value="BETA">BETA</option>
                    <option value="PERBAIKAN">{lang === 'id' ? 'PERBAIKAN' : 'PATCH'}</option>
                    <option value="MAYOR">{lang === 'id' ? 'MAYOR' : 'MAJOR'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm block text-[#57534E] dark:text-[#A8A29E] mb-1 font-medium">{lang === 'id' ? 'Judul Rilis' : 'Release Title'}</label>
                <input
                  type="text"
                  required
                  value={relTitle}
                  onChange={(e) => setRelTitle(e.target.value)}
                  placeholder={lang === 'id' ? 'Pembaruan Fitur Eksport Vektor...' : 'Vector Export Feature Update...'}
                  className="w-full px-3 py-2 border border-[#EAE5DC] dark:border-[#272A33] rounded-xl bg-transparent"
                />
              </div>

              <div>
                <label className="text-sm block text-[#57534E] dark:text-[#A8A29E] mb-1 font-medium">{lang === 'id' ? 'Tanggal Rilis' : 'Release Date'}</label>
                <input
                  type="date"
                  value={relDate}
                  onChange={(e) => setRelDate(e.target.value)}
                  className="w-full px-3 py-2 border border-[#EAE5DC] dark:border-[#272A33] rounded-xl bg-transparent font-mono-code"
                />
              </div>

              <div>
                <label className="text-sm block text-[#57534E] dark:text-[#A8A29E] mb-1 font-medium">{lang === 'id' ? 'Ringkasan Rilis' : 'Release Summary'}</label>
                <textarea
                  rows={2}
                  required
                  value={relHighlights}
                  onChange={(e) => setRelHighlights(e.target.value)}
                  placeholder={lang === 'id' ? 'Rangkuman hal utama yang diperbarui pada rilis ini...' : 'Main highlights updated in this release...'}
                  className="w-full p-3 border border-[#EAE5DC] dark:border-[#272A33] rounded-xl bg-transparent"
                />
              </div>

              <div>
                <label className="text-sm block text-[#57534E] dark:text-[#A8A29E] mb-1 font-medium">
                  {lang === 'id' ? 'Tipe Default Perubahan' : 'Default Change Type'}
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {([
                    { val: 'new' as const, label: lang === 'id' ? 'Baru' : 'New', icon: Plus, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
                    { val: 'fix' as const, label: lang === 'id' ? 'Perbaikan' : 'Fix', icon: Bug, color: 'text-amber-600 bg-amber-50 border-amber-200' },
                    { val: 'improve' as const, label: lang === 'id' ? 'Peningkatan' : 'Improvement', icon: Zap, color: 'text-blue-600 bg-blue-50 border-blue-200' },
                    { val: 'remove' as const, label: lang === 'id' ? 'Dihapus' : 'Removed', icon: Trash2, color: 'text-rose-600 bg-rose-50 border-rose-200' },
                  ]).map((t) => (
                    <button
                      key={t.val}
                      type="button"
                      onClick={() => setRelChangeType(t.val)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${relChangeType === t.val ? t.color : 'text-[#78716C] bg-transparent border-[#EAE5DC] dark:border-[#272A33]'}`}
                    >
                      <t.icon className="w-3 h-3" />
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-[#78716C] mt-1 block">
                  {lang === 'id' ? 'Atau awali tiap baris dengan [new], [fix], [improve], [remove]' : 'Or prefix each line with [new], [fix], [improve], [remove]'}
                </span>
              </div>

              <div>
                <label className="text-sm block text-[#57534E] dark:text-[#A8A29E] mb-1 font-medium">
                  {lang === 'id' ? 'Poin Perubahan (1 baris per perubahan)' : 'Change Items (1 line per item)'}
                </label>
                <textarea
                  rows={5}
                  required
                  value={relChangesText}
                  onChange={(e) => setRelChangesText(e.target.value)}
                  placeholder={lang === 'id' ? "[new] Menambahkan fitur eksport SVG\n[fix] Memperbaiki render QR di Safari\n[improve] Optimasi performa batch generator\nFitur baru tanpa tag (menggunakan tipe default)" : "[new] Added vector SVG export feature\n[fix] Resolved QR canvas rendering on Safari\n[improve] Optimized batch generator performance\nNew item without prefix (uses default type)"}
                  className="w-full p-3 border border-[#EAE5DC] dark:border-[#272A33] rounded-xl bg-transparent font-mono-code"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 font-semibold bg-[#E14D2A] hover:bg-[#C83B1B] text-white rounded-xl cursor-pointer shadow-sm shadow-[#E14D2A]/20 flex items-center gap-1.5"
              >
                <PackagePlus className="w-3.5 h-3.5" />
                <span>{lang === 'id' ? 'Simpan & Tayangkan Rilis' : 'Save & Publish Release'}</span>
              </button>
            </form>

            <div className="lg:col-span-5 space-y-3">
              <span className="text-xs font-semibold text-[#1C1917] dark:text-[#F5F4F0]">
                {lang === 'id' ? 'Daftar Rilis di Database' : 'Releases in Database'} ({relList.length})
              </span>

              {relList.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#78716C] border border-dashed border-[#EAE5DC] dark:border-[#272A33] rounded-2xl">
                  {lang === 'id' ? 'Belum ada rilis tambahan di database.' : 'No release notes stored in database yet.'}
                </div>
              ) : (
                <div className="space-y-2 max-h-[700px] overflow-y-auto">
                  {relList.map((rel) => (
                    <div
                      key={rel.id}
                      className="p-3.5 bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-2xl text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#1C1917] dark:text-[#F5F4F0]">{rel.title}</span>
                          {rel.badge && (
                            <span className="text-[10px] font-mono-code font-bold uppercase px-1.5 py-0.5 rounded-full bg-[#E14D2A]/10 text-[#E14D2A]">
                              {rel.badge}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteRelease(rel.id)}
                          className="text-[#78716C] hover:text-rose-600 cursor-pointer transition-colors p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-[10px] text-[#78716C] font-mono-code">{rel.date}</div>
                      <p className="text-xs text-[#57534E] dark:text-[#A8A29E]">{rel.highlights}</p>
                      {rel.changes && rel.changes.length > 0 && (
                        <div className="space-y-1 pt-1 border-t border-[#EAE5DC]/50 dark:border-[#272A33]/50">
                          {(rel.changes as Array<{ type: string; label: string; text: string }>).slice(0, 5).map((ch, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-[10px]">
                              <span className={`shrink-0 text-[10px] font-mono-code font-bold px-1.5 py-0.5 rounded ${
                                ch.type === 'fix' ? 'bg-amber-50 text-amber-700' :
                                ch.type === 'improve' ? 'bg-blue-50 text-blue-700' :
                                ch.type === 'remove' ? 'bg-rose-50 text-rose-700' :
                                'bg-emerald-50 text-emerald-700'
                              }`}>
                                {ch.label}
                              </span>
                              <span className="text-[#57534E] dark:text-[#A8A29E]">{ch.text}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: FEEDBACK MODERATION */}
        {activeTab === 'feedback' && (
          <div className="bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-[28px] p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE5DC] dark:border-[#272A33]">
              <div>
                <h3 className="text-sm font-bold text-[#1C1917] dark:text-[#F5F4F0]">
                  {lang === 'id' ? 'Moderasi Ulasan & Ide Alat dari Pengguna' : 'User Reviews & Tool Suggestions Moderation'}
                </h3>
                <p className="text-xs text-[#78716C]">{lang === 'id' ? 'Data masuk secara real-time dari halaman /feedback' : 'Real-time feedback submitted from /feedback page'}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Type Filter */}
                <div className="relative">
                  <select
                    value={feedbackFilter}
                    onChange={(e) => setFeedbackFilter(e.target.value as any)}
                    className="text-xs pl-7 pr-3 py-1.5 rounded-lg border border-[#EAE5DC] dark:border-[#272A33] bg-[#FAF8F5] dark:bg-[#121316] text-[#1C1917] dark:text-[#F5F4F0] appearance-none cursor-pointer"
                  >
                    <option value="all">{lang === 'id' ? 'Semua Tipe' : 'All Types'}</option>
                    <option value="review">{lang === 'id' ? 'Ulasan' : 'Reviews'}</option>
                    <option value="idea">{lang === 'id' ? 'Ide' : 'Ideas'}</option>
                    <option value="bug">{lang === 'id' ? 'Bug' : 'Bugs'}</option>
                  </select>
                  <Filter className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#78716C] pointer-events-none" />
                </div>

                {/* Sort */}
                <div className="relative">
                  <select
                    value={feedbackSort}
                    onChange={(e) => setFeedbackSort(e.target.value as any)}
                    className="text-xs pl-7 pr-3 py-1.5 rounded-lg border border-[#EAE5DC] dark:border-[#272A33] bg-[#FAF8F5] dark:bg-[#121316] text-[#1C1917] dark:text-[#F5F4F0] appearance-none cursor-pointer"
                  >
                    <option value="newest">{lang === 'id' ? 'Terbaru' : 'Newest'}</option>
                    <option value="oldest">{lang === 'id' ? 'Terlama' : 'Oldest'}</option>
                    <option value="rating">{lang === 'id' ? 'Rating Tertinggi' : 'Highest Rating'}</option>
                  </select>
                  <ArrowUpDown className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#78716C] pointer-events-none" />
                </div>

                {/* Bulk Delete */}
                {selectedFeedbacks.size > 0 && (
                  <button
                    type="button"
                    onClick={handleBulkDeleteFeedback}
                    className="text-xs px-3 py-1.5 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{lang === 'id' ? `Hapus ${selectedFeedbacks.size} Dipilih` : `Delete ${selectedFeedbacks.size} Selected`}</span>
                  </button>
                )}

                <span className="text-xs font-mono-code font-bold text-[#E14D2A]">
                  {filteredFeedbacks.length} {lang === 'id' ? 'Feedback' : 'Feedback'}
                </span>
              </div>
            </div>

            {filteredFeedbacks.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#78716C] border border-dashed border-[#EAE5DC] dark:border-[#272A33] rounded-2xl bg-[#FAF8F5] dark:bg-[#121316]">
                {lang === 'id' ? 'Belum ada masukan atau review baru di database.' : 'No feedback or reviews stored in database yet.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredFeedbacks.map((item) => {
                  const isSelected = selectedFeedbacks.has(item.id)
                  return (
                    <div
                      key={item.id}
                      className={`p-5 bg-[#FAF8F5] dark:bg-[#121316] border rounded-2xl shadow-xs space-y-2 text-xs transition-colors ${isSelected ? 'border-[#E14D2A] bg-[#E14D2A]/5' : 'border-[#EAE5DC] dark:border-[#272A33]'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleFeedbackSelect(item.id)}
                            className="cursor-pointer text-[#78716C] hover:text-[#E14D2A] transition-colors"
                          >
                            {isSelected ? <CheckSquare className="w-4 h-4 text-[#E14D2A]" /> : <Square className="w-4 h-4" />}
                          </button>
                          <div>
                            <span className="font-bold text-[#1C1917] dark:text-[#F5F4F0]">{item.name}</span>
                            <span className="text-xs text-[#78716C] ml-1.5">({item.role || 'Pengguna'})</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteFeedback(item.id)}
                          className="text-[#78716C] hover:text-rose-600 cursor-pointer transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {item.rating && (
                        <div className="flex items-center gap-0.5 text-[#F59E0B]">
                          {Array.from({ length: item.rating }).map((_, sIdx) => (
                            <Star key={sIdx} className="w-3.5 h-3.5 fill-[#F59E0B]" />
                          ))}
                          {Array.from({ length: 5 - item.rating }).map((_, sIdx) => (
                            <Star key={sIdx} className="w-3.5 h-3.5 text-[#EAE5DC] dark:text-[#272A33]" />
                          ))}
                        </div>
                      )}

                      <p className="text-[#57534E] dark:text-[#A8A29E] leading-relaxed pt-1">
                        "{item.comment}"
                      </p>
                      <div className="flex items-center justify-between text-[10px] font-mono-code text-[#78716C] pt-1">
                        <span className={`px-1.5 py-0.5 rounded ${
                          item.type === 'bug' ? 'bg-rose-50 text-rose-700' :
                          item.type === 'idea' ? 'bg-blue-50 text-blue-700' :
                          'bg-emerald-50 text-emerald-700'
                        }`}>
                          {item.type}
                        </span>
                        <span>{new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB: SETTINGS & BRAND ASSET UPLOADS */}
        {activeTab === 'settings' && (
          <form
            onSubmit={handleSaveSettings}
            className="p-6 sm:p-8 bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-[28px] shadow-xs space-y-8 text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE5DC] dark:border-[#272A33]">
              <div>
                <h3 className="font-bold text-sm text-[#1C1917] dark:text-[#F5F4F0]">
                  {lang === 'id' ? 'Branding & Identitas Situs' : 'Branding & Site Identity'}
                </h3>
                <p className="text-xs text-[#78716C]">
                  {lang === 'id' ? 'Kelola logo, favicon, dan metadata mesin pencari' : 'Manage logos, favicon, and SEO search metadata'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {settingsMsg && (
                  <span className="text-xs text-emerald-600 font-semibold">{settingsMsg}</span>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold bg-[#E14D2A] hover:bg-[#C83B1B] text-white rounded-xl cursor-pointer shadow-sm shadow-[#E14D2A]/20 flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{lang === 'id' ? 'Simpan Branding' : 'Save Branding'}</span>
                </button>
              </div>
            </div>

            {/* Section 1: Logo & Favicon */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#E14D2A] flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4" />
                <span>Logo & Favicon</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Logo Light Mode */}
                <div className="p-4 rounded-2xl border border-[#EAE5DC] dark:border-[#272A33] bg-[#FAF8F5] dark:bg-[#121316] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#1C1917] dark:text-[#F5F4F0] text-xs">{lang === 'id' ? 'Logo Terang' : 'Light Logo'}</span>
                    {logoLight && (
                      <button type="button" onClick={() => { setLogoLight(''); showToast('Logo Dihapus', 'Logo light dihapus.', 'info') }} className="text-[10px] text-rose-600 hover:underline cursor-pointer">{lang === 'id' ? 'Hapus' : 'Delete'}</button>
                    )}
                  </div>
                  {logoLight ? (
                    <div className="h-14 w-full p-2 bg-white rounded-xl border border-slate-200 flex items-center justify-center">
                      <img src={logoLight} alt="Logo Light" className="max-h-full max-w-full object-contain" />
                    </div>
                  ) : (
                    <label className="text-sm h-14 w-full border-2 border-dashed border-[#EAE5DC] dark:border-[#272A33] rounded-xl flex items-center justify-center cursor-pointer hover:border-[#E14D2A] transition-colors">
                      <span className="text-[10px] text-[#78716C] flex items-center gap-1">
                        <UploadCloud className="w-3 h-3 text-[#E14D2A]" />
                        <span>Upload</span>
                      </span>
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setLogoLight, 'Logo Terang')} className="hidden" />
                    </label>
                  )}
                </div>

                {/* Logo Dark Mode */}
                <div className="p-4 rounded-2xl border border-[#EAE5DC] dark:border-[#272A33] bg-[#FAF8F5] dark:bg-[#121316] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#1C1917] dark:text-[#F5F4F0] text-xs">{lang === 'id' ? 'Logo Gelap' : 'Dark Logo'}</span>
                    {logoDark && (
                      <button type="button" onClick={() => { setLogoDark(''); showToast('Logo Dihapus', 'Logo dark dihapus.', 'info') }} className="text-[10px] text-rose-600 hover:underline cursor-pointer">{lang === 'id' ? 'Hapus' : 'Delete'}</button>
                    )}
                  </div>
                  {logoDark ? (
                    <div className="h-14 w-full p-2 bg-[#0F1015] rounded-xl border border-slate-800 flex items-center justify-center">
                      <img src={logoDark} alt="Logo Dark" className="max-h-full max-w-full object-contain" />
                    </div>
                  ) : (
                    <label className="text-sm h-14 w-full border-2 border-dashed border-[#EAE5DC] dark:border-[#272A33] rounded-xl flex items-center justify-center cursor-pointer hover:border-[#E14D2A] transition-colors">
                      <span className="text-[10px] text-[#78716C] flex items-center gap-1">
                        <UploadCloud className="w-3 h-3 text-[#E14D2A]" />
                        <span>Upload</span>
                      </span>
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setLogoDark, 'Logo Gelap')} className="hidden" />
                    </label>
                  )}
                </div>

                {/* Favicon */}
                <div className="p-4 rounded-2xl border border-[#EAE5DC] dark:border-[#272A33] bg-[#FAF8F5] dark:bg-[#121316] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#1C1917] dark:text-[#F5F4F0] text-xs">Favicon</span>
                    {favicon && (
                      <button type="button" onClick={() => { setFavicon(''); showToast('Favicon Dihapus', 'Favicon dihapus.', 'info') }} className="text-[10px] text-rose-600 hover:underline cursor-pointer">{lang === 'id' ? 'Hapus' : 'Delete'}</button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] flex items-center justify-center shrink-0">
                      {favicon ? <img src={favicon} alt="Favicon" className="w-5 h-5 object-contain" /> : <Globe className="w-4 h-4 text-[#78716C]" />}
                    </div>
                    <label className="text-sm flex-1 py-2 px-3 border border-[#EAE5DC] dark:border-[#272A33] rounded-lg bg-white dark:bg-[#1A1B20] text-center cursor-pointer hover:border-[#E14D2A] transition-colors">
                      <span className="text-[10px] font-medium text-[#1C1917] dark:text-[#F5F4F0]">{favicon ? (lang === 'id' ? 'Ganti' : 'Change') : 'Upload'}</span>
                      <input type="file" accept="image/svg+xml, image/png, image/x-icon" onChange={(e) => handleFileUpload(e, setFavicon, 'Favicon')} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* OG Image */}
                <div className="p-4 rounded-2xl border border-[#EAE5DC] dark:border-[#272A33] bg-[#FAF8F5] dark:bg-[#121316] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#1C1917] dark:text-[#F5F4F0] text-xs">{lang === 'id' ? 'Banner Sosial' : 'Social Banner'}</span>
                    {ogImage && (
                      <button type="button" onClick={() => { setOgImage(''); showToast('Banner Dihapus', 'og:image dihapus.', 'info') }} className="text-[10px] text-rose-600 hover:underline cursor-pointer">{lang === 'id' ? 'Hapus' : 'Delete'}</button>
                    )}
                  </div>
                  {ogImage ? (
                    <div className="h-14 w-full p-1 bg-white rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center">
                      <img src={ogImage} alt="OG" className="max-h-full max-w-full object-cover" />
                    </div>
                  ) : (
                    <label className="text-sm h-14 w-full border-2 border-dashed border-[#EAE5DC] dark:border-[#272A33] rounded-xl flex items-center justify-center cursor-pointer hover:border-[#E14D2A] transition-colors">
                      <span className="text-[10px] text-[#78716C] flex items-center gap-1">
                        <UploadCloud className="w-3 h-3 text-[#E14D2A]" />
                        <span>1200x630</span>
                      </span>
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setOgImage, 'Social Banner')} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: SEO & Metadata */}
            <div className="space-y-4 pt-4 border-t border-[#EAE5DC] dark:border-[#272A33]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#E14D2A] flex items-center gap-1.5">
                <Globe className="w-4 h-4" />
                <span>SEO & Metadata</span>
              </h4>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm block text-[#57534E] dark:text-[#A8A29E] mb-1 font-medium">{lang === 'id' ? 'Judul Website (Meta Title)' : 'Website Title (Meta Title)'}</label>
                  <input type="text" required value={siteTitle} onChange={(e) => setSiteTitle(e.target.value)} className="w-full px-3 py-2 border border-[#EAE5DC] dark:border-[#272A33] rounded-xl bg-transparent" />
                </div>
                <div>
                  <label className="text-sm block text-[#57534E] dark:text-[#A8A29E] mb-1 font-medium">{lang === 'id' ? 'Nama Penulis / Brand' : 'Author / Brand Name'}</label>
                  <input type="text" value={siteAuthor} onChange={(e) => setSiteAuthor(e.target.value)} className="w-full px-3 py-2 border border-[#EAE5DC] dark:border-[#272A33] rounded-xl bg-transparent" />
                </div>
              </div>

              <div>
                <label className="text-sm block text-[#57534E] dark:text-[#A8A29E] mb-1 font-medium">{lang === 'id' ? 'Deskripsi Mesin Pencari (Meta Description)' : 'Search Description (Meta Description)'}</label>
                <textarea rows={2} required value={siteDesc} onChange={(e) => setSiteDesc(e.target.value)} className="w-full p-3 border border-[#EAE5DC] dark:border-[#272A33] rounded-xl bg-transparent" />
                <span className="text-[10px] text-[#78716C] mt-0.5 block">{siteDesc.length}/160 {lang === 'id' ? 'karakter' : 'characters'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-sm block text-[#57534E] dark:text-[#A8A29E] mb-1 font-medium">{lang === 'id' ? 'Kata Kunci (Keywords)' : 'Keywords'}</label>
                  <input type="text" required value={siteKeywords} onChange={(e) => setSiteKeywords(e.target.value)} placeholder="kitto, qr code..." className="w-full px-3 py-2 border border-[#EAE5DC] dark:border-[#272A33] rounded-xl bg-transparent font-mono-code" />
                </div>
                <div>
                  <label className="text-sm block text-[#57534E] dark:text-[#A8A29E] mb-1 font-medium">{lang === 'id' ? 'Twitter / X Handle' : 'Twitter / X Handle'}</label>
                  <input type="text" value={siteTwitter} onChange={(e) => setSiteTwitter(e.target.value)} placeholder="@kitto_dev" className="w-full px-3 py-2 border border-[#EAE5DC] dark:border-[#272A33] rounded-xl bg-transparent font-mono-code" />
                </div>
                <div>
                  <label className="text-sm block text-[#57534E] dark:text-[#A8A29E] mb-1 font-medium">{lang === 'id' ? 'Canonical URL' : 'Canonical URL'}</label>
                  <input type="url" value={siteCanonical} onChange={(e) => setSiteCanonical(e.target.value)} placeholder="https://kitto.dev" className="w-full px-3 py-2 border border-[#EAE5DC] dark:border-[#272A33] rounded-xl bg-transparent font-mono-code" />
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
