import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, ShieldCheck, ArrowRight, HelpCircle } from 'lucide-react'
import { useAuth } from '../../lib/auth'
import { useRouter } from '../../lib/router'
import { useToast } from '../../lib/toast'
import { TurnstileWidget } from '../ui/TurnstileWidget'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [showGoogleGuide, setShowGoogleGuide] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileReset, setTurnstileReset] = useState(0)

  const { setUser } = useAuth()
  const { navigate } = useRouter()
  const { showToast } = useToast()

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  useEffect(() => {
    if (!isOpen) {
      setShowGoogleGuide(false)
      setErrorMsg(null)
      setSuccessMsg(null)
      setTurnstileToken('')
      setTurnstileReset((v) => v + 1)
      return
    }

    // Initialize Google Identity Services (GIS) if available and client ID is set
    const google = (window as any).google
    if (google?.accounts?.id && googleClientId && !googleClientId.includes('your-google-client-id')) {
      try {
        google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: any) => {
            if (response.credential) {
              await handleGoogleCredential(response.credential)
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        })
      } catch (err) {
        console.warn('Google Identity Services notice:', err)
      }
    }
  }, [isOpen, googleClientId])

  const handleGoogleCredential = async (credential: string) => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      })
      const data = await res.json()
      if (res.ok && data.user) {
        setUser(data.user)
        setSuccessMsg(`Berhasil masuk sebagai ${data.user.name}!`)
        showToast('Login Google Berhasil', `Selamat datang di Kitto, ${data.user.name}.`, 'success')
        setTimeout(() => {
          onClose()
          navigate('/member')
          setSuccessMsg(null)
        }, 900)
      } else {
        setErrorMsg(data.error || 'Verifikasi akun Google gagal.')
      }
    } catch {
      setErrorMsg('Gagal terhubung ke server autentikasi.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignInClick = () => {
    const google = (window as any).google

    if (google?.accounts?.id && googleClientId && !googleClientId.includes('your-google-client-id')) {
      // Trigger native GIS Google Account Prompt
      google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setShowGoogleGuide(true)
        }
      })
    } else {
      // Show developer guide & quick demo login
      setShowGoogleGuide((prev) => !prev)
    }
  }

  const handleSimulateGoogleLogin = async (demoEmail: string, demoName: string) => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: demoEmail,
          name: demoName,
          avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${demoEmail}`,
        }),
      })
      const data = await res.json()
      if (res.ok && data.user) {
        setUser(data.user)
        setSuccessMsg(`Berhasil masuk sebagai ${data.user.name}!`)
        showToast('Login Google Sukses', `Terautentikasi sebagai ${data.user.email}.`, 'success')
        setTimeout(() => {
          onClose()
          navigate('/member')
          setSuccessMsg(null)
          setShowGoogleGuide(false)
        }, 900)
      } else {
        setErrorMsg(data.error || 'Gagal masuk akun Google.')
      }
    } catch {
      setErrorMsg('Gagal memproses simulasi login Google.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!turnstileToken) {
      setErrorMsg('Selesaikan verifikasi Cloudflare terlebih dahulu.')
      return
    }

    setLoading(true)

    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login'
      const payload = mode === 'register'
        ? { name, email, password, turnstileToken }
        : { email, password, turnstileToken }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        setTurnstileToken('')
        setTurnstileReset((v) => v + 1)
        setErrorMsg(data.error || 'Terjadi kesalahan autentikasi')
      } else {
        setUser(data.user)
        setSuccessMsg(
          mode === 'register'
            ? 'Akun Kreator berhasil dibuat dan aktif!'
            : 'Berhasil masuk ke Ruang Kerja Akun Anda!'
        )
        setTimeout(() => {
          onClose()
          navigate('/member')
          setName('')
          setEmail('')
          setPassword('')
          setSuccessMsg(null)
        }, 900)
      }
    } catch {
      setTurnstileToken('')
      setTurnstileReset((v) => v + 1)
      setErrorMsg('Gagal terhubung ke server database API')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Framer Motion Animated Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Framer Motion Animated Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            className="relative z-10 w-full max-w-lg bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-3xl p-5 sm:p-9 shadow-2xl space-y-6 my-auto"
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#EAE5DC] dark:border-[#272A33]">
              <div>
                <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#E14D2A]">
                  Ruang Kerja Kreator
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1C1917] dark:text-[#F5F4F0] mt-1 tracking-tight">
                  {mode === 'login' ? 'Masuk ke Akun' : 'Daftar Akun Baru'}
                </h2>
                <p className="text-sm text-[#78716C] mt-1 leading-relaxed">
                  Kelola Dynamic QR, simpan arsip faktur, dan sinkronkan aset brand Anda.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={onClose}
                className="p-2 text-[#78716C] hover:text-[#1C1917] dark:hover:text-white rounded-xl hover:bg-[#F3EFEA] dark:hover:bg-[#22242B] cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Benefit Highlight Box */}
            <div className="p-4 bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] rounded-2xl space-y-2 text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E]">
              <div className="font-bold text-[#1C1917] dark:text-[#F5F4F0] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#E14D2A]" />
                <span>Keuntungan Akun Terdaftar:</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#E14D2A] shrink-0" />
                <span>Ubah URL target Dynamic QR kapan saja tanpa cetak ulang</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#E14D2A] shrink-0" />
                <span>Analitik scan harian, device pemindai & status aktif</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#E14D2A] shrink-0" />
                <span>Arsip faktur tagihan UMKM & template warna kustom</span>
              </div>
            </div>

            {/* Notifications */}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 text-sm text-rose-700 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl font-medium"
              >
                {errorMsg}
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 text-sm text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl font-bold flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>{successMsg}</span>
              </motion.div>
            )}

            {/* Google OAuth Button (Full Width, Discord Removed) */}
            <div className="space-y-3">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleGoogleSignInClick}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 text-xs sm:text-sm font-semibold border border-[#EAE5DC] dark:border-[#272A33] rounded-xl hover:bg-[#FAF8F5] dark:hover:bg-[#22242B] hover:border-[#E14D2A] transition-all cursor-pointer text-[#1C1917] dark:text-[#F5F4F0] shadow-xs"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Lanjutkan dengan Akun Google</span>
              </motion.button>

              {/* Google OAuth Setup Guide & Quick Test Box */}
              {showGoogleGuide && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 text-xs space-y-3"
                >
                  <div className="flex items-center justify-between text-amber-900 dark:text-amber-200 font-bold">
                    <span className="flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-amber-600" />
                      <span>Konfigurasi Google Client ID</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowGoogleGuide(false)}
                      className="text-[#78716C] hover:text-[#1C1917] cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[#57534E] dark:text-[#A8A29E] leading-relaxed">
                    Untuk menghubungkan Google Login resmi ke domain ini, tambahkan <strong>VITE_GOOGLE_CLIENT_ID</strong> di berkas <code>.env</code>:
                  </p>

                  <ol className="list-decimal list-inside space-y-1 text-[#57534E] dark:text-[#A8A29E] font-mono-code text-xs">
                    <li>Buka Google Cloud Console &rarr; Credentials</li>
                    <li>Buat OAuth 2.0 Client ID (Web Application)</li>
                    <li>Authorized JavaScript origins: <code>http://localhost:5173</code></li>
                    <li>Salin Client ID ke <code>apps/web/.env</code></li>
                  </ol>

                  <div className="pt-2 border-t border-amber-200/60 dark:border-amber-800/40 flex items-center justify-between">
                    <span className="text-xs text-[#78716C]">Ingin menguji langsung sekarang?</span>
                    <button
                      type="button"
                      onClick={() => handleSimulateGoogleLogin('kreator.google@kitto.dev', 'Kreator Google')}
                      className="px-3 py-1.5 rounded-lg bg-[#E14D2A] text-white font-semibold text-xs hover:bg-[#C83B1B] cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <span>Simulasi Masuk Google</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-[#EAE5DC] dark:border-[#272A33] w-full" />
              <span className="bg-white dark:bg-[#1A1B20] px-3 text-xs font-medium text-[#78716C] absolute">
                atau via email & sandi
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-sm sm:text-sm font-semibold text-[#1C1917] dark:text-[#F5F4F0] mb-1.5">
                    Nama Lengkap / Studio
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full px-4 py-3 text-sm sm:text-base border border-[#EAE5DC] dark:border-[#272A33] rounded-xl outline-none bg-transparent text-[#1C1917] dark:text-[#F5F4F0] focus:border-[#E14D2A] focus:ring-2 focus:ring-[#E14D2A]/20 transition-all placeholder:text-[#78716C]/60"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm sm:text-sm font-semibold text-[#1C1917] dark:text-[#F5F4F0] mb-1.5">
                  Alamat Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@domain.com"
                  className="w-full px-4 py-3 text-sm sm:text-base border border-[#EAE5DC] dark:border-[#272A33] rounded-xl outline-none bg-transparent text-[#1C1917] dark:text-[#F5F4F0] focus:border-[#E14D2A] focus:ring-2 focus:ring-[#E14D2A]/20 transition-all placeholder:text-[#78716C]/60"
                />
              </div>

              <div>
                <label className="block text-sm sm:text-sm font-semibold text-[#1C1917] dark:text-[#F5F4F0] mb-1.5">
                  Kata Sandi (Min. 6 Karakter)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 text-sm sm:text-base border border-[#EAE5DC] dark:border-[#272A33] rounded-xl outline-none bg-transparent text-[#1C1917] dark:text-[#F5F4F0] focus:border-[#E14D2A] focus:ring-2 focus:ring-[#E14D2A]/20 transition-all placeholder:text-[#78716C]/60 font-mono-code"
                />
              </div>

              <TurnstileWidget
                onVerify={setTurnstileToken}
                onExpire={() => setTurnstileToken('')}
                resetKey={turnstileReset}
                className="min-h-[65px]"
              />

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading || !turnstileToken}
                className="w-full py-3.5 sm:py-4 text-sm sm:text-base font-bold bg-[#E14D2A] hover:bg-[#C83B1B] text-white rounded-xl active:scale-[0.98] transition-all cursor-pointer mt-2 disabled:opacity-50 shadow-md shadow-[#E14D2A]/25 flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Memproses...' : mode === 'login' ? 'Masuk ke Ruang Kerja' : 'Daftar Akun Gratis'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </motion.button>
            </form>

            {/* Toggle Mode */}
            <div className="text-center pt-3 border-t border-[#EAE5DC] dark:border-[#272A33]">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login')
                  setErrorMsg(null)
                  setSuccessMsg(null)
                }}
                className="text-xs sm:text-sm font-medium text-[#57534E] dark:text-[#A8A29E] hover:text-[#E14D2A] transition-colors cursor-pointer"
              >
                {mode === 'login'
                  ? 'Belum punya akun? Buat akun kreator gratis'
                  : 'Sudah punya akun? Masuk di sini'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
