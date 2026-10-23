import { useState } from 'react'
import { ExternalLink, MessageCircle, Check, CheckCheck } from 'lucide-react'

export function DevExtraTools({
  initialTool = 'regex',
  hideTabs = true,
}: {
  initialTool?: string
  hideTabs?: boolean
}) {
  const [userTab, setUserTab] = useState<'regex' | 'codesnap' | 'whatsapp' | null>(null)
  const activeSub = !hideTabs && userTab ? userTab : (
    initialTool === 'codesnap'
      ? 'codesnap'
      : initialTool === 'whatsapp'
      ? 'whatsapp'
      : 'regex'
  )

  return (
    <div className="w-full space-y-6">
      {!hideTabs && (
        <div className="flex flex-wrap border-b border-[#EAE5DC] dark:border-[#272A33] gap-x-4 gap-y-1 pb-1">
          {[
            { id: 'regex', label: 'Tester Regex & Cheat Sheet' },
            { id: 'codesnap', label: 'Code Snap (Export Gambar)' },
            { id: 'whatsapp', label: 'WhatsApp Link & Chat Mockup' },
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

      {activeSub === 'regex' && <RegexTester />}
      {activeSub === 'codesnap' && <CodeSnap />}
      {activeSub === 'whatsapp' && <WhatsAppLinkGen />}
    </div>
  )
}

function RegexTester() {
  const [pattern, setPattern] = useState<string>('([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})')
  const [flags, setFlags] = useState<string>('g')
  const [testString, setTestString] = useState<string>(
    'Kontak kami di support@kitto.dev atau admin@domain.co.id untuk verifikasi.'
  )
  const [matches, setMatches] = useState<string[]>([])
  const [error, setError] = useState<string>('')

  const presets = [
    { label: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', flags: 'g' },
    { label: 'No. WA / HP Indo', pattern: '(\\+62|62|0)8[1-9][0-9]{6,10}', flags: 'g' },
    { label: 'URL / Link Web', pattern: 'https?:\\/\\/[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!$&\'()*+,;=.]+', flags: 'g' },
    { label: 'IPv4 Address', pattern: '(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)', flags: 'g' },
    { label: 'Slug URL', pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$', flags: 'g' },
    { label: 'Kode Warna HEX', pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b', flags: 'g' },
  ]

  const testRegex = () => {
    setError('')
    try {
      const reg = new RegExp(pattern, flags)
      const found: string[] = []
      if (flags.includes('g')) {
        let match: RegExpExecArray | null
        while ((match = reg.exec(testString)) !== null) {
          found.push(match[0])
          if (reg.lastIndex === match.index) reg.lastIndex++
        }
      } else {
        const single = reg.exec(testString)
        if (single) found.push(single[0])
      }
      setMatches(found)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Pola regex tidak valid')
      setMatches([])
    }
  }

  const applyPreset = (p: string, f: string) => {
    setPattern(p)
    setFlags(f)
  }

  return (
    <div className="border border-[#EAE5DC] dark:border-[#272A33] bg-white dark:bg-[#1A1B20] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
      <div className="pb-4 border-b border-[#EAE5DC] dark:border-[#272A33]">
        <h3 className="text-base sm:text-lg font-bold text-[#1C1917] dark:text-[#F5F4F0]">
          Tester Ekspresi Reguler (Regex) & Presets
        </h3>
        <p className="text-sm text-[#78716C] mt-1">
          Uji kecocokan pola ekspresi reguler secara instan dengan pustaka preset siap pakai.
        </p>
      </div>

      {/* Preset Buttons */}
      <div className="space-y-2">
        <span className="text-xs sm:text-sm font-semibold text-[#57534E] dark:text-[#A8A29E]">
          Preset Pola Cepat:
        </span>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(p.pattern, p.flags)}
              className="px-3 py-1.5 rounded-xl border border-[#EAE5DC] dark:border-[#272A33] hover:bg-[#F3EFEA] dark:hover:bg-[#22242B] cursor-pointer font-medium text-xs sm:text-sm transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Pattern & Flags */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="sm:col-span-3 space-y-1.5">
          <label className="block text-sm sm:text-sm font-semibold text-[#1C1917] dark:text-[#F5F4F0]">
            Pola Regex (Pattern)
          </label>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            className="w-full px-4 py-3 border border-[#EAE5DC] dark:border-[#272A33] rounded-xl bg-transparent font-mono-code text-sm sm:text-base outline-none focus:border-[#E14D2A] transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm sm:text-sm font-semibold text-[#1C1917] dark:text-[#F5F4F0]">
            Flags
          </label>
          <input
            type="text"
            value={flags}
            onChange={(e) => setFlags(e.target.value)}
            placeholder="g, i, m"
            className="w-full px-4 py-3 border border-[#EAE5DC] dark:border-[#272A33] rounded-xl bg-transparent font-mono-code text-sm sm:text-base outline-none focus:border-[#E14D2A] transition-colors"
          />
        </div>
      </div>

      {/* Test String Textarea */}
      <div className="space-y-1.5">
        <label className="block text-sm sm:text-sm font-semibold text-[#1C1917] dark:text-[#F5F4F0]">
          Teks Sampel Pengujian
        </label>
        <textarea
          rows={6}
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
          placeholder="Ketik atau tempel teks yang ingin diuji polanya di sini..."
          className="w-full p-4 text-sm sm:text-base font-mono-code border border-[#EAE5DC] dark:border-[#272A33] bg-[#FAF8F5] dark:bg-[#121316] rounded-2xl outline-none focus:border-[#E14D2A] leading-relaxed transition-colors min-h-[150px]"
        />
      </div>

      <button
        type="button"
        onClick={testRegex}
        className="px-7 py-3 text-sm font-bold bg-[#E14D2A] text-white hover:bg-[#C83B1B] rounded-xl shadow-md shadow-[#E14D2A]/20 cursor-pointer active:scale-[0.98] transition-all"
      >
        Jalankan Uji Regex
      </button>

      {error && (
        <div className="p-4 text-sm text-rose-700 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl font-medium">
          {error}
        </div>
      )}

      {matches.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-[#EAE5DC] dark:border-[#272A33]">
          <span className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <Check className="w-4 h-4" />
            <span>Berhasil menemukan {matches.length} kecocokan pola:</span>
          </span>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {matches.map((m, i) => (
              <div
                key={i}
                className="p-3.5 bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] rounded-xl font-mono-code text-sm sm:text-base text-[#1C1917] dark:text-[#F5F4F0] flex items-center justify-between font-semibold"
              >
                <span className="break-all">{m}</span>
                <span className="text-xs text-[#78716C] font-mono-code ml-3 shrink-0">#{i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CodeSnap() {
  const [code, setCode] = useState<string>(
    `// Minimalist QR & Tool Suite\nimport { createQr } from 'kitto';\n\nconst qr = createQr({\n  data: 'https://kitto.dev',\n  vector: true,\n  theme: 'hanko-vermilion'\n});`
  )
  const [title, setTitle] = useState<string>('kitto.ts')
  const [theme, setTheme] = useState<'dark' | 'dracula' | 'sumi'>('dark')
  const [copied, setCopied] = useState<boolean>(false)

  const copyCode = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const themeBgs = {
    dark: 'from-[#18181B] to-[#09090B]',
    dracula: 'from-[#282a36] to-[#191a21]',
    sumi: 'from-[#E14D2A]/20 to-[#121316]',
  }

  return (
    <div className="border border-[#EAE5DC] dark:border-[#272A33] bg-white dark:bg-[#1A1B20] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-[#EAE5DC] dark:border-[#272A33] gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#1C1917] dark:text-[#F5F4F0]">
            Code Snap (Cuplikan Kode Estetik)
          </h3>
          <p className="text-sm text-[#78716C] mt-1">
            Tampilkan cuplikan kode dengan bingkai macOS profesional siap dibagikan ke media sosial.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={copyCode}
            className="px-4 py-2 text-xs sm:text-sm font-semibold border border-[#EAE5DC] dark:border-[#272A33] rounded-xl hover:bg-[#F3EFEA] dark:hover:bg-[#22242B] cursor-pointer flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tersalin</span>
              </>
            ) : (
              <span>Salin Kode</span>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-sm sm:text-sm font-semibold text-[#1C1917] dark:text-[#F5F4F0]">Judul Tab File</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 border border-[#EAE5DC] dark:border-[#272A33] rounded-xl bg-transparent font-mono-code text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm sm:text-sm font-semibold text-[#1C1917] dark:text-[#F5F4F0]">Tema Warna</label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as any)}
            className="w-full px-4 py-2.5 border border-[#EAE5DC] dark:border-[#272A33] rounded-xl bg-transparent font-medium text-sm"
          >
            <option value="dark">Jet Black Minimal</option>
            <option value="dracula">Dracula Purple</option>
            <option value="sumi">Sumi & Vermilion Tint</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <textarea
          rows={7}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full p-4 text-sm font-mono-code border border-[#EAE5DC] dark:border-[#272A33] rounded-2xl bg-transparent outline-none focus:border-[#E14D2A] leading-relaxed min-h-[160px]"
        />

        {/* Visual Code Card Preview */}
        <div className={`p-6 sm:p-10 bg-gradient-to-br ${themeBgs[theme]} rounded-3xl shadow-xl border border-black/10`}>
          <div className="bg-[#09090B] border border-[#27272A] rounded-2xl overflow-hidden shadow-2xl">
            {/* macOS Chrome Header */}
            <div className="px-4 py-3 bg-[#121214] border-b border-[#27272A] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-[#EF4444]" />
                <span className="w-3.5 h-3.5 rounded-full bg-[#F59E0B]" />
                <span className="w-3.5 h-3.5 rounded-full bg-[#10B981]" />
                <span className="text-xs font-mono-code text-[#71717A] ml-2 font-medium">{title}</span>
              </div>
              <span className="text-xs font-mono-code text-[#E14D2A] font-bold">kitto</span>
            </div>
            <pre className="p-6 text-sm font-mono-code text-[#E4E4E7] overflow-x-auto leading-relaxed">
              {code}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}

function WhatsAppLinkGen() {
  const [phone, setPhone] = useState<string>('6281234567890')
  const [message, setMessage] = useState<string>('Halo Admin Kitto, saya ingin menanyakan fitur Dynamic QR.')
  const [copied, setCopied] = useState<boolean>(false)

  const quickTemplates = [
    { label: 'Tanya Produk', text: 'Halo, saya tertarik dengan produk/layanan Anda. Apakah bisa minta info katalog lengkapnya?' },
    { label: 'Konfirmasi Bayar', text: 'Halo, saya sudah melakukan transfer pembayaran pesanan. Berikut bukti pembayarannya.' },
    { label: 'Konsultasi', text: 'Halo tim, saya ingin konsultasi terkait kebutuhan implementasi proyek saya.' },
  ]

  const cleanPhone = phone.replace(/[^0-9]/g, '')
  const link = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`

  const handleCopy = () => {
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="border border-[#EAE5DC] dark:border-[#272A33] bg-white dark:bg-[#1A1B20] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
      <div className="pb-4 border-b border-[#EAE5DC] dark:border-[#272A33]">
        <h3 className="text-base sm:text-lg font-bold text-[#1C1917] dark:text-[#F5F4F0]">
          Generator Link WhatsApp & Mockup Obrolan
        </h3>
        <p className="text-sm text-[#78716C] mt-1">
          Buat tautan WhatsApp instan tanpa simpan kontak + pratinjau langsung tampilan balon obrolan ponsel.
        </p>
      </div>

      {/* Quick Template Buttons */}
      <div className="space-y-2">
        <span className="text-xs sm:text-sm font-semibold text-[#57534E] dark:text-[#A8A29E]">Template Pesan Cepat:</span>
        <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
          {quickTemplates.map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => setMessage(t.text)}
              className="px-3 py-1.5 rounded-xl border border-[#EAE5DC] dark:border-[#272A33] hover:bg-[#F3EFEA] dark:hover:bg-[#22242B] cursor-pointer font-medium transition-colors"
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Inputs */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm sm:text-sm font-semibold text-[#1C1917] dark:text-[#F5F4F0]">
              Nomor WhatsApp (dengan kode negara)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 border border-[#EAE5DC] dark:border-[#272A33] rounded-xl bg-transparent font-mono-code text-sm sm:text-base outline-none focus:border-[#E14D2A]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm sm:text-sm font-semibold text-[#1C1917] dark:text-[#F5F4F0]">
              Isi Pesan Otomatis
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-4 border border-[#EAE5DC] dark:border-[#272A33] rounded-2xl bg-transparent text-sm sm:text-base outline-none focus:border-[#E14D2A] leading-relaxed"
            />
          </div>

          <div className="p-4 bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] rounded-2xl">
            <span className="text-[#78716C] text-xs font-mono-code">Tautan wa.me Hasil:</span>
            <div className="font-mono-code text-xs sm:text-sm text-[#E14D2A] mt-1 break-all font-semibold">
              {link}
            </div>
          </div>

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={handleCopy}
              className="px-5 py-2.5 text-xs sm:text-sm font-bold bg-[#E14D2A] text-white hover:bg-[#C83B1B] rounded-xl shadow-md shadow-[#E14D2A]/20 cursor-pointer flex items-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4" /> : null}
              <span>{copied ? 'Tersalin!' : 'Salin Tautan'}</span>
            </button>
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold border border-[#EAE5DC] dark:border-[#272A33] rounded-xl hover:bg-[#F3EFEA] dark:hover:bg-[#22242B] inline-flex items-center gap-1.5"
            >
              <span>Uji Buka di WhatsApp</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Right: WhatsApp Chat Bubble Mockup */}
        <div className="rounded-3xl border border-emerald-600/20 bg-[#ECE5DD] dark:bg-[#0B141A] overflow-hidden shadow-lg flex flex-col h-full min-h-[340px]">
          {/* Header */}
          <div className="px-4 py-3 bg-[#075E54] dark:bg-[#1F2C34] text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-xs text-white">
                WA
              </div>
              <div>
                <div className="text-xs font-bold leading-tight">+{cleanPhone || '628...'}</div>
                <div className="text-[10px] text-emerald-200">Online</div>
              </div>
            </div>
            <MessageCircle className="w-4 h-4 text-emerald-200" />
          </div>

          {/* Chat Background & Message Bubble */}
          <div className="p-4 flex-1 flex flex-col justify-end space-y-3 overflow-y-auto">
            <div className="text-center">
              <span className="text-[10px] bg-white/70 dark:bg-slate-800/80 px-2 py-0.5 rounded-md text-slate-600 dark:text-slate-400 font-medium">
                HARI INI
              </span>
            </div>

            <div className="self-end max-w-[85%] bg-[#D9FDD3] dark:bg-[#005C4B] text-[#111B21] dark:text-[#E9EDEF] rounded-2xl rounded-tr-xs p-3.5 text-xs sm:text-sm shadow-xs relative">
              <p className="leading-relaxed whitespace-pre-wrap">{message || 'Pesan Anda akan muncul di sini...'}</p>
              <div className="text-[10px] text-slate-500 dark:text-slate-300 text-right mt-1.5 flex items-center justify-end gap-1 font-mono-code">
                <span>12:00</span>
                <CheckCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
