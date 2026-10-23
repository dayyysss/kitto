import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Trash2, Info, X } from 'lucide-react'
import { useConfirm } from '../../lib/confirm'

export function ConfirmDialog() {
  const { isOpen, options, close } = useConfirm()
  const [loading, setLoading] = useState(false)

  if (!options) return null

  const handleConfirm = async () => {
    try {
      setLoading(true)
      await options.onConfirm()
    } finally {
      setLoading(false)
      close()
    }
  }

  const handleCancel = () => {
    if (options.onCancel) options.onCancel()
    close()
  }

  const isDanger = options.variant === 'danger' || !options.variant
  const isWarning = options.variant === 'warning'

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Animated Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleCancel}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Dialog Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative z-10 w-full max-w-md bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5"
          >
            {/* Header Icon & Close */}
            <div className="flex items-start justify-between">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  isDanger
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60'
                    : isWarning
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60'
                    : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200'
                }`}
              >
                {isDanger ? (
                  <Trash2 className="w-6 h-6" />
                ) : isWarning ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <Info className="w-6 h-6" />
                )}
              </div>

              <button
                type="button"
                onClick={handleCancel}
                className="p-2 text-[#78716C] hover:text-[#1C1917] dark:hover:text-white rounded-xl hover:bg-[#FAF8F5] dark:hover:bg-[#22242B] cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Text */}
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-extrabold text-[#1C1917] dark:text-[#F5F4F0] tracking-tight">
                {options.title}
              </h3>
              <p className="text-sm text-[#57534E] dark:text-[#A8A29E] leading-relaxed">
                {options.message}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-[#EAE5DC] dark:border-[#272A33]">
              <button
                type="button"
                disabled={loading}
                onClick={handleCancel}
                className="w-full sm:w-auto px-5 py-2.5 text-xs sm:text-sm font-semibold border border-[#EAE5DC] dark:border-[#272A33] rounded-xl hover:bg-[#FAF8F5] dark:hover:bg-[#22242B] text-[#57534E] dark:text-[#A8A29E] cursor-pointer transition-colors"
              >
                {options.cancelText || 'Batal'}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleConfirm}
                className={`w-full sm:w-auto px-5 py-2.5 text-xs sm:text-sm font-bold text-white rounded-xl active:scale-[0.98] transition-all cursor-pointer shadow-md disabled:opacity-50 ${
                  isDanger
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                    : isWarning
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                    : 'bg-[#E14D2A] hover:bg-[#C83B1B] shadow-[#E14D2A]/20'
                }`}
              >
                {loading ? 'Memproses...' : options.confirmText || 'Konfirmasi'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
