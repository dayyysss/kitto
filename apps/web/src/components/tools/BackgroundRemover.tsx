import { useCallback, useEffect, useRef, useState } from 'react'
import { Download, ImageOff, Maximize2, Paintbrush, RotateCcw, Sparkles, Upload, Wand2, ZoomIn, ZoomOut } from 'lucide-react'

const checker =
  'linear-gradient(45deg, #e7e5e4 25%, transparent 25%, transparent 75%, #e7e5e4 75%), linear-gradient(45deg, #e7e5e4 25%, transparent 25%, transparent 75%, #e7e5e4 75%)'

const COLOR_PRESETS = ['#ffffff', '#f5f5f4', '#fecaca', '#fed7aa', '#fef08a', '#bbf7d0', '#bfdbfe', '#e9d5ff', '#1c1917']

const MAGIC_BACKGROUNDS = [
  { name: 'Sunset', from: '#f97316', to: '#db2777' },
  { name: 'Ocean', from: '#0ea5e9', to: '#4f46e5' },
  { name: 'Mint', from: '#34d399', to: '#0d9488' },
  { name: 'Peach', from: '#fda4af', to: '#fdba74' },
  { name: 'Grape', from: '#a78bfa', to: '#6366f1' },
  { name: 'Studio', from: '#e5e7eb', to: '#9ca3af' },
  { name: 'Midnight', from: '#1e293b', to: '#0f172a' },
]

type Mode = 'erase' | 'restore' | 'magic'
type BackgroundType = 'transparent' | 'color' | 'photo' | 'magic'
type Effect = 'none' | 'blur' | 'shadow' | 'glow'

