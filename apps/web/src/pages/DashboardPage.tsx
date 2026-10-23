import { useEffect, useState, useMemo, useRef } from 'react'
import {
  Search,
  Plus,
  ArrowUpRight,
  ArrowRight,
  ExternalLink,
  Edit3,
  RefreshCw,
  QrCode,
  TrendingUp,
  Sliders,
  FileText,
  Star,
  Bookmark,
  LogOut,
  LayoutDashboard,
  User as UserIcon,
  Camera,
  Check,
  KeyRound,
} from 'lucide-react'
import { useAuth } from '../lib/auth'
import { useRouter } from '../lib/router'
import { useI18n } from '../lib/i18n'
import { useToast } from '../lib/toast'
import { useConfirm } from '../lib/confirm'
import { NumberTicker } from '../components/magicui/number-ticker'
import {
  getCollectionTools,
  getFavoriteTools,
  toggleCollectionTool,
  toggleFavoriteTool,
} from '../lib/userPreferences'
import { TOOLS_DATA } from '../data/tools'

interface DynamicQr {
  id: number
  title: string
  slug: string
  target_url: string
  total_scans: number
  created_at: string
}

interface Invoice {
  id: number
  invoice_num: string
  from_company: string
  client_name: string
  total_amount: number
  status: string
  created_at: string
}

interface Preset {
  id: number
  name: string
  config: any
  created_at: string
}

