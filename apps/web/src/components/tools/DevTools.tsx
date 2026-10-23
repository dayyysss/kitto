import { useState, useId } from 'react'
import { Calendar, Zap, Check } from 'lucide-react'

// Cryptographically secure UUID v4
function generateUuidV4(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// RFC 9562 Time-Ordered UUID v7
function generateUuidV7(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  const timestamp = BigInt(Date.now())
  
  // 48-bit timestamp
  bytes[0] = Number((timestamp >> 40n) & 0xffn)
  bytes[1] = Number((timestamp >> 32n) & 0xffn)
  bytes[2] = Number((timestamp >> 24n) & 0xffn)
  bytes[3] = Number((timestamp >> 16n) & 0xffn)
  bytes[4] = Number((timestamp >> 8n) & 0xffn)
  bytes[5] = Number(timestamp & 0xffn)

  // Version 7 in bits 48..51
  bytes[6] = (bytes[6] & 0x0f) | 0x70
  // Variant RFC 4122 in bits 64..65
  bytes[8] = (bytes[8] & 0x3f) | 0x80

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

function decodeUuidV7Timestamp(uuid: string): string {
  try {
    const hex = uuid.replace(/-/g, '').slice(0, 12)
    const ms = parseInt(hex, 16)
    if (isNaN(ms)) return ''
    return new Date(ms).toLocaleString('id-ID')
  } catch {
    return ''
  }
}

function jsonToTypescript(obj: any, interfaceName = 'RootObject'): string {
  if (typeof obj !== 'object' || obj === null) {
    return `type ${interfaceName} = ${typeof obj};`
  }
  if (Array.isArray(obj)) {
    const itemType = obj.length > 0 ? typeof obj[0] : 'any'
    return `export type ${interfaceName} = ${itemType}[];`
  }
  let res = `export interface ${interfaceName} {\n`
  for (const key of Object.keys(obj)) {
    const val = obj[key]
    let typeName: string = typeof val
    if (val === null) typeName = 'null | any'
    else if (Array.isArray(val)) typeName = val.length > 0 ? `${typeof val[0]}[]` : 'any[]'
    else if (typeof val === 'object') typeName = 'Record<string, any>'
    res += `  ${key}: ${typeName};\n`
  }
  res += '}'
  return res
}

export function DevTools({
  initialTool = 'uuid',
  initialCodecMode,
  hideTabs = true,
}: {
  initialTool?: 'uuid' | 'codec'
  initialCodecMode?: 'base64' | 'url' | 'json'
  hideTabs?: boolean
}) {
  const [userSubTab, setUserSubTab] = useState<'uuid' | 'codec' | null>(null)
  const subTab = !hideTabs && userSubTab ? userSubTab : initialTool

  // UUID State
  const [uuidVersion, setUuidVersion] = useState<'v4' | 'v7'>('v7')
  const [uuidCount, setUuidCount] = useState<number>(5)
  const [uuids, setUuids] = useState<string[]>([])
  const [copiedAll, setCopiedAll] = useState<boolean>(false)

  // Codec State
  const [codecMode, setCodecMode] = useState<'base64' | 'url' | 'json'>(initialCodecMode || 'json')
  const [inputVal, setInputVal] = useState<string>(
    '{\n  "id": 101,\n  "name": "Kitto Suite",\n  "version": "2.4.0",\n  "active": true\n}'
  )
  const [outputVal, setOutputVal] = useState<string>('')
  const [codecError, setCodecError] = useState<string>('')

  const versionId = useId()
  const countId = useId()

  const generateUuids = () => {
    const list: string[] = []
    for (let i = 0; i < uuidCount; i++) {
      list.push(uuidVersion === 'v7' ? generateUuidV7() : generateUuidV4())
    }
    setUuids(list)
  }

  const handleCopyAll = async () => {
    if (uuids.length === 0) return
    await navigator.clipboard.writeText(uuids.join('\n'))
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 1500)
  }

  // Codec process
  const processCodec = (action: 'encode' | 'decode' | 'format' | 'minify' | 'ts') => {
    setCodecError('')
    try {
      if (codecMode === 'base64') {
        if (action === 'encode') {
          setOutputVal(btoa(unescape(encodeURIComponent(inputVal))))
        } else {
          setOutputVal(decodeURIComponent(escape(atob(inputVal))))
        }
      } else if (codecMode === 'url') {
        if (action === 'encode') {
          setOutputVal(encodeURIComponent(inputVal))
        } else {
          setOutputVal(decodeURIComponent(inputVal))
        }
      } else if (codecMode === 'json') {
        const parsed = JSON.parse(inputVal)
        if (action === 'format') {
          setOutputVal(JSON.stringify(parsed, null, 2))
        } else if (action === 'minify') {
          setOutputVal(JSON.stringify(parsed))
        } else if (action === 'ts') {
          setOutputVal(jsonToTypescript(parsed))
        }
      }
    } catch (err: unknown) {
      setCodecError(err instanceof Error ? err.message : 'Format input tidak valid.')
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Subtab navigation */}
      {!hideTabs && (
        <div className="flex flex-wrap border-b border-[#EAE5DC] dark:border-[#272A33] gap-x-6 gap-y-1 pb-1">
          <button
            type="button"
            onClick={() => setUserSubTab('uuid')}
            className={`pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              subTab === 'uuid'
                ? 'border-b-2 border-[#E14D2A] text-[#E14D2A]'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            UUID Generator & Timestamp Decoder (v4 / v7)
          </button>

          <button
            type="button"
            onClick={() => setUserSubTab('codec')}
            className={`pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              subTab === 'codec'
                ? 'border-b-2 border-[#E14D2A] text-[#E14D2A]'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            JSON, Base64 & TypeScript Interface Generator
          </button>
        </div>
      )}

      {subTab === 'uuid' ? (
        <div className="border border-[#EAE5DC] dark:border-[#272A33] bg-white dark:bg-[#1A1B20] rounded-3xl p-6 sm:p-9 shadow-sm space-y-6">
          <div className="pb-4 border-b border-[#EAE5DC] dark:border-[#272A33]">
            <h3 className="text-base sm:text-lg font-bold text-[#1C1917] dark:text-[#F5F4F0]">
              Generator UUID v7 (Time-Ordered) & v4
            </h3>
            <p className="text-sm text-[#78716C] mt-1">
              UUID v7 mengurutkan data berbasis timestamp epoch milidetik (RFC 9562) untuk efisiensi index database.
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <label htmlFor={versionId} className="text-sm font-semibold text-[#57534E] dark:text-[#A8A29E]">Versi:</label>
              <select
                id={versionId}
                value={uuidVersion}
                onChange={(e) => setUuidVersion(e.target.value as 'v4' | 'v7')}
                className="px-3.5 py-2 border border-[#EAE5DC] dark:border-[#272A33] bg-transparent rounded-xl font-medium text-sm"
              >
                <option value="v7">UUID v7 (Time-Ordered + Timestamp)</option>
                <option value="v4">UUID v4 (Acak)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor={countId} className="text-sm font-semibold text-[#57534E] dark:text-[#A8A29E]">Jumlah:</label>
              <select
                id={countId}
                value={uuidCount}
                onChange={(e) => setUuidCount(parseInt(e.target.value))}
                className="px-3.5 py-2 border border-[#EAE5DC] dark:border-[#272A33] bg-transparent rounded-xl font-medium text-sm"
              >
                <option value="1">1</option>
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
              </select>
            </div>

            <button
              type="button"
              onClick={generateUuids}
              className="px-6 py-2.5 text-sm font-bold bg-[#E14D2A] text-white hover:bg-[#C83B1B] rounded-xl shadow-sm shadow-[#E14D2A]/20 transition-all cursor-pointer"
            >
              Hasilkan UUID
            </button>

            {uuids.length > 0 && (
              <button
                type="button"
                onClick={handleCopyAll}
                className="px-4 py-2.5 text-sm font-bold border border-[#EAE5DC] dark:border-[#272A33] rounded-xl hover:bg-[#F3EFEA] dark:hover:bg-[#22242B] cursor-pointer flex items-center gap-1.5"
              >
                {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : null}
                <span>{copiedAll ? 'Tersalin Semua' : 'Salin Semua'}</span>
              </button>
            )}
          </div>

          {/* Results list with timestamp decoding */}
          <div className="space-y-2.5 pt-2">
            {uuids.length === 0 ? (
              <div className="text-center py-12 text-sm text-[#78716C] border border-dashed border-[#EAE5DC] dark:border-[#272A33] rounded-2xl bg-[#FAF8F5] dark:bg-[#121316]">
                Klik tombol "Hasilkan UUID" untuk mengenerate string unik.
              </div>
            ) : (
              uuids.map((id, index) => {
                const decodedTime = uuidVersion === 'v7' ? decodeUuidV7Timestamp(id) : ''
                return (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] rounded-2xl font-mono-code text-sm gap-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[#1C1917] dark:text-[#F5F4F0] font-bold">{id}</span>
                      {decodedTime && (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{decodedTime}</span>
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(id)}
                      className="text-xs text-[#E14D2A] hover:underline cursor-pointer font-bold self-end sm:self-auto"
                    >
                      Salin
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>
      ) : (
        <div className="border border-[#EAE5DC] dark:border-[#272A33] bg-white dark:bg-[#1A1B20] rounded-3xl p-6 sm:p-9 shadow-sm space-y-6">
          <div className="flex gap-2 pb-4 border-b border-[#EAE5DC] dark:border-[#272A33]">
            {(['json', 'base64', 'url'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setCodecMode(mode)
                  setInputVal('')
                  setOutputVal('')
                  setCodecError('')
                }}
                className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl uppercase transition-colors cursor-pointer ${
                  codecMode === mode
                    ? 'bg-[#E14D2A] text-white shadow-xs'
                    : 'text-[#78716C] hover:bg-[#F3EFEA] dark:hover:bg-[#22242B]'
                }`}
              >
                {mode === 'json' ? 'JSON & TypeScript' : mode}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-[#1C1917] dark:text-[#F5F4F0] mb-2">
                Input Data
              </label>
              <textarea
                rows={9}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Masukkan teks, JSON, atau data di sini..."
                className="w-full p-4 text-sm font-mono-code border border-[#EAE5DC] dark:border-[#272A33] bg-[#FAF8F5] dark:bg-[#121316] rounded-2xl outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1C1917] dark:text-[#F5F4F0] mb-2 flex justify-between">
                <span>Output Hasil</span>
                {outputVal && (
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(outputVal)}
                    className="text-[#E14D2A] hover:underline cursor-pointer font-bold text-xs sm:text-sm"
                  >
                    Salin Output
                  </button>
                )}
              </label>
              <textarea
                readOnly
                rows={9}
                value={outputVal}
                placeholder="Hasil konversi atau TypeScript interface akan tampil di sini..."
                className="w-full p-4 text-sm font-mono-code border border-[#EAE5DC] dark:border-[#272A33] bg-[#FAF8F5] dark:bg-[#121316] rounded-2xl outline-none"
              />
            </div>
          </div>

          {codecError && (
            <div className="p-3.5 text-sm text-rose-700 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl font-medium">
              {codecError}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2.5 pt-1">
            {codecMode === 'json' ? (
              <>
                <button
                  type="button"
                  onClick={() => processCodec('format')}
                  className="px-5 py-2.5 text-sm font-bold bg-[#E14D2A] text-white hover:bg-[#C83B1B] rounded-xl shadow-sm cursor-pointer"
                >
                  Rapikan JSON (Prettify)
                </button>
                <button
                  type="button"
                  onClick={() => processCodec('ts')}
                  className="px-5 py-2.5 text-sm font-bold border border-[#EAE5DC] dark:border-[#272A33] rounded-xl hover:bg-[#F3EFEA] dark:hover:bg-[#22242B] cursor-pointer text-[#E14D2A] flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Generate TypeScript Interface</span>
                </button>
                <button
                  type="button"
                  onClick={() => processCodec('minify')}
                  className="px-5 py-2.5 text-sm font-medium border border-[#EAE5DC] dark:border-[#272A33] rounded-xl hover:bg-[#F3EFEA] dark:hover:bg-[#22242B] cursor-pointer"
                >
                  Minify
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => processCodec('encode')}
                  className="px-5 py-2.5 text-sm font-bold bg-[#E14D2A] text-white hover:bg-[#C83B1B] rounded-xl shadow-sm cursor-pointer"
                >
                  Encode
                </button>
                <button
                  type="button"
                  onClick={() => processCodec('decode')}
                  className="px-5 py-2.5 text-sm font-medium border border-[#EAEAEA] dark:border-[#232326] rounded-xl hover:bg-[#F3EFEA] dark:hover:bg-[#22242B] cursor-pointer"
                >
                  Decode
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