export function BackgroundRemover() {
  const [file, setFile] = useState<File | null>(null)
  const [originalUrl, setOriginalUrl] = useState('')
  const [bgPhotoUrl, setBgPhotoUrl] = useState('')
  const [hasCutout, setHasCutout] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  const [mode, setMode] = useState<Mode>('erase')
  const [brushSize, setBrushSize] = useState(60)
  const [tolerance, setTolerance] = useState(45)
  const [bgType, setBgType] = useState<BackgroundType>('transparent')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [magicIndex, setMagicIndex] = useState(0)
  const [effect, setEffect] = useState<Effect>('none')
  const [zoom, setZoom] = useState(1)

  const previewRef = useRef<HTMLCanvasElement>(null)
  const outerRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const workRef = useRef<HTMLCanvasElement | null>(null)
  const originalRef = useRef<HTMLCanvasElement | null>(null)
  const bgImageRef = useRef<HTMLImageElement | null>(null)
  const drawingRef = useRef(false)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)
  const urls = useRef<string[]>([])

  useEffect(() => {
    return () => {
      urls.current.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  const track = (url: string) => {
    urls.current.push(url)
    return url
  }

  const render = useCallback(() => {
    const canvas = previewRef.current
    const work = workRef.current
    if (!canvas || !work) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = work.width
    const height = work.height
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
    }

    ctx.clearRect(0, 0, width, height)

    if (bgType === 'color') {
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, width, height)
    } else if (bgType === 'magic') {
      const preset = MAGIC_BACKGROUNDS[magicIndex] || MAGIC_BACKGROUNDS[0]
      const gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, preset.from)
      gradient.addColorStop(1, preset.to)
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
    } else if (bgType === 'photo' && bgImageRef.current) {
      const image = bgImageRef.current
      ctx.save()
      if (effect === 'blur') ctx.filter = 'blur(14px)'
      const scale = Math.max(width / image.width, height / image.height) * (effect === 'blur' ? 1.06 : 1)
      const drawWidth = image.width * scale
      const drawHeight = image.height * scale
      ctx.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight)
      ctx.restore()
    }

    if (effect === 'shadow' || effect === 'glow') {
      ctx.save()
      ctx.shadowColor = effect === 'shadow' ? 'rgba(0,0,0,0.45)' : 'rgba(225,77,42,0.75)'
      ctx.shadowBlur = effect === 'shadow' ? 36 : 32
      ctx.shadowOffsetY = effect === 'shadow' ? 16 : 0
      ctx.drawImage(work, 0, 0)
      ctx.restore()
    }

    ctx.drawImage(work, 0, 0)
  }, [bgType, bgColor, magicIndex, effect])

  useEffect(() => {
    render()
  }, [render, hasCutout, bgPhotoUrl])

  useEffect(() => {
    if (mode === 'magic' && cursorRef.current) cursorRef.current.style.opacity = '0'
  }, [mode])

  useEffect(() => {
    const element = outerRef.current
    if (!element || !hasCutout) return
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      setZoom((current) => {
        const next = current + (e.deltaY > 0 ? -0.25 : 0.25)
        return Math.min(3, Math.max(0.5, Math.round(next * 4) / 4))
      })
    }
    element.addEventListener('wheel', onWheel, { passive: false })
    return () => element.removeEventListener('wheel', onWheel)
  }, [hasCutout])

  const reset = () => {
    urls.current.forEach((url) => URL.revokeObjectURL(url))
    urls.current = []
    workRef.current = null
    originalRef.current = null
    bgImageRef.current = null
    drawingRef.current = false
    lastPointRef.current = null
    setFile(null)
    setOriginalUrl('')
    setBgPhotoUrl('')
    setHasCutout(false)
    setProgress(0)
    setStatus('')
    setError('')
    setBgType('transparent')
    setEffect('none')
    setZoom(1)
  }

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0]
    if (!picked) return
    reset()
    setFile(picked)
    setOriginalUrl(track(URL.createObjectURL(picked)))
  }

  const removeBg = async () => {
    if (!file || isProcessing) return
    setIsProcessing(true)
    setError('')
    setProgress(0)
    setStatus('Menyiapkan model...')

    try {
      const { removeBackground } = await import('@imgly/background-removal')
      const blob = await removeBackground(file, {
        model: 'isnet_fp16',
        output: { format: 'image/png' },
        progress: (key, current, total) => {
          const label = key.split('/').pop() || key
          setStatus(`Memproses ${label}`)
          if (total > 0) setProgress(Math.min(99, Math.round((current / total) * 100)))
        },
      })

      const originalImage = new Image()
      originalImage.src = originalUrl
      await originalImage.decode()

      const original = document.createElement('canvas')
      original.width = originalImage.naturalWidth
      original.height = originalImage.naturalHeight
      original.getContext('2d')?.drawImage(originalImage, 0, 0)
      originalRef.current = original

      const cutoutUrl = track(URL.createObjectURL(blob))
      const cutoutImage = new Image()
      cutoutImage.src = cutoutUrl
      await cutoutImage.decode()

      const work = document.createElement('canvas')
      work.width = cutoutImage.naturalWidth
      work.height = cutoutImage.naturalHeight
      work.getContext('2d')?.drawImage(cutoutImage, 0, 0)
      workRef.current = work

      setHasCutout(true)
      setProgress(100)
      setStatus('Selesai')
    } catch (err) {
      console.error('Background removal failed:', err)
      setError('Gagal menghapus latar belakang. Coba foto lain atau muat ulang halaman.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBgPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0]
    if (!picked) return
    const url = track(URL.createObjectURL(picked))
    const image = new Image()
    image.src = url
    image.onload = () => {
      bgImageRef.current = image
      setBgPhotoUrl(url)
      setBgType('photo')
    }
  }

  const pointFromEvent = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = previewRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    }
  }

  const updateCursor = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = previewRef.current
    const outer = outerRef.current
    const cursor = cursorRef.current
    if (!canvas || !outer || !cursor) return
    if (mode === 'magic') {
      cursor.style.opacity = '0'
      return
    }
    const rect = canvas.getBoundingClientRect()
    const outerRect = outer.getBoundingClientRect()
    const size = Math.max(6, brushSize * (rect.width / canvas.width))
    cursor.style.width = `${size}px`
    cursor.style.height = `${size}px`
    cursor.style.left = `${e.clientX - outerRect.left - size / 2}px`
    cursor.style.top = `${e.clientY - outerRect.top - size / 2}px`
    cursor.style.opacity = '1'
  }

  const hideCursor = () => {
    if (cursorRef.current) cursorRef.current.style.opacity = '0'
  }

  const changeZoom = (value: number) => {
    const next = Math.min(3, Math.max(0.5, Math.round(value * 4) / 4))
    setZoom(next)
    if (next === 1) scrollRef.current?.scrollTo({ top: 0, left: 0 })
  }

  const stamp = (x: number, y: number) => {
    const work = workRef.current
    const original = originalRef.current
    if (!work || !original) return
    const ctx = work.getContext('2d')
    if (!ctx) return
    const radius = brushSize / 2

    if (mode === 'erase') {
      ctx.save()
      ctx.globalCompositeOperation = 'destination-out'
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    } else if (mode === 'restore') {
      ctx.save()
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.clip()
      ctx.drawImage(original, 0, 0)
      ctx.restore()
    }
  }

  const stroke = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const distance = Math.hypot(to.x - from.x, to.y - from.y)
    const step = Math.max(1, brushSize / 6)
    const count = Math.max(1, Math.ceil(distance / step))
    for (let i = 1; i <= count; i++) {
      const t = i / count
      stamp(from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t)
    }
    render()
  }

  const magicErase = (startX: number, startY: number) => {
    const work = workRef.current
    if (!work) return
    const ctx = work.getContext('2d')
    if (!ctx) return

    const width = work.width
    const height = work.height
    const x = Math.max(0, Math.min(width - 1, Math.floor(startX)))
    const y = Math.max(0, Math.min(height - 1, Math.floor(startY)))
    const image = ctx.getImageData(0, 0, width, height)
    const data = image.data
    const startIndex = y * width + x
    const startPixel = startIndex * 4

    if (data[startPixel + 3] === 0) return

    const targetR = data[startPixel]
    const targetG = data[startPixel + 1]
    const targetB = data[startPixel + 2]
    const limit = tolerance * tolerance

    const visited = new Uint8Array(width * height)
    const stack = new Int32Array(width * height)
    let top = 0
    stack[top++] = startIndex
    visited[startIndex] = 1

    while (top > 0) {
      const index = stack[--top]
      const pixel = index * 4
      if (data[pixel + 3] === 0) continue

      const dr = data[pixel] - targetR
      const dg = data[pixel + 1] - targetG
      const db = data[pixel + 2] - targetB
      if (dr * dr + dg * dg + db * db > limit) continue

      data[pixel + 3] = 0

      const px = index % width
      if (px > 0 && !visited[index - 1]) {
        visited[index - 1] = 1
        stack[top++] = index - 1
      }
      if (px < width - 1 && !visited[index + 1]) {
        visited[index + 1] = 1
        stack[top++] = index + 1
      }
      if (index >= width && !visited[index - width]) {
        visited[index - width] = 1
        stack[top++] = index - width
      }
      if (index < width * (height - 1) && !visited[index + width]) {
        visited[index + width] = 1
        stack[top++] = index + width
      }
    }

    ctx.putImageData(image, 0, 0)
    render()
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!hasCutout) return
    const point = pointFromEvent(e)
    if (!point) return

    if (mode === 'magic') {
      magicErase(point.x, point.y)
      return
    }

    drawingRef.current = true
    lastPointRef.current = point
    e.currentTarget.setPointerCapture(e.pointerId)
    stamp(point.x, point.y)
    render()
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return
    const point = pointFromEvent(e)
    if (!point) return
    const last = lastPointRef.current
    if (last) stroke(last, point)
    lastPointRef.current = point
  }

  const stopDrawing = () => {
    drawingRef.current = false
    lastPointRef.current = null
  }

  const download = () => {
    const canvas = previewRef.current
    if (!canvas || !file) return
    const name = file.name.replace(/\.[^.]+$/, '') || 'gambar'
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${name}-no-bg.png`
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    }, 'image/png')
  }

  return (
    <div className="border border-[#EAE5DC] dark:border-[#272A33] bg-white dark:bg-[#1A1B20] rounded-2xl p-4 sm:p-6 shadow-xs space-y-6">
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#EAE5DC] dark:border-[#272A33] gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#1C1917] dark:text-[#F5F4F0]">Hapus Latar Belakang Foto</h3>
          <p className="text-xs text-[#78716C]">
            Hapus background otomatis, rapikan hasil dengan brush, lalu pilih latar baru. Semua diproses di browser.
          </p>
        </div>
        {hasCutout && (
          <button
            type="button"
            onClick={download}
            className="px-4 py-2 text-xs font-bold bg-[#E14D2A] text-white hover:bg-[#C83B1B] rounded-xl shadow-sm shadow-[#E14D2A]/20 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Unduh PNG
          </button>
        )}
      </div>

      {!file ? (
        <label className="text-sm border-2 border-dashed border-[#EAE5DC] dark:border-[#272A33] rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center cursor-pointer hover:border-[#E14D2A] transition-colors bg-[#FAF8F5] dark:bg-[#121316]">
          <ImageOff className="w-7 h-7 text-[#78716C] mb-2" />
          <span className="text-sm font-bold text-[#1C1917] dark:text-[#F5F4F0]">Pilih Foto</span>
          <span className="text-xs text-[#78716C] mt-1 text-center">
            PNG, JPG, atau WEBP. Model AI diunduh sekali saat pemrosesan pertama.
          </span>
          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleUpload} className="hidden" />
        </label>
      ) : !hasCutout ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-[#EAE5DC] dark:border-[#272A33] bg-[#FAF8F5] dark:bg-[#121316] flex items-center justify-center p-2 min-h-[260px]">
            <img src={originalUrl} alt="Foto asli" className="max-h-[420px] max-w-full object-contain rounded" />
          </div>

          {error && (
            <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/30 dark:border-rose-800/40 text-xs text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-[#57534E] dark:text-[#A8A29E]">
                <span>{status || 'Memproses...'}</span>
                <span className="font-mono-code">{progress}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#EAE5DC] dark:bg-[#272A33] overflow-hidden">
                <div className="h-full bg-[#E14D2A] transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={removeBg}
              disabled={isProcessing}
              className="px-5 py-2.5 text-xs font-bold bg-[#E14D2A] text-white hover:bg-[#C83B1B] rounded-xl shadow-sm shadow-[#E14D2A]/20 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isProcessing ? 'Memproses...' : 'Hapus Latar Belakang'}
            </button>
            <button
              type="button"
              onClick={reset}
              className="px-4 py-2.5 text-xs font-semibold border border-[#EAE5DC] dark:border-[#272A33] text-[#57534E] dark:text-[#A8A29E] hover:border-[#E14D2A] hover:text-[#E14D2A] rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Ganti Foto
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-5 items-start">
          <div className="space-y-3 min-w-0">
            <div
              ref={outerRef}
              className="relative rounded-xl border border-[#EAE5DC] dark:border-[#272A33] overflow-hidden"
              style={{ backgroundImage: checker, backgroundSize: '16px 16px', backgroundPosition: '0 0, 8px 8px' }}
            >
              <div ref={scrollRef} className="p-2 overflow-auto max-h-[520px]">
                <canvas
                  ref={previewRef}
                  onPointerDown={(e) => {
                    updateCursor(e)
                    handlePointerDown(e)
                  }}
                  onPointerMove={(e) => {
                    updateCursor(e)
                    handlePointerMove(e)
                  }}
                  onPointerEnter={updateCursor}
                  onPointerUp={stopDrawing}
                  onPointerLeave={() => {
                    hideCursor()
                    stopDrawing()
                  }}
                  onPointerCancel={() => {
                    hideCursor()
                    stopDrawing()
                  }}
                  style={{ width: `${zoom * 100}%` }}
                  className={`block h-auto max-w-none mx-auto touch-none ${
                    mode === 'magic' ? 'cursor-pointer' : 'cursor-none'
                  }`}
                />
              </div>

              <div className="absolute top-2 right-2 z-20 flex items-center gap-0.5 rounded-lg border border-[#EAE5DC] dark:border-[#272A33] bg-white/95 dark:bg-[#1A1B20]/95 backdrop-blur px-1 py-0.5 shadow-sm">
                <button
                  type="button"
                  onClick={() => changeZoom(zoom - 0.25)}
                  disabled={zoom <= 0.5}
                  aria-label="Perkecil"
                  className="w-7 h-7 rounded-md flex items-center justify-center text-[#57534E] dark:text-[#A8A29E] hover:text-[#E14D2A] disabled:opacity-40 cursor-pointer"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono-code font-bold w-10 text-center text-[#1C1917] dark:text-[#F5F4F0]">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => changeZoom(zoom + 0.25)}
                  disabled={zoom >= 3}
                  aria-label="Perbesar"
                  className="w-7 h-7 rounded-md flex items-center justify-center text-[#57534E] dark:text-[#A8A29E] hover:text-[#E14D2A] disabled:opacity-40 cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => changeZoom(1)}
                  aria-label="Reset zoom"
                  className="w-7 h-7 rounded-md flex items-center justify-center text-[#57534E] dark:text-[#A8A29E] hover:text-[#E14D2A] cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div
                ref={cursorRef}
                className="pointer-events-none absolute z-10 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.65)] opacity-0"
                style={{ width: 0, height: 0 }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#78716C]">
              <span>
                {mode === 'magic'
                  ? 'Klik area yang ingin dihapus. Magic brush menghapus warna serupa yang terhubung.'
                  : mode === 'restore'
                  ? 'Sapukan untuk mengembalikan bagian foto yang terlanjur terhapus.'
                  : 'Sapukan pada area yang masih tersisa untuk menghapusnya.'}
                {' '}Ctrl + scroll untuk zoom.
              </span>
              <button
                type="button"
                onClick={reset}
                className="text-xs font-semibold text-[#57534E] dark:text-[#A8A29E] hover:text-[#E14D2A] inline-flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Ganti Foto
              </button>
            </div>
          </div>

          <div className="space-y-5">
            <section className="space-y-3">
              <h4 className="text-xs font-bold font-mono-code uppercase tracking-wider flex items-center gap-1.5">
                <Paintbrush className="w-3.5 h-3.5 text-[#E14D2A]" />
                Cutout Brush
              </h4>

              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'erase' as const, label: 'Hapus' },
                  { id: 'restore' as const, label: 'Pulihkan' },
                  { id: 'magic' as const, label: 'Magic' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMode(item.id)}
                    className={`px-2 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      mode === item.id
                        ? 'bg-[#E14D2A] border-[#E14D2A] text-white'
                        : 'border-[#EAE5DC] dark:border-[#272A33] text-[#57534E] dark:text-[#A8A29E] hover:border-[#E14D2A]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#57534E] dark:text-[#A8A29E]">Brush size</span>
                  <span className="font-mono-code font-bold text-[#E14D2A]">{brushSize}px</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="200"
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                  className="w-full accent-[#E14D2A]"
                />
              </div>

              {mode === 'magic' && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#57534E] dark:text-[#A8A29E]">Toleransi warna</span>
                    <span className="font-mono-code font-bold text-[#E14D2A]">{tolerance}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={tolerance}
                    onChange={(e) => setTolerance(parseInt(e.target.value))}
                    className="w-full accent-[#E14D2A]"
                  />
                </div>
              )}
            </section>

            <section className="space-y-3 pt-4 border-t border-[#EAE5DC] dark:border-[#272A33]">
              <h4 className="text-xs font-bold font-mono-code uppercase tracking-wider flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-[#E14D2A]" />
                Background
              </h4>

              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'transparent' as const, label: 'Transparan' },
                  { id: 'color' as const, label: 'Warna' },
                  { id: 'photo' as const, label: 'Foto' },
                  { id: 'magic' as const, label: 'Magic' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setBgType(item.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                      bgType === item.id
                        ? 'bg-[#1C1917] border-[#1C1917] text-white dark:bg-white dark:border-white dark:text-[#1C1917]'
                        : 'border-[#EAE5DC] dark:border-[#272A33] text-[#57534E] dark:text-[#A8A29E] hover:border-[#E14D2A]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {bgType === 'transparent' && (
                <p className="text-[11px] text-[#78716C] leading-relaxed">
                  Latar transparan. Cocok untuk PNG yang akan ditempel ke desain lain.
                </p>
              )}

              {bgType === 'color' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border border-[#EAE5DC] dark:border-[#272A33] bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="flex-1 min-w-0 px-2.5 py-1.5 text-xs font-mono-code rounded-lg border border-[#EAE5DC] dark:border-[#272A33] bg-[#FAF8F5] dark:bg-[#121316] text-[#1C1917] dark:text-[#F5F4F0] outline-none focus:border-[#E14D2A]"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {COLOR_PRESETS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setBgColor(color)}
                        aria-label={`Warna ${color}`}
                        className={`w-6 h-6 rounded-md border cursor-pointer ${
                          bgColor === color ? 'ring-2 ring-[#E14D2A] ring-offset-1 dark:ring-offset-[#1A1B20]' : 'border-black/10'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {bgType === 'photo' && (
                <div className="space-y-2">
                  <label className="flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-semibold border border-dashed border-[#EAE5DC] dark:border-[#272A33] rounded-lg hover:border-[#E14D2A] cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    Pilih Foto Latar
                    <input type="file" accept="image/*" onChange={handleBgPhoto} className="hidden" />
                  </label>
                  {bgPhotoUrl && (
                    <img src={bgPhotoUrl} alt="Latar terpilih" className="w-full h-16 object-cover rounded-lg border border-[#EAE5DC] dark:border-[#272A33]" />
                  )}
                </div>
              )}

              {bgType === 'magic' && (
                <div className="grid grid-cols-4 gap-1.5">
                  {MAGIC_BACKGROUNDS.map((preset, index) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setMagicIndex(index)}
                      title={preset.name}
                      className={`h-8 rounded-md border cursor-pointer ${
                        magicIndex === index ? 'ring-2 ring-[#E14D2A] ring-offset-1 dark:ring-offset-[#1A1B20]' : 'border-black/10'
                      }`}
                      style={{ backgroundImage: `linear-gradient(135deg, ${preset.from}, ${preset.to})` }}
                    />
                  ))}
                </div>
              )}

              <div className="space-y-1.5 pt-2">
                <div className="text-[11px] font-semibold text-[#57534E] dark:text-[#A8A29E]">Efek</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'none' as const, label: 'Tanpa' },
                    { id: 'blur' as const, label: 'Blur Latar' },
                    { id: 'shadow' as const, label: 'Shadow' },
                    { id: 'glow' as const, label: 'Glow' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setEffect(item.id)}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                        effect === item.id
                          ? 'bg-[#E14D2A] border-[#E14D2A] text-white'
                          : 'border-[#EAE5DC] dark:border-[#272A33] text-[#57534E] dark:text-[#A8A29E] hover:border-[#E14D2A]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                {effect === 'blur' && bgType !== 'photo' && (
                  <p className="text-[10px] text-[#78716C]">Blur latar aktif saat background Foto dipilih.</p>
                )}
              </div>
            </section>

            {error && (
              <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/30 dark:border-rose-800/40 text-xs text-rose-700 dark:text-rose-300">
                {error}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
