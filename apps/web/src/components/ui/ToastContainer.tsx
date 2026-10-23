import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { useToast } from '../../lib/toast'

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-xl flex items-start gap-3 backdrop-blur-md transition-all ${
              t.type === 'success'
                ? 'bg-emerald-50/95 dark:bg-[#12281E]/95 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 shadow-emerald-500/10'
                : t.type === 'error'
                ? 'bg-rose-50/95 dark:bg-[#2C1819]/95 border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-100 shadow-rose-500/10'
                : 'bg-white/95 dark:bg-[#1A1B20]/95 border-[#EAE5DC] dark:border-[#272A33] text-[#1C1917] dark:text-[#F5F4F0] shadow-black/5'
            }`}
          >
            {t.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : t.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-[#E14D2A] shrink-0 mt-0.5" />
            )}

            <div className="flex-1 space-y-0.5 text-xs">
              <div className="font-bold text-sm leading-tight">{t.title}</div>
              {t.message && (
                <div className="opacity-80 leading-relaxed font-medium">{t.message}</div>
              )}
            </div>

            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="p-1 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
