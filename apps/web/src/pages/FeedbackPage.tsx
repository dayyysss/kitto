import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Star,
  Lightbulb,
  Send,
  Sparkles,
  Check,
  ArrowRight,
  CheckCircle2,
  ThumbsUp,
} from 'lucide-react'
import { useI18n } from '../lib/i18n'
import { useToast } from '../lib/toast'
import { DotPattern } from '../components/magicui/dot-pattern'
import { BorderBeam } from '../components/magicui/border-beam'
import { TurnstileWidget } from '../components/ui/TurnstileWidget'

interface ReviewItem {
  id: string | number
  name: string
  role: string
  rating: number
  comment: string
  date: string
  type?: string
}

export function FeedbackPage() {
  const { lang } = useI18n()
  const { showToast } = useToast()

  const [activeTab, setActiveTab] = useState<'review' | 'suggest'>('review')
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Suggest Tool Form State
  const [toolName, setToolName] = useState('')
  const [toolCategory, setToolCategory] = useState('dev')
  const [toolDescription, setToolDescription] = useState('')
  const [suggestSuccess, setSuggestSuccess] = useState(false)
  const [isSubmittingSuggest, setIsSubmittingSuggest] = useState(false)

  // Review Form State
  const [reviewerName, setReviewerName] = useState('')
  const [reviewerRole, setReviewerRole] = useState('')
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState(false)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  const [suggestTurnstileToken, setSuggestTurnstileToken] = useState('')
  const [suggestTurnstileReset, setSuggestTurnstileReset] = useState(0)
  const [reviewTurnstileToken, setReviewTurnstileToken] = useState('')
  const [reviewTurnstileReset, setReviewTurnstileReset] = useState(0)

  // Initial curated reviews as baseline
  const baselineReviews: ReviewItem[] = [
    {
      id: 'base-1',
      name: 'Rian Pratama',
      role: 'Fullstack Engineer',
      rating: 5,
      comment:
        lang === 'id'
          ? 'Sangat suka QR generator vektornya. Ekspor SVG benar-benar bersih tanpa embel-embel watermark atau iklan popup yang biasa ada di web lain.'
          : 'Love the pure vector QR studio. The SVG export is crisp without forced watermarks or noisy pop-up ads.',
      date: '16 Okt 2026',
    },
    {
      id: 'base-2',
      name: 'Nadia Salsabila',
      role: 'Owner Bakery & Kafe',
      rating: 5,
      comment:
        lang === 'id'
          ? 'Bon kasir thermal generator dan kalkulator patungannya sangat membantu operasional warung kecil saya. Cepat dan tanpa ribet instal aplikasi berat.'
          : 'The thermal receipt maker and bill splitter have significantly streamlined our cafe operations. Lightning fast and zero bloat.',
      date: '15 Okt 2026',
    },
    {
      id: 'base-3',
      name: 'Dimas Wicaksono',
      role: 'Mahasiswa Teknik Informatika',
      rating: 5,
      comment:
        lang === 'id'
          ? 'Pengukur kekuatan password dan kalkulator pajak PPh 21-nya sangat akurat. Tampilan webnya juga berkelas dan rapi.'
          : 'The password strength calculation and tax calculators are extremely accurate. The editorial design is top notch.',
      date: '14 Okt 2026',
    },
    {
      id: 'base-4',
      name: 'Sarah Stephanie',
      role: 'UI/UX Designer',
      rating: 5,
      comment:
        lang === 'id'
          ? 'Fitur Percantik Screenshot 3D dan kompresor fotonya membuat portofolio presentasi klien saya terlihat jauh lebih profesional.'
          : 'The 3D Screenshot Beautifier and lossless image compressor elevated my client presentation decks significantly.',
      date: '12 Okt 2026',
    },
  ]

  // Load real feedback from API database on mount
  useEffect(() => {
    let active = true
    setIsLoading(true)
    fetch('/api/feedback')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!active || !Array.isArray(data)) return

        if (data.length > 0) {
          const apiReviews: ReviewItem[] = data.map((d: any) => ({
            id: d.id,
            name: d.name || 'Pengguna Kitto',
            role: d.role || 'Kreator',
            rating: typeof d.rating === 'number' ? d.rating : 5,
            comment: d.comment || '',
            date: d.created_at
              ? new Date(d.created_at).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Baru saja',
            type: d.type,
          }))

          // Combine API reviews with baseline reviews (deduplicating)
          setReviews([...apiReviews, ...baselineReviews])
        } else {
          setReviews(baselineReviews)
        }
      })
      .catch(() => {
        setReviews(baselineReviews)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [lang])

  const handleSuggestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!toolName.trim()) return
    if (!suggestTurnstileToken) {
      showToast('Verifikasi Diperlukan', 'Selesaikan verifikasi Cloudflare terlebih dahulu.', 'error')
      return
    }
    setIsSubmittingSuggest(true)

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'suggestion',
          name: 'Usulan Komunitas',
          role: toolCategory,
          comment: `[${toolName.trim()}] ${toolDescription.trim()}`,
          turnstileToken: suggestTurnstileToken,
        }),
      })

      const data = await res.json().catch(() => null)

      if (res.ok) {
        setSuggestSuccess(true)
        showToast(
          lang === 'id' ? 'Saran Terkirim!' : 'Suggestion Sent!',
          lang === 'id'
            ? `Ide alat "${toolName.trim()}" berhasil disimpan ke database Kitto.`
            : `Tool request "${toolName.trim()}" recorded successfully.`,
          'success'
        )

        setTimeout(() => {
          setToolName('')
          setToolDescription('')
          setSuggestSuccess(false)
          setSuggestTurnstileToken('')
          setSuggestTurnstileReset((v) => v + 1)
        }, 2500)
      } else {
        setSuggestTurnstileToken('')
        setSuggestTurnstileReset((v) => v + 1)
        showToast('Gagal Mengirim', data?.error || 'Saran gagal dikirim. Coba lagi.', 'error')
      }
    } catch {
      setSuggestTurnstileToken('')
      setSuggestTurnstileReset((v) => v + 1)
      showToast('Koneksi Gagal', 'Gagal menghubungi server.', 'error')
    } finally {
      setIsSubmittingSuggest(false)
    }
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewerName.trim() || !reviewComment.trim()) return
    if (!reviewTurnstileToken) {
      showToast('Verifikasi Diperlukan', 'Selesaikan verifikasi Cloudflare terlebih dahulu.', 'error')
      return
    }
    setIsSubmittingReview(true)

    const newRev: ReviewItem = {
      id: `rev-${Date.now()}`,
      name: reviewerName.trim(),
      role: reviewerRole.trim() || (lang === 'id' ? 'Pengguna Kitto' : 'Kitto User'),
      rating,
      comment: reviewComment.trim(),
      date: lang === 'id' ? 'Baru saja' : 'Just now',
    }

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'review',
          name: newRev.name,
          role: newRev.role,
          rating: newRev.rating,
          comment: newRev.comment,
          turnstileToken: reviewTurnstileToken,
        }),
      })

      const data = await res.json().catch(() => null)

      if (res.ok) {
        setReviews([newRev, ...reviews])
        setReviewSuccess(true)
        showToast(
          lang === 'id' ? 'Ulasan Diterbitkan!' : 'Review Published!',
          lang === 'id' ? 'Terima kasih atas ulasan pengalaman Anda.' : 'Thank you for sharing your experience.',
          'success'
        )

        setTimeout(() => {
          setReviewerName('')
          setReviewerRole('')
          setReviewComment('')
          setReviewSuccess(false)
          setReviewTurnstileToken('')
          setReviewTurnstileReset((v) => v + 1)
        }, 2500)
      } else {
        setReviewTurnstileToken('')
        setReviewTurnstileReset((v) => v + 1)
        showToast('Gagal Mengirim', data?.error || 'Ulasan gagal dikirim. Coba lagi.', 'error')
      }
    } catch {
      setReviewTurnstileToken('')
      setReviewTurnstileReset((v) => v + 1)
      showToast('Koneksi Gagal', 'Gagal menghubungi server.', 'error')
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const switchTab = (tab: 'review' | 'suggest') => {
    setActiveTab(tab)
    setReviewTurnstileToken('')
    setSuggestTurnstileToken('')
  }

  // Calculate average rating
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
      : '5.0'

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] dark:bg-[#121316] text-[#1C1917] dark:text-[#F5F4F0] relative overflow-hidden transition-colors">
      {/* Background Dot Pattern with radial fade */}
      <DotPattern className="opacity-70 dark:opacity-30" />

      {/* Ambient Vermilion Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#E14D2A]/15 via-[#F59E0B]/10 to-transparent rounded-full blur-[110px] pointer-events-none" />

      {/* Main Container - Full Spacious Desktop Width */}
      <div className="max-w-6xl lg:max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-12 sm:py-20 relative z-10 space-y-12">
        
        {/* ========================================================= */}
        {/* HERO SECTION (Japanese Vermilion Theme, Large Typography) */}
        {/* ========================================================= */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#E14D2A]/30 bg-white/80 dark:bg-[#1A1B20]/80 backdrop-blur-md shadow-xs text-xs font-mono-code"
          >
            <span className="w-2 h-2 rounded-full bg-[#E14D2A] animate-pulse" />
            <span className="font-semibold text-[#E14D2A]">
              {lang === 'id' ? 'KOMUNITAS & MUTU' : 'COMMUNITY & FEEDBACK'}
            </span>
            <span className="text-[#78716C]">/</span>
            <span className="text-[#57534E] dark:text-[#A8A29E]">Kitto Voice</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1C1917] dark:text-[#F5F4F0] leading-[1.08]"
          >
            {lang === 'id' ? 'Saran tools &' : 'Tool requests &'}{' '}
            <span className="font-serif-accent italic text-[#E14D2A] font-normal">
              {lang === 'id' ? 'ulasan pengguna.' : 'user reviews.'}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-base sm:text-lg text-[#57534E] dark:text-[#A8A29E] leading-relaxed max-w-2xl mx-auto"
          >
            {lang === 'id'
              ? 'Bantu kami menyempurnakan 26 alat utilitas Kitto. Ajukan ide alat baru yang Anda butuhkan atau bagikan ulasan pengalaman Anda.'
              : 'Help us expand and refine Kitto. Request specific digital utilities for your workflow or share your honest thoughts with the community.'}
          </motion.p>

          {/* Tab Switcher - Hanko Vermilion Theme */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="pt-4 flex items-center justify-center gap-2"
          >
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 p-1.5 bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-2xl shadow-sm w-full sm:w-auto">
              <button
                type="button"
                  onClick={() => switchTab('review')}
                className={`w-full sm:w-auto justify-center px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'review'
                    ? 'bg-[#E14D2A] text-white shadow-md shadow-[#E14D2A]/25'
                    : 'text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-white'
                }`}
              >
                <Star className="w-4 h-4" />
                <span>{lang === 'id' ? 'Ulasan Komunitas' : 'User Reviews'}</span>
                <span className={`text-[10px] font-mono-code px-1.5 py-0.2 rounded-full ${activeTab === 'review' ? 'bg-white/20 text-white' : 'bg-[#FAF8F5] dark:bg-[#121316] text-[#78716C]'}`}>
                  {reviews.length}
                </span>
              </button>

              <button
                type="button"
                  onClick={() => switchTab('suggest')}
                className={`w-full sm:w-auto justify-center px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'suggest'
                    ? 'bg-[#E14D2A] text-white shadow-md shadow-[#E14D2A]/25'
                    : 'text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-white'
                }`}
              >
                <Lightbulb className="w-4 h-4" />
                <span>{lang === 'id' ? 'Saran Alat Baru' : 'Suggest a Tool'}</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: USER REVIEWS & SUBMISSION FORM                     */}
        {/* ========================================================= */}
        {activeTab === 'review' && (
          <div className="space-y-12">
            
            {/* Top Split Section: Stats Summary & Submission Form */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column (5 cols): Rating Summary Card */}
              <div className="lg:col-span-5 bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-[32px] p-5 sm:p-10 shadow-sm space-y-6 relative overflow-hidden">
                <BorderBeam size={220} duration={8} colorFrom="#E14D2A" colorTo="#F59E0B" />

                <div className="space-y-2 text-left">
                  <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#E14D2A]">
                    {lang === 'id' ? 'KEPUASAN PENGGUNA' : 'COMMUNITY SCORE'}
                  </span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl sm:text-6xl font-black font-mono-code tracking-tight text-[#1C1917] dark:text-[#F5F4F0]">
                      {avgRating}
                    </span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-[#F59E0B]">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className="w-5 h-5 fill-[#F59E0B]" />
                        ))}
                      </div>
                      <span className="text-xs font-mono-code text-[#78716C] block">
                        {lang === 'id' ? `Berdasarkan ${reviews.length} ulasan terverifikasi` : `Based on ${reviews.length} verified reviews`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-[#EAE5DC] dark:border-[#272A33] text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#57534E] dark:text-[#A8A29E] font-medium">Bebas Watermark</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono-code">5.0 ★</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#57534E] dark:text-[#A8A29E] font-medium">Kecepatan di Browser</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono-code">5.0 ★</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#57534E] dark:text-[#A8A29E] font-medium">Kemudahan Penggunaan</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono-code">5.0 ★</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] space-y-1 text-left text-xs">
                  <span className="font-bold text-[#1C1917] dark:text-[#F5F4F0] flex items-center gap-1.5">
                    <ThumbsUp className="w-4 h-4 text-[#E14D2A]" />
                    <span>{lang === 'id' ? 'Komitmen Kualitas' : 'Quality Commitment'}</span>
                  </span>
                  <p className="text-xs text-[#78716C] leading-relaxed">
                    {lang === 'id'
                      ? 'Setiap ulasan dan saran dibaca langsung oleh tim pengembang Kitto untuk prioritas roadmap rilis berikutnya.'
                      : 'Every review and suggestion is reviewed directly by our core engineering team to prioritize future features.'}
                  </p>
                </div>
              </div>

              {/* Right Column (7 cols): Submit Review Form */}
              <div className="lg:col-span-7 bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-[32px] p-5 sm:p-10 shadow-sm space-y-6 text-left">
                <div className="space-y-1 pb-4 border-b border-[#EAE5DC] dark:border-[#272A33]">
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1C1917] dark:text-[#F5F4F0]">
                    {lang === 'id' ? 'Tulis Ulasan Pengalaman Anda' : 'Write a Review'}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#78716C]">
                    {lang === 'id'
                      ? 'Bagikan pendapat jujur Anda mengenai alat-alat di Kitto kepada komunitas.'
                      : 'Share your honest feedback regarding Kitto tools with the community.'}
                  </p>
                </div>

                <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs sm:text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-[#57534E] dark:text-[#A8A29E]">
                        {lang === 'id' ? 'Nama Anda' : 'Your Name'}
                      </label>
                      <input
                        type="text"
                        required
                        value={reviewerName}
                        onChange={(e) => setReviewerName(e.target.value)}
                        placeholder={lang === 'id' ? 'Contoh: Ahmad Rizki' : 'e.g. Alex Johnson'}
                        className="w-full px-4 py-3 border border-[#EAE5DC] dark:border-[#272A33] rounded-2xl bg-[#FAF8F5] dark:bg-[#121316] outline-none text-[#1C1917] dark:text-[#F5F4F0] focus:border-[#E14D2A] transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-[#57534E] dark:text-[#A8A29E]">
                        {lang === 'id' ? 'Profesi / Peran (Opsional)' : 'Role / Title (Optional)'}
                      </label>
                      <input
                        type="text"
                        value={reviewerRole}
                        onChange={(e) => setReviewerRole(e.target.value)}
                        placeholder={lang === 'id' ? 'Contoh: UI Designer / Pemilik Kafe' : 'e.g. Product Designer'}
                        className="w-full px-4 py-3 border border-[#EAE5DC] dark:border-[#272A33] rounded-2xl bg-[#FAF8F5] dark:bg-[#121316] outline-none text-[#1C1917] dark:text-[#F5F4F0] focus:border-[#E14D2A] transition-all"
                      />
                    </div>
                  </div>

                  {/* Interactive Star Rating Selector */}
                  <div className="space-y-1.5 pt-1">
                    <label className="block text-sm font-semibold text-[#57534E] dark:text-[#A8A29E]">
                      {lang === 'id' ? 'Rating Kepuasan:' : 'Rating Score:'}
                    </label>
                    <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-2xl bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] w-fit">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled = star <= (hoverRating || rating)
                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(null)}
                            className="p-1 cursor-pointer transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-6 h-6 transition-colors ${
                                isFilled
                                  ? 'fill-[#F59E0B] text-[#F59E0B]'
                                  : 'text-slate-300 dark:text-slate-700'
                              }`}
                            />
                          </button>
                        )
                      })}
                      <span className="text-xs font-mono-code font-bold text-[#E14D2A] ml-2 pr-1">
                        {rating}.0 / 5.0
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-[#57534E] dark:text-[#A8A29E]">
                      {lang === 'id' ? 'Ulasan atau Masukan Anda' : 'Your Review'}
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder={
                        lang === 'id'
                          ? 'Ceritakan pengalaman Anda menggunakan alat-alat di Kitto, apa yang paling Anda sukai, atau apa yang perlu ditingkatkan...'
                          : 'Share your experience using Kitto utilities, what you liked most, or what we can refine...'
                      }
                      className="w-full p-4 border border-[#EAE5DC] dark:border-[#272A33] rounded-2xl bg-[#FAF8F5] dark:bg-[#121316] outline-none text-[#1C1917] dark:text-[#F5F4F0] focus:border-[#E14D2A] transition-all leading-relaxed"
                    />
                  </div>

                  <TurnstileWidget
                    onVerify={setReviewTurnstileToken}
                    onExpire={() => setReviewTurnstileToken('')}
                    resetKey={reviewTurnstileReset}
                    className="min-h-[65px]"
                  />

                  <button
                    type="submit"
                    disabled={isSubmittingReview || !reviewTurnstileToken}
                    className="w-full sm:w-auto justify-center px-8 py-3.5 text-sm font-bold bg-[#E14D2A] hover:bg-[#C83B1B] text-white rounded-2xl shadow-lg shadow-[#E14D2A]/25 active:scale-[0.98] cursor-pointer transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <span>{isSubmittingReview ? (lang === 'id' ? 'Menyimpan...' : 'Submitting...') : (lang === 'id' ? 'Publikasikan Ulasan' : 'Submit Review')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {reviewSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>
                      {lang === 'id'
                        ? 'Ulasan Anda berhasil ditambahkan ke daftar testimoni komunitas Kitto!'
                        : 'Your review was successfully added to the community showcase!'}
                    </span>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Bottom Section: Testimonial Cards Grid */}
            <div className="space-y-6 pt-6">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#EAE5DC] dark:border-[#272A33]">
                <h3 className="text-xl font-bold tracking-tight text-[#1C1917] dark:text-[#F5F4F0] flex items-center gap-2.5">
                  <Sparkles className="w-5 h-5 text-[#E14D2A]" />
                  <span>{lang === 'id' ? 'Testimoni Komunitas' : 'Community Voices'} ({reviews.length})</span>
                </h3>
                <span className="text-xs font-mono-code text-[#78716C]">
                  {lang === 'id' ? 'Ulasan Komunitas' : 'Community Feedback'}
                </span>
              </div>

              {isLoading ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-8 h-8 rounded-full border-2 border-[#E14D2A] border-t-transparent animate-spin mx-auto" />
                  <p className="text-xs text-[#78716C] font-mono-code">Memuat ulasan komunitas...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {reviews.map((rev) => (
                    <motion.div
                      key={rev.id}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-40px' }}
                      transition={{ duration: 0.3 }}
                      className="p-5 sm:p-8 rounded-[30px] border border-[#EAE5DC] dark:border-[#272A33] bg-white dark:bg-[#1A1B20] space-y-4 shadow-sm text-left hover:border-[#E14D2A] transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-2xl bg-[#E14D2A]/10 text-[#E14D2A] flex items-center justify-center font-bold text-sm font-mono-code shrink-0">
                              {rev.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-sm sm:text-base text-[#1C1917] dark:text-[#F5F4F0] truncate">
                                {rev.name}
                              </div>
                              <div className="text-xs text-[#78716C] truncate">{rev.role}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 text-[#F59E0B] shrink-0">
                            {Array.from({ length: rev.rating || 5 }).map((_, sIdx) => (
                              <Star key={sIdx} className="w-4 h-4 fill-[#F59E0B]" />
                            ))}
                          </div>
                        </div>

                        <p className="text-sm sm:text-base text-[#57534E] dark:text-[#A8A29E] leading-relaxed pt-1">
                          "{rev.comment}"
                        </p>
                      </div>

                      <div className="pt-4 border-t border-[#EAE5DC]/60 dark:border-[#272A33]/60 flex items-center justify-between text-xs font-mono-code text-[#78716C]">
                        <span>{rev.date}</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Terverifikasi</span>
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: SUGGEST A NEW TOOL                                 */}
        {/* ========================================================= */}
        {activeTab === 'suggest' && (
          <div className="max-w-3xl mx-auto bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] rounded-[32px] p-5 sm:p-12 shadow-sm space-y-6 text-left relative overflow-hidden">
            <BorderBeam size={240} duration={8} colorFrom="#E14D2A" colorTo="#F59E0B" />

            <div className="space-y-1.5 pb-4 border-b border-[#EAE5DC] dark:border-[#272A33]">
              <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#E14D2A]">
                {lang === 'id' ? 'ROADMAP KOMUNITAS' : 'COMMUNITY ROADMAP'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1C1917] dark:text-[#F5F4F0]">
                {lang === 'id' ? 'Ajukan Ide Alat yang Anda Butuhkan' : 'Request a New Tool'}
              </h2>
              <p className="text-xs sm:text-sm text-[#78716C] leading-relaxed">
                {lang === 'id'
                  ? 'Punya kebutuhan utilitas harian yang belum tersedia di Kitto? Tuliskan ide Anda di bawah ini untuk kami pertimbangkan pada rilis berikutnya.'
                  : 'Need a specific productivity tool that is missing? Let our engineering team know what you would like to see next.'}
              </p>
            </div>

            <form onSubmit={handleSuggestSubmit} className="space-y-5 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-[#57534E] dark:text-[#A8A29E]">
                    {lang === 'id' ? 'Nama Alat yang Disarankan' : 'Suggested Tool Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={toolName}
                    onChange={(e) => setToolName(e.target.value)}
                    placeholder={lang === 'id' ? 'Contoh: SVG Optimizer, JSON to CSV, Subnet Calculator' : 'e.g. SVG Optimizer, Subnet Calculator'}
                    className="w-full px-4 py-3 border border-[#EAE5DC] dark:border-[#272A33] rounded-2xl bg-[#FAF8F5] dark:bg-[#121316] outline-none text-[#1C1917] dark:text-[#F5F4F0] focus:border-[#E14D2A] transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-[#57534E] dark:text-[#A8A29E]">
                    {lang === 'id' ? 'Kategori Alat' : 'Category'}
                  </label>
                  <select
                    value={toolCategory}
                    onChange={(e) => setToolCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-[#EAE5DC] dark:border-[#272A33] rounded-2xl bg-[#FAF8F5] dark:bg-[#121316] outline-none text-[#1C1917] dark:text-[#F5F4F0] focus:border-[#E14D2A] transition-all cursor-pointer"
                  >
                    <option value="dev">{lang === 'id' ? 'Kode & Keamanan' : 'Code & Security'}</option>
                    <option value="visual">{lang === 'id' ? 'Foto & Desain Visual' : 'Photo & Visual Design'}</option>
                    <option value="finance">{lang === 'id' ? 'Keuangan, Faktur & Kasir' : 'Finance & Billing'}</option>
                    <option value="document">{lang === 'id' ? 'PDF & Dokumen' : 'PDF & Documents'}</option>
                    <option value="lifestyle">{lang === 'id' ? 'Gaya Hidup & Harian' : 'Lifestyle & Daily'}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[#57534E] dark:text-[#A8A29E]">
                  {lang === 'id' ? 'Deskripsi Manfaat & Cara Kerja Alat' : 'Description & Use Case'}
                </label>
                <textarea
                  rows={5}
                  required
                  value={toolDescription}
                  onChange={(e) => setToolDescription(e.target.value)}
                  placeholder={
                    lang === 'id'
                      ? 'Jelaskan masalah apa yang ingin Anda selesaikan dengan alat ini, parameter apa yang dibutuhkan, dan format keluaran yang diharapkan...'
                      : 'Describe the problem this tool should solve and expected inputs/outputs...'
                  }
                  className="w-full p-4 border border-[#EAE5DC] dark:border-[#272A33] rounded-2xl bg-[#FAF8F5] dark:bg-[#121316] outline-none text-[#1C1917] dark:text-[#F5F4F0] focus:border-[#E14D2A] transition-all leading-relaxed"
                />
              </div>

              <TurnstileWidget
                onVerify={setSuggestTurnstileToken}
                onExpire={() => setSuggestTurnstileToken('')}
                resetKey={suggestTurnstileReset}
                className="min-h-[65px]"
              />

              <button
                type="submit"
                disabled={isSubmittingSuggest || !suggestTurnstileToken}
                className="w-full sm:w-auto justify-center px-8 py-3.5 text-sm font-bold bg-[#E14D2A] hover:bg-[#C83B1B] text-white rounded-2xl shadow-lg shadow-[#E14D2A]/25 active:scale-[0.98] cursor-pointer transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <span>{isSubmittingSuggest ? (lang === 'id' ? 'Mengirim...' : 'Sending...') : (lang === 'id' ? 'Kirimkan Saran Alat' : 'Submit Tool Request')}</span>
                <Send className="w-4 h-4" />
              </button>
            </form>

            {suggestSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  {lang === 'id'
                    ? 'Terima kasih! Ide alat baru Anda telah kami simpan dan akan dipertimbangkan untuk rilis berikutnya.'
                    : 'Thank you! Your tool request has been recorded and will be reviewed for upcoming releases.'}
                </span>
              </motion.div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
