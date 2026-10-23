import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useI18n } from '../../lib/i18n'
import { useToast } from '../../lib/toast'
import { useSiteSettings } from '../../lib/settings'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export function PwaInstallPrompt() {
  const { lang } = useI18n()
  const { showToast } = useToast()
  const { settings } = useSiteSettings()
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [showIosGuide, setShowIosGuide] = useState(false)

  const activeFavicon = settings.favicon || '/favicon.svg'

  useEffect(() => {
    // Check if already in standalone / installed PWA mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true

    if (isStandalone) {
      return
    }

    // Check if user previously dismissed in this session
    const isDismissed = sessionStorage.getItem('kitto_pwa_prompt_dismissed')
    if (isDismissed) {
      return
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    // For browsers/devices where beforeinstallprompt doesn't fire immediately (or testing),
    // display prompt after 2.5 seconds if not installed and not dismissed
    const timer = setTimeout(() => {
      if (!isStandalone && !sessionStorage.getItem('kitto_pwa_prompt_dismissed')) {
        setIsVisible(true)
      }
    }, 2500)

    window.addEventListener('appinstalled', () => {
      setIsVisible(false)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      clearTimeout(timer)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      if (choiceResult.outcome === 'accepted') {
        setIsVisible(false)
      }
      setDeferredPrompt(null)
    } else {
      // iOS Safari or desktop browser fallback guide
      const isIos = /iPhone|iPad|iPod/.test(navigator.userAgent) && !(window as any).MSStream
      if (isIos) {
        setShowIosGuide(true)
      } else {
        showToast(
          lang === 'id' ? 'Petunjuk Instalasi' : 'Installation Guide',
          lang === 'id'
            ? 'Klik ikon instal (+) di address bar browser atau pilih menu browser > "Instal Kitto".'
            : 'Click the install (+) icon in your browser address bar or menu > "Install Kitto".',
          'info'
        )
        setIsVisible(false)
      }
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    sessionStorage.setItem('kitto_pwa_prompt_dismissed', 'true')
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed bottom-20 xl:bottom-6 right-4 sm:right-6 z-50 max-w-[calc(100vw-2rem)] sm:max-w-sm w-full bg-[#18191E]/95 dark:bg-[#121316]/95 border border-[#2E313A] text-white p-4 rounded-2xl shadow-2xl backdrop-blur-md space-y-3"
        >
          <div className="flex items-start gap-3">
            {/* Favicon App Icon */}
            <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#FAF8F5] dark:bg-[#121316] p-1.5 border border-white/10 flex items-center justify-center shrink-0 shadow-md shadow-black/20">
              <img
                src={activeFavicon}
                alt="Kitto App Icon"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Header and description */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-white tracking-tight leading-snug">
                  {lang === 'id' ? 'Pasang Kitto' : 'Install Kitto'}
                </h3>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="text-slate-400 hover:text-white p-0.5 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-300 dark:text-slate-400 leading-relaxed mt-1">
                {lang === 'id'
                  ? 'Pasang aplikasi di perangkat untuk akses instan cepat dan dukungan offline!'
                  : 'Install our app for quick access and full offline support!'}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-0.5">
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-4 py-1.5 text-xs font-bold bg-[#E14D2A] hover:bg-[#C83B1B] text-white rounded-lg shadow-sm shadow-[#E14D2A]/30 active:scale-[0.98] transition-all cursor-pointer"
            >
              {lang === 'id' ? 'Instal' : 'Install'}
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              {lang === 'id' ? 'Nanti saja' : 'Not now'}
            </button>
          </div>

          {showIosGuide && (
            <div className="p-2.5 rounded-lg bg-white/10 text-[10px] text-slate-200 leading-relaxed border border-white/10 mt-2">
              {lang === 'id'
                ? 'Di iOS Safari: Tekan tombol Bagikan (Share icon) di bawah, lalu pilih "Tambahkan ke Layar Utama" (Add to Home Screen).'
                : 'On iOS Safari: Tap the Share button at the bottom, then choose "Add to Home Screen".'}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
