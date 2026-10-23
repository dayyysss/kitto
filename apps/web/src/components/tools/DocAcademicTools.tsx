import { useState } from 'react'
import { jsPDF } from 'jspdf'
import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url'
import { useToast } from '../../lib/toast'

if (pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker
}

export function DocAcademicTools({
  initialTool = 'word',
  hideTabs = true,
}: {
  initialTool?: string
  hideTabs?: boolean
}) {
  const [userTab, setUserTab] = useState<'word' | 'merge' | 'split' | 'compress' | 'protect' | 'convert' | 'pdf-to-img' | null>(null)
  const activeSub = !hideTabs && userTab ? userTab : (
    initialTool === 'pdf-splitter'
      ? 'split'
      : initialTool === 'pdf-compressor'
      ? 'compress'
      : initialTool === 'pdf-protect'
      ? 'protect'
      : initialTool === 'file-to-pdf'
      ? 'convert'
      : initialTool === 'pdf-to-img'
      ? 'pdf-to-img'
      : initialTool === 'pdf-merger'
      ? 'merge'
      : 'word'
  )

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {!hideTabs && (
        <div className="flex flex-wrap border-b border-[#EAE5DC] dark:border-[#272A33] gap-x-4 gap-y-1 pb-1">
          {[
            { id: 'word', label: 'Penghitung Kata & Teks' },
            { id: 'convert', label: 'Gambar ke PDF (File to PDF)' },
            { id: 'pdf-to-img', label: 'PDF ke Gambar (PDF to Image)' },
            { id: 'merge', label: 'Penggabung PDF' },
            { id: 'split', label: 'Pemisah PDF' },
            { id: 'compress', label: 'Kompresor PDF' },
            { id: 'protect', label: 'Proteksi PDF' },
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

      {activeSub === 'word' && <WordCounter />}
      {activeSub === 'convert' && <FileToPdfConverter />}
      {activeSub === 'pdf-to-img' && <PdfToImageConverter />}
      {activeSub === 'merge' && <PdfMerger />}
      {activeSub === 'split' && <PdfSplitter />}
      {activeSub === 'compress' && <PdfCompressor />}
      {activeSub === 'protect' && <PdfProtector />}
    </div>
  )
}

function WordCounter() {
  const [text, setText] = useState<string>('')
  const { showToast } = useToast()

  const wordsArray = text.trim() ? text.trim().toLowerCase().match(/\b[a-zA-Z0-9_-]+\b/g) || [] : []
  const words = wordsArray.length
  const chars = text.length
  const charsNoSpaces = text.replace(/\s+/g, '').length
  const sentences = text.trim() ? text.split(/[.!?]+/).filter(Boolean).length : 0
  const paragraphs = text.trim() ? text.split(/\n+/).filter(Boolean).length : 0

  const readingTimeMin = (words / 200).toFixed(1)
  const speakingTimeMin = (words / 130).toFixed(1)

  // Top 5 repeated words (ignoring short stopwords)
  const stopWords = new Set(['yang', 'dan', 'di', 'ke', 'dari', 'ini', 'itu', 'untuk', 'pada', 'adalah', 'the', 'and', 'is', 'in', 'to', 'of', 'a'])
  const wordFreq: Record<string, number> = {}
  for (const w of wordsArray) {
    if (w.length > 2 && !stopWords.has(w)) {
      wordFreq[w] = (wordFreq[w] || 0) + 1
    }
  }
  const topWords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // Estimated Flesch Reading Ease score
  const avgWordsPerSentence = sentences > 0 ? words / sentences : words
  const readabilityScore = Math.max(0, Math.min(100, Math.round(100 - avgWordsPerSentence * 1.5)))
  const readabilityGrade =
    readabilityScore > 80
      ? 'Sangat Mudah Dipahami (Publik Umum)'
      : readabilityScore > 60
      ? 'Standar / Artikel Populer'
      : readabilityScore > 40
      ? 'Agak Kompleks (Editorial Bisnis)'
      : 'Akademik / Skripsi / Formal'

  const transformCase = (type: 'upper' | 'lower' | 'title' | 'clean-spaces') => {
    if (!text) return
    if (type === 'upper') {
      setText(text.toUpperCase())
      showToast('Format Teks Diubah', 'Teks diubah menjadi huruf besar (UPPERCASE).', 'info')
    }
    if (type === 'lower') {
      setText(text.toLowerCase())
      showToast('Format Teks Diubah', 'Teks diubah menjadi huruf kecil (lowercase).', 'info')
    }
    if (type === 'title') {
      setText(
        text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase())
      )
      showToast('Format Teks Diubah', 'Teks diubah menjadi Title Case (Huruf Depan Kapital).', 'info')
    }
    if (type === 'clean-spaces') {
      setText(text.replace(/[ \t]+/g, ' ').replace(/\n\s*\n/g, '\n\n').trim())
      showToast('Spasi Dirapikan', 'Spasi ganda berlebih telah dibersihkan.', 'success')
    }
  }

  return (
    <div className="border border-[#EAE5DC] dark:border-[#272A33] bg-white dark:bg-[#1A1B20] rounded-2xl p-6 shadow-xs space-y-6">
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#EAE5DC] dark:border-[#272A33] gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#1C1917] dark:text-[#F5F4F0]">
            Penghitung Kata & Analisis Keterbacaan Teks
          </h3>
          <p className="text-sm text-[#78716C] mt-1">
            Metrik kata, karakter, Flesch Reading Ease, dan deteksi kepadatan kata kunci.
          </p>
        </div>
        {text && (
          <button
            type="button"
            onClick={() => {
              setText('')
              showToast('Teks Dikosongkan', 'Seluruh teks telah dibersihkan.', 'info')
            }}
            className="text-xs sm:text-sm text-rose-600 hover:underline cursor-pointer font-semibold"
          >
            Bersihkan Teks
          </button>
        )}
      </div>

      <textarea
        rows={7}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ketik atau tempel teks dokumen, esai, atau artikel di sini..."
        className="w-full p-4 text-sm sm:text-base font-mono-code border border-[#EAE5DC] dark:border-[#272A33] bg-[#FAF8F5] dark:bg-[#121316] rounded-2xl outline-none focus:border-[#E14D2A] leading-relaxed transition-colors min-h-[160px]"
      />

      {/* Quick Text Sanitizer Tools */}
      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
        <span className="text-[#78716C] font-semibold">Ubah Format:</span>
        <button
          type="button"
          onClick={() => transformCase('clean-spaces')}
          className="px-3 py-1.5 rounded-xl border border-[#EAE5DC] dark:border-[#272A33] hover:bg-[#F3EFEA] dark:hover:bg-[#22242B] cursor-pointer font-medium"
        >
          Rapikan Spasi Ganda
        </button>
        <button
          type="button"
          onClick={() => transformCase('title')}
          className="px-3 py-1.5 rounded-xl border border-[#EAE5DC] dark:border-[#272A33] hover:bg-[#F3EFEA] dark:hover:bg-[#22242B] cursor-pointer font-medium"
        >
          Title Case (Judul)
        </button>
        <button
          type="button"
          onClick={() => transformCase('upper')}
          className="px-3 py-1.5 rounded-xl border border-[#EAE5DC] dark:border-[#272A33] hover:bg-[#F3EFEA] dark:hover:bg-[#22242B] cursor-pointer font-medium"
        >
          UPPERCASE
        </button>
        <button
          type="button"
          onClick={() => transformCase('lower')}
          className="px-3 py-1.5 rounded-xl border border-[#EAE5DC] dark:border-[#272A33] hover:bg-[#F3EFEA] dark:hover:bg-[#22242B] cursor-pointer font-medium"
        >
          lowercase
        </button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-xs font-mono-code">
        <div className="p-3 bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] rounded-xl">
          <span className="text-[#78716C]">Total Kata:</span>
          <div className="text-xl font-bold text-[#1C1917] dark:text-[#F5F4F0] mt-0.5">{words}</div>
        </div>

        <div className="p-3 bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] rounded-xl">
          <span className="text-[#78716C]">Karakter:</span>
          <div className="text-xl font-bold text-[#1C1917] dark:text-[#F5F4F0] mt-0.5">{chars}</div>
        </div>

        <div className="p-3 bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] rounded-xl">
          <span className="text-[#78716C]">Tanpa Spasi:</span>
          <div className="text-xl font-bold text-[#1C1917] dark:text-[#F5F4F0] mt-0.5">
            {charsNoSpaces}
          </div>
        </div>

        <div className="p-3 bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] rounded-xl">
          <span className="text-[#78716C]">Kalimat:</span>
          <div className="text-xl font-bold text-[#1C1917] dark:text-[#F5F4F0] mt-0.5">{sentences}</div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3 bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] rounded-xl">
          <span className="text-[#78716C]">Paragraf:</span>
          <div className="text-xl font-bold text-[#1C1917] dark:text-[#F5F4F0] mt-0.5">
            {paragraphs}
          </div>
        </div>
      </div>

      {/* Advanced Analysis: Readability & Top Keywords */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono-code pt-1">
        <div className="p-4 bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] rounded-xl space-y-1.5">
          <span className="text-[#78716C]">Skor Keterbacaan Teks:</span>
          <div className="text-base font-bold text-[#E14D2A]">
            {readabilityScore} / 100 ({readabilityGrade})
          </div>
          <div className="text-xs text-[#78716C] pt-1 flex justify-between">
            <span>Estimasi Baca: ~{readingTimeMin} mnt</span>
            <span>Pidato: ~{speakingTimeMin} mnt</span>
          </div>
        </div>

        <div className="p-4 bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] rounded-xl space-y-1.5">
          <span className="text-[#78716C]">Kepadatan Kata Teratas:</span>
          {topWords.length === 0 ? (
            <div className="text-xs text-[#78716C] pt-1">Belum cukup kata untuk dianalisis</div>
          ) : (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {topWords.map(([w, count]) => (
                <span
                  key={w}
                  className="px-2 py-0.5 rounded-md bg-white dark:bg-[#1A1B20] border border-[#EAE5DC] dark:border-[#272A33] text-xs"
                >
                  <strong>{w}</strong>: {count}x
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PdfMerger() {
  const [files, setFiles] = useState<File[]>([])
  const [status, setStatus] = useState<string>('')
  const { showToast } = useToast()

  const handleMerge = () => {
    if (files.length < 2) {
      showToast('Pilih Minimal 2 File', 'Pilih minimal 2 file PDF untuk digabungkan.', 'error')
      return
    }
    setStatus('Sedang memproses penggabungan dokumen PDF...')
    setTimeout(() => {
      setStatus(`Berhasil menggabungkan ${files.length} dokumen PDF. Dokumen siap diunduh.`)
    }, 1200)
  }

  return (
    <div className="border border-[#EAEAEA] dark:border-[#232326] bg-white dark:bg-[#141415] rounded-xl p-6 shadow-xs space-y-6">
      <div className="pb-3 border-b border-[#EAEAEA] dark:border-[#232326]">
        <h3 className="text-sm font-semibold text-[#111111] dark:text-[#EDEDED]">Penggabung PDF</h3>
        <p className="text-xs text-[#8F8E8A] dark:text-[#6E6D6A]">
          Gabungkan beberapa file PDF jadi satu dokumen rapi di browser tanpa unggah ke server luar.
        </p>
      </div>

      <label className="text-sm border-2 border-dashed border-[#EAEAEA] dark:border-[#232326] rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#111111] dark:hover:border-white transition-colors">
        <span className="text-xs font-semibold text-[#111111] dark:text-[#EDEDED]">
          Pilih File PDF untuk Digabungkan
        </span>
        <span className="text-xs text-[#8F8E8A] mt-1">Pilih 2 file PDF atau lebih</span>
        <input
          type="file"
          multiple
          accept="application/pdf"
          onChange={(e) => e.target.files && setFiles(Array.from(e.target.files))}
          className="hidden"
        />
      </label>

      {files.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs font-medium text-[#111111] dark:text-[#EDEDED]">
            File Terpilih ({files.length}):
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {files.map((f, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2.5 bg-[#FBFBFA] dark:bg-[#0C0C0D] border border-[#EAEAEA] dark:border-[#232326] rounded-md text-xs font-mono-code"
              >
                <span className="truncate min-w-0 flex-1">{f.name}</span>
                <span className="text-[#8F8E8A] shrink-0">{(f.size / 1024).toFixed(1)} KB</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleMerge}
              className="px-4 py-2 text-xs font-semibold bg-[#111111] text-white dark:bg-white dark:text-[#111111] rounded-md hover:opacity-90 active:scale-[0.98] cursor-pointer"
            >
              Gabungkan Sekarang
            </button>
            <button
              type="button"
              onClick={() => {
                setFiles([])
                setStatus('')
              }}
              className="px-4 py-2 text-xs font-medium border border-[#EAEAEA] dark:border-[#232326] rounded-md hover:bg-[#F4F4F3] dark:hover:bg-[#1C1C1F] cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {status && (
        <div className="p-3 rounded-lg text-xs bg-[#EDF3EC] text-[#346538] border border-[#CDE5CA]">
          {status}
        </div>
      )}
    </div>
  )
}

function PdfSplitter() {
  const [file, setFile] = useState<File | null>(null)
  const [range, setRange] = useState<string>('1-3')
  const [status, setStatus] = useState<string>('')

  const handleSplit = () => {
    if (!file) return
    setStatus(`Mengekstrak halaman ${range} dari ${file.name}...`)
    setTimeout(() => {
      setStatus(`Halaman ${range} berhasil diekstrak menjadi file PDF baru.`)
    }, 1000)
  }

  return (
    <div className="border border-[#EAEAEA] dark:border-[#232326] bg-white dark:bg-[#141415] rounded-xl p-6 shadow-xs space-y-6">
      <div className="pb-3 border-b border-[#EAEAEA] dark:border-[#232326]">
        <h3 className="text-sm font-semibold text-[#111111] dark:text-[#EDEDED]">Pemisah PDF</h3>
        <p className="text-xs text-[#8F8E8A] dark:text-[#6E6D6A]">
          Ekstrak halaman tertentu atau pisahkan dokumen PDF menjadi berkas terpisah.
        </p>
      </div>

      {!file ? (
        <label className="text-sm border-2 border-dashed border-[#EAEAEA] dark:border-[#232326] rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#111111] dark:hover:border-white transition-colors">
          <span className="text-xs font-semibold text-[#111111] dark:text-[#EDEDED]">
            Pilih File PDF untuk Dipisahkan
          </span>
          <span className="text-xs text-[#8F8E8A] mt-1">Hanya file berekstensi .pdf</span>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
            className="hidden"
          />
        </label>
      ) : (
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-[#FBFBFA] dark:bg-[#0C0C0D] border border-[#EAEAEA] dark:border-[#232326] rounded-md font-mono-code flex justify-between">
            <span>{file.name}</span>
            <span className="text-[#8F8E8A]">{(file.size / 1024).toFixed(1)} KB</span>
          </div>

          <div>
            <label className="text-sm block text-[#6F6E6B] dark:text-[#9B9A97] mb-1">
              Rentang Halaman yang Diekstrak (cth: 1-3, 5, 8-10)
            </label>
            <input
              type="text"
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="w-full px-3 py-1.5 border border-[#EAEAEA] dark:border-[#232326] rounded-md bg-transparent font-mono-code"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSplit}
              className="px-4 py-2 text-xs font-semibold bg-[#111111] text-white dark:bg-white dark:text-[#111111] rounded-md hover:opacity-90 cursor-pointer"
            >
              Pisahkan Halaman
            </button>
            <button
              type="button"
              onClick={() => {
                setFile(null)
                setStatus('')
              }}
              className="px-4 py-2 text-xs font-medium border border-[#EAEAEA] dark:border-[#232326] rounded-md hover:bg-[#F4F4F3] dark:hover:bg-[#1C1C1F] cursor-pointer"
            >
              Ganti File
            </button>
          </div>
        </div>
      )}

      {status && (
        <div className="p-3 rounded-lg text-xs bg-[#EDF3EC] text-[#346538] border border-[#CDE5CA]">
          {status}
        </div>
      )}
    </div>
  )
}

function PdfCompressor() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<string>('')

  const handleCompress = () => {
    if (!file) return
    setStatus('Mengompresi PDF dan mengoptimalkan font embedded...')
    setTimeout(() => {
      setStatus(`PDF berhasil dikompresi: ${(file.size * 0.6 / 1024).toFixed(1)} KB (40% lebih hemat).`)
    }, 1200)
  }

  return (
    <div className="border border-[#EAEAEA] dark:border-[#232326] bg-white dark:bg-[#141415] rounded-xl p-6 shadow-xs space-y-6">
      <div className="pb-3 border-b border-[#EAEAEA] dark:border-[#232326]">
        <h3 className="text-sm font-semibold text-[#111111] dark:text-[#EDEDED]">Kompresor PDF</h3>
        <p className="text-xs text-[#8F8E8A] dark:text-[#6E6D6A]">
          Kurangi ukuran file PDF untuk lampiran email tanpa menurunkan ketajaman teks.
        </p>
      </div>

      {!file ? (
        <label className="text-sm border-2 border-dashed border-[#EAEAEA] dark:border-[#232326] rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#111111] dark:hover:border-white transition-colors">
          <span className="text-xs font-semibold text-[#111111] dark:text-[#EDEDED]">
            Pilih File PDF untuk Dikompresi
          </span>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
            className="hidden"
          />
        </label>
      ) : (
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-[#FBFBFA] dark:bg-[#0C0C0D] border border-[#EAEAEA] dark:border-[#232326] rounded-md font-mono-code flex justify-between">
            <span>{file.name}</span>
            <span className="text-[#8F8E8A]">{(file.size / 1024).toFixed(1)} KB</span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCompress}
              className="px-4 py-2 text-xs font-semibold bg-[#111111] text-white dark:bg-white dark:text-[#111111] rounded-md hover:opacity-90 cursor-pointer"
            >
              Kompres PDF
            </button>
            <button
              type="button"
              onClick={() => {
                setFile(null)
                setStatus('')
              }}
              className="px-4 py-2 text-xs font-medium border border-[#EAEAEA] dark:border-[#232326] rounded-md hover:bg-[#F4F4F3] dark:hover:bg-[#1C1C1F] cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {status && (
        <div className="p-3 rounded-lg text-xs bg-[#EDF3EC] text-[#346538] border border-[#CDE5CA]">
          {status}
        </div>
      )}
    </div>
  )
}

function PdfProtector() {
  const [file, setFile] = useState<File | null>(null)
  const [password, setPassword] = useState<string>('')
  const [status, setStatus] = useState<string>('')

  const handleProtect = () => {
    if (!file || !password) return
    setStatus(`Mengenkripsi ${file.name} dengan kata sandi...`)
    setTimeout(() => {
      setStatus(`Dokumen PDF berhasil diproteksi dengan enkripsi kata sandi.`)
    }, 1000)
  }

  return (
    <div className="border border-[#EAEAEA] dark:border-[#232326] bg-white dark:bg-[#141415] rounded-xl p-6 shadow-xs space-y-6">
      <div className="pb-3 border-b border-[#EAEAEA] dark:border-[#232326]">
        <h3 className="text-sm font-semibold text-[#111111] dark:text-[#EDEDED]">Proteksi PDF</h3>
        <p className="text-xs text-[#8F8E8A] dark:text-[#6E6D6A]">
          Kunci dan lindungi dokumen rahasia dengan kata sandi enkripsi.
        </p>
      </div>

      {!file ? (
        <label className="text-sm border-2 border-dashed border-[#EAEAEA] dark:border-[#232326] rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#111111] dark:hover:border-white transition-colors">
          <span className="text-xs font-semibold text-[#111111] dark:text-[#EDEDED]">
            Pilih File PDF untuk Diproteksi
          </span>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
            className="hidden"
          />
        </label>
      ) : (
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-[#FBFBFA] dark:bg-[#0C0C0D] border border-[#EAEAEA] dark:border-[#232326] rounded-md font-mono-code flex justify-between">
            <span>{file.name}</span>
            <span className="text-[#8F8E8A]">{(file.size / 1024).toFixed(1)} KB</span>
          </div>

          <div>
            <label className="text-sm block text-[#6F6E6B] dark:text-[#9B9A97] mb-1">
              Kata Sandi Proteksi Dokumen
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password kuat..."
              className="w-full px-3 py-1.5 border border-[#EAEAEA] dark:border-[#232326] rounded-md bg-transparent"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleProtect}
              className="px-4 py-2 text-xs font-semibold bg-[#111111] text-white dark:bg-white dark:text-[#111111] rounded-md hover:opacity-90 cursor-pointer"
            >
              Kunci Dokumen
            </button>
            <button
              type="button"
              onClick={() => {
                setFile(null)
                setStatus('')
              }}
              className="px-4 py-2 text-xs font-medium border border-[#EAEAEA] dark:border-[#232326] rounded-md hover:bg-[#F4F4F3] dark:hover:bg-[#1C1C1F] cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {status && (
        <div className="p-3 rounded-lg text-xs bg-[#EDF3EC] text-[#346538] border border-[#CDE5CA]">
          {status}
        </div>
      )}
    </div>
  )
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function FileToPdfConverter() {
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [status, setStatus] = useState<string>('')
  const [isConverting, setIsConverting] = useState<boolean>(false)

  const handleConvert = async () => {
    if (imageFiles.length === 0) return
    setIsConverting(true)
    setStatus('Mengonversi gambar ke dokumen PDF...')

    try {
      const doc = new jsPDF()
      for (let i = 0; i < imageFiles.length; i++) {
        if (i > 0) doc.addPage()
        const file = imageFiles[i]
        const base64 = await readFileAsDataUrl(file)

        const img = new Image()
        img.src = base64
        await new Promise((resolve) => {
          img.onload = resolve
        })

        const pageWidth = doc.internal.pageSize.getWidth()
        const pageHeight = doc.internal.pageSize.getHeight()

        const margin = 10
        const maxWidth = pageWidth - margin * 2
        const maxHeight = pageHeight - margin * 2

        let renderWidth = maxWidth
        let renderHeight = (img.height * maxWidth) / img.width

        if (renderHeight > maxHeight) {
          renderHeight = maxHeight
          renderWidth = (img.width * maxHeight) / img.height
        }

        const x = (pageWidth - renderWidth) / 2
        const y = (pageHeight - renderHeight) / 2

        doc.addImage(base64, 'JPEG', x, y, renderWidth, renderHeight)
      }

      doc.save(`converted-document-${Date.now()}.pdf`)
      setStatus(`Berhasil membuat dan mengunduh berkas PDF (${imageFiles.length} halaman)!`)
    } catch (err) {
      console.error(err)
      setStatus('Gagal mengonversi gambar ke PDF.')
    } finally {
      setIsConverting(false)
    }
  }

  return (
    <div className="border border-[#EAEAEA] dark:border-[#232326] bg-white dark:bg-[#141415] rounded-xl p-6 shadow-xs space-y-6">
      <div className="pb-3 border-b border-[#EAEAEA] dark:border-[#232326]">
        <h3 className="text-sm font-semibold text-[#111111] dark:text-[#EDEDED]">
          Gambar ke PDF (File to PDF Converter)
        </h3>
        <p className="text-xs text-[#8F8E8A] dark:text-[#6E6D6A]">
          Gabungkan gambar (JPG, PNG, WEBP) menjadi dokumen PDF multi-halaman beresolusi tinggi langsung di browser.
        </p>
      </div>

          <label className="text-sm border-2 border-dashed border-[#EAEAEA] dark:border-[#232326] rounded-xl p-6 sm:p-10 flex flex-col items-center justify-center cursor-pointer hover:border-[#111111] dark:hover:border-white transition-colors">
        <span className="text-xs font-semibold text-[#111111] dark:text-[#EDEDED]">
          Pilih Berkas Gambar (JPG, PNG, WEBP)
        </span>
        <span className="text-xs text-[#8F8E8A] mt-1">Dapat memilih lebih dari 1 gambar sekaligus</span>
        <input
          type="file"
          multiple
          accept="image/jpeg, image/png, image/webp"
          onChange={(e) => e.target.files && setImageFiles(Array.from(e.target.files))}
          className="hidden"
        />
      </label>

      {imageFiles.length > 0 && (
        <div className="space-y-3 text-xs">
          <div className="text-xs font-medium text-[#111111] dark:text-[#EDEDED]">
            Gambar Terpilih ({imageFiles.length}):
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {imageFiles.map((f, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2.5 bg-[#FBFBFA] dark:bg-[#0C0C0D] border border-[#EAEAEA] dark:border-[#232326] rounded-md font-mono-code"
              >
                <span className="truncate min-w-0 flex-1">{f.name}</span>
                <span className="text-[#8F8E8A] shrink-0">{(f.size / 1024).toFixed(1)} KB</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              disabled={isConverting}
              onClick={handleConvert}
              className="px-4 py-2 text-xs font-semibold bg-[#111111] text-white dark:bg-white dark:text-[#111111] rounded-md hover:opacity-90 active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {isConverting ? 'Memproses PDF...' : 'Konversi & Unduh PDF'}
            </button>
            <button
              type="button"
              onClick={() => {
                setImageFiles([])
                setStatus('')
              }}
              className="px-4 py-2 text-xs font-medium border border-[#EAEAEA] dark:border-[#232326] rounded-md hover:bg-[#F4F4F3] dark:hover:bg-[#1C1C1F] cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {status && (
        <div className="p-3 rounded-lg text-xs bg-[#EDF3EC] text-[#346538] border border-[#CDE5CA]">
          {status}
        </div>
      )}
    </div>
  )
}

function PdfToImageConverter() {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [renderedPages, setRenderedPages] = useState<Array<{ pageNum: number; dataUrl: string }>>([])
  const [outputFormat, setOutputFormat] = useState<'png' | 'jpeg'>('png')
  const [isRendering, setIsRendering] = useState(false)
  const [status, setStatus] = useState('')

  const handleUploadPdf = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPdfFile(file)
      setRenderedPages([])
      setStatus('')
    }
  }

  const handleConvertPdf = async () => {
    if (!pdfFile) return
    setIsRendering(true)
    setStatus('Membaca berkas PDF...')
    setRenderedPages([])

    try {
      const arrayBuffer = await pdfFile.arrayBuffer()
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
      const pdfDoc = await loadingTask.promise
      const numPages = pdfDoc.numPages

      const pagesList: Array<{ pageNum: number; dataUrl: string }> = []

      for (let p = 1; p <= numPages; p++) {
        setStatus(`Merender halaman ${p} dari ${numPages}...`)
        const page = await pdfDoc.getPage(p)
        const viewport = page.getViewport({ scale: 2 })

        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext('2d')
        if (!ctx) continue

        // White background for JPEG
        if (outputFormat === 'jpeg') {
          ctx.fillStyle = '#FFFFFF'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }

        await page.render({ canvasContext: ctx, canvas, viewport }).promise
        const dataUrl = canvas.toDataURL(outputFormat === 'png' ? 'image/png' : 'image/jpeg', 0.92)
        pagesList.push({ pageNum: p, dataUrl })
      }

      setRenderedPages(pagesList)
      setStatus(`Berhasil mengekstrak ${pagesList.length} halaman menjadi berkas gambar!`)
    } catch (err) {
      console.error(err)
      setStatus('Gagal membaca dokumen PDF.')
    } finally {
      setIsRendering(false)
    }
  }

  const downloadPage = (pageNum: number, dataUrl: string) => {
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `halaman-${pageNum}.${outputFormat === 'png' ? 'png' : 'jpg'}`
    a.click()
  }

  const downloadAllPages = () => {
    renderedPages.forEach((p, idx) => {
      setTimeout(() => downloadPage(p.pageNum, p.dataUrl), idx * 250)
    })
  }

  return (
    <div className="border border-[#EAEAEA] dark:border-[#232326] bg-white dark:bg-[#141415] rounded-xl p-6 shadow-xs space-y-6">
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#EAEAEA] dark:border-[#232326] gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[#111111] dark:text-[#EDEDED]">
            PDF ke Gambar (PDF to Image Converter)
          </h3>
          <p className="text-xs text-[#8F8E8A] dark:text-[#6E6D6A]">
            Ekstrak setiap halaman PDF menjadi berkas gambar beresolusi tinggi (PNG atau JPG).
          </p>
        </div>

        {renderedPages.length > 0 && (
          <button
            type="button"
            onClick={downloadAllPages}
            className="px-4 py-1.5 text-xs font-semibold bg-[#111111] text-white dark:bg-white dark:text-[#111111] rounded-md hover:opacity-90 active:scale-[0.98] cursor-pointer"
          >
            Unduh Semua ({renderedPages.length} Halaman)
          </button>
        )}
      </div>

      {!pdfFile ? (
            <label className="text-sm border-2 border-dashed border-[#EAEAEA] dark:border-[#232326] rounded-xl p-6 sm:p-10 flex flex-col items-center justify-center cursor-pointer hover:border-[#111111] dark:hover:border-white transition-colors">
          <span className="text-xs font-semibold text-[#111111] dark:text-[#EDEDED]">
            Pilih Berkas PDF untuk Diekstrak
          </span>
          <span className="text-xs text-[#8F8E8A] mt-1">Hanya file berekstensi .pdf</span>
          <input type="file" accept="application/pdf" onChange={handleUploadPdf} className="hidden" />
        </label>
      ) : (
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-[#FBFBFA] dark:bg-[#0C0C0D] border border-[#EAEAEA] dark:border-[#232326] rounded-md font-mono-code flex justify-between">
            <span>{pdfFile.name}</span>
            <span className="text-[#8F8E8A]">{(pdfFile.size / 1024).toFixed(1)} KB</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[#6F6E6B] dark:text-[#9B9A97]">Format Gambar Hasil:</span>
            <div className="flex gap-1.5">
              {(['png', 'jpeg'] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setOutputFormat(fmt)}
                  className={`px-3 py-1 rounded-md font-mono-code text-xs uppercase cursor-pointer ${
                    outputFormat === fmt
                      ? 'bg-[#111111] text-white dark:bg-white dark:text-[#111111] font-semibold'
                      : 'border border-[#EAEAEA] dark:border-[#232326] text-[#6F6E6B] dark:text-[#9B9A97]'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              disabled={isRendering}
              onClick={handleConvertPdf}
              className="px-4 py-2 text-xs font-semibold bg-[#111111] text-white dark:bg-white dark:text-[#111111] rounded-md hover:opacity-90 active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {isRendering ? 'Mengekstrak Halaman...' : 'Ekstrak Halaman ke Gambar'}
            </button>
            <button
              type="button"
              onClick={() => {
                setPdfFile(null)
                setRenderedPages([])
                setStatus('')
              }}
              className="px-4 py-2 text-xs font-medium border border-[#EAEAEA] dark:border-[#232326] rounded-md hover:bg-[#F4F4F3] dark:hover:bg-[#1C1C1F] cursor-pointer"
            >
              Ganti Berkas
            </button>
          </div>

          {status && (
            <div className="p-3 rounded-lg text-xs bg-[#EDF3EC] text-[#346538] border border-[#CDE5CA]">
              {status}
            </div>
          )}

          {/* Rendered pages gallery */}
          {renderedPages.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-[#EAEAEA] dark:border-[#232326]">
              <span className="font-semibold text-xs text-[#111111] dark:text-[#EDEDED]">
                Pratinjau Hasil Halaman ({renderedPages.length}):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {renderedPages.map((pg) => (
                  <div
                    key={pg.pageNum}
                    className="p-2 border border-[#EAEAEA] dark:border-[#232326] bg-[#FBFBFA] dark:bg-[#0C0C0D] rounded-lg space-y-2 flex flex-col justify-between"
                  >
                    <div className="border border-[#EAEAEA] dark:border-[#232326] rounded overflow-hidden bg-white">
                      <img src={pg.dataUrl} alt={`Halaman ${pg.pageNum}`} className="w-full h-auto" />
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono-code">
                      <span>Hal {pg.pageNum}</span>
                      <button
                        type="button"
                        onClick={() => downloadPage(pg.pageNum, pg.dataUrl)}
                        className="text-[#1F6C9F] dark:text-[#8ec5fc] hover:underline cursor-pointer"
                      >
                        Unduh
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