export function DashboardPage() {
  const { user, logout } = useAuth()
  const { navigate } = useRouter()
  const { lang: _lang } = useI18n()
  const { showToast } = useToast()
  const { ask } = useConfirm()

  const [qrs, setQrs] = useState<DynamicQr[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [presets, setPresets] = useState<Preset[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Active Tab Filter on Top Bar
  const [activeMenuTab, setActiveMenuTab] = useState<
    'overview' | 'profile' | 'collection' | 'favorites' | 'qr' | 'invoices' | 'presets'
  >('overview')
  const [searchQuery, setSearchQuery] = useState('')

  // Profile Form States
  const [profileName, setProfileName] = useState(() => user?.name || '')
  const [profileAvatar, setProfileAvatar] = useState(() => user?.avatar || '')
  const [profileBio, setProfileBio] = useState(() => user?.bio || '')
  const [profilePhone, setProfilePhone] = useState(() => user?.phone || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      showToast('Ukuran Terlalu Besar', 'Maksimal ukuran foto adalah 2 MB.', 'error')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.src = reader.result as string
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxDim = 320
        let w = img.width
        let h = img.height
        if (w > h) {
          if (w > maxDim) {
            h = Math.round((h * maxDim) / w)
            w = maxDim
          }
        } else {
          if (h > maxDim) {
            w = Math.round((w * maxDim) / h)
            h = maxDim
          }
        }
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, w, h)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85)
        setProfileAvatar(compressedBase64)
        showToast('Foto Terpilih', 'Klik "Simpan Perubahan Profil" untuk menerapkan foto baru.', 'info')
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (!profileName.trim()) {
      showToast('Nama Wajib Diisi', 'Nama pengguna tidak boleh kosong.', 'error')
      return
    }

    // High security check if user wants to change password
    if (currentPassword || newPassword || confirmPassword) {
      if (!currentPassword) {
        showToast('Kata Sandi Lama Wajib Diisi', 'Masukkan kata sandi lama Anda untuk verifikasi identitas.', 'error')
        return
      }
      if (!newPassword) {
        showToast('Kata Sandi Baru Wajib Diisi', 'Masukkan kata sandi baru yang ingin Anda gunakan.', 'error')
        return
      }
      if (newPassword.length < 6) {
        showToast('Kata Sandi Terlalu Pendek', 'Kata sandi baru minimal harus 6 karakter.', 'error')
        return
      }
      if (newPassword !== confirmPassword) {
        showToast('Konfirmasi Sandi Tidak Cocok', 'Kata sandi baru dan konfirmasi sandi tidak sama.', 'error')
        return
      }
      if (newPassword === currentPassword) {
        showToast('Kata Sandi Sama', 'Kata sandi baru harus berbeda dari kata sandi lama Anda.', 'error')
        return
      }
    }

    setIsSavingProfile(true)
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          name: profileName.trim(),
          avatar: profileAvatar || null,
          bio: profileBio.trim() || null,
          phone: profilePhone.trim() || null,
          currentPassword: currentPassword ? currentPassword : undefined,
          newPassword: newPassword ? newPassword : undefined,
        }),
      })

      const data = await res.json()
      if (res.ok && data.user) {
        useAuth.getState().setUser({
          ...user,
          ...data.user,
        })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        showToast(
          newPassword ? 'Profil & Kata Sandi Diperbarui' : 'Profil Berhasil Diperbarui',
          newPassword
            ? 'Informasi akun dan kata sandi baru Anda berhasil diperbarui.'
            : 'Nama, foto, dan informasi akun Anda telah tersimpan.',
          'success'
        )
      } else {
        showToast('Gagal Memperbarui Profil', data.error || 'Terjadi kesalahan.', 'error')
      }
    } catch {
      showToast('Koneksi Gagal', 'Gagal menghubungi server database.', 'error')
    } finally {
      setIsSavingProfile(false)
    }
  }

  // Collection & Favorite Tools state
  const [collectionIds, setCollectionIds] = useState<string[]>(() => getCollectionTools(user?.id))
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => getFavoriteTools(user?.id))

  useEffect(() => {
    const handlePrefChange = () => {
      setCollectionIds(getCollectionTools(user?.id))
      setFavoriteIds(getFavoriteTools(user?.id))
    }
    handlePrefChange()
    window.addEventListener('kitto_preferences_changed', handlePrefChange)
    return () => window.removeEventListener('kitto_preferences_changed', handlePrefChange)
  }, [user?.id])

  const collectionTools = useMemo(() => {
    return collectionIds.map((id) => TOOLS_DATA.find((t) => t.id === id)).filter(Boolean) as typeof TOOLS_DATA
  }, [collectionIds])

  const favoriteTools = useMemo(() => {
    return favoriteIds.map((id) => TOOLS_DATA.find((t) => t.id === id)).filter(Boolean) as typeof TOOLS_DATA
  }, [favoriteIds])

  // Edit target URL state
  const [editingSlug, setEditingSlug] = useState<string | null>(null)
  const [newTarget, setNewTarget] = useState('')

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [qrRes, invRes, presetRes] = await Promise.all([
        fetch('/api/qr').then((r) => (r.ok ? r.json() : [])),
        fetch('/api/invoices').then((r) => (r.ok ? r.json() : [])),
        fetch('/api/presets?type=qr').then((r) => (r.ok ? r.json() : [])),
      ])

      if (Array.isArray(qrRes)) setQrs(qrRes)
      if (Array.isArray(invRes)) setInvoices(invRes)
      if (Array.isArray(presetRes)) setPresets(presetRes)
    } catch (err) {
      console.warn('Dashboard fetch notice:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    Promise.all([
      fetch('/api/qr').then((r) => (r.ok ? r.json() : [])),
      fetch('/api/invoices').then((r) => (r.ok ? r.json() : [])),
      fetch('/api/presets?type=qr').then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([qrRes, invRes, presetRes]) => {
        if (!active) return
        if (Array.isArray(qrRes)) setQrs(qrRes)
        if (Array.isArray(invRes)) setInvoices(invRes)
        if (Array.isArray(presetRes)) setPresets(presetRes)
        setIsLoading(false)
      })
      .catch((err) => {
        if (active) {
          console.warn('Dashboard fetch notice:', err)
          setIsLoading(false)
        }
      })
    return () => {
      active = false
    }
  }, [])

  const handleUpdateTarget = async (slug: string) => {
    if (!newTarget.trim()) return
    try {
      const res = await fetch(`/api/qr/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl: newTarget.trim() }),
      })
      if (res.ok) {
        setEditingSlug(null)
        setNewTarget('')
        loadData()
        showToast('Target URL Diperbarui', `Tautan /r/${slug} berhasil dialihkan ke tujuan baru.`, 'success')
      } else {
        showToast('Gagal Memperbarui URL', 'Terjadi kesalahan saat menyimpan link target.', 'error')
      }
    } catch {
      showToast('Koneksi Terputus', 'Gagal menghubungi server database.', 'error')
    }
  }

  const handleToggleInvoice = async (id: number, current: string) => {
    const nextStatus = current === 'paid' ? 'unpaid' : 'paid'
    try {
      const res = await fetch(`/api/invoices/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      if (res.ok) {
        loadData()
        showToast(
          nextStatus === 'paid' ? 'Faktur Ditandai Lunas' : 'Faktur Belum Lunas',
          `Status faktur berhasil diubah menjadi ${nextStatus === 'paid' ? 'Lunas' : 'Belum Lunas'}.`,
          'success'
        )
      }
    } catch {
      showToast('Gagal Mengubah Status', 'Terjadi kesalahan saat memperbarui status faktur.', 'error')
    }
  }

  const handleRemoveCollection = (t: typeof TOOLS_DATA[0]) => {
    ask({
      title: 'Hapus dari Koleksi?',
      message: `Hapus "${t.title}" dari koleksi alat Member Area Anda?`,
      confirmText: 'Ya, Hapus',
      variant: 'warning',
      onConfirm: () => {
        toggleCollectionTool(t.id, user?.id)
        showToast('Alat Dihapus dari Koleksi', `${t.title} telah dihapus dari koleksi Member Area Anda.`, 'info')
      },
    })
  }

  const handleRemoveFavorite = (t: typeof TOOLS_DATA[0]) => {
    ask({
      title: 'Hapus dari Favorit?',
      message: `Hapus tanda bintang favorit untuk "${t.title}"?`,
      confirmText: 'Ya, Hapus',
      variant: 'warning',
      onConfirm: () => {
        toggleFavoriteTool(t.id, user?.id)
        showToast('Alat Dihapus dari Favorit', `${t.title} telah dihapus dari daftar favorit Anda.`, 'info')
      },
    })
  }

  const handleConfirmLogout = () => {
    ask({
      title: 'Keluar dari Akun?',
      message: 'Anda akan keluar dari sesi Member Area saat ini.',
      confirmText: 'Ya, Keluar Akun',
      variant: 'danger',
      onConfirm: () => {
        logout()
      },
    })
  }

  // Calculated metrics
  const totalScans = qrs.reduce((acc, curr) => acc + (curr.total_scans || 0), 0)
  const totalInvoiceAmount = invoices.reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0)
  const paidInvoicesCount = invoices.filter((i) => i.status === 'paid').length

  // Date values in state to avoid impure call during render
  const [currentDate] = useState(() => {
    const d = new Date()
    return {
      dayDate: d.getDate(),
      dayName: d.toLocaleDateString('id-ID', { weekday: 'short' }),
      monthName: d.toLocaleDateString('id-ID', { month: 'long' }),
    }
  })

  // Filtered lists
  const filteredQrs = qrs.filter(
    (q) =>
      q.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.target_url.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const userName = user?.name ? user.name.split(' ')[0] : 'Kreator'
  const userFull = user?.name || 'Kreator Studio'

  const menuItems = [
    { id: 'overview' as const, label: 'Ringkasan', icon: LayoutDashboard },
    { id: 'profile' as const, label: 'Profil Saya', icon: UserIcon },
    { id: 'collection' as const, label: 'Koleksi', icon: Bookmark, badge: collectionTools.length },
    { id: 'favorites' as const, label: 'Favorit', icon: Star, badge: favoriteTools.length },
    { id: 'qr' as const, label: 'Dynamic QR', icon: QrCode, badge: qrs.length },
    { id: 'invoices' as const, label: 'Faktur', icon: FileText, badge: invoices.length },
    { id: 'presets' as const, label: 'Template', icon: Sliders, badge: presets.length },
  ]

  return (
    <div className="w-full max-w-7xl lg:max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-8 sm:py-10">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Sidebar Menu */}
        <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-28 space-y-4">
          <div className="bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
            {/* User Mini Profile Header - Clickable to open Profile */}
            <button
              type="button"
              onClick={() => setActiveMenuTab('profile')}
              className="w-full flex items-center gap-3 pb-4 border-b border-[#EAE5DC] dark:border-[#272A33] text-left group cursor-pointer hover:opacity-90 transition-opacity"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#E14D2A] to-[#D4A373] text-white flex items-center justify-center font-bold text-sm uppercase shadow-xs shrink-0 overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  userName.charAt(0)
                )}
              </div>
              <div className="truncate flex-1">
                <div className="text-xs font-bold text-[#1C1917] dark:text-[#F5F4F0] truncate group-hover:text-[#E14D2A] transition-colors">
                  {userFull}
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono-code font-bold leading-none mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  <span>Edit Profil</span>
                </div>
              </div>
            </button>

            {/* Menu Items (7 menu dari screenshot user, diletakkan vertikal di kiri) */}
            <nav className="space-y-1">
              <span className="px-3 text-[10px] font-mono-code uppercase font-bold tracking-wider text-[#78716C] block mb-2">
                MENU MEMBER
              </span>
              {menuItems.map((m) => {
                const Icon = m.icon
                const isActive = activeMenuTab === m.id
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setActiveMenuTab(m.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#E14D2A] text-white shadow-md shadow-[#E14D2A]/25'
                        : 'text-[#57534E] dark:text-[#A8A29E] hover:bg-[#FAF8F5] dark:hover:bg-[#22242B] hover:text-[#1C1917] dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#78716C]'}`} />
                      <span>{m.label}</span>
                    </div>
                    {typeof m.badge === 'number' && (
                      <span
                        className={`text-xs font-mono-code px-2 py-0.5 rounded-full font-bold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-[#FAF8F5] dark:bg-[#22242B] text-[#78716C] border border-[#EAE5DC] dark:border-[#272A33]'
                        }`}
                      >
                        {m.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>

            {/* Web Shortcuts */}
            <div className="pt-3 border-t border-[#EAE5DC] dark:border-[#272A33] space-y-1">
              <span className="px-3 text-[10px] font-mono-code uppercase font-bold tracking-wider text-[#78716C] block mb-1">
                PINTASAN
              </span>
              <button
                type="button"
                onClick={() => navigate('/tools')}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-[#57534E] dark:text-[#A8A29E] hover:bg-[#FAF8F5] dark:hover:bg-[#22242B] cursor-pointer"
              >
                <span>Katalog 26 Alat</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#78716C]" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-[#57534E] dark:text-[#A8A29E] hover:bg-[#FAF8F5] dark:hover:bg-[#22242B] cursor-pointer"
              >
                <span>Beranda Studio QR</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#78716C]" />
              </button>
            </div>

            {/* Logout Button */}
            <div className="pt-3 border-t border-[#EAE5DC] dark:border-[#272A33]">
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="w-full py-2 px-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-2 hover:bg-rose-100 dark:hover:bg-rose-950/60 cursor-pointer transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar dari Akun</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Right Content Area (Penuh dengan padding nyaman) */}
        <div className="flex-1 min-w-0 w-full space-y-6 sm:space-y-8">
          {/* Top Header inside Member Content */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#EAE5DC] dark:border-[#272A33]">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#E14D2A]">
                  Ruang Kerja Member
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#1C1917] dark:text-[#F5F4F0] tracking-tight break-words">
                Selamat Datang, {userFull}
              </h1>
              <p className="text-xs sm:text-sm text-[#78716C] max-w-xl">
                Kelola tautan Dynamic QR, pantau performa pindaian, dan akses koleksi alat Anda.
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
              {/* Search Input */}
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 absolute left-3.5 text-[#78716C] pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari aset..."
                  className="pl-9 pr-4 py-2 w-32 sm:w-44 text-xs rounded-xl bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] text-[#1C1917] dark:text-[#F5F4F0] placeholder-[#78716C] outline-none focus:border-[#E14D2A] transition-colors"
                />
              </div>

              {/* Date Pill Widget */}
              <div className="hidden sm:flex items-center gap-2.5 bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] px-3.5 py-1.5 rounded-2xl shadow-xs shrink-0">
                <div className="w-7 h-7 rounded-full bg-[#FAF8F5] dark:bg-[#121316] text-[#1C1917] dark:text-[#F5F4F0] font-bold font-mono-code text-xs flex items-center justify-center border border-[#EAE5DC] dark:border-[#272A33]">
                  {currentDate.dayDate}
                </div>
                <div className="text-xs leading-tight">
                  <span className="font-semibold text-[#1C1917] dark:text-[#F5F4F0]">{currentDate.dayName}, </span>
                  <span className="text-[#78716C]">{currentDate.monthName}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-4 py-2 text-xs font-bold bg-[#E14D2A] hover:bg-[#C83B1B] text-white rounded-xl shadow-sm shadow-[#E14D2A]/20 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Buat QR</span>
              </button>

              {/* Refresh Data Button */}
              <button
                type="button"
                onClick={loadData}
                title="Segarkan Data"
                className="w-9 h-9 rounded-xl bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] text-[#57534E] dark:text-[#A8A29E] flex items-center justify-center hover:bg-[#F3EFEA] dark:hover:bg-[#22242B] transition-colors cursor-pointer shadow-xs shrink-0"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

        {/* ========================================================= */}
        {/* TOP 4 STATS CARDS ROW (1 Coral Hero + 3 Neutral Cards)    */}
        {/* ========================================================= */}
        {activeMenuTab === 'overview' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Coral Hero Card (Weight 72.5kg style with smooth wave) */}
            <div className="bg-[#E14D2A] text-white rounded-[22px] p-5 shadow-md shadow-[#E14D2A]/20 relative overflow-hidden flex flex-col justify-between min-h-[120px]">
              <div className="flex items-center justify-between z-10">
                <span className="text-xs font-medium opacity-90">Dynamic QR Aktif</span>
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className="flex items-end justify-between z-10 mt-3">
                <div className="text-3xl font-extrabold font-mono-code leading-none">
                  <NumberTicker value={qrs.length} />
                  <span className="text-sm font-normal ml-1">tautan</span>
                </div>

                {/* Decorative mini wave SVG */}
                <svg className="w-20 h-8 opacity-80" viewBox="0 0 100 40" fill="none">
                  <path
                    d="M0 25 C20 10, 40 35, 60 15 C80 -5, 90 20, 100 15"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* Card 2: Neutral Card with Mini Bar Chart (Steps 82,641 style) */}
            <div className="bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-[22px] p-5 shadow-xs flex flex-col justify-between min-h-[120px]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#78716C]">Total Scan Pengunjung</span>
                <span className="w-6 h-6 rounded-full bg-[#FAF8F5] dark:bg-[#121316] text-[#78716C] flex items-center justify-center border border-[#EAE5DC] dark:border-[#272A33]">
                  <QrCode className="w-3 h-3" />
                </span>
              </div>

              <div className="flex items-end justify-between mt-3">
                <div className="text-3xl font-extrabold font-mono-code text-[#1C1917] dark:text-[#F5F4F0] leading-none">
                  <NumberTicker value={totalScans} />
                </div>

                {/* Mini vertical bars visual sparkline */}
                <div className="flex items-end gap-1 h-7">
                  {[40, 65, 30, 90, 50, 75, 45].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className="w-1.5 rounded-full bg-[#E14D2A] opacity-80"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Card 3: Neutral Card with Status Indicator (Sleep 5h 36m style) */}
            <div className="bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-[22px] p-5 shadow-xs flex flex-col justify-between min-h-[120px]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#78716C]">Total Nilai Faktur</span>
                <span className="w-6 h-6 rounded-full bg-[#FAF8F5] dark:bg-[#121316] text-[#78716C] flex items-center justify-center border border-[#EAE5DC] dark:border-[#272A33]">
                  <FileText className="w-3 h-3" />
                </span>
              </div>

              <div className="flex items-end justify-between mt-3">
                <div className="text-xl sm:text-2xl font-extrabold font-mono-code text-[#1C1917] dark:text-[#F5F4F0] leading-none break-all">
                  Rp {(totalInvoiceAmount / 1000000).toFixed(1)}M
                </div>

                {/* Mini status indicator row */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <span
                      key={i}
                      className={`w-1.5 h-3.5 rounded-full ${
                        i <= paidInvoicesCount ? 'bg-emerald-500' : 'bg-[#EAE5DC] dark:bg-[#272A33]'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Card 4: Neutral Card with Wave (Water Intake 1.8L style) */}
            <div className="bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-[22px] p-5 shadow-xs flex flex-col justify-between min-h-[120px]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#78716C]">Template Brand</span>
                <span className="w-6 h-6 rounded-full bg-[#FAF8F5] dark:bg-[#121316] text-[#78716C] flex items-center justify-center border border-[#EAE5DC] dark:border-[#272A33]">
                  <Sliders className="w-3 h-3" />
                </span>
              </div>

              <div className="flex items-end justify-between mt-3">
                <div className="text-3xl font-extrabold font-mono-code text-[#1C1917] dark:text-[#F5F4F0] leading-none">
                  <NumberTicker value={presets.length} />
                  <span className="text-sm font-normal text-[#78716C] ml-1">preset</span>
                </div>

                {/* Mini wave fill graphic */}
                <svg className="w-16 h-6 text-[#D4A373] opacity-60" viewBox="0 0 100 40" fill="currentColor">
                  <path d="M0 25 C30 15, 70 35, 100 20 L100 40 L0 40 Z" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Dedicated Profile Tab View */}
        {activeMenuTab === 'profile' && (
          <div className="bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-3xl p-6 sm:p-9 shadow-xs space-y-8">
            <div className="pb-4 border-b border-[#EAE5DC] dark:border-[#272A33] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#1C1917] dark:text-[#F5F4F0] flex items-center gap-2.5">
                  <UserIcon className="w-6 h-6 text-[#E14D2A]" />
                  <span>Pengaturan Profil & Akun Member</span>
                </h3>
                <p className="text-sm text-[#78716C] mt-1">
                  Ubah identitas publik, foto avatar profil, kontak, dan kata sandi akun Anda.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono-code font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Akun Terverifikasi</span>
              </span>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-8">
              {/* Avatar Uploader Section */}
              <div className="p-6 bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] rounded-3xl flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-[#E14D2A] to-[#D4A373] text-white flex items-center justify-center font-black text-3xl uppercase shadow-lg shadow-[#E14D2A]/25 overflow-hidden border-2 border-white dark:border-[#272A33]">
                    {profileAvatar ? (
                      <img src={profileAvatar} alt={profileName || 'Avatar'} className="w-full h-full object-cover" />
                    ) : (
                      (profileName || userName).charAt(0)
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    title="Unggah Foto Baru"
                    className="absolute -bottom-1 -right-1 p-2.5 rounded-xl bg-[#E14D2A] text-white hover:bg-[#C83B1B] shadow-md transition-transform hover:scale-110 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>

                <div className="space-y-2 text-center sm:text-left flex-1">
                  <h4 className="text-base font-bold text-[#1C1917] dark:text-[#F5F4F0]">
                    Foto Profil (Avatar)
                  </h4>
                  <p className="text-xs sm:text-sm text-[#78716C] leading-relaxed max-w-md">
                    Foto avatar akan ditampilkan di bilah atas, menu profil, dan tanda tangan digital dokumen Anda.
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="px-4 py-2 text-xs sm:text-sm font-bold bg-[#E14D2A] hover:bg-[#C83B1B] text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Pilih Foto Baru
                    </button>
                    {profileAvatar && (
                      <button
                        type="button"
                        onClick={() => {
                          setProfileAvatar('')
                          showToast('Foto Dihapus', 'Foto profil telah dicopot (menggunakan inisial huruf).', 'info')
                        }}
                        className="px-4 py-2 text-xs sm:text-sm font-bold border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                      >
                        Hapus Foto
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
                <div className="space-y-1.5">
                  <label className="block text-sm sm:text-sm font-semibold text-[#1C1917] dark:text-[#F5F4F0]">
                    Nama Pengguna / Brand Studio *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Contoh: Budi Santoso atau Studio Kreatif"
                    className="w-full px-4 py-3 text-sm sm:text-base border border-[#EAE5DC] dark:border-[#272A33] rounded-2xl bg-[#FAF8F5] dark:bg-[#121316] text-[#1C1917] dark:text-[#F5F4F0] outline-none focus:border-[#E14D2A] transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm sm:text-sm font-semibold text-[#1C1917] dark:text-[#F5F4F0]">
                    Alamat Email (Login)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full px-4 py-3 text-sm sm:text-base border border-[#EAE5DC] dark:border-[#272A33] rounded-2xl bg-[#FAF8F5]/50 dark:bg-[#121316]/50 text-[#78716C] font-mono-code cursor-not-allowed opacity-80"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm sm:text-sm font-semibold text-[#1C1917] dark:text-[#F5F4F0]">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full px-4 py-3 text-sm sm:text-base border border-[#EAE5DC] dark:border-[#272A33] rounded-2xl bg-[#FAF8F5] dark:bg-[#121316] text-[#1C1917] dark:text-[#F5F4F0] font-mono-code outline-none focus:border-[#E14D2A] transition-colors"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-sm sm:text-sm font-semibold text-[#1C1917] dark:text-[#F5F4F0]">
                    Bio Singkat / Tentang Saya
                  </label>
                  <textarea
                    rows={3}
                    value={profileBio}
                    onChange={(e) => setProfileBio(e.target.value)}
                    placeholder="Ceritakan sedikit tentang dirimu, profesi, atau bisnis yang kamu kelola..."
                    className="w-full p-4 text-sm sm:text-base border border-[#EAE5DC] dark:border-[#272A33] rounded-2xl bg-[#FAF8F5] dark:bg-[#121316] text-[#1C1917] dark:text-[#F5F4F0] outline-none focus:border-[#E14D2A] transition-colors leading-relaxed"
                  />
                </div>

                {/* High Security Password Change Box */}
                <div className="sm:col-span-2 pt-6 border-t border-[#EAE5DC] dark:border-[#272A33] space-y-4">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-[#E14D2A]" />
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-[#1C1917] dark:text-[#F5F4F0]">
                        Keamanan & Ubah Kata Sandi Akun
                      </h4>
                      <p className="text-xs text-[#78716C] mt-0.5">
                        Demi keamanan akun Anda, masukkan kata sandi lama terlebih dahulu untuk menetapkan kata sandi baru.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-[#1C1917] dark:text-[#F5F4F0]">
                        Kata Sandi Saat Ini (Lama)
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 text-sm border border-[#EAE5DC] dark:border-[#272A33] rounded-xl bg-[#FAF8F5] dark:bg-[#121316] text-[#1C1917] dark:text-[#F5F4F0] font-mono-code outline-none focus:border-[#E14D2A] transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-[#1C1917] dark:text-[#F5F4F0]">
                        Kata Sandi Baru (Min. 6 Karakter)
                      </label>
                      <input
                        type="password"
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 text-sm border border-[#EAE5DC] dark:border-[#272A33] rounded-xl bg-[#FAF8F5] dark:bg-[#121316] text-[#1C1917] dark:text-[#F5F4F0] font-mono-code outline-none focus:border-[#E14D2A] transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-[#1C1917] dark:text-[#F5F4F0]">
                        Ulangi Kata Sandi Baru
                      </label>
                      <input
                        type="password"
                        minLength={6}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 text-sm border border-[#EAE5DC] dark:border-[#272A33] rounded-xl bg-[#FAF8F5] dark:bg-[#121316] text-[#1C1917] dark:text-[#F5F4F0] font-mono-code outline-none focus:border-[#E14D2A] transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-[#EAE5DC] dark:border-[#272A33] flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-[#78716C]">
                  Perubahan akan otomatis tersinkronisasi ke seluruh perangkat Anda.
                </span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (user) {
                        setProfileName(user.name || '')
                        setProfileAvatar(user.avatar || '')
                        setProfileBio(user.bio || '')
                        setProfilePhone(user.phone || '')
                        setCurrentPassword('')
                        setNewPassword('')
                        setConfirmPassword('')
                      }
                    }}
                    className="px-4 py-2.5 text-xs sm:text-sm font-semibold border border-[#EAE5DC] dark:border-[#272A33] rounded-xl hover:bg-[#FAF8F5] dark:hover:bg-[#22242B] cursor-pointer"
                  >
                    Reset Form
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="px-6 py-2.5 text-xs sm:text-sm font-bold bg-[#E14D2A] hover:bg-[#C83B1B] text-white rounded-xl shadow-md shadow-[#E14D2A]/25 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isSavingProfile ? 'Menyimpan...' : 'Simpan Perubahan Profil'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Dedicated Collection Tab View */}
        {activeMenuTab === 'collection' && (
          <div className="bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-[28px] p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE5DC] dark:border-[#272A33]">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#1C1917] dark:text-[#F5F4F0] flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-[#E14D2A] fill-[#E14D2A]" />
                  <span>Koleksi Alat Saya ({collectionTools.length})</span>
                </h3>
                <p className="text-xs text-[#78716C] mt-0.5">
                  Daftar alat yang Anda simpan di Member Area untuk akses langsung tanpa mencari lagi.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/tools')}
                className="px-4 py-2 text-xs font-bold bg-[#E14D2A] text-white hover:bg-[#C83B1B] rounded-xl shadow-xs cursor-pointer self-start sm:self-auto"
              >
                + Tambah dari Katalog 26 Alat
              </button>
            </div>

            {collectionTools.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <Bookmark className="w-10 h-10 text-[#78716C]/40 mx-auto" />
                <div className="text-sm font-semibold text-[#1C1917] dark:text-[#F5F4F0]">
                  Belum ada alat yang disimpan ke koleksi
                </div>
                <p className="text-xs text-[#78716C] max-w-sm mx-auto">
                  Buka halaman detail alat apa pun dan klik tombol "Tambah ke Koleksi" untuk menyimpannya di sini.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/tools')}
                  className="px-4 py-2 text-xs font-bold border border-[#EAE5DC] dark:border-[#272A33] rounded-xl hover:bg-[#F3EFEA] dark:hover:bg-[#22242B] cursor-pointer"
                >
                  Jelajahi Katalog Alat
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {collectionTools.map((t) => (
                  <div
                    key={t.id}
                    className="p-5 rounded-2xl border border-[#EAE5DC] dark:border-[#272A33] bg-[#FAF8F5] dark:bg-[#121316] flex flex-col justify-between space-y-3 hover:border-[#E14D2A]/50 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono-code uppercase px-2 py-0.5 rounded-full bg-white dark:bg-[#1A1B20] text-[#78716C] border border-[#EAE5DC] dark:border-[#272A33]">
                          {t.category}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCollection(t)}
                          title="Hapus dari koleksi"
                          className="text-xs text-rose-600 hover:underline cursor-pointer font-medium"
                        >
                          Hapus
                        </button>
                      </div>
                      <h4 className="font-bold text-sm text-[#1C1917] dark:text-[#F5F4F0]">
                        {t.title}
                      </h4>
                      <p className="text-xs text-[#78716C] line-clamp-2 mt-1">
                        {t.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(`/${t.id}`)}
                      className="w-full py-2 text-xs font-bold bg-[#E14D2A] text-white hover:bg-[#C83B1B] rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Buka Alat Ini</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Dedicated Favorites Tab View */}
        {activeMenuTab === 'favorites' && (
          <div className="bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-[28px] p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE5DC] dark:border-[#272A33]">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#1C1917] dark:text-[#F5F4F0] flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span>Alat Favorit Saya ({favoriteTools.length})</span>
                </h3>
                <p className="text-xs text-[#78716C] mt-0.5">
                  Daftar seluruh alat yang telah Anda beri tanda bintang favorit.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/tools')}
                className="px-4 py-2 text-xs font-bold bg-[#E14D2A] text-white hover:bg-[#C83B1B] rounded-xl shadow-xs cursor-pointer self-start sm:self-auto"
              >
                + Cari Alat Lainnya
              </button>
            </div>

            {favoriteTools.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <Star className="w-10 h-10 text-[#78716C]/40 mx-auto" />
                <div className="text-sm font-semibold text-[#1C1917] dark:text-[#F5F4F0]">
                  Belum ada alat yang difavoritkan
                </div>
                <p className="text-xs text-[#78716C] max-w-sm mx-auto">
                  Buka halaman detail alat apa pun dan klik tombol "Favoritkan" untuk menyimpannya di sini.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/tools')}
                  className="px-4 py-2 text-xs font-bold border border-[#EAE5DC] dark:border-[#272A33] rounded-xl hover:bg-[#F3EFEA] dark:hover:bg-[#22242B] cursor-pointer"
                >
                  Jelajahi Katalog Alat
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoriteTools.map((t) => (
                  <div
                    key={t.id}
                    className="p-5 rounded-2xl border border-[#EAE5DC] dark:border-[#272A33] bg-[#FAF8F5] dark:bg-[#121316] flex flex-col justify-between space-y-3 hover:border-amber-400 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono-code uppercase px-2 py-0.5 rounded-full bg-white dark:bg-[#1A1B20] text-[#78716C] border border-[#EAE5DC] dark:border-[#272A33]">
                          {t.category}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFavorite(t)}
                          title="Hapus favorit"
                          className="text-xs text-rose-600 hover:underline cursor-pointer font-medium"
                        >
                          Hapus
                        </button>
                      </div>
                      <h4 className="font-bold text-sm text-[#1C1917] dark:text-[#F5F4F0]">
                        {t.title}
                      </h4>
                      <p className="text-xs text-[#78716C] line-clamp-2 mt-1">
                        {t.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(`/${t.id}`)}
                      className="w-full py-2 text-xs font-bold bg-[#E14D2A] text-white hover:bg-[#C83B1B] rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Buka Alat Ini</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* OVERVIEW 2-COLUMN DASHBOARD (100% Dynamic & Topic-Aligned) */}
        {/* ========================================================= */}
        {activeMenuTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (7 cols): Dynamic QRs & Recent Invoices */}
            <div className="lg:col-span-7 space-y-6">
              {/* Box 1: Dynamic QR Quick Links */}
              <div className="bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#EAE5DC] dark:border-[#272A33]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#E14D2A]/10 text-[#E14D2A] flex items-center justify-center">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-[#1C1917] dark:text-[#F5F4F0]">
                        Tautan Dynamic QR Aktif
                      </h3>
                      <p className="text-xs text-[#78716C]">
                        {qrs.length} tautan aktif dialihkan via /r/:slug
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveMenuTab('qr')}
                    className="text-xs font-bold text-[#E14D2A] hover:underline cursor-pointer"
                  >
                    Kelola Semua &rarr;
                  </button>
                </div>

                {qrs.length === 0 ? (
                  <div className="py-8 text-center space-y-2 border border-dashed border-[#EAE5DC] dark:border-[#272A33] rounded-2xl bg-[#FAF8F5] dark:bg-[#121316] p-4">
                    <p className="text-xs text-[#78716C]">
                      Belum ada Dynamic QR yang dibuat. Buat QR pertama Anda untuk mendapatkan link pendek yang bisa diedit kapan saja.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate('/')}
                      className="px-4 py-2 text-xs font-bold bg-[#E14D2A] text-white rounded-xl hover:bg-[#C83B1B] cursor-pointer"
                    >
                      Buat Dynamic QR Sekarang
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {qrs.slice(0, 4).map((item) => (
                      <div
                        key={item.slug}
                        className="p-3.5 bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] rounded-2xl flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="truncate min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold font-mono-code text-xs text-[#1C1917] dark:text-[#F5F4F0]">
                              /r/{item.slug}
                            </span>
                            <span className="text-[10px] font-mono-code font-bold px-2 py-0.5 rounded-full bg-[#E14D2A]/10 text-[#E14D2A]">
                              {item.total_scans || 0} scan
                            </span>
                          </div>
                          <div className="text-xs text-[#78716C] truncate mt-0.5 max-w-xs">
                            {item.target_url}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <a
                            href={`/r/${item.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 text-xs font-semibold text-[#1F6C9F] dark:text-[#8ec5fc] hover:underline flex items-center gap-1"
                          >
                            <span>Tes</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuTab('qr')
                              setEditingSlug(item.slug)
                              setNewTarget(item.target_url)
                            }}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-[#EAE5DC] dark:border-[#272A33] hover:bg-white dark:hover:bg-[#1A1B20] text-[#1C1917] dark:text-[#F5F4F0] cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Box 2: Recent Invoices Vault */}
              <div className="bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#EAE5DC] dark:border-[#272A33]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-[#1C1917] dark:text-[#F5F4F0]">
                        Arsip Faktur Tagihan
                      </h3>
                      <p className="text-xs text-[#78716C]">
                        {invoices.length} nota ({paidInvoicesCount} Lunas)
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveMenuTab('invoices')}
                    className="text-xs font-bold text-[#E14D2A] hover:underline cursor-pointer"
                  >
                    Buka Vault &rarr;
                  </button>
                </div>

                {invoices.length === 0 ? (
                  <div className="py-8 text-center space-y-2 border border-dashed border-[#EAE5DC] dark:border-[#272A33] rounded-2xl bg-[#FAF8F5] dark:bg-[#121316] p-4">
                    <p className="text-xs text-[#78716C]">
                      Belum ada faktur yang disimpan ke cloud vault.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate('/invoice-gen')}
                      className="px-4 py-2 text-xs font-bold bg-[#E14D2A] text-white rounded-xl hover:bg-[#C83B1B] cursor-pointer"
                    >
                      Buka Generator Invoice
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {invoices.slice(0, 4).map((inv) => (
                      <div
                        key={inv.id}
                        className="p-3.5 bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] rounded-2xl flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3 truncate">
                          <input
                            type="checkbox"
                            checked={inv.status === 'paid'}
                            onChange={() => handleToggleInvoice(inv.id, inv.status)}
                            className="w-4 h-4 rounded accent-[#E14D2A] cursor-pointer shrink-0"
                            title="Centang untuk menandai lunas"
                          />
                          <div className="truncate">
                            <div className="font-bold font-mono-code text-xs text-[#1C1917] dark:text-[#F5F4F0]">
                              {inv.invoice_num}
                            </div>
                            <div className="text-xs text-[#78716C] truncate mt-0.5">
                              {inv.client_name} • <span className="font-bold text-[#E14D2A]">Rp {Number(inv.total_amount).toLocaleString('id-ID')}</span>
                            </div>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-mono-code font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            inv.status === 'paid'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200'
                          }`}
                        >
                          {inv.status === 'paid' ? 'LUNAS' : 'BELUM'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column (5 cols): Collections, Favorites & Presets */}
            <div className="lg:col-span-5 space-y-6">
              {/* Box 1: Collection Tools */}
              <div className="bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#EAE5DC] dark:border-[#272A33]">
                  <div className="flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-[#E14D2A] fill-[#E14D2A]" />
                    <h3 className="text-sm sm:text-base font-bold text-[#1C1917] dark:text-[#F5F4F0]">
                      Koleksi Alat Saya ({collectionTools.length})
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveMenuTab('collection')}
                    className="text-xs font-bold text-[#E14D2A] hover:underline cursor-pointer"
                  >
                    Buka Tab &rarr;
                  </button>
                </div>

                {collectionTools.length === 0 ? (
                  <div className="py-6 text-center space-y-2 border border-dashed border-[#EAE5DC] dark:border-[#272A33] rounded-2xl bg-[#FAF8F5] dark:bg-[#121316] p-4">
                    <p className="text-xs text-[#78716C]">
                      Belum ada alat yang disimpan ke koleksi.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate('/tools')}
                      className="px-3.5 py-1.5 text-xs font-bold border border-[#EAE5DC] dark:border-[#272A33] rounded-xl hover:bg-[#FAF8F5] dark:hover:bg-[#22242B] cursor-pointer"
                    >
                      Pilih dari Katalog 26 Alat
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {collectionTools.slice(0, 3).map((t) => (
                      <div
                        key={t.id}
                        onClick={() => navigate(`/${t.id}`)}
                        className="p-3 bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] rounded-2xl flex items-center justify-between hover:border-[#E14D2A] transition-all cursor-pointer group"
                      >
                        <div className="truncate pr-2">
                          <div className="text-xs font-bold text-[#1C1917] dark:text-[#F5F4F0] group-hover:text-[#E14D2A] transition-colors truncate">
                            {t.title}
                          </div>
                          <div className="text-[10px] text-[#78716C] truncate">
                            {t.description}
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#78716C] group-hover:text-[#E14D2A] group-hover:translate-x-0.5 transition-transform shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Box 2: Favorite Tools */}
              {favoriteTools.length > 0 && (
                <div className="bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-3xl p-6 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#EAE5DC] dark:border-[#272A33]">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                      <span>Alat Favorit ({favoriteTools.length})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveMenuTab('favorites')}
                      className="text-xs font-bold text-amber-600 hover:underline cursor-pointer"
                    >
                      Buka Tab &rarr;
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {favoriteTools.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => navigate(`/${t.id}`)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] hover:border-amber-400 cursor-pointer transition-colors"
                      >
                        {t.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Box 3: Brand Presets */}
              <div className="bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#EAE5DC] dark:border-[#272A33]">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#D4A373]" />
                    <h3 className="text-sm sm:text-base font-bold text-[#1C1917] dark:text-[#F5F4F0]">
                      Template Brand ({presets.length})
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveMenuTab('presets')}
                    className="text-xs font-bold text-[#E14D2A] hover:underline cursor-pointer"
                  >
                    Kelola &rarr;
                  </button>
                </div>

                {presets.length === 0 ? (
                  <div className="py-6 text-center space-y-2 border border-dashed border-[#EAE5DC] dark:border-[#272A33] rounded-2xl bg-[#FAF8F5] dark:bg-[#121316] p-4">
                    <p className="text-xs text-[#78716C]">
                      Belum ada template gaya brand QR yang disimpan.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate('/qr')}
                      className="px-3.5 py-1.5 text-xs font-bold border border-[#EAE5DC] dark:border-[#272A33] rounded-xl hover:bg-[#FAF8F5] dark:hover:bg-[#22242B] cursor-pointer"
                    >
                      Bikin di QR Studio
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {presets.slice(0, 3).map((p) => (
                      <div
                        key={p.id}
                        className="p-3 bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] rounded-2xl flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                            style={{ backgroundColor: p.config?.fgColor || '#E14D2A' }}
                          />
                          <span className="font-bold text-[#1C1917] dark:text-[#F5F4F0] truncate">
                            {p.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate('/qr')}
                          className="px-2.5 py-1 text-xs font-semibold text-[#E14D2A] hover:underline cursor-pointer"
                        >
                          Terapkan
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* EXPANDED MANAGEMENT SECTION (Dynamic QR Link Editor)      */}
        {/* ========================================================= */}
        {activeMenuTab === 'qr' && (
        <div className="bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-[28px] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#EAE5DC] dark:border-[#272A33]">
            <div>
              <h3 className="text-sm font-bold text-[#1C1917] dark:text-[#F5F4F0]">
                Manajemen Dynamic QR Code & Tautan Pengalihan
              </h3>
              <p className="text-xs text-[#78716C]">
                Ubah target tautan seketika tanpa perlu mencetak ulang fisik QR
              </p>
            </div>
            <span className="text-xs font-mono-code font-bold text-[#E14D2A]">
              {qrs.length} Tautan Terdaftar
            </span>
          </div>

          {filteredQrs.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#78716C]">
              Tidak ada QR dinamis yang ditemukan. Buat yang pertama di Studio.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {filteredQrs.map((item) => (
                <div
                  key={item.slug}
                  className="p-4 bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] rounded-2xl flex flex-col justify-between space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono-code text-sm text-[#1C1917] dark:text-[#F5F4F0]">
                        /r/{item.slug}
                      </span>
                      <span className="text-[10px] font-mono-code font-bold px-2 py-0.5 rounded-full bg-[#E14D2A]/10 text-[#E14D2A]">
                        {item.total_scans || 0} Scans
                      </span>
                    </div>
                    <a
                      href={`/r/${item.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#1F6C9F] dark:text-[#8ec5fc] hover:underline flex items-center gap-1"
                    >
                      <span>Tes Buka</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {editingSlug === item.slug ? (
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="url"
                        value={newTarget}
                        onChange={(e) => setNewTarget(e.target.value)}
                        placeholder="https://link-baru.com"
                        className="flex-1 px-3 py-1.5 text-xs border border-[#EAE5DC] dark:border-[#272A33] rounded-lg bg-white dark:bg-[#1A1B20] font-mono-code"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateTarget(item.slug)}
                        className="px-3 py-1.5 text-xs font-semibold bg-[#E14D2A] text-white rounded-lg hover:bg-[#C83B1B] cursor-pointer"
                      >
                        Simpan
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingSlug(null)}
                        className="px-2 text-xs text-[#78716C] cursor-pointer"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-[#78716C] truncate max-w-[240px]">
                        {item.target_url}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSlug(item.slug)
                          setNewTarget(item.target_url)
                        }}
                        className="px-2.5 py-1 border border-[#EAE5DC] dark:border-[#272A33] rounded-lg text-[#1C1917] dark:text-[#F5F4F0] hover:bg-white dark:hover:bg-[#1A1B20] transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3 text-[#E14D2A]" />
                        <span>Edit Link</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        )}

        {/* Dedicated Invoices Tab View */}
        {activeMenuTab === 'invoices' && (
          <div className="bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE5DC] dark:border-[#272A33]">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#1C1917] dark:text-[#F5F4F0] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#E14D2A]" />
                  <span>Arsip Faktur Tagihan ({invoices.length})</span>
                </h3>
                <p className="text-xs text-[#78716C] mt-0.5">
                  Kelola status lunas dan arsip nota pembayaran tagihan UMKM Anda.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/invoice-gen')}
                className="px-4 py-2 text-xs font-bold bg-[#E14D2A] text-white hover:bg-[#C83B1B] rounded-xl shadow-xs cursor-pointer self-start sm:self-auto"
              >
                + Buat Faktur Baru
              </button>
            </div>

            {invoices.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <FileText className="w-10 h-10 text-[#78716C]/40 mx-auto" />
                <div className="text-sm font-semibold text-[#1C1917] dark:text-[#F5F4F0]">
                  Belum ada faktur yang diarsipkan
                </div>
                <p className="text-xs text-[#78716C] max-w-sm mx-auto">
                  Buat faktur pertama Anda dan simpan ke cloud vault untuk melacak status pembayaran klien.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/invoice-gen')}
                  className="px-4 py-2 text-xs font-bold border border-[#EAE5DC] dark:border-[#272A33] rounded-xl hover:bg-[#F3EFEA] dark:hover:bg-[#22242B] cursor-pointer"
                >
                  Buka Generator Invoice
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={inv.status === 'paid'}
                        onChange={() => handleToggleInvoice(inv.id, inv.status)}
                        className="w-4 h-4 rounded accent-[#E14D2A] cursor-pointer shrink-0"
                      />
                      <div>
                        <div className="font-bold font-mono-code text-sm text-[#1C1917] dark:text-[#F5F4F0]">
                          {inv.invoice_num}
                        </div>
                        <div className="text-xs text-[#78716C] mt-0.5">
                          Klien: <span className="font-medium text-[#1C1917] dark:text-[#F5F4F0]">{inv.client_name}</span> • Total: <span className="font-bold text-[#E14D2A]">Rp {Number(inv.total_amount).toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <span
                        className={`text-[10px] font-mono-code font-bold px-2.5 py-1 rounded-full ${
                          inv.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200'
                        }`}
                      >
                        {inv.status === 'paid' ? 'LUNAS' : 'BELUM LUNAS'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Dedicated Presets Tab View */}
        {activeMenuTab === 'presets' && (
          <div className="bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE5DC] dark:border-[#272A33]">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#1C1917] dark:text-[#F5F4F0] flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#E14D2A]" />
                  <span>Template Desain Brand ({presets.length})</span>
                </h3>
                <p className="text-xs text-[#78716C] mt-0.5">
                  Daftar kombinasi warna dan gaya QR kustom yang disimpan di cloud.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/qr')}
                className="px-4 py-2 text-xs font-bold bg-[#E14D2A] text-white hover:bg-[#C83B1B] rounded-xl shadow-xs cursor-pointer self-start sm:self-auto"
              >
                + Bikin Template di QR Studio
              </button>
            </div>

            {presets.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <Sliders className="w-10 h-10 text-[#78716C]/40 mx-auto" />
                <div className="text-sm font-semibold text-[#1C1917] dark:text-[#F5F4F0]">
                  Belum ada template brand tersimpan
                </div>
                <p className="text-xs text-[#78716C] max-w-sm mx-auto">
                  Atur palet warna dan bentuk dot pada studio QR lalu klik "Simpan Desain Ini".
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {presets.map((p) => (
                  <div
                    key={p.id}
                    className="p-5 rounded-2xl border border-[#EAE5DC] dark:border-[#272A33] bg-[#FAF8F5] dark:bg-[#121316] space-y-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-4 h-4 rounded-full border border-black/20 shrink-0"
                        style={{ backgroundColor: p.config?.fgColor || '#E14D2A' }}
                      />
                      <span className="font-bold text-sm text-[#1C1917] dark:text-[#F5F4F0]">
                        {p.name}
                      </span>
                    </div>
                    <div className="text-xs font-mono-code text-[#78716C] space-y-1">
                      <div>Warna: {p.config?.fgColor || '#E14D2A'}</div>
                      <div>Latar: {p.config?.bgColor || '#FFFFFF'}</div>
                      <div>Bentuk Dot: {p.config?.dotStyle || 'rounded'}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/qr')}
                      className="w-full py-2 text-xs font-bold bg-[#E14D2A] text-white rounded-xl hover:bg-[#C83B1B] cursor-pointer transition-colors"
                    >
                      Terapkan di QR Studio
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
  )
}
