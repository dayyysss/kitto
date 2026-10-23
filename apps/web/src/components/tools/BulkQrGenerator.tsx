import { useState } from 'react'
import QRCodeStyling from 'qr-code-styling'
import { Upload, Printer, Download } from 'lucide-react'
import { useToast } from '../../lib/toast'

interface BulkItem {
  id: number
  label: string
  payload: string
}

export function BulkQrGenerator() {
  const { showToast } = useToast()
  const [inputText, setInputText] = useState(
    `Meja 01, https://menu.kafe.com/meja-1\nMeja 02, https://menu.kafe.com/meja-2\nMeja 03, https://menu.kafe.com/meja-3\nMeja 04, https://menu.kafe.com/meja-4\nMeja 05, https://menu.kafe.com/meja-5`
  )
  const [fgColor, setFgColor] = useState('#121316')
  const [bgColor, setBgColor] = useState('#FFFFFF')
  const [batchItems, setBatchItems] = useState<BulkItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  const presets = [
    {
      label: 'Nomor Meja Kafe (5 Meja)',
      text: `Meja 01, https://menu.kafe.com/meja-1\nMeja 02, https://menu.kafe.com/meja-2\nMeja 03, https://menu.kafe.com/meja-3\nMeja 04, https://menu.kafe.com/meja-4\nMeja 05, https://menu.kafe.com/meja-5`,
    },
    {
      label: 'Inventaris Gudang (SKU)',
      text: `SKU-A101-JAKET, https://inventaris.id/item/A101\nSKU-A102-KEMEJA, https://inventaris.id/item/A102\nSKU-B201-CELANA, https://inventaris.id/item/B201\nSKU-C301-SEPATU, https://inventaris.id/item/C301`,
    },
    {
      label: 'Tiket Seminar / Event',
      text: `VIP-TKT-001, https://event.com/checkin/001\nVIP-TKT-002, https://event.com/checkin/002\nREG-TKT-101, https://event.com/checkin/101\nREG-TKT-102, https://event.com/checkin/102`,
    },
  ]

  const handleParse = () => {
    const lines = inputText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)

    const parsed: BulkItem[] = lines.map((line, idx) => {
      if (line.includes(',')) {
        const [label, ...rest] = line.split(',')
        return {
          id: idx + 1,
          label: (label || '').trim() || `Item ${idx + 1}`,
          payload: rest.join(',').trim(),
        }
      }
      return {
        id: idx + 1,
        label: `Item ${idx + 1}`,
        payload: line,
      }
    })

    setBatchItems(parsed)
    setStatusMessage(`Berhasil memuat ${parsed.length} kode QR siap diekspor.`)
    showToast('Batch QR Berhasil Dimuat', `${parsed.length} item siap di-generate dan diunduh.`, 'success')
  }

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setInputText(reader.result as string)
      setStatusMessage('File CSV berhasil dimuat. Klik "Proses Batch QR".')
      showToast('Berkas CSV Dimuat', 'Data tabel CSV berhasil diimpor.', 'info')
    }
    reader.readAsText(file)
  }

  const downloadSingleQr = async (item: BulkItem) => {
    const qr = new QRCodeStyling({
      width: 600,
      height: 600,
      data: item.payload,
      dotsOptions: { color: fgColor, type: 'rounded' },
      cornersSquareOptions: { color: fgColor, type: 'extra-rounded' },
      backgroundOptions: { color: bgColor },
    })

    await qr.download({
      name: `qr-${item.label.toLowerCase().replace(/[^a-z0-9-_]/g, '-')}`,
      extension: 'png',
    })
    showToast('QR Diunduh', `File QR untuk "${item.label}" berhasil disimpan.`, 'success')
  }

  const handleDownloadAll = async () => {
    if (batchItems.length === 0) return
    setIsProcessing(true)
    setStatusMessage(`Mengunduh ${batchItems.length} berkas QR secara berurutan...`)
    showToast('Mulai Mengunduh Batch', `Sedang mengunduh ${batchItems.length} file QR berurutan...`, 'info')

    for (let i = 0; i < batchItems.length; i++) {
      const it = batchItems[i]
      if (it) {
        await downloadSingleQr(it)
        await new Promise((r) => setTimeout(r, 200))
      }
    }

    setIsProcessing(false)
    setStatusMessage(`Berhasil mengunduh ${batchItems.length} berkas QR PNG.`)
    showToast('Unduhan Selesai', `Seluruh ${batchItems.length} berkas QR PNG berhasil diunduh.`, 'success')
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <div className="border border-[#EAE5DC] dark:border-[#272A33] bg-white dark:bg-[#1A1B20] rounded-3xl p-6 sm:p-9 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between pb-4 border-b border-[#EAE5DC] dark:border-[#272A33] gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#1C1917] dark:text-[#F5F4F0]">
              Batch QR Generator (Bulk CSV & Multi-Baris)
            </h3>
            <p className="text-sm text-[#78716C] mt-1">
              Buat puluhan hingga ratusan kode QR sekaligus untuk nomor meja restoran, tiket seminar, atau inventaris.
            </p>
          </div>
          <label className="px-4 py-2 text-sm sm:text-sm font-semibold border border-[#EAE5DC] dark:border-[#272A33] rounded-xl hover:bg-[#F3EFEA] dark:hover:bg-[#22242B] cursor-pointer flex items-center gap-2 transition-colors">
            <Upload className="w-4 h-4 text-[#E14D2A]" />
            <span>Unggah Berkas CSV</span>
            <input type="file" accept=".csv, .txt" onChange={handleCsvUpload} className="hidden" />
          </label>
        </div>

        {/* Preset Templates */}
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-[#78716C]">Template Data Cepat:</span>
          <div className="flex flex-wrap gap-2 text-xs">
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setInputText(p.text)}
                className="px-2.5 py-1 rounded-lg border border-[#EAE5DC] dark:border-[#272A33] hover:bg-[#F3EFEA] dark:hover:bg-[#22242B] cursor-pointer font-medium"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input format textarea */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#57534E] dark:text-[#A8A29E]">
            Input Teks Multi-Baris (Format: <span className="font-mono-code font-bold text-[#E14D2A]">Label, URL/Payload</span>)
          </label>
          <textarea
            rows={6}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Meja 1, https://menu.kafe.com/1&#10;Meja 2, https://menu.kafe.com/2"
            className="w-full p-3 text-xs font-mono-code border border-[#EAE5DC] dark:border-[#272A33] bg-[#FAF8F5] dark:bg-[#121316] rounded-xl outline-none"
          />
        </div>

        {/* Color controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-sm block text-[#57534E] dark:text-[#A8A29E] mb-1 font-medium">Warna QR</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="w-8 h-8 rounded border border-[#EAE5DC] dark:border-[#272A33] p-0 bg-transparent cursor-pointer"
              />
              <span className="font-mono-code text-xs uppercase">{fgColor}</span>
            </div>
          </div>

          <div>
            <label className="text-sm block text-[#57534E] dark:text-[#A8A29E] mb-1 font-medium">Warna Latar</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-8 h-8 rounded border border-[#EAE5DC] dark:border-[#272A33] p-0 bg-transparent cursor-pointer"
              />
              <span className="font-mono-code text-xs uppercase">{bgColor}</span>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleParse}
            className="px-5 py-2 text-xs font-bold bg-[#E14D2A] text-white hover:bg-[#C83B1B] rounded-xl shadow-sm shadow-[#E14D2A]/20 transition-all cursor-pointer"
          >
            Proses Batch QR ({inputText.split('\n').filter(Boolean).length} Baris)
          </button>

          {batchItems.length > 0 && (
            <>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleDownloadAll}
                className="px-4 py-2 text-xs font-bold border border-[#EAE5DC] dark:border-[#272A33] rounded-xl hover:bg-[#F3EFEA] dark:hover:bg-[#22242B] cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isProcessing ? 'Mengunduh...' : `Unduh Semua (${batchItems.length} PNG)`}</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-bold border border-[#EAE5DC] dark:border-[#272A33] rounded-xl hover:bg-[#F3EFEA] dark:hover:bg-[#22242B] cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Lembar Stiker</span>
              </button>
            </>
          )}

          {statusMessage && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
              {statusMessage}
            </span>
          )}
        </div>

        {/* Batch Preview List */}
        {batchItems.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-[#EAE5DC] dark:border-[#272A33]">
            <div className="flex items-center justify-between text-xs font-bold text-[#1C1917] dark:text-[#F5F4F0]">
              <span>Hasil Batch ({batchItems.length} QR Code Siap Unduh):</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {batchItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] rounded-xl flex flex-col justify-between space-y-3 text-xs"
                >
                  <div className="space-y-1">
                    <span className="font-bold text-[#1C1917] dark:text-[#F5F4F0] font-mono-code">
                      {item.label}
                    </span>
                    <p className="font-mono-code text-xs text-[#78716C] truncate" title={item.payload}>
                      {item.payload}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => downloadSingleQr(item)}
                    className="w-full py-1.5 text-xs font-bold border border-[#EAE5DC] dark:border-[#272A33] bg-white dark:bg-[#1A1B20] text-[#E14D2A] rounded-lg hover:bg-[#E14D2A] hover:text-white transition-all cursor-pointer"
                  >
                    Unduh Satuan PNG
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
