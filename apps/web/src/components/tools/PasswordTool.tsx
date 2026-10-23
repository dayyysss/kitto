import { useState, useId } from 'react'
import { RefreshCw, Copy, Check } from 'lucide-react'

const INDO_WORDS = [
  'elang', 'kopi', 'roket', 'pantai', 'mentari', 'ombak', 'bintang', 'hujan', 'cahaya',
  'gunung', 'sungai', 'pelangi', 'samudra', 'angin', 'merpati', 'kancil', 'bambu', 'kelapa',
  'danau', 'padang', 'harimau', 'bunga', 'pohon', 'lembah', 'karang', 'senja', 'fajar',
  'kilat', 'kristal', 'mutiara', 'zamrud', 'safir', 'perak', 'emas', 'kompas', 'lentera'
]

function createRandomPassword(
  len: number,
  upper: boolean,
  lower: boolean,
  digits: boolean,
  symbols: boolean,
  ambiguous: boolean
): string {
  let charset = ''
  if (upper) charset += ambiguous ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (lower) charset += ambiguous ? 'abcdefghijkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz'
  if (digits) charset += ambiguous ? '23456789' : '0123456789'
  if (symbols) charset += '!@#$%^&*()-_=+[]{}|;:,.<>?'
  if (!charset) return ''

  const randomValues = new Uint32Array(len)
  window.crypto.getRandomValues(randomValues)
  let result = ''
  for (let i = 0; i < len; i++) {
    result += charset[randomValues[i] % charset.length]
  }
  return result
}

function createPassphrase(wordCount = 4, separator = '-'): string {
  const randomValues = new Uint32Array(wordCount)
  window.crypto.getRandomValues(randomValues)
  const words: string[] = []
  for (let i = 0; i < wordCount; i++) {
    words.push(INDO_WORDS[randomValues[i] % INDO_WORDS.length])
  }
  const randomSuffix = Math.floor(10 + Math.random() * 89)
  return words.join(separator) + separator + randomSuffix
}

function createPin(len = 6): string {
  const randomValues = new Uint32Array(len)
  window.crypto.getRandomValues(randomValues)
  let pin = ''
  for (let i = 0; i < len; i++) {
    pin += (randomValues[i] % 10).toString()
  }
  return pin
}

