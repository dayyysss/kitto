import { useState, useRef } from 'react'
import { Lock, Unlock, Edit2, Check, Minus, Square, X } from 'lucide-react'

export function VisualTools({
  initialTool = 'screenshot',
  hideTabs = true,
}: {
  initialTool?: string
  hideTabs?: boolean
}) {
  const [userTab, setUserTab] = useState<'screenshot' | 'palette' | 'gradient' | 'compress' | 'resizer' | null>(null)
  const activeSub = !hideTabs && userTab ? userTab : (
    initialTool === 'palette'
      ? 'palette'
      : initialTool === 'gradient'
      ? 'gradient'
      : initialTool === 'compress'
      ? 'compress'
      : initialTool === 'resizer'
      ? 'resizer'
      : 'screenshot'
  )

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Subtab navigation */}
      {!hideTabs && (
        <div className="flex flex-wrap border-b border-[#EAE5DC] dark:border-[#272A33] gap-x-4 gap-y-1 pb-1">
          {[
            { id: 'screenshot', label: 'Percantik Screenshot' },
            { id: 'palette', label: 'Generator Palet Warna' },
            { id: 'gradient', label: 'Pembuat Gradien CSS' },
            { id: 'compress', label: 'Kompresi Gambar' },
            { id: 'resizer', label: 'Ubah Ukuran Gambar' },
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

      {activeSub === 'screenshot' && <ScreenshotBeautifier />}
      {activeSub === 'palette' && <ColorPaletteGenerator />}
      {activeSub === 'gradient' && <GradientMaker />}
      {activeSub === 'compress' && <ImageCompressor />}
      {activeSub === 'resizer' && <ImageResizer />}
    </div>
  )
}

function ScreenshotBeautifier() {
  const [imageSrc, setImageSrc] = useState<string>('')
  const [padding, setPadding] = useState<number>(40)
  const [rounded, setRounded] = useState<number>(14)
  const [bgType, setBgType] = useState<string>('gradient1')
  const [shadow, setShadow] = useState<boolean>(true)
  const [windowChrome, setWindowChrome] = useState<'macos' | 'windows' | 'none'>('macos')
  const [aspectRatio, setAspectRatio] = useState<'auto' | '1/1' | '16/9' | '4/5'>('auto')
  const [tilt, setTilt] = useState<number>(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  const backgroundStyles: Record<string, string> = {
    gradient1: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    gradient2: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    gradient3: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)',
    vermilion: 'linear-gradient(135deg, #E14D2A 0%, #D4A373 100%)',
    dark: '#141415',
    warm: '#F7F6F3',
    charcoal: '#1E1E20',
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => setImageSrc(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleDownload = () => {
    if (!imageSrc) return
    const img = new Image()
    img.src = imageSrc
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const chromeHeaderHeight = windowChrome !== 'none' ? 36 : 0
      const contentW = img.width
      const contentH = img.height + chromeHeaderHeight

      const totalW = contentW + padding * 2
      const totalH = contentH + padding * 2

      const scale = 2
      canvas.width = totalW * scale
      canvas.height = totalH * scale
      ctx.scale(scale, scale)

      // 1. Draw Background
      ctx.fillStyle = bgType.startsWith('gradient') ? '#c3cfe2' : backgroundStyles[bgType]
      ctx.fillRect(0, 0, totalW, totalH)

      // 2. Draw Shadow
      if (shadow) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
        ctx.shadowBlur = 32
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 14
      }

      // 3. Draw Rounded Card Container
      ctx.beginPath()
      ctx.roundRect(padding, padding, contentW, contentH, rounded)
      ctx.fillStyle = '#1A1B20'
      ctx.fill()

      // Reset shadow for inner graphics
      ctx.shadowColor = 'transparent'

      ctx.save()
      ctx.clip()

      // 4. Draw Chrome Header Bar if selected
      if (windowChrome === 'macos') {
        ctx.fillStyle = '#18191E'
        ctx.fillRect(padding, padding, contentW, chromeHeaderHeight)
        // Red, Yellow, Green dots
        ctx.fillStyle = '#EF4444'
        ctx.beginPath()
        ctx.arc(padding + 16, padding + 18, 5, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#F59E0B'
        ctx.beginPath()
        ctx.arc(padding + 32, padding + 18, 5, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#10B981'
        ctx.beginPath()
        ctx.arc(padding + 48, padding + 18, 5, 0, Math.PI * 2)
        ctx.fill()
      } else if (windowChrome === 'windows') {
        ctx.fillStyle = '#202124'
        ctx.fillRect(padding, padding, contentW, chromeHeaderHeight)
      }

      // 5. Draw Image Content
      ctx.drawImage(img, padding, padding + chromeHeaderHeight, contentW, img.height)
      ctx.restore()

      const a = document.createElement('a')
      a.download = `screenshot-beautified-${Date.now()}.png`
      a.href = canvas.toDataURL('image/png')
      a.click()
    }
  }

  return (
    <div className="border border-[#EAE5DC] dark:border-[#272A33] bg-white dark:bg-[#1A1B20] rounded-2xl p-4 sm:p-6 shadow-xs space-y-6">
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#EAE5DC] dark:border-[#272A33] gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#1C1917] dark:text-[#F5F4F0]">
            Percantik Screenshot (Frame 3D & Mockup)
          </h3>
          <p className="text-xs text-[#78716C]">
            Ubah cuplikan layar biasa menjadi showcase berkelas ala Dribbble dengan window chrome & 3D tilt.
          </p>
        </div>
        {imageSrc && (
          <button
            type="button"
            onClick={handleDownload}
            className="px-4 py-2 text-xs font-bold bg-[#E14D2A] text-white hover:bg-[#C83B1B] rounded-xl shadow-sm shadow-[#E14D2A]/25 cursor-pointer"
          >
            Unduh PNG Resolusi Tinggi
          </button>
        )}
      </div>

      {/* Extended Controls */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <label className="text-sm block text-[#57534E] dark:text-[#A8A29E] mb-1 font-medium">Latar Belakang</label>
          <select
            value={bgType}
            onChange={(e) => setBgType(e.target.value)}
            className="w-full px-2.5 py-1.5 border border-[#EAE5DC] dark:border-[#272A33] rounded-lg bg-transparent"
          >
            <option value="gradient1">Soft Blue-Gray</option>
            <option value="gradient2">Lilac Sky</option>
            <option value="gradient3">Clean White</option>
            <option value="vermilion">Vermilion Glow</option>
            <option value="warm">Warm Ivory (#FAF8F5)</option>
            <option value="dark">Sumi Obsidian (#121316)</option>
            <option value="charcoal">Charcoal</option>
          </select>
        </div>

        <div>
          <label className="text-sm block text-[#57534E] dark:text-[#A8A29E] mb-1 font-medium">Bingkai Window</label>
          <select
            value={windowChrome}
            onChange={(e) => setWindowChrome(e.target.value as any)}
            className="w-full px-2.5 py-1.5 border border-[#EAE5DC] dark:border-[#272A33] rounded-lg bg-transparent"
          >
            <option value="macos">macOS (Traffic Light Dots)</option>
            <option value="windows">Windows 11 Clean</option>
            <option value="none">Tanpa Header Window</option>
          </select>
        </div>

        <div>
          <label className="text-sm block text-[#57534E] dark:text-[#A8A29E] mb-1 font-medium">Aspek Rasio</label>
          <select
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value as any)}
            className="w-full px-2.5 py-1.5 border border-[#EAE5DC] dark:border-[#272A33] rounded-lg bg-transparent"
          >
            <option value="auto">Auto (Proporsional)</option>
            <option value="16/9">16:9 (Landscape / YouTube)</option>
            <option value="1/1">1:1 (Persegi / Instagram)</option>
            <option value="4/5">4:5 (Portrait / Feed)</option>
          </select>
        </div>

        <div>
          <label className="text-sm block text-[#57534E] dark:text-[#A8A29E] mb-1 font-medium">
            3D Tilt Perspektif: {tilt}&deg;
          </label>
          <input
            type="range"
            min="-15"
            max="15"
            value={tilt}
            onChange={(e) => setTilt(parseInt(e.target.value))}
            className="w-full accent-[#E14D2A]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
        <div>
          <label className="text-sm block text-[#57534E] dark:text-[#A8A29E] mb-1 font-medium">
            Padding Kanvas: {padding}px
          </label>
          <input
            type="range"
            min="16"
            max="80"
            value={padding}
            onChange={(e) => setPadding(parseInt(e.target.value))}
            className="w-full accent-[#E14D2A]"
          />
        </div>

        <div>
          <label className="text-sm block text-[#57534E] dark:text-[#A8A29E] mb-1 font-medium">
            Radius Sudut: {rounded}px
          </label>
          <input
            type="range"
            min="0"
            max="32"
            value={rounded}
            onChange={(e) => setRounded(parseInt(e.target.value))}
            className="w-full accent-[#E14D2A]"
          />
        </div>

        <div className="flex items-center gap-4 pt-3">
          <label className="text-sm flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={shadow}
              onChange={(e) => setShadow(e.target.checked)}
              className="rounded accent-[#E14D2A]"
            />
            <span className="font-medium text-[#1C1917] dark:text-[#F5F4F0]">Bayangan Diffuse 3D</span>
          </label>
        </div>
      </div>

      {/* Preview Box */}
      <div className="flex flex-col items-center justify-center pt-2">
        {!imageSrc ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-16 border-2 border-dashed border-[#EAE5DC] dark:border-[#272A33] rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[#E14D2A] transition-colors bg-[#FAF8F5] dark:bg-[#121316]"
          >
            <span className="text-sm font-bold text-[#1C1917] dark:text-[#F5F4F0]">
              Unggah File Screenshot (PNG, JPG, WEBP)
            </span>
            <span className="text-xs text-[#78716C] mt-1">atau klik untuk memilih file</span>
          </div>
        ) : (
          <div
            ref={previewRef}
            className="w-full max-w-3xl rounded-2xl overflow-hidden flex items-center justify-center transition-all p-8"
            style={{
              background: backgroundStyles[bgType],
              padding: `${padding}px`,
              aspectRatio: aspectRatio === 'auto' ? undefined : aspectRatio,
            }}
          >
            <div
              className="transition-all overflow-hidden bg-white dark:bg-black/90 w-full"
              style={{
                borderRadius: `${rounded}px`,
                boxShadow: shadow ? '0 25px 50px -12px rgba(0,0,0,0.25)' : 'none',
                transform: tilt !== 0 ? `perspective(1000px) rotateY(${tilt}deg) rotateX(${tilt > 0 ? 4 : -4}deg)` : 'none',
              }}
            >
              {/* Window Chrome Header */}
              {windowChrome === 'macos' && (
                <div className="px-4 py-2.5 bg-[#18191E] flex items-center gap-2 border-b border-black/20">
                  <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
                  <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                  <span className="w-3 h-3 rounded-full bg-[#10B981]" />
                  <span className="text-[10px] font-mono-code text-slate-400 ml-2 truncate">preview.app</span>
                </div>
              )}
              {windowChrome === 'windows' && (
                <div className="px-4 py-2 bg-[#202124] flex items-center justify-end gap-3.5 border-b border-black/20 text-slate-400">
                  <Minus className="w-3 h-3" />
                  <Square className="w-3 h-3" />
                  <X className="w-3 h-3" />
                </div>
              )}
              <img
                src={imageSrc}
                alt="Preview"
                className="max-w-full max-h-[500px] object-contain w-full"
              />
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        {imageSrc && (
          <button
            type="button"
            onClick={() => setImageSrc('')}
            className="mt-3 text-xs text-rose-600 hover:underline cursor-pointer font-medium"
          >
            Ganti / Hapus Gambar
          </button>
        )}
      </div>
    </div>
  )
}

const PALETTE_PRESETS = [
  {
    name: 'Warm Editorial (Swiss)',
    tag: 'Editorial',
    colors: ['#F7F5F0', '#18181A', '#E63946', '#1D3557', '#DDA15E'],
  },
  {
    name: 'Matcha & Hinoki',
    tag: 'Earthy',
    colors: ['#FAF9F6', '#283618', '#606C38', '#BC6C25', '#DDA15E'],
  },
  {
    name: 'Dark Obsidian & Cyan',
    tag: 'Cyber Tech',
    colors: ['#0B0C10', '#14161D', '#00F0FF', '#6366F1', '#EDEDED'],
  },
  {
    name: 'Luxe Atelier & Gold',
    tag: 'Luxury',
    colors: ['#FDFCF7', '#F5F2EB', '#1E1B18', '#C5A880', '#7D8471'],
  },
  {
    name: 'Nordic Slate & Amber',
    tag: 'Clean Minimal',
    colors: ['#F1F4F8', '#334E68', '#627D98', '#D97706', '#BCCCDC'],
  },
  {
    name: 'Tokyo Night Neon',
    tag: 'Vibrant Dark',
    colors: ['#0D0E15', '#1A1B26', '#F7768E', '#7AA2F7', '#BB9AF7'],
  },
  {
    name: 'Terracotta & Sage',
    tag: 'Natural',
    colors: ['#FBF6EE', '#2D1E18', '#E07A5F', '#3D405B', '#81B29A'],
  },
]

function hslToHex(h: number, s: number, l: number): string {
  l /= 100
  const a = (s * Math.min(l, 1 - l)) / 100
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase()
}

function generateHarmonicPalette(mode: 'editorial' | 'complementary' | 'analogous' | 'monochrome'): string[] {
  const baseHue = Math.floor(Math.random() * 360)
  if (mode === 'editorial') {
    const isDark = Math.random() > 0.5
    if (isDark) {
      return [
        '#0E0F12',
        '#1A1C22',
        '#EDEDED',
        hslToHex(baseHue, 80, 60),
        hslToHex((baseHue + 40) % 360, 60, 45),
      ]
    } else {
      return [
        '#F7F5F0',
        '#ECE8DF',
        '#18181A',
        hslToHex(baseHue, 75, 45),
        hslToHex((baseHue + 30) % 360, 50, 55),
      ]
    }
  } else if (mode === 'monochrome') {
    return [
      hslToHex(baseHue, 20, 96),
      hslToHex(baseHue, 25, 80),
      hslToHex(baseHue, 35, 55),
      hslToHex(baseHue, 50, 35),
      hslToHex(baseHue, 60, 15),
    ]
  } else if (mode === 'complementary') {
    const comp = (baseHue + 180) % 360
    return [
      hslToHex(baseHue, 15, 95),
      hslToHex(baseHue, 30, 20),
      hslToHex(baseHue, 70, 50),
      hslToHex(comp, 75, 50),
      hslToHex(comp, 35, 75),
    ]
  } else {
    return [
      hslToHex(baseHue, 15, 96),
      hslToHex(baseHue, 25, 18),
      hslToHex(baseHue, 65, 48),
      hslToHex((baseHue + 30) % 360, 70, 50),
      hslToHex((baseHue + 60) % 360, 60, 55),
    ]
  }
}

function ColorPaletteGenerator() {
  const [colors, setColors] = useState<string[]>([
    '#F7F5F0',
    '#18181A',
    '#E63946',
    '#1D3557',
    '#DDA15E',
  ])
  const [locked, setLocked] = useState<boolean[]>([false, false, false, false, false])
  const [copiedHex, setCopiedHex] = useState<string | null>(null)
  const [harmonyMode, setHarmonyMode] = useState<'editorial' | 'complementary' | 'analogous' | 'monochrome'>('editorial')
  const [copyCodeSuccess, setCopyCodeSuccess] = useState<string | null>(null)

  const swatchRoles = ['Canvas / BG', 'Surface / Card', 'Primary Ink', 'Main Accent', 'Sub Accent']

  const generateNewPalette = () => {
    const nextHarmonic = generateHarmonicPalette(harmonyMode)
    setColors(colors.map((c, i) => (locked[i] ? c : nextHarmonic[i] || c)))
  }

  const toggleLock = (index: number) => {
    const nextLocked = [...locked]
    nextLocked[index] = !nextLocked[index]
    setLocked(nextLocked)
  }

  const updateColor = (index: number, newColor: string) => {
    const nextColors = [...colors]
    nextColors[index] = newColor.toUpperCase()
    setColors(nextColors)
  }

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex)
    setCopiedHex(hex)
    setTimeout(() => setCopiedHex(null), 1500)
  }

  const copyCssVars = () => {
    const css = `:root {\n  --canvas: ${colors[0]};\n  --surface: ${colors[1]};\n  --ink: ${colors[2]};\n  --accent: ${colors[3]};\n  --sub-accent: ${colors[4]};\n}`
    navigator.clipboard.writeText(css)
    setCopyCodeSuccess('css')
    setTimeout(() => setCopyCodeSuccess(null), 1500)
  }

  const copyTailwind = () => {
    const tw = `colors: {\n  canvas: '${colors[0]}',\n  surface: '${colors[1]}',\n  ink: '${colors[2]}',\n  accent: '${colors[3]}',\n  subAccent: '${colors[4]}',\n}`
    navigator.clipboard.writeText(tw)
    setCopyCodeSuccess('tw')
    setTimeout(() => setCopyCodeSuccess(null), 1500)
  }

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(colors, null, 2))
    setCopyCodeSuccess('json')
    setTimeout(() => setCopyCodeSuccess(null), 1500)
  }

  return (
    <div className="border border-[#EAEAEA] dark:border-[#232326] bg-white dark:bg-[#141415] rounded-xl p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#EAEAEA] dark:border-[#232326] gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[#111111] dark:text-[#EDEDED]">
            Generator Palet Warna Harmonis & Preset Desain
          </h3>
          <p className="text-xs text-[#8F8E8A] dark:text-[#6E6D6A]">
            Koleksi skema warna kurasi Awwwards dengan pratinjau antarmuka nyata.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={harmonyMode}
            onChange={(e) => setHarmonyMode(e.target.value as typeof harmonyMode)}
            className="px-2.5 py-1.5 text-xs border border-[#EAEAEA] dark:border-[#232326] rounded-md bg-transparent"
          >
            <option value="editorial">Editorial Modern</option>
            <option value="complementary">Komplementer</option>
            <option value="analogous">Harmoni Analogous</option>
            <option value="monochrome">Monokrom Gradasi</option>
          </select>

          <button
            type="button"
            onClick={generateNewPalette}
            className="px-4 py-1.5 text-xs font-semibold bg-[#111111] text-white dark:bg-white dark:text-[#111111] rounded-md hover:opacity-90 active:scale-[0.98] cursor-pointer"
          >
            Acak Harmoni
          </button>
        </div>
      </div>

      {/* Curated Presets Bar */}
      <div className="space-y-1.5">
        <span className="text-xs font-mono-code uppercase text-[#8F8E8A]">
          Pilihan Preset Terkurasi:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {PALETTE_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => {
                setColors(preset.colors)
                setLocked([false, false, false, false, false])
              }}
              className="px-2.5 py-1 text-xs border border-[#EAEAEA] dark:border-[#232326] rounded-md hover:bg-[#F4F4F3] dark:hover:bg-[#1C1C1F] text-[#111111] dark:text-[#EDEDED] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <div className="flex -space-x-1">
                {preset.colors.slice(0, 3).map((c, i) => (
                  <span
                    key={i}
                    className="w-2.5 h-2.5 rounded-full border border-white dark:border-black"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main 5 Color Swatches */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {colors.map((color, index) => {
          const isLocked = locked[index]
          return (
            <div
              key={index}
              className="flex flex-col rounded-xl overflow-hidden border border-[#EAEAEA] dark:border-[#232326] bg-white dark:bg-[#0C0C0D] shadow-xs group"
            >
              {/* Swatch Canvas Area */}
              <div
                className="h-32 w-full relative transition-all flex flex-col justify-between p-2.5"
                style={{ backgroundColor: color }}
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono-code font-bold px-1.5 py-0.5 rounded bg-black/40 text-white backdrop-blur-xs">
                    {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleLock(index)}
                    title={isLocked ? 'Warna Terkunci (Tetap saat diacak)' : 'Kunci Warna'}
                    className={`p-1.5 rounded transition-colors cursor-pointer flex items-center justify-center ${
                      isLocked
                        ? 'bg-[#111111] text-white shadow-xs'
                        : 'bg-black/30 text-white/80 hover:bg-black/50'
                    }`}
                  >
                    {isLocked ? <Lock className="w-3 h-3 text-white" /> : <Unlock className="w-3 h-3 text-white/80" />}
                  </button>
                </div>

                <div className="flex justify-end">
                  <label className="text-sm cursor-pointer">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => updateColor(index, e.target.value)}
                      className="opacity-0 w-0 h-0 absolute"
                    />
                    <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-black/40 text-white backdrop-blur-xs hover:bg-black/60 transition-colors flex items-center gap-1">
                      <Edit2 className="w-2.5 h-2.5" />
                      <span>Ubah</span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Swatch Info Box */}
              <div className="p-3 space-y-1.5">
                <div className="flex items-center justify-between font-mono-code text-xs">
                  <span className="font-bold text-[#111111] dark:text-[#EDEDED]">{color}</span>
                  <button
                    type="button"
                    onClick={() => copyHex(color)}
                    className="text-xs text-[#6F6E6B] dark:text-[#9B9A97] hover:text-[#111111] dark:hover:text-white underline cursor-pointer"
                  >
                    {copiedHex === color ? 'Tersalin' : 'Salin'}
                  </button>
                </div>
                <div className="text-[10px] font-mono-code text-[#8F8E8A] truncate">
                  {swatchRoles[index]}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Live UI Mockup Preview */}
      <div className="pt-2 space-y-2">
        <span className="text-xs font-mono-code uppercase text-[#8F8E8A]">
          Pratinjau Antarmuka Nyata (Live UI Widget):
        </span>
        <div
          className="p-6 sm:p-8 rounded-xl border border-[#EAEAEA] dark:border-[#232326] transition-all flex flex-col md:flex-row items-center justify-between gap-6"
          style={{ backgroundColor: colors[0], color: colors[2] }}
        >
          {/* Card Mockup */}
          <div
            className="p-5 rounded-lg border shadow-sm max-w-sm w-full space-y-3 transition-all"
            style={{ backgroundColor: colors[1], borderColor: colors[4] }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-[10px] font-mono-code uppercase px-2 py-0.5 rounded font-bold"
                style={{ backgroundColor: colors[4], color: colors[1] }}
              >
                PRODUK UNGGULAN
              </span>
              <span className="text-xs font-mono-code opacity-70">Rp 450.000</span>
            </div>

            <h4 className="text-base font-semibold leading-snug" style={{ color: colors[2] }}>
              Desain Arsitektur Modern
            </h4>

            <p className="text-xs opacity-80 leading-relaxed" style={{ color: colors[2] }}>
              Palet warna ini diaplikasikan langsung pada kanvas, kartu, tipografi, dan tombol CTA.
            </p>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                className="px-3.5 py-1.5 text-xs font-semibold rounded transition-opacity"
                style={{ backgroundColor: colors[3], color: colors[0] }}
              >
                Beli Sekarang
              </button>
              <button
                type="button"
                className="px-3 py-1.5 text-xs font-medium rounded border"
                style={{ borderColor: colors[4], color: colors[2] }}
              >
                Detail
              </button>
            </div>
          </div>

          {/* Quick Metrics / Palette Harmony Info */}
          <div className="space-y-2 max-w-xs text-xs">
            <div className="font-semibold" style={{ color: colors[2] }}>
              Keseimbangan Kontras & Harmoni
            </div>
            <p className="text-xs opacity-80 leading-relaxed">
              Warna 1 ({colors[0]}) berfungsi sebagai latar belakang rileks, sedangkan Warna 4 ({colors[3]}) berfungsi sebagai aksen pemancing perhatian mata.
            </p>
            <div className="pt-1 flex gap-1.5">
              {colors.map((c, i) => (
                <span
                  key={i}
                  className="w-5 h-5 rounded-md border border-black/10 shadow-xs"
                  style={{ backgroundColor: c }}
                  title={`${swatchRoles[i]}: ${c}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Developer Export Hub */}
      <div className="pt-3 border-t border-[#EAEAEA] dark:border-[#232326] flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="text-[#8F8E8A] font-mono-code">Ekspor untuk Developer:</span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyCssVars}
            className="px-3 py-1.5 border border-[#EAEAEA] dark:border-[#232326] rounded-md hover:bg-[#F4F4F3] dark:hover:bg-[#1C1C1F] cursor-pointer font-mono-code flex items-center gap-1"
          >
            {copyCodeSuccess === 'css' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : null}
            <span>{copyCodeSuccess === 'css' ? 'Tersalin CSS Vars' : 'Salin CSS Variables'}</span>
          </button>

          <button
            type="button"
            onClick={copyTailwind}
            className="px-3 py-1.5 border border-[#EAEAEA] dark:border-[#232326] rounded-md hover:bg-[#F4F4F3] dark:hover:bg-[#1C1C1F] cursor-pointer font-mono-code flex items-center gap-1"
          >
            {copyCodeSuccess === 'tw' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : null}
            <span>{copyCodeSuccess === 'tw' ? 'Tersalin Tailwind' : 'Salin Tailwind Config'}</span>
          </button>

          <button
            type="button"
            onClick={copyJson}
            className="px-3 py-1.5 border border-[#EAEAEA] dark:border-[#232326] rounded-md hover:bg-[#F4F4F3] dark:hover:bg-[#1C1C1F] cursor-pointer font-mono-code flex items-center gap-1"
          >
            {copyCodeSuccess === 'json' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : null}
            <span>{copyCodeSuccess === 'json' ? 'Tersalin JSON' : 'Salin Array HEX'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function GradientMaker() {
  const [color1, setColor1] = useState<string>('#E14D2A')
  const [color2, setColor2] = useState<string>('#D4A373')
  const [angle, setAngle] = useState<number>(90)
  const [type, setType] = useState<'linear' | 'radial'>('linear')
  const [copied, setCopied] = useState<boolean>(false)
  const [copiedTw, setCopiedTw] = useState<boolean>(false)
  const [withNoise, setWithNoise] = useState<boolean>(false)

  const gradientCode =
    type === 'linear'
      ? `linear-gradient(${angle}deg, ${color1}, ${color2})`
      : `radial-gradient(circle, ${color1}, ${color2})`

  const copyCode = () => {
    navigator.clipboard.writeText(`background: ${gradientCode};`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const copyTailwind = () => {
    const tw = `bg-gradient-to-r from-[${color1}] to-[${color2}]`
    navigator.clipboard.writeText(tw)
    setCopiedTw(true)
    setTimeout(() => setCopiedTw(false), 1500)
  }

  return (
    <div className="border border-[#EAE5DC] dark:border-[#272A33] bg-white dark:bg-[#1A1B20] rounded-2xl p-4 sm:p-6 shadow-xs space-y-6">
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#EAE5DC] dark:border-[#272A33] gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#1C1917] dark:text-[#F5F4F0]">
            Pembuat Gradien CSS & Tailwind
          </h3>
          <p className="text-xs text-[#78716C]">
            Visual builder gradien dengan simulasi tekstur grain & salin kode instan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyTailwind}
            className="px-3 py-1.5 text-xs font-semibold border border-[#EAE5DC] dark:border-[#272A33] rounded-lg hover:bg-[#F3EFEA] dark:hover:bg-[#22242B] cursor-pointer flex items-center gap-1.5"
          >
            {copiedTw ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : null}
            <span>{copiedTw ? 'Tersalin Tailwind' : 'Salin Kelas Tailwind'}</span>
          </button>
          <button
            type="button"
            onClick={copyCode}
            className="px-4 py-1.5 text-xs font-semibold bg-[#E14D2A] text-white hover:bg-[#C83B1B] rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-white" /> : null}
            <span>{copied ? 'Tersalin CSS' : 'Salin Kode CSS'}</span>
          </button>
        </div>
      </div>

      <div
        className="h-48 w-full rounded-2xl border border-black/10 shadow-inner transition-all relative overflow-hidden"
        style={{ background: gradientCode }}
      >
        {withNoise && (
          <div
            className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
            style={{
              backgroundImage: `radial-gradient(rgba(0,0,0,0.5) 1px, transparent 0)`,
              backgroundSize: '4px 4px',
            }}
          />
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <label className="text-sm block text-[#57534E] dark:text-[#A8A29E] mb-1 font-medium">Tipe Gradien</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'linear' | 'radial')}
            className="w-full px-2.5 py-1.5 border border-[#EAE5DC] dark:border-[#272A33] rounded-lg bg-transparent"
          >
            <option value="linear">Linear</option>
            <option value="radial">Radial</option>
          </select>
        </div>

        <div>
          <label className="text-sm block text-[#57534E] dark:text-[#A8A29E] mb-1 font-medium">
            Sudut: {angle}&deg;
          </label>
          <input
            type="range"
            min="0"
            max="360"
            disabled={type === 'radial'}
            value={angle}
            onChange={(e) => setAngle(parseInt(e.target.value))}
            className="w-full accent-[#E14D2A] disabled:opacity-30"
          />
        </div>

        <div>
          <label className="text-sm block text-[#57534E] dark:text-[#A8A29E] mb-1 font-medium">Warna Awal</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color1}
              onChange={(e) => setColor1(e.target.value)}
              className="w-8 h-8 rounded border border-[#EAE5DC] dark:border-[#272A33] cursor-pointer p-0 bg-transparent"
            />
            <span className="font-mono-code text-xs uppercase">{color1}</span>
          </div>
        </div>

        <div>
          <label className="text-sm block text-[#57534E] dark:text-[#A8A29E] mb-1 font-medium">Warna Akhir</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color2}
              onChange={(e) => setColor2(e.target.value)}
              className="w-8 h-8 rounded border border-[#EAE5DC] dark:border-[#272A33] cursor-pointer p-0 bg-transparent"
            />
            <span className="font-mono-code text-xs uppercase">{color2}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1 text-xs">
        <label className="text-sm flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={withNoise}
            onChange={(e) => setWithNoise(e.target.checked)}
            className="rounded accent-[#E14D2A]"
          />
          <span className="text-[#1C1917] dark:text-[#F5F4F0] font-medium">
            Simulasikan Tekstur Noise Grain (Editorial Aesthetic)
          </span>
        </label>
      </div>
    </div>
  )
}

function ImageCompressor() {
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [originalUrl, setOriginalUrl] = useState<string>('')
  const [quality, setQuality] = useState<number>(80)
  const [targetFormat, setTargetFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg')
  const [scalePct, setScalePct] = useState<number>(100)
  const [compressedUrl, setCompressedUrl] = useState<string>('')
  const [originalSize, setOriginalSize] = useState<number>(0)
  const [compressedSize, setCompressedSize] = useState<number>(0)
  const [compareView, setCompareView] = useState<'compressed' | 'original' | 'split'>('compressed')
  const [dimensions, setDimensions] = useState<{ origW: number; origH: number; newW: number; newH: number }>({
    origW: 0,
    origH: 0,
    newW: 0,
    newH: 0,
  })

  const compress = (file: File, qual: number, fmt: typeof targetFormat, scale: number) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const src = event.target?.result as string
      setOriginalUrl(src)
      const img = new Image()
      img.src = src
      img.onload = () => {
        const newW = Math.max(1, Math.round((img.width * scale) / 100))
        const newH = Math.max(1, Math.round((img.height * scale) / 100))
        setDimensions({ origW: img.width, origH: img.height, newW, newH })

        const canvas = document.createElement('canvas')
        canvas.width = newW
        canvas.height = newH
        const ctx = canvas.getContext('2d')
        if (ctx) {
          if (fmt === 'image/jpeg') {
            ctx.fillStyle = '#FFFFFF'
            ctx.fillRect(0, 0, newW, newH)
          }
          ctx.drawImage(img, 0, 0, newW, newH)
        }

        canvas.toBlob(
          (blob) => {
            if (blob) {
              setCompressedSize(blob.size)
              setCompressedUrl(URL.createObjectURL(blob))
            }
          },
          fmt,
          qual / 100
        )
      }
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setOriginalFile(file)
    setOriginalSize(file.size)
    compress(file, quality, targetFormat, scalePct)
  }

  const handleQualityChange = (newQual: number) => {
    setQuality(newQual)
    if (originalFile) compress(originalFile, newQual, targetFormat, scalePct)
  }

  const handleFormatChange = (newFmt: typeof targetFormat) => {
    setTargetFormat(newFmt)
    if (originalFile) compress(originalFile, quality, newFmt, scalePct)
  }

  const handleScaleChange = (newScale: number) => {
    setScalePct(newScale)
    if (originalFile) compress(originalFile, quality, targetFormat, newScale)
  }

  const getExtension = () => {
    if (targetFormat === 'image/png') return 'png'
    if (targetFormat === 'image/webp') return 'webp'
    return 'jpg'
  }

  const savingsPct =
    originalSize > 0 ? Math.round(((originalSize - compressedSize) / originalSize) * 100) : 0

  return (
    <div className="border border-[#EAE5DC] dark:border-[#272A33] bg-white dark:bg-[#1A1B20] rounded-2xl p-4 sm:p-6 shadow-xs space-y-6">
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#EAE5DC] dark:border-[#272A33] gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#1C1917] dark:text-[#F5F4F0]">
            Kompresi & Konversi Gambar (Visual Compare)
          </h3>
          <p className="text-xs text-[#78716C]">
            Ubah format (PNG, JPG, WEBP) dan kecilkan ukuran dengan perbandingan visual langsung.
          </p>
        </div>
        {compressedUrl && (
          <a
            href={compressedUrl}
            download={`image-compressed.${getExtension()}`}
            className="px-4 py-2 text-xs font-bold bg-[#E14D2A] text-white hover:bg-[#C83B1B] rounded-xl shadow-sm shadow-[#E14D2A]/20 inline-block"
          >
            Unduh Hasil (.{getExtension().toUpperCase()})
          </a>
        )}
      </div>

      {!originalFile ? (
        <label className="text-sm border-2 border-dashed border-[#EAE5DC] dark:border-[#272A33] rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center cursor-pointer hover:border-[#E14D2A] transition-colors bg-[#FAF8F5] dark:bg-[#121316]">
          <span className="text-sm font-bold text-[#1C1917] dark:text-[#F5F4F0]">
            Pilih Berkas Gambar
          </span>
          <span className="text-xs text-[#78716C] mt-1">Mendukung PNG, JPG, JPEG, WEBP, AVIF</span>
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </label>
      ) : (
        <div className="space-y-6">
          {/* Controls Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Format Target */}
            <div>
              <label className="text-sm block text-[#57534E] dark:text-[#A8A29E] mb-1.5 font-medium">
                Format Ekstensi Tujuan
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'image/jpeg', label: 'JPG / JPEG' },
                  { id: 'image/png', label: 'PNG' },
                  { id: 'image/webp', label: 'WEBP' },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => handleFormatChange(fmt.id as typeof targetFormat)}
                    className={`px-3 py-1.5 rounded-lg font-mono-code transition-all cursor-pointer ${
                      targetFormat === fmt.id
                        ? 'bg-[#E14D2A] text-white font-bold shadow-xs'
                        : 'border border-[#EAE5DC] dark:border-[#272A33] text-[#57534E] dark:text-[#A8A29E]'
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scale Percent */}
            <div>
              <label className="text-sm block text-[#57534E] dark:text-[#A8A29E] mb-1.5 font-medium">
                Skala Resolusi ({dimensions.newW} × {dimensions.newH} px)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[100, 75, 50, 25].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handleScaleChange(pct)}
                    className={`px-3 py-1.5 rounded-lg font-mono-code transition-all cursor-pointer ${
                      scalePct === pct
                        ? 'bg-[#E14D2A] text-white font-bold shadow-xs'
                        : 'border border-[#EAE5DC] dark:border-[#272A33] text-[#57534E] dark:text-[#A8A29E]'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quality Slider (for JPEG / WEBP) */}
          {targetFormat !== 'image/png' && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-[#1C1917] dark:text-[#F5F4F0] font-medium">
                <span>Tingkat Kualitas Kompresi</span>
                <span className="font-mono-code font-bold text-[#E14D2A]">{quality}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="95"
                value={quality}
                onChange={(e) => handleQualityChange(parseInt(e.target.value))}
                className="w-full accent-[#E14D2A]"
              />
            </div>
          )}

          {/* Interactive Before & After Visual Preview */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-bold text-[#1C1917] dark:text-[#F5F4F0]">
                Perbandingan Visual:
              </span>
              <div className="flex gap-1">
                {(['compressed', 'original', 'split'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setCompareView(mode)}
                    className={`px-2.5 py-1 rounded-md text-xs font-mono-code transition-colors cursor-pointer ${
                      compareView === mode
                        ? 'bg-[#E14D2A] text-white font-bold'
                        : 'text-[#78716C] hover:text-[#1C1917]'
                    }`}
                  >
                    {mode === 'compressed' ? 'Hasil Kompres' : mode === 'original' ? 'File Asli' : 'Bandingan 50/50'}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative max-h-72 overflow-hidden rounded-xl border border-black/10 bg-black/5 flex items-center justify-center p-2">
              {compareView === 'original' ? (
                <img src={originalUrl} alt="Original" className="max-h-64 object-contain" />
              ) : compareView === 'split' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-h-64">
                  <div className="relative text-center">
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-mono-code">ASLI</span>
                    <img src={originalUrl} alt="Original" className="max-h-56 mx-auto object-contain rounded" />
                  </div>
                  <div className="relative text-center">
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#E14D2A] text-white text-[10px] font-mono-code">KOMPRES</span>
                    <img src={compressedUrl} alt="Compressed" className="max-h-56 mx-auto object-contain rounded" />
                  </div>
                </div>
              ) : (
                <img src={compressedUrl} alt="Compressed" className="max-h-64 object-contain" />
              )}
            </div>
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono-code pt-1">
            <div className="p-4 bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] rounded-2xl">
              <span className="text-[#78716C]">Ukuran Awal:</span>
              <div className="text-lg font-bold text-[#1C1917] dark:text-[#F5F4F0] mt-0.5">
                {(originalSize / 1024).toFixed(1)} KB
              </div>
              <div className="text-xs text-[#78716C] mt-0.5">
                {dimensions.origW} × {dimensions.origH} px
              </div>
            </div>

            <div className="p-4 bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] rounded-2xl">
              <span className="text-[#78716C]">Hasil Kompresi & Konversi:</span>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {(compressedSize / 1024).toFixed(1)} KB (
                {savingsPct > 0 ? `${savingsPct}% lebih hemat` : 'Optimal'})
              </div>
              <div className="text-xs text-[#78716C] mt-0.5">
                Format .{getExtension().toUpperCase()} ({dimensions.newW} × {dimensions.newH} px)
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setOriginalFile(null)
              setCompressedUrl('')
              setOriginalUrl('')
            }}
            className="text-xs text-rose-600 hover:underline cursor-pointer font-medium"
          >
            Ganti File Gambar Lain
          </button>
        </div>
      )}
    </div>
  )
}

function ImageResizer() {
  const [imageSrc, setImageSrc] = useState<string>('')
  const [origWidth, setOrigWidth] = useState<number>(0)
  const [origHeight, setOrigHeight] = useState<number>(0)
  const [targetWidth, setTargetWidth] = useState<number>(800)
  const [targetHeight, setTargetHeight] = useState<number>(600)
  const [lockRatio, setLockRatio] = useState<boolean>(true)
  const [resizedUrl, setResizedUrl] = useState<string>('')

  const presets = [
    { label: 'Instagram Post', w: 1080, h: 1080 },
    { label: 'Story / Reel / TikTok', w: 1080, h: 1920 },
    { label: 'YouTube Thumbnail', w: 1280, h: 720 },
    { label: 'Social Banner', w: 1200, h: 630 },
  ]

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const src = reader.result as string
      setImageSrc(src)
      const img = new Image()
      img.src = src
      img.onload = () => {
        setOrigWidth(img.width)
        setOrigHeight(img.height)
        setTargetWidth(img.width)
        setTargetHeight(img.height)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleWidthChange = (val: number) => {
    setTargetWidth(val)
    if (lockRatio && origWidth > 0) {
      setTargetHeight(Math.round((val / origWidth) * origHeight))
    }
  }

  const handleHeightChange = (val: number) => {
    setTargetHeight(val)
    if (lockRatio && origHeight > 0) {
      setTargetWidth(Math.round((val / origHeight) * origWidth))
    }
  }

  const applyPreset = (w: number, h: number) => {
    setLockRatio(false)
    setTargetWidth(w)
    setTargetHeight(h)
  }

  const handleResize = () => {
    if (!imageSrc) return
    const img = new Image()
    img.src = imageSrc
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = targetWidth
      canvas.height = targetHeight
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(img, 0, 0, targetWidth, targetHeight)
      setResizedUrl(canvas.toDataURL('image/png'))
    }
  }

  return (
    <div className="border border-[#EAE5DC] dark:border-[#272A33] bg-white dark:bg-[#1A1B20] rounded-2xl p-4 sm:p-6 shadow-xs space-y-6">
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#EAE5DC] dark:border-[#272A33] gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#1C1917] dark:text-[#F5F4F0]">
            Ubah Ukuran Gambar (Preset Media Sosial)
          </h3>
          <p className="text-xs text-[#78716C]">
            Ubah dimensi piksel kustom atau gunakan preset standar Instagram, TikTok, YouTube & Banner.
          </p>
        </div>
        {resizedUrl && (
          <a
            href={resizedUrl}
            download="resized-image.png"
            className="px-4 py-2 text-xs font-bold bg-[#E14D2A] text-white hover:bg-[#C83B1B] rounded-xl shadow-sm shadow-[#E14D2A]/20 inline-block"
          >
            Unduh Hasil PNG
          </a>
        )}
      </div>

      {!imageSrc ? (
        <label className="text-sm border-2 border-dashed border-[#EAE5DC] dark:border-[#272A33] rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center cursor-pointer hover:border-[#E14D2A] transition-colors bg-[#FAF8F5] dark:bg-[#121316]">
          <span className="text-sm font-bold text-[#1C1917] dark:text-[#F5F4F0]">
            Pilih Gambar untuk Diubah Ukurannya
          </span>
          <span className="text-xs text-[#78716C] mt-1">Mendukung JPEG, PNG, WEBP</span>
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </label>
      ) : (
        <div className="space-y-5">
          {/* Preset Buttons */}
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-[#78716C]">Preset Ukuran Populer:</span>
            <div className="flex flex-wrap gap-2 text-xs">
              {presets.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p.w, p.h)}
                  className="px-3 py-1.5 rounded-lg border border-[#EAE5DC] dark:border-[#272A33] hover:bg-[#F3EFEA] dark:hover:bg-[#22242B] cursor-pointer font-medium"
                >
                  {p.label} ({p.w}×{p.h})
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
            <div>
              <label className="text-sm block text-[#57534E] dark:text-[#A8A29E] mb-1 font-medium">
                Lebar Baru (px)
              </label>
              <input
                type="number"
                value={targetWidth}
                onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-[#EAE5DC] dark:border-[#272A33] rounded-lg bg-transparent font-mono-code"
              />
            </div>

            <div>
              <label className="text-sm block text-[#57534E] dark:text-[#A8A29E] mb-1 font-medium">
                Tinggi Baru (px)
              </label>
              <input
                type="number"
                value={targetHeight}
                onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-[#EAE5DC] dark:border-[#272A33] rounded-lg bg-transparent font-mono-code"
              />
            </div>

            <div className="flex items-end pb-2">
              <label className="text-sm flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lockRatio}
                  onChange={(e) => setLockRatio(e.target.checked)}
                  className="rounded accent-[#E14D2A]"
                />
                <span className="text-[#1C1917] dark:text-[#F5F4F0] font-medium">Kunci Rasio Aspek</span>
              </label>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono-code text-[#78716C]">
            <span>Ukuran Asli: {origWidth} × {origHeight} px</span>
            <span>Target: {targetWidth} × {targetHeight} px</span>
          </div>

          <button
            type="button"
            onClick={handleResize}
            className="px-5 py-2.5 text-xs font-bold bg-[#E14D2A] text-white hover:bg-[#C83B1B] rounded-xl shadow-sm shadow-[#E14D2A]/20 transition-all cursor-pointer"
          >
            Proses Ubah Ukuran & Pratinjau
          </button>
        </div>
      )}
    </div>
  )
}
