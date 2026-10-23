import { useState } from 'react'
import { Trash2, Sparkles, Check } from 'lucide-react'
import { useToast } from '../../lib/toast'

export function LifestyleTools({
  initialTool = 'bill',
  hideTabs = true,
}: {
  initialTool?: string
  hideTabs?: boolean
}) {
  const [userTab, setUserTab] = useState<'bill' | 'bmi' | 'calorie' | 'habit' | 'greeting' | null>(null)
  const activeSub = !hideTabs && userTab ? userTab : (
    initialTool === 'bmi' || initialTool === 'bmi-calc'
      ? 'bmi'
      : initialTool === 'calorie' || initialTool === 'calorie-tracker'
      ? 'calorie'
      : initialTool === 'habit' || initialTool === 'habit-tracker'
      ? 'habit'
      : initialTool === 'greeting' || initialTool === 'greeting-card'
      ? 'greeting'
      : 'bill'
  )

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {!hideTabs && (
        <div className="flex flex-wrap border-b border-[#EAE5DC] dark:border-[#272A33] gap-x-4 gap-y-1 pb-1">
          {[
            { id: 'bill', label: 'Kalkulator Patungan (Bill Split)' },
            { id: 'bmi', label: 'Kalkulator BMI' },
            { id: 'calorie', label: 'Tracker Kalori' },
            { id: 'habit', label: 'Tracker Kebiasaan' },
            { id: 'greeting', label: 'Greeting Card Maker' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setUserTab(tab.id as typeof activeSub)}
              className={`pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                activeSub === tab.id
                  ? 'border-b-2 border-[#E14D2A] text-[#E14D2A]'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {activeSub === 'bill' && <BillSplitter />}
      {activeSub === 'bmi' && <BmiCalculator />}
      {activeSub === 'calorie' && <CalorieTracker />}
      {activeSub === 'habit' && <HabitTracker />}
      {activeSub === 'greeting' && <GreetingCardMaker />}
    </div>
  )
}

function BillSplitter() {
  const { showToast } = useToast()
  const [eventName, setEventName] = useState('Makan Bareng Tim')
  const [billTotal, setBillTotal] = useState<number>(350000)
  const [taxPercent, setTaxPercent] = useState<number>(10)
  const [servicePercent, setServicePercent] = useState<number>(5)
  const [people, setPeople] = useState<number>(4)
  const [bankAccount, setBankAccount] = useState('BCA 8280123456 a/n Alex Pratama')
  const [copied, setCopied] = useState<boolean>(false)

  const taxAmount = (billTotal * taxPercent) / 100
  const serviceAmount = (billTotal * servicePercent) / 100
  const totalAmount = billTotal + taxAmount + serviceAmount
  const perPerson = people > 0 ? totalAmount / people : totalAmount

  const handleCopyBreakdown = () => {
    const text = `*RINCIAN PATUNGAN: ${eventName.toUpperCase()}*\n\n` +
      `- Tagihan Makanan: Rp ${billTotal.toLocaleString('id-ID')}\n` +
      `- Pajak (${taxPercent}%): Rp ${Math.round(taxAmount).toLocaleString('id-ID')}\n` +
      `- Service (${servicePercent}%): Rp ${Math.round(serviceAmount).toLocaleString('id-ID')}\n` +
      `-----------------\n` +
      `*Total Keseluruhan:* Rp ${Math.round(totalAmount).toLocaleString('id-ID')}\n` +
      `- Jumlah Orang: ${people} orang\n` +
      `*Per Orang Bayar: Rp ${Math.round(perPerson).toLocaleString('id-ID')}*\n\n` +
      `*Transfer ke:*\n${bankAccount || 'Hubungi panitia'}\n\n` +
      `Mohon kirim bukti transfer ya, terima kasih!`
    navigator.clipboard.writeText(text)
    setCopied(true)
    showToast('Rincian Patungan Disalin', 'Rincian tagihan siap ditempel ke grup WhatsApp.', 'success')
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="border border-[#EAE5DC] dark:border-[#272A33] bg-white dark:bg-[#1A1B20] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-[#EAE5DC] dark:border-[#272A33] gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#1C1917] dark:text-[#F5F4F0]">
            Kalkulator Patungan (Bill Split) & Format WhatsApp
          </h3>
          <p className="text-sm text-[#78716C] mt-1">
            Hitung pembagian tagihan resto (pajak + servis) dan salin format tagihan lengkap ke grup WhatsApp.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopyBreakdown}
          className="px-5 py-2.5 text-xs sm:text-sm font-bold bg-[#E14D2A] text-white hover:bg-[#C83B1B] rounded-xl shadow-md shadow-[#E14D2A]/20 cursor-pointer flex items-center gap-1.5"
        >
          {copied ? <Check className="w-4 h-4" /> : null}
          <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin Format Chat WA'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-sm sm:text-sm font-semibold text-[#1C1917] dark:text-[#F5F4F0]">Nama Acara / Resto</label>
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="w-full px-4 py-3 border border-[#EAE5DC] dark:border-[#272A33] rounded-xl bg-transparent text-sm sm:text-base outline-none focus:border-[#E14D2A]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm sm:text-sm font-semibold text-[#1C1917] dark:text-[#F5F4F0]">Info Rekening Transfer</label>
          <input
            type="text"
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value)}
            placeholder="Contoh: BCA 1234567 a/n Nama"
            className="w-full px-4 py-3 border border-[#EAE5DC] dark:border-[#272A33] rounded-xl bg-transparent text-sm sm:text-base outline-none focus:border-[#E14D2A]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <label className="block text-sm sm:text-sm font-semibold text-[#1C1917] dark:text-[#F5F4F0]">Tagihan Bersih (Rp)</label>
          <input
            type="number"
            step="1000"
            value={billTotal}
            onChange={(e) => setBillTotal(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-3 border border-[#EAE5DC] dark:border-[#272A33] rounded-xl bg-transparent font-mono-code text-sm sm:text-base outline-none focus:border-[#E14D2A]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm sm:text-sm font-semibold text-[#1C1917] dark:text-[#F5F4F0]">Pajak Resto (%)</label>
          <input
            type="number"
            value={taxPercent}
            onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-3 border border-[#EAE5DC] dark:border-[#272A33] rounded-xl bg-transparent font-mono-code text-sm sm:text-base outline-none focus:border-[#E14D2A]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm sm:text-sm font-semibold text-[#1C1917] dark:text-[#F5F4F0]">Biaya Servis (%)</label>
          <input
            type="number"
            value={servicePercent}
            onChange={(e) => setServicePercent(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-3 border border-[#EAE5DC] dark:border-[#272A33] rounded-xl bg-transparent font-mono-code text-sm sm:text-base outline-none focus:border-[#E14D2A]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm sm:text-sm font-semibold text-[#1C1917] dark:text-[#F5F4F0]">Jumlah Teman</label>
          <input
            type="number"
            min="1"
            value={people}
            onChange={(e) => setPeople(parseInt(e.target.value) || 1)}
            className="w-full px-4 py-3 border border-[#EAE5DC] dark:border-[#272A33] rounded-xl bg-transparent font-mono-code text-sm sm:text-base outline-none focus:border-[#E14D2A]"
          />
        </div>
      </div>

      <div className="p-5 bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-[#78716C]">Bagian Bayar per Orang:</span>
          <div className="text-3xl font-bold font-mono-code text-[#E14D2A] mt-0.5">
            Rp {Math.round(perPerson).toLocaleString('id-ID')}
          </div>
          <div className="text-xs text-[#78716C] mt-1 font-mono-code">
            Total Tagihan: Rp {Math.round(totalAmount).toLocaleString('id-ID')} ({people} orang)
          </div>
        </div>

        <div className="text-xs font-mono-code text-[#78716C] space-y-1 sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-[#EAE5DC] dark:border-[#272A33]">
          <div>Tagihan Bersih: Rp {billTotal.toLocaleString('id-ID')}</div>
          <div>Pajak & Servis: Rp {Math.round(taxAmount + serviceAmount).toLocaleString('id-ID')}</div>
          <div className="font-semibold text-[#1C1917] dark:text-[#F5F4F0]">{bankAccount}</div>
        </div>
      </div>
    </div>
  )
}

function BmiCalculator() {
  const [heightCm, setHeightCm] = useState<number>(170)
  const [weightKg, setWeightKg] = useState<number>(65)

  const heightM = heightCm / 100
  const bmi = heightM > 0 ? parseFloat((weightKg / (heightM * heightM)).toFixed(1)) : 0

  // Standard ideal weight (BMI 18.5 - 22.9 according to WHO Western Pacific & Kemenkes)
  const minIdealWeight = Math.round(18.5 * heightM * heightM)
  const maxIdealWeight = Math.round(22.9 * heightM * heightM)

  let status = 'Normal (Ideal)'
  let color = '#10B981'
  if (bmi < 18.5) {
    status = 'Berat Badan Kurang'
    color = '#3B82F6'
  } else if (bmi >= 23 && bmi < 25) {
    status = 'Kelebihan Berat Badan Ringan'
    color = '#F59E0B'
  } else if (bmi >= 25 && bmi < 30) {
    status = 'Pra-Obesitas'
    color = '#F97316'
  } else if (bmi >= 30) {
    status = 'Obesitas'
    color = '#EF4444'
  }

  // Position on gauge (0% - 100% across BMI 15 to 35)
  const gaugePercent = Math.max(0, Math.min(100, ((bmi - 15) / 20) * 100))

  return (
    <div className="border border-[#EAE5DC] dark:border-[#272A33] bg-white dark:bg-[#1A1B20] rounded-2xl p-6 shadow-xs space-y-6">
      <div className="pb-3 border-b border-[#EAE5DC] dark:border-[#272A33]">
        <h3 className="text-sm font-bold text-[#1C1917] dark:text-[#F5F4F0]">
          Kalkulator Indeks Massa Tubuh (BMI) & Berat Ideal
        </h3>
        <p className="text-xs text-[#78716C]">
          Evaluasi komposisi berat badan ideal berdasarkan standar Kemenkes RI & WHO Asia Pasifik.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
        <div>
          <div className="flex justify-between mb-1.5 font-medium">
            <span className="text-[#57534E] dark:text-[#A8A29E]">Tinggi Badan:</span>
            <span className="font-mono-code font-bold text-[#E14D2A]">{heightCm} cm</span>
          </div>
          <input
            type="range"
            min="120"
            max="220"
            value={heightCm}
            onChange={(e) => setHeightCm(parseInt(e.target.value))}
            className="w-full accent-[#E14D2A]"
          />
        </div>

        <div>
          <div className="flex justify-between mb-1.5 font-medium">
            <span className="text-[#57534E] dark:text-[#A8A29E]">Berat Badan:</span>
            <span className="font-mono-code font-bold text-[#E14D2A]">{weightKg} kg</span>
          </div>
          <input
            type="range"
            min="30"
            max="160"
            value={weightKg}
            onChange={(e) => setWeightKg(parseInt(e.target.value))}
            className="w-full accent-[#E14D2A]"
          />
        </div>
      </div>

      {/* Visual BMI Gauge Bar */}
      <div className="space-y-2 pt-1">
        <div className="w-full h-3 rounded-full overflow-hidden flex bg-neutral-200">
          <div style={{ width: '17.5%' }} className="bg-blue-400" title="Kurang (< 18.5)" />
          <div style={{ width: '22%' }} className="bg-emerald-500" title="Normal (18.5 - 22.9)" />
          <div style={{ width: '10.5%' }} className="bg-amber-400" title="Overweight (23 - 24.9)" />
          <div style={{ width: '25%' }} className="bg-orange-500" title="Pra-Obesitas (25 - 29.9)" />
          <div style={{ width: '25%' }} className="bg-rose-500" title="Obesitas (>= 30)" />
        </div>
        <div className="relative h-4">
          <div
            className="absolute -top-1 w-3 h-3 bg-[#1C1917] dark:bg-white border-2 border-white dark:border-black rounded-full shadow transition-all duration-300 -translate-x-1.5"
            style={{ left: `${gaugePercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-[#78716C] font-mono-code">
          <span>&lt;18.5 Kurang</span>
          <span className="text-emerald-600 font-bold">18.5 - 22.9 Normal</span>
          <span>&gt;25 Pra-Obesitas</span>
          <span>&gt;30 Obesitas</span>
        </div>
      </div>

      <div className="p-5 bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-[#78716C]">Skor BMI:</span>
          <div className="text-3xl font-bold font-mono-code mt-0.5" style={{ color }}>
            {bmi}
          </div>
          <div className="text-xs font-bold mt-1" style={{ color }}>
            {status}
          </div>
        </div>

        <div className="p-3 bg-white dark:bg-[#1A1B20] rounded-xl border border-[#EAE5DC] dark:border-[#272A33] text-xs font-mono-code text-right">
          <span className="text-[#78716C]">Rentang Berat Ideal Anda:</span>
          <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {minIdealWeight} kg — {maxIdealWeight} kg
          </div>
          <div className="text-[10px] text-[#78716C] mt-1">
            {weightKg < minIdealWeight
              ? `Perlu naik ~${minIdealWeight - weightKg} kg`
              : weightKg > maxIdealWeight
              ? `Perlu turun ~${weightKg - maxIdealWeight} kg`
              : 'Berat Anda sudah dalam zona ideal.'}
          </div>
        </div>
      </div>
    </div>
  )
}

function HabitTracker() {
  const { showToast } = useToast()
  const [habits, setHabits] = useState([
    { id: 1, name: 'Minum Air 2 Liter', days: [true, true, true, false, true, false, false] },
    { id: 2, name: 'Membaca Buku 15 Menit', days: [true, false, true, true, true, false, false] },
    { id: 3, name: 'Olahraga / Jalan 5000 Langkah', days: [false, true, true, false, true, true, false] },
  ])
  const [newHabit, setNewHabit] = useState('')

  const dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

  const toggleDay = (habitId: number, dayIdx: number) => {
    setHabits(
      habits.map((h) => {
        if (h.id !== habitId) return h
        const nextDays = [...h.days]
        nextDays[dayIdx] = !nextDays[dayIdx]
        return { ...h, days: nextDays }
      })
    )
  }

  const addHabit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newHabit.trim()) return
    setHabits([
      ...habits,
      { id: Date.now(), name: newHabit.trim(), days: [false, false, false, false, false, false, false] },
    ])
    showToast('Kebiasaan Ditambahkan', `Rutinitas "${newHabit.trim()}" berhasil dicatat.`, 'success')
    setNewHabit('')
  }

  return (
    <div className="border border-[#EAEAEA] dark:border-[#232326] bg-white dark:bg-[#141415] rounded-xl p-6 shadow-xs space-y-6">
      <div className="pb-3 border-b border-[#EAEAEA] dark:border-[#232326]">
        <h3 className="text-sm font-semibold text-[#111111] dark:text-[#EDEDED]">
          Tracker Kebiasaan Mingguan
        </h3>
        <p className="text-xs text-[#8F8E8A] dark:text-[#6E6D6A]">
          Catat konsistensi rutinitas positif harian langsung di browser.
        </p>
      </div>

      <form onSubmit={addHabit} className="flex gap-2">
        <input
          type="text"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          placeholder="Tambah kebiasaan baru..."
          className="flex-1 px-3 py-1.5 text-xs border border-[#EAEAEA] dark:border-[#232326] rounded-md bg-transparent"
        />
        <button
          type="submit"
          className="px-4 py-1.5 text-xs font-semibold bg-[#111111] text-white dark:bg-white dark:text-[#111111] rounded-md hover:opacity-90 cursor-pointer"
        >
          Tambah
        </button>
      </form>

      <div className="space-y-3 pt-2">
        {habits.map((h) => (
          <div
            key={h.id}
            className="p-3 bg-[#FBFBFA] dark:bg-[#0C0C0D] border border-[#EAEAEA] dark:border-[#232326] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          >
            <span className="font-medium text-[#111111] dark:text-[#EDEDED]">{h.name}</span>
            <div className="flex gap-2">
              {h.days.map((done, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleDay(h.id, idx)}
                  className={`w-7 h-7 rounded text-[10px] font-mono-code font-bold transition-all cursor-pointer ${
                    done
                      ? 'bg-[#346538] text-white'
                      : 'border border-[#EAEAEA] dark:border-[#232326] text-[#8F8E8A] hover:bg-[#EAEAEA]/50'
                  }`}
                >
                  {dayLabels[idx]}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function GreetingCardMaker() {
  const { showToast } = useToast()
  const [recipient, setRecipient] = useState('Sahabatku')
  const [occasion, setOccasion] = useState('Idul Fitri')
  const [theme, setTheme] = useState<'vermilion' | 'emerald' | 'midnight' | 'sakura'>('vermilion')
  const [message, setMessage] = useState(
    'Taqabbalallahu minna wa minkum. Selamat Hari Raya Idul Fitri, mohon maaf lahir dan batin.'
  )

  const themeStyles = {
    vermilion: {
      bg: 'bg-gradient-to-br from-[#E14D2A] to-[#8C250E]',
      text: 'text-white',
      accent: 'text-[#FDE8DF]',
      border: 'border-[#F07A5E]',
      seal: 'border-white/60 text-white',
    },
    emerald: {
      bg: 'bg-gradient-to-br from-[#1B4332] to-[#081C15]',
      text: 'text-white',
      accent: 'text-[#D8F3DC]',
      border: 'border-[#40916C]',
      seal: 'border-[#D8F3DC]/60 text-[#D8F3DC]',
    },
    midnight: {
      bg: 'bg-gradient-to-br from-[#1A1A24] to-[#0D0D11]',
      text: 'text-white',
      accent: 'text-[#D4A373]',
      border: 'border-[#333544]',
      seal: 'border-[#D4A373]/60 text-[#D4A373]',
    },
    sakura: {
      bg: 'bg-gradient-to-br from-[#FFF0F3] to-[#FFCCD5]',
      text: 'text-[#590D22]',
      accent: 'text-[#A4133C]',
      border: 'border-[#FFB3C1]',
      seal: 'border-[#800F2F]/60 text-[#800F2F]',
    },
  }

  const handleDownload = () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = 1200
    canvas.height = 800

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 1200, 800)
    if (theme === 'vermilion') {
      grad.addColorStop(0, '#E14D2A')
      grad.addColorStop(1, '#8C250E')
    } else if (theme === 'emerald') {
      grad.addColorStop(0, '#1B4332')
      grad.addColorStop(1, '#081C15')
    } else if (theme === 'midnight') {
      grad.addColorStop(0, '#1A1A24')
      grad.addColorStop(1, '#0D0D11')
    } else {
      grad.addColorStop(0, '#FFF0F3')
      grad.addColorStop(1, '#FFCCD5')
    }
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 1200, 800)

    // Gold inner border
    ctx.strokeStyle = theme === 'sakura' ? '#FFB3C1' : 'rgba(255,255,255,0.25)'
    ctx.lineWidth = 4
    ctx.strokeRect(40, 40, 1120, 720)

    // Occasion Header
    ctx.fillStyle = theme === 'sakura' ? '#A4133C' : '#FFFFFF'
    ctx.font = 'bold 24px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(occasion.toUpperCase(), 600, 200)

    // Recipient
    ctx.font = 'italic 52px serif'
    ctx.fillText(`Untuk ${recipient}`, 600, 280)

    // Message
    ctx.font = '26px sans-serif'
    ctx.fillStyle = theme === 'sakura' ? '#590D22' : 'rgba(255,255,255,0.9)'
    ctx.fillText(message, 600, 420)

    // Hanko seal text
    ctx.font = 'bold 18px monospace'
    ctx.fillStyle = theme === 'sakura' ? '#800F2F' : '#E14D2A'
    ctx.fillText('— KITTO ATELIER —', 600, 620)

    const a = document.createElement('a')
    a.download = `greeting-card-${recipient.toLowerCase().replace(/\s+/g, '-')}.png`
    a.href = canvas.toDataURL('image/png')
    a.click()
    showToast('Kartu Ucapan Diunduh', `Kartu ucapan "${occasion}" untuk ${recipient} berhasil disimpan format PNG.`, 'success')
  }

  const currentTheme = themeStyles[theme]

  return (
    <div className="border border-[#EAE5DC] dark:border-[#272A33] bg-white dark:bg-[#1A1B20] rounded-2xl p-6 shadow-xs space-y-6">
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#EAE5DC] dark:border-[#272A33] gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#1C1917] dark:text-[#F5F4F0]">
            Greeting Card Maker (Kartu Ucapan Digital Mewah)
          </h3>
          <p className="text-xs text-[#78716C]">
            Buat kartu ucapan bernuansa editorial, hanko seal stempel, dan unduh resolusi tinggi (1200×800 px).
          </p>
        </div>
        <button
          type="button"
          onClick={handleDownload}
          className="px-4 py-2 text-xs font-bold bg-[#E14D2A] text-white hover:bg-[#C83B1B] rounded-xl shadow-sm cursor-pointer"
        >
          Unduh Kartu PNG
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="space-y-4 text-xs">
          <div>
            <label className="text-sm block text-[#57534E] dark:text-[#A8A29E] mb-1 font-medium">Tema Visual</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'vermilion', label: 'Vermilion Hanko' },
                { id: 'emerald', label: 'Emerald Forest' },
                { id: 'midnight', label: 'Midnight Obsidian' },
                { id: 'sakura', label: 'Sakura Blush' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id as any)}
                  className={`py-2 px-3 rounded-lg font-medium transition-colors cursor-pointer text-center ${
                    theme === t.id
                      ? 'bg-[#E14D2A] text-white font-bold'
                      : 'border border-[#EAE5DC] dark:border-[#272A33] text-[#78716C] hover:bg-[#F3EFEA]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm block text-[#57534E] dark:text-[#A8A29E] mb-1 font-medium">Momen Spesial</label>
            <select
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              className="w-full px-3 py-2 border border-[#EAE5DC] dark:border-[#272A33] rounded-lg bg-transparent font-medium"
            >
              <option value="Idul Fitri">Idul Fitri</option>
              <option value="Ulang Tahun">Ulang Tahun</option>
              <option value="Tahun Baru">Tahun Baru</option>
              <option value="Sukses & Selamat">Apresiasi & Selamat</option>
              <option value="Terima Kasih">Ucapan Terima Kasih</option>
            </select>
          </div>

          <div>
            <label className="text-sm block text-[#57534E] dark:text-[#A8A29E] mb-1 font-medium">Nama Penerima</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-3 py-2 border border-[#EAE5DC] dark:border-[#272A33] rounded-lg bg-transparent"
            />
          </div>

          <div>
            <label className="text-sm block text-[#57534E] dark:text-[#A8A29E] mb-1 font-medium">Pesan Ucapan</label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 border border-[#EAE5DC] dark:border-[#272A33] rounded-lg bg-transparent text-xs"
            />
          </div>
        </div>

        {/* Visual Card Preview Container */}
        <div
          className={`p-8 rounded-2xl ${currentTheme.bg} ${currentTheme.text} text-center space-y-4 shadow-xl border ${currentTheme.border} relative overflow-hidden flex flex-col justify-between min-h-[300px]`}
        >
          {/* Subtle Corner Accents */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 opacity-40 border-current" />
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 opacity-40 border-current" />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 opacity-40 border-current" />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 opacity-40 border-current" />

          <div className="space-y-2">
            <span className={`text-xs font-mono-code uppercase tracking-widest ${currentTheme.accent} font-bold flex items-center justify-center gap-1.5`}>
              <Sparkles className="w-3 h-3" />
              <span>{occasion}</span>
              <Sparkles className="w-3 h-3" />
            </span>
            <div className="text-2xl font-serif-accent italic font-bold">
              Untuk {recipient}
            </div>
          </div>

          <p className="text-xs leading-relaxed max-w-xs mx-auto opacity-90 font-medium">
            "{message}"
          </p>

          <div className="pt-4 flex items-center justify-center gap-2">
            {/* Hanko Seal Stamp */}
            <div className={`w-8 h-8 rounded-full border-2 ${currentTheme.seal} flex items-center justify-center font-bold text-[10px] font-mono-code`}>
              吉
            </div>
            <span className="text-[10px] font-mono-code opacity-70">
              Kitto Atelier Digital
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function CalorieTracker() {
  const { showToast } = useToast()
  const [targetCalories, setTargetCalories] = useState<number>(2000)
  const [meals, setMeals] = useState<Array<{ id: number; name: string; calories: number }>>([
    { id: 1, name: 'Sarapan: Oatmeal & Telur Rebus', calories: 380 },
    { id: 2, name: 'Makan Siang: Nasi Merah, Dada Ayam, Sayur', calories: 650 },
    { id: 3, name: 'Camilan: Buah Pisang & Almond', calories: 210 },
  ])
  const [mealName, setMealName] = useState('')
  const [mealCalories, setMealCalories] = useState(400)

  const totalCalories = meals.reduce((acc, curr) => acc + curr.calories, 0)
  const remaining = targetCalories - totalCalories
  const percent = Math.min(100, Math.round((totalCalories / targetCalories) * 100))

  const addMeal = (e: React.FormEvent) => {
    e.preventDefault()
    if (!mealName.trim()) return
    setMeals([...meals, { id: Date.now(), name: mealName.trim(), calories: mealCalories }])
    showToast('Menu Dicatat', `${mealName.trim()} (${mealCalories} kcal) berhasil ditambahkan.`, 'success')
    setMealName('')
  }

  const deleteMeal = (id: number) => {
    setMeals(meals.filter((m) => m.id !== id))
    showToast('Menu Dihapus', 'Catatan menu makanan telah dihapus.', 'info')
  }

  return (
    <div className="border border-[#EAEAEA] dark:border-[#232326] bg-white dark:bg-[#141415] rounded-xl p-6 shadow-xs space-y-6">
      <div className="pb-3 border-b border-[#EAEAEA] dark:border-[#232326]">
        <h3 className="text-sm font-semibold text-[#111111] dark:text-[#EDEDED]">
          Tracker Kalori & Nutrisi Harian
        </h3>
        <p className="text-xs text-[#8F8E8A] dark:text-[#6E6D6A]">
          Lacak asupan kalori makanan dan evaluasi defisit atau surplus harian.
        </p>
      </div>

      {/* Target & Summary Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono-code">
        <div className="p-3 bg-[#FBFBFA] dark:bg-[#0C0C0D] border border-[#EAEAEA] dark:border-[#232326] rounded-lg">
          <span className="text-[#8F8E8A]">Target Harian:</span>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="number"
              step="50"
              value={targetCalories}
              onChange={(e) => setTargetCalories(parseInt(e.target.value) || 0)}
              className="w-24 px-2 py-0.5 border border-[#EAEAEA] dark:border-[#232326] rounded text-sm font-bold bg-transparent"
            />
            <span className="text-xs">kcal</span>
          </div>
        </div>

        <div className="p-3 bg-[#FBFBFA] dark:bg-[#0C0C0D] border border-[#EAEAEA] dark:border-[#232326] rounded-lg">
          <span className="text-[#8F8E8A]">Total Asupan:</span>
          <div className="text-lg font-bold text-[#111111] dark:text-[#EDEDED] mt-1">
            {totalCalories} kcal ({percent}%)
          </div>
        </div>

        <div className="p-3 bg-[#FBFBFA] dark:bg-[#0C0C0D] border border-[#EAEAEA] dark:border-[#232326] rounded-lg">
          <span className="text-[#8F8E8A]">Sisa Kalori:</span>
          <div
            className={`text-lg font-bold mt-1 ${
              remaining >= 0 ? 'text-[#346538]' : 'text-[#9F2F2D]'
            }`}
          >
            {remaining >= 0 ? `${remaining} kcal tersisa` : `${Math.abs(remaining)} kcal surplus`}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="w-full bg-[#EAEAEA] dark:bg-[#232326] h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              percent > 100 ? 'bg-[#9F2F2D]' : 'bg-[#346538]'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Add meal form */}
      <form onSubmit={addMeal} className="flex flex-col sm:flex-row gap-2 pt-2 text-xs">
        <input
          type="text"
          value={mealName}
          onChange={(e) => setMealName(e.target.value)}
          placeholder="Nama makanan atau minuman..."
          className="flex-1 px-3 py-1.5 border border-[#EAEAEA] dark:border-[#232326] rounded-md bg-transparent"
        />
        <input
          type="number"
          step="10"
          value={mealCalories}
          onChange={(e) => setMealCalories(parseInt(e.target.value) || 0)}
          className="w-28 px-3 py-1.5 border border-[#EAEAEA] dark:border-[#232326] rounded-md bg-transparent font-mono-code"
          placeholder="Kalori"
        />
        <button
          type="submit"
          className="px-4 py-1.5 font-semibold bg-[#111111] text-white dark:bg-white dark:text-[#111111] rounded-md hover:opacity-90 cursor-pointer"
        >
          Tambah
        </button>
      </form>

      {/* Meals list */}
      <div className="space-y-2 pt-2">
        {meals.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between p-2.5 bg-[#FBFBFA] dark:bg-[#0C0C0D] border border-[#EAEAEA] dark:border-[#232326] rounded-lg text-xs"
          >
            <span className="text-[#111111] dark:text-[#EDEDED]">{m.name}</span>
            <div className="flex items-center gap-3">
              <span className="font-mono-code font-bold text-[#6F6E6B] dark:text-[#9B9A97]">
                {m.calories} kcal
              </span>
              <button
                type="button"
                onClick={() => deleteMeal(m.id)}
                className="p-1 text-[#9F2F2D] hover:underline cursor-pointer flex items-center justify-center"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