export function PasswordTool() {
  const [toolMode, setToolMode] = useState<'crypto' | 'passphrase' | 'pin'>('crypto')
  const [length, setLength] = useState<number>(20)
  const [passphraseWords, setPassphraseWords] = useState<number>(4)
  const [useUpper, setUseUpper] = useState<boolean>(true)
  const [useLower, setUseLower] = useState<boolean>(true)
  const [useDigits, setUseDigits] = useState<boolean>(true)
  const [useSymbols, setUseSymbols] = useState<boolean>(true)
  const [excludeAmbiguous, setExcludeAmbiguous] = useState<boolean>(true)
  const [password, setPassword] = useState<string>(() =>
    createRandomPassword(20, true, true, true, true, true)
  )
  const [copied, setCopied] = useState<boolean>(false)

  const upperId = useId()
  const lowerId = useId()
  const digitsId = useId()
  const symbolsId = useId()
  const ambiguousId = useId()

  const generate = (
    mode = toolMode,
    len = length,
    words = passphraseWords,
    upper = useUpper,
    lower = useLower,
    digits = useDigits,
    symbols = useSymbols,
    ambiguous = excludeAmbiguous
  ) => {
    if (mode === 'passphrase') {
      setPassword(createPassphrase(words))
    } else if (mode === 'pin') {
      setPassword(createPin(6))
    } else {
      setPassword(createRandomPassword(len, upper, lower, digits, symbols, ambiguous))
    }
  }

  const switchMode = (newMode: typeof toolMode) => {
    setToolMode(newMode)
    generate(newMode)
  }

  // Shannon Entropy calculation
  const getEntropy = (): { bits: number; grade: string; color: string; crackTime: string } => {
    if (toolMode === 'passphrase') {
      const bits = Math.round(passphraseWords * Math.log2(INDO_WORDS.length) + 6)
      return { bits, grade: 'Kuat (Mudah Diingat)', color: '#346538', crackTime: '~ ribuan tahun' }
    }
    if (toolMode === 'pin') {
      return { bits: 20, grade: 'Standar PIN', color: '#956400', crackTime: '~ beberapa menit' }
    }

    let pool = 0
    if (useUpper) pool += excludeAmbiguous ? 24 : 26
    if (useLower) pool += excludeAmbiguous ? 24 : 26
    if (useDigits) pool += excludeAmbiguous ? 8 : 10
    if (useSymbols) pool += 27
    if (pool === 0 || password.length === 0) {
      return { bits: 0, grade: 'Kosong', color: '#8F8E8A', crackTime: 'Seketika' }
    }

    const bits = Math.round(password.length * Math.log2(pool))
    if (bits < 40) {
      return { bits, grade: 'Sangat Lemah', color: '#9F2F2D', crackTime: '< 1 detik' }
    }
    if (bits < 60) {
      return { bits, grade: 'Sedang', color: '#956400', crackTime: '~ beberapa jam' }
    }
    if (bits < 80) {
      return { bits, grade: 'Kuat', color: '#346538', crackTime: '~ ratusan tahun' }
    }
    return { bits, grade: 'Sangat Kuat', color: '#1F6C9F', crackTime: '> triliunan abad' }
  }

  const entropy = getEntropy()

  const copyPassword = async () => {
    if (!password) return
    await navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      <div className="border border-[#EAE5DC] dark:border-[#272A33] bg-white dark:bg-[#1A1B20] rounded-3xl p-6 sm:p-9 shadow-sm space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#EAE5DC] dark:border-[#272A33]">
          <div>
            <span className="text-xs sm:text-sm font-mono-code font-bold uppercase tracking-wider text-[#E14D2A]">
              Pembuat Sandi
            </span>
            <p className="text-sm text-[#78716C] mt-1">
              Dibuat langsung di perangkat Anda. Sandi tidak pernah dikirim ke internet.
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 p-1.5 bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] rounded-2xl text-[10px] sm:text-sm font-semibold">
          <button
            type="button"
            onClick={() => switchMode('crypto')}
            className={`flex-1 min-w-0 py-2 sm:py-2.5 px-1 sm:px-2 rounded-xl transition-all cursor-pointer leading-tight text-center ${
              toolMode === 'crypto'
                ? 'bg-white dark:bg-[#1A1B20] text-[#E14D2A] font-bold shadow-xs'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            Karakter Acak
          </button>
          <button
            type="button"
            onClick={() => switchMode('passphrase')}
            className={`flex-1 min-w-0 py-2 sm:py-2.5 px-1 sm:px-2 rounded-xl transition-all cursor-pointer leading-tight text-center ${
              toolMode === 'passphrase'
                ? 'bg-white dark:bg-[#1A1B20] text-[#E14D2A] font-bold shadow-xs'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            Passphrase (Kata)
          </button>
          <button
            type="button"
            onClick={() => switchMode('pin')}
            className={`flex-1 min-w-0 py-2 sm:py-2.5 px-1 sm:px-2 rounded-xl transition-all cursor-pointer leading-tight text-center ${
              toolMode === 'pin'
                ? 'bg-white dark:bg-[#1A1B20] text-[#E14D2A] font-bold shadow-xs'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            PIN Angka
          </button>
        </div>

        {/* Display Box */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border border-[#EAE5DC] dark:border-[#272A33] bg-[#FAF8F5] dark:bg-[#121316] rounded-2xl p-4 sm:p-6 shadow-inner gap-3 sm:gap-4">
          <input
            type="text"
            readOnly
            value={password}
            className="w-full text-base sm:text-2xl font-mono-code text-[#1C1917] dark:text-[#F5F4F0] bg-transparent outline-none select-all font-bold tracking-wide break-all"
          />
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => generate()}
              title="Acak Ulang"
              className="p-2 sm:p-2.5 text-[#78716C] hover:text-[#E14D2A] transition-colors cursor-pointer rounded-xl hover:bg-[#F3EFEA] dark:hover:bg-[#22242B]"
            >
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              type="button"
              onClick={copyPassword}
              className="px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold bg-[#E14D2A] hover:bg-[#C83B1B] text-white rounded-xl active:scale-[0.98] transition-all cursor-pointer shadow-md shadow-[#E14D2A]/20 flex items-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Tersalin!' : 'Salin Sandi'}</span>
            </button>
          </div>
        </div>

        {/* Entropy Meter */}
        <div className="p-5 sm:p-6 border border-[#EAE5DC] dark:border-[#272A33] rounded-2xl bg-[#FAF8F5]/60 dark:bg-[#16171B] space-y-3">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-[#57534E] dark:text-[#A8A29E] font-medium">Kekuatan Sandi:</span>
            <span className="font-bold text-sm sm:text-base" style={{ color: entropy.color }}>
              {entropy.grade} ({entropy.bits} bits)
            </span>
          </div>
          <div className="w-full bg-[#EAE5DC] dark:bg-[#272A33] h-2.5 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-300 rounded-full"
              style={{
                width: `${Math.min(100, (entropy.bits / 100) * 100)}%`,
                backgroundColor: entropy.color,
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-[#78716C] pt-1 font-mono-code">
            <span>Estimasi waktu tebak: {entropy.crackTime}</span>
            <span>Minimal: &gt;= 64 bits</span>
          </div>
        </div>

        {/* Controls based on Mode */}
        {toolMode === 'crypto' && (
          <div className="space-y-6 pt-1">
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-[#1C1917] dark:text-[#F5F4F0]">Panjang Karakter:</span>
                <span className="font-mono-code font-bold text-[#E14D2A] text-base">{length} Karakter</span>
              </div>
              <input
                type="range"
                min="8"
                max="64"
                value={length}
                onChange={(e) => {
                  const val = parseInt(e.target.value)
                  setLength(val)
                  generate(toolMode, val)
                }}
                className="w-full accent-[#E14D2A] h-2 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm pt-2">
              <label htmlFor={upperId} className="text-sm flex items-center gap-3 p-3 rounded-xl border border-[#EAE5DC] dark:border-[#272A33] bg-[#FAF8F5] dark:bg-[#121316] cursor-pointer select-none hover:border-[#E14D2A]/50 transition-colors">
                <input
                  id={upperId}
                  type="checkbox"
                  checked={useUpper}
                  onChange={(e) => {
                    setUseUpper(e.target.checked)
                    generate(toolMode, length, passphraseWords, e.target.checked)
                  }}
                  className="w-4 h-4 rounded accent-[#E14D2A]"
                />
                <span className="font-medium text-[#1C1917] dark:text-[#F5F4F0]">Huruf Besar (A-Z)</span>
              </label>

              <label htmlFor={lowerId} className="text-sm flex items-center gap-3 p-3 rounded-xl border border-[#EAE5DC] dark:border-[#272A33] bg-[#FAF8F5] dark:bg-[#121316] cursor-pointer select-none hover:border-[#E14D2A]/50 transition-colors">
                <input
                  id={lowerId}
                  type="checkbox"
                  checked={useLower}
                  onChange={(e) => {
                    setUseLower(e.target.checked)
                    generate(toolMode, length, passphraseWords, useUpper, e.target.checked)
                  }}
                  className="w-4 h-4 rounded accent-[#E14D2A]"
                />
                <span className="font-medium text-[#1C1917] dark:text-[#F5F4F0]">Huruf Kecil (a-z)</span>
              </label>

              <label htmlFor={digitsId} className="text-sm flex items-center gap-3 p-3 rounded-xl border border-[#EAE5DC] dark:border-[#272A33] bg-[#FAF8F5] dark:bg-[#121316] cursor-pointer select-none hover:border-[#E14D2A]/50 transition-colors">
                <input
                  id={digitsId}
                  type="checkbox"
                  checked={useDigits}
                  onChange={(e) => {
                    setUseDigits(e.target.checked)
                    generate(toolMode, length, passphraseWords, useUpper, useLower, e.target.checked)
                  }}
                  className="w-4 h-4 rounded accent-[#E14D2A]"
                />
                <span className="font-medium text-[#1C1917] dark:text-[#F5F4F0]">Angka (0-9)</span>
              </label>

              <label htmlFor={symbolsId} className="text-sm flex items-center gap-3 p-3 rounded-xl border border-[#EAE5DC] dark:border-[#272A33] bg-[#FAF8F5] dark:bg-[#121316] cursor-pointer select-none hover:border-[#E14D2A]/50 transition-colors">
                <input
                  id={symbolsId}
                  type="checkbox"
                  checked={useSymbols}
                  onChange={(e) => {
                    setUseSymbols(e.target.checked)
                    generate(toolMode, length, passphraseWords, useUpper, useLower, useDigits, e.target.checked)
                  }}
                  className="w-4 h-4 rounded accent-[#E14D2A]"
                />
                <span className="font-medium text-[#1C1917] dark:text-[#F5F4F0]">Simbol Spesial (!@#$)</span>
              </label>

              <label htmlFor={ambiguousId} className="text-sm sm:col-span-2 flex items-center gap-3 p-3 rounded-xl border border-[#EAE5DC] dark:border-[#272A33] bg-[#FAF8F5] dark:bg-[#121316] cursor-pointer select-none hover:border-[#E14D2A]/50 transition-colors">
                <input
                  id={ambiguousId}
                  type="checkbox"
                  checked={excludeAmbiguous}
                  onChange={(e) => {
                    setExcludeAmbiguous(e.target.checked)
                    generate(toolMode, length, passphraseWords, useUpper, useLower, useDigits, useSymbols, e.target.checked)
                  }}
                  className="w-4 h-4 rounded accent-[#E14D2A]"
                />
                <span className="font-medium text-[#1C1917] dark:text-[#F5F4F0]">Hindari karakter membingungkan (1, l, I, 0, O)</span>
              </label>
            </div>
          </div>
        )}

        {toolMode === 'passphrase' && (
          <div className="space-y-4 pt-1">
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-[#1C1917] dark:text-[#F5F4F0]">Jumlah Kata:</span>
                <span className="font-mono-code font-bold text-[#E14D2A] text-base">{passphraseWords} Kata</span>
              </div>
              <input
                type="range"
                min="3"
                max="8"
                value={passphraseWords}
                onChange={(e) => {
                  const val = parseInt(e.target.value)
                  setPassphraseWords(val)
                  generate('passphrase', length, val)
                }}
                className="w-full accent-[#E14D2A] h-2 cursor-pointer"
              />
            </div>
            <p className="text-sm text-[#78716C] leading-relaxed">
              Passphrase menggabungkan kata-kata acak kamus bahasa Indonesia dengan angka akhiran acak. Jauh lebih mudah diketik pada ponsel namun tetap sulit ditebak.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
