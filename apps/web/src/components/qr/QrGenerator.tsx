import { useEffect, useRef, useState, useMemo } from 'react'
import QRCodeStyling from 'qr-code-styling'
import {
  type QrConfig,
  type PayloadType,
  type DotStyle,
  type CornerStyle,
  formatPayload,
} from './qr-types'
import { checkScannability } from '../../lib/contrast'
import { useToast } from '../../lib/toast'
import { useConfirm } from '../../lib/confirm'
import { ShineBorder } from '../magicui/shine-border'
import { BorderBeam } from '../magicui/border-beam'
import {
  Edit3,
  X,
  ExternalLink,
  Smartphone,
  Store,
  Layers,
  Globe,
  MessageCircle,
  Wifi,
  FileText,
  Mail,
  Contact,
  Link2,
  Download,
  Check,
} from 'lucide-react'

const DEFAULT_CONFIG: QrConfig = {
  isDynamic: false,
  dynamicSlug: 'promo-2026',
  dynamicTargetUrl: 'https://instagram.com/kitto',
  pin: '',
  expiresAt: '',
  payloadType: 'url',
  rawText: 'https://kitto.dev',
  wifi: { ssid: '', password: '', encryption: 'WPA', hidden: false },
  whatsapp: { phone: '', message: '' },
  email: { to: '', subject: '', body: '' },
  vcard: { firstName: '', lastName: '', phone: '', email: '', organization: '', title: '', url: '' },
  fgColor: '#111111',
  bgColor: '#FFFFFF',
  dotStyle: 'rounded',
  cornerStyle: 'extra-rounded',
  logoUrl: '',
  logoSize: 0.25,
  errorCorrection: 'Q',
  size: 320,
}

interface DynamicQrItem {
  id: number
  title: string
  slug: string
  target_url: string
  total_scans: number
  created_at: string
}

interface QrPresetItem {
  id: number
  name: string
  config: any
}

export function QrGenerator() {
  const [config, setConfig] = useState<QrConfig>(DEFAULT_CONFIG)
  const [exportSize, setExportSize] = useState<number>(1024)
  const [isCopied, setIsCopied] = useState<boolean>(false)
  const [previewMode, setPreviewMode] = useState<'canvas' | 'standee' | 'scanner'>('canvas')
  const [frameBanner, setFrameBanner] = useState<'none' | 'scan_me' | 'menu' | 'wifi' | 'pay'>('none')

  // Presets Studio State
  const [presets, setPresets] = useState<QrPresetItem[]>([])
  const [presetNameInput, setPresetNameInput] = useState('')
  const [presetNotice, setPresetNotice] = useState<string | null>(null)

  // Dynamic QR States
  const [dynamicList, setDynamicList] = useState<DynamicQrItem[]>([])
  const [isSavingDynamic, setIsSavingDynamic] = useState<boolean>(false)
  const [dynamicNotice, setDynamicNotice] = useState<string | null>(null)
  const [editingSlug, setEditingSlug] = useState<string | null>(null)
  const [editTargetUrl, setEditTargetUrl] = useState<string>('')

  const { showToast } = useToast()
  const { ask } = useConfirm()
  
  const qrRef = useRef<HTMLDivElement>(null)
  const qrCodeInstance = useRef<QRCodeStyling | null>(null)

  const payloadString = useMemo(() => formatPayload(config), [config])
  const scannability = useMemo(
    () => checkScannability(config.fgColor, config.bgColor),
    [config.fgColor, config.bgColor]
  )

  const fetchDynamicList = () => {
    fetch('/api/qr')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setDynamicList(data)
      })
      .catch((e) => console.warn('Gagal memuat dynamic QR list:', e))
  }

  const fetchPresets = () => {
    fetch('/api/presets?type=qr')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setPresets(data)
      })
      .catch(() => {})
  }

  useEffect(() => {
    let active = true
    fetch('/api/qr')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (active && Array.isArray(data)) setDynamicList(data)
      })
      .catch((e) => console.warn('Gagal memuat dynamic QR list:', e))

    fetch('/api/presets?type=qr')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (active && Array.isArray(data)) setPresets(data)
      })
      .catch(() => {})

    return () => {
      active = false
    }
  }, [])

  const handleSavePreset = async () => {
    if (!presetNameInput.trim()) return
    try {
      const res = await fetch('/api/presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'qr',
          name: presetNameInput.trim(),
          config: {
            fgColor: config.fgColor,
            bgColor: config.bgColor,
            dotStyle: config.dotStyle,
            cornerStyle: config.cornerStyle,
            logoSize: config.logoSize,
            errorCorrection: config.errorCorrection,
          },
        }),
      })
      if (res.ok) {
        setPresetNotice('Tersimpan di akun Anda!')
        showToast('Template Brand Tersimpan!', `Template "${presetNameInput.trim()}" berhasil disimpan.`, 'success')
        setPresetNameInput('')
        fetchPresets()
        setTimeout(() => setPresetNotice(null), 2500)
      } else {
        showToast('Gagal Menyimpan', 'Terjadi kesalahan saat menyimpan template.', 'error')
      }
    } catch {
      showToast('Koneksi Gagal', 'Gagal menghubungi server database.', 'error')
    }
  }

  const handleLoadPreset = (p: QrPresetItem) => {
    if (p.config) {
      setConfig((prev) => ({
        ...prev,
        fgColor: p.config.fgColor || prev.fgColor,
        bgColor: p.config.bgColor || prev.bgColor,
        dotStyle: p.config.dotStyle || prev.dotStyle,
        cornerStyle: p.config.cornerStyle || prev.cornerStyle,
        logoSize: p.config.logoSize || prev.logoSize,
        errorCorrection: p.config.errorCorrection || prev.errorCorrection,
      }))
      showToast('Template Dimuat', `Warna & gaya "${p.name}" diterapkan ke QR.`, 'info')
    }
  }

  const handleDeletePreset = (id: number, name?: string) => {
    ask({
      title: 'Hapus Template Desain?',
      message: `Template brand "${name || 'ini'}" akan dihapus permanen dari penyimpanan.`,
      confirmText: 'Ya, Hapus',
      variant: 'danger',
      onConfirm: async () => {
        await fetch(`/api/presets/${id}`, { method: 'DELETE' })
        showToast('Template Dihapus', 'Template brand berhasil dihapus.', 'info')
        fetchPresets()
      },
    })
  }

  // Manage qrCodeInstance creation and updates
  useEffect(() => {
    if (!qrRef.current) return

    const qrSize = previewMode === 'canvas' ? config.size : previewMode === 'scanner' ? 180 : 200

    const qr = new QRCodeStyling({
      width: qrSize,
      height: qrSize,
      data: payloadString,
      dotsOptions: {
        color: config.fgColor,
        type: config.dotStyle,
      },
      cornersSquareOptions: {
        type: config.cornerStyle,
        color: config.fgColor,
      },
      cornersDotOptions: {
        type: config.cornerStyle === 'square' ? 'square' : 'dot',
        color: config.fgColor,
      },
      backgroundOptions: {
        color: config.bgColor,
      },
      image: config.logoUrl || undefined,
      imageOptions: {
        crossOrigin: 'anonymous',
        hideBackgroundDots: true,
        imageSize: config.logoSize,
        margin: 4,
      },
      qrOptions: {
        errorCorrectionLevel: config.logoUrl ? 'H' : config.errorCorrection,
      },
    })

    qrCodeInstance.current = qr
    qrRef.current.innerHTML = ''
    qr.append(qrRef.current)
  }, [config, payloadString, previewMode])

  const handleDownload = async (ext: 'png' | 'svg' | 'jpeg') => {
    if (!qrCodeInstance.current) return
    
    qrCodeInstance.current.update({
      width: exportSize,
      height: exportSize,
    })
    
    await qrCodeInstance.current.download({
      name: `qr-code-${config.isDynamic ? config.dynamicSlug : Date.now()}`,
      extension: ext,
    })

    const resetSize = previewMode === 'canvas' ? config.size : previewMode === 'scanner' ? 180 : 200
    qrCodeInstance.current.update({
      width: resetSize,
      height: resetSize,
    })

    showToast(
      'QR Code Berhasil Diunduh',
      `Berkas QR disimpan dalam format .${ext.toUpperCase()} resolusi ${exportSize}×${exportSize} px.`,
      'success'
    )
  }

  const handleSaveDynamic = async () => {
    if (!config.dynamicSlug.trim() || !config.dynamicTargetUrl.trim()) {
      showToast('Data Belum Lengkap', 'Slug tautan dan Target URL wajib diisi.', 'error')
      return
    }

    setIsSavingDynamic(true)
    setDynamicNotice(null)
    try {
      const res = await fetch('/api/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: config.dynamicSlug.trim(),
          targetUrl: config.dynamicTargetUrl.trim(),
          title: `QR /r/${config.dynamicSlug.trim()}`,
          payloadType: 'dynamic',
          styleConfig: config,
          pin: config.pin || undefined,
          expiresAt: config.expiresAt || undefined,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setDynamicNotice('Berhasil disimpan & aktif!')
        showToast(
          'Dynamic QR Aktif!',
          `Tautan /r/${config.dynamicSlug.trim()} berhasil didaftarkan dan siap dialihkan.`,
          'success'
        )
        fetchDynamicList()
      } else {
        setDynamicNotice(`Error: ${data.error || 'Gagal menyimpan ke database'}`)
        showToast('Gagal Menyimpan', data.error || 'Gagal menyimpan tautan dinamis.', 'error')
      }
    } catch {
      setDynamicNotice('Error: Tidak dapat terhubung ke server API')
      showToast('Koneksi Gagal', 'Tidak dapat terhubung ke server API.', 'error')
    } finally {
      setIsSavingDynamic(false)
    }
  }

  const handleUpdateTarget = async (slug: string) => {
    if (!editTargetUrl.trim()) return
    try {
      const res = await fetch(`/api/qr/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl: editTargetUrl.trim() }),
      })
      if (res.ok) {
        setEditingSlug(null)
        setEditTargetUrl('')
        showToast('Target URL Diperbarui!', `Pengalihan /r/${slug} kini mengarah ke URL baru.`, 'success')
        fetchDynamicList()
      } else {
        showToast('Gagal Memperbarui', 'Gagal memperbarui target URL.', 'error')
      }
    } catch {
      showToast('Koneksi Gagal', 'Koneksi ke server API gagal.', 'error')
    }
  }

  const generateRandomSlug = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789'
    let s = ''
    for (let i = 0; i < 6; i++) {
      s += chars[Math.floor(Math.random() * chars.length)]
    }
    setConfig((prev) => ({ ...prev, dynamicSlug: s }))
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      showToast('Ukuran Terlalu Besar', 'Logo maksimal 2MB agar scannability tetap terjaga.', 'error')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setConfig((prev) => ({
        ...prev,
        logoUrl: reader.result as string,
        errorCorrection: 'H',
      }))
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left: Input & Customizer Controls (7 cols) */}
      <div className="lg:col-span-7 space-y-6">
        {/* Mode Selector Tabs (Static vs Dynamic) */}
        <div className="border border-[#EAE5DC] dark:border-[#272A33] bg-white dark:bg-[#1A1B20] rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#EAE5DC] dark:border-[#272A33] gap-2">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#57534E] dark:text-[#A8A29E]">
              Tipe Mode QR
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfig({ ...config, isDynamic: false })}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors cursor-pointer ${
                  !config.isDynamic
                    ? 'bg-[#E14D2A] text-white shadow-sm shadow-[#E14D2A]/25'
                    : 'text-[#57534E] dark:text-[#A8A29E] hover:bg-[#F3EFEA] dark:hover:bg-[#22242B]'
                }`}
              >
                Mode Statis (Offline)
              </button>
              <button
                type="button"
                onClick={() => setConfig({ ...config, isDynamic: true })}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
                  config.isDynamic
                    ? 'bg-[#E14D2A] text-white shadow-sm shadow-[#E14D2A]/25'
                    : 'text-[#57534E] dark:text-[#A8A29E] hover:bg-[#F3EFEA] dark:hover:bg-[#22242B]'
                }`}
              >
                <span>Dynamic QR</span>
              </button>
            </div>
          </div>

          {/* DYNAMIC QR PANEL */}
          {config.isDynamic ? (
            <div className="space-y-4">
              <div className="p-3 bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] rounded-lg text-xs text-[#57534E] dark:text-[#A8A29E] space-y-1">
                <span className="font-semibold text-[#1C1917] dark:text-[#F5F4F0]">
                  Keunggulan Dynamic QR:
                </span>
                <p className="leading-relaxed">
                  QR fisik yang sudah dicetak tidak perlu diganti. Kapan pun link tujuan berubah, cukup ubah Target URL di sini dan pengalihan otomatis diperbarui seketika.
                </p>
              </div>

              {/* Slug Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-[#111111] dark:text-[#EDEDED]">
                    Slug / Tautan Pendek (Shortlink)
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomSlug}
                    className="text-xs text-[#1F6C9F] dark:text-[#8ec5fc] hover:underline cursor-pointer"
                  >
                    Acak Slug
                  </button>
                </div>
                <div className="flex items-center border border-[#EAEAEA] dark:border-[#232326] rounded-lg bg-transparent overflow-hidden">
                  <span className="px-3 py-2 text-xs font-mono-code bg-[#F4F4F3] dark:bg-[#1C1C1F] text-[#8F8E8A] border-r border-[#EAEAEA] dark:border-[#232326]">
                    /r/
                  </span>
                  <input
                    type="text"
                    value={config.dynamicSlug}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        dynamicSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''),
                      })
                    }
                    placeholder="nama-promo"
                    className="flex-1 px-3 py-2 text-xs font-mono-code outline-none bg-transparent text-[#111111] dark:text-[#EDEDED]"
                  />
                </div>
              </div>

              {/* Target URL */}
              <div>
                <label className="block text-sm font-medium text-[#111111] dark:text-[#EDEDED] mb-1.5">
                  Target URL Tujuan Asli (Bisa diedit sewaktu-waktu)
                </label>
                <input
                  type="url"
                  value={config.dynamicTargetUrl}
                  onChange={(e) => setConfig({ ...config, dynamicTargetUrl: e.target.value })}
                  placeholder="https://instagram.com/toko-anda"
                  className="w-full px-3.5 py-2 text-xs font-mono-code border border-[#EAEAEA] dark:border-[#232326] rounded-lg bg-transparent outline-none focus:border-[#111111] dark:focus:border-white transition-colors"
                />
              </div>

              {/* PIN & Expiration Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-sm font-medium text-[#111111] dark:text-[#EDEDED] mb-1">
                    Proteksi PIN Rahasia (Opsional)
                  </label>
                  <input
                    type="password"
                    value={config.pin || ''}
                    onChange={(e) => setConfig({ ...config, pin: e.target.value })}
                    placeholder="Contoh: 1234"
                    className="w-full px-3 py-1.5 text-xs font-mono-code border border-[#EAEAEA] dark:border-[#232326] rounded-md bg-transparent outline-none"
                  />
                  <span className="text-[10px] text-[#8F8E8A]">Pemindai harus isi PIN sebelum dialihkan</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#111111] dark:text-[#EDEDED] mb-1">
                    Batas Kedaluwarsa (Opsional)
                  </label>
                  <input
                    type="date"
                    value={config.expiresAt ? config.expiresAt.slice(0, 10) : ''}
                    onChange={(e) => setConfig({ ...config, expiresAt: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs font-mono-code border border-[#EAEAEA] dark:border-[#232326] rounded-md bg-transparent outline-none"
                  />
                  <span className="text-[10px] text-[#8F8E8A]">Tautan otomatis nonaktif setelah tanggal ini</span>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-1 flex items-center gap-3">
                <button
                  type="button"
                  disabled={isSavingDynamic}
                  onClick={handleSaveDynamic}
                  className="px-4 py-2 text-xs font-semibold bg-[#E14D2A] hover:bg-[#C83B1B] text-white rounded-lg active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 shadow-sm shadow-[#E14D2A]/20"
                >
                  {isSavingDynamic ? 'Menyimpan...' : 'Simpan & Aktifkan Tautan'}
                </button>
                {dynamicNotice && (
                  <span className="text-xs font-medium text-[#2D6A4F] dark:text-emerald-400">
                    {dynamicNotice}
                  </span>
                )}
              </div>

              {/* Active Dynamic QR List */}
              {dynamicList.length > 0 && (
                <div className="pt-4 border-t border-[#EAE5DC] dark:border-[#272A33] space-y-2.5">
                  <span className="text-xs font-semibold text-[#1C1917] dark:text-[#F5F4F0]">
                    Daftar Dynamic QR Aktif:
                  </span>
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {dynamicList.map((item) => (
                      <div
                        key={item.slug}
                        className="p-3 bg-[#FBFBFA] dark:bg-[#0C0C0D] border border-[#EAEAEA] dark:border-[#232326] rounded-lg text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold font-mono-code text-[#111111] dark:text-[#EDEDED]">
                            /r/{item.slug}
                          </span>
                          <span className="text-xs font-mono-code px-2 py-0.5 rounded bg-[#EDF3EC] text-[#346538] dark:bg-[#1A2E1C] dark:text-[#8FD194]">
                            {item.total_scans || 0} Total Scan
                          </span>
                        </div>

                        {editingSlug === item.slug ? (
                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="url"
                              value={editTargetUrl}
                              onChange={(e) => setEditTargetUrl(e.target.value)}
                              placeholder="URL target baru..."
                              className="flex-1 px-2.5 py-1 text-xs border border-[#EAEAEA] dark:border-[#232326] rounded bg-white dark:bg-[#141415] font-mono-code"
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateTarget(item.slug)}
                              className="px-2.5 py-1 text-xs font-semibold bg-[#111111] text-white dark:bg-white dark:text-[#111111] rounded"
                            >
                              Simpan
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingSlug(null)}
                              className="px-2.5 py-1 text-xs text-[#8F8E8A]"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-xs text-[#6F6E6B] dark:text-[#9B9A97]">
                            <span className="truncate max-w-xs">{item.target_url}</span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setConfig((prev) => ({
                                    ...prev,
                                    isDynamic: true,
                                    dynamicSlug: item.slug,
                                    dynamicTargetUrl: item.target_url,
                                  }))
                                }}
                                className="text-[#1F6C9F] dark:text-[#8ec5fc] hover:underline cursor-pointer"
                              >
                                Tampilkan QR
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingSlug(item.slug)
                                  setEditTargetUrl(item.target_url)
                                }}
                                className="text-[#111111] dark:text-white hover:underline cursor-pointer flex items-center gap-1"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Ubah Target</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* STATIC PAYLOAD FORM */
            <div>
              <div className="flex flex-wrap gap-2 pb-5">
                {[
                  { id: 'url', label: 'Website / Link', icon: Globe },
                  { id: 'whatsapp', label: 'Chat WhatsApp', icon: MessageCircle },
                  { id: 'wifi', label: 'Sandi Wi-Fi', icon: Wifi },
                  { id: 'text', label: 'Teks Bebas', icon: FileText },
                  { id: 'email', label: 'Kirim Email', icon: Mail },
                  { id: 'vcard', label: 'Kontak (vCard)', icon: Contact },
                ].map((tab) => {
                  const TabIcon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setConfig({ ...config, payloadType: tab.id as PayloadType })}
                      className={`px-3.5 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                        config.payloadType === tab.id
                          ? 'bg-[#E14D2A] text-white shadow-sm shadow-[#E14D2A]/25'
                          : 'border border-[#EAE5DC] dark:border-[#272A33] text-[#57534E] dark:text-[#A8A29E] hover:bg-[#F3EFEA] dark:hover:bg-[#22242B]'
                      }`}
                    >
                      <TabIcon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Payload Fields */}
              <div className="space-y-4">
                {config.payloadType === 'url' && (
                  <div>
                    <label className="block text-sm font-semibold text-[#1C1917] dark:text-[#F5F4F0] mb-2">
                      Alamat Website (URL)
                    </label>
                    <input
                      type="url"
                      value={config.rawText}
                      onChange={(e) => setConfig({ ...config, rawText: e.target.value })}
                      placeholder="Contoh: https://instagram.com/tokoanda atau https://tokopedia.com"
                      className="w-full px-4 py-3 text-sm border border-[#EAE5DC] dark:border-[#272A33] bg-transparent rounded-xl focus:outline-none focus:border-[#E14D2A] font-mono-code transition-colors"
                    />
                    <p className="text-xs text-[#78716C] mt-1.5">
                      Pengunjung yang memindai kode QR akan otomatis membuka halaman web ini.
                    </p>
                  </div>
                )}

                {config.payloadType === 'whatsapp' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-[#111111] dark:text-[#EDEDED] mb-1.5">
                        Nomor WhatsApp (dengan kode negara)
                      </label>
                      <input
                        type="tel"
                        value={config.whatsapp.phone}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            whatsapp: { ...config.whatsapp, phone: e.target.value },
                          })
                        }
                        placeholder="Contoh: 6281234567890 (awalan 62)"
                        className="w-full px-3.5 py-2 text-sm border border-[#EAEAEA] dark:border-[#232326] bg-transparent rounded-lg focus:outline-none focus:border-[#111111] dark:focus:border-white font-mono-code transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#111111] dark:text-[#EDEDED] mb-1.5">
                        Pesan Pembuka Otomatis (Opsional)
                      </label>
                      <textarea
                        rows={2}
                        value={config.whatsapp.message}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            whatsapp: { ...config.whatsapp, message: e.target.value },
                          })
                        }
                        placeholder="Contoh: Halo Admin, saya ingin bertanya tentang produk..."
                        className="w-full px-3.5 py-2 text-sm border border-[#EAEAEA] dark:border-[#232326] bg-transparent rounded-lg focus:outline-none focus:border-[#111111] dark:focus:border-white transition-colors"
                      />
                    </div>
                  </div>
                )}

                {config.payloadType === 'wifi' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-[#111111] dark:text-[#EDEDED] mb-1.5">
                        Nama Jaringan (SSID)
                      </label>
                      <input
                        type="text"
                        value={config.wifi.ssid}
                        onChange={(e) =>
                          setConfig({ ...config, wifi: { ...config.wifi, ssid: e.target.value } })
                        }
                        placeholder="Nama WiFi Kafe/Kantor"
                        className="w-full px-3.5 py-2 text-sm border border-[#EAEAEA] dark:border-[#232326] bg-transparent rounded-lg focus:outline-none focus:border-[#111111] dark:focus:border-white transition-colors"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-[#111111] dark:text-[#EDEDED] mb-1.5">
                          Password
                        </label>
                        <input
                          type="text"
                          value={config.wifi.password}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              wifi: { ...config.wifi, password: e.target.value },
                            })
                          }
                          placeholder="Password WiFi"
                          className="w-full px-3.5 py-2 text-sm border border-[#EAEAEA] dark:border-[#232326] bg-transparent rounded-lg focus:outline-none focus:border-[#111111] dark:focus:border-white font-mono-code transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#111111] dark:text-[#EDEDED] mb-1.5">
                          Enkripsi
                        </label>
                        <select
                          value={config.wifi.encryption}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              wifi: {
                                ...config.wifi,
                                encryption: e.target.value as 'WPA' | 'WEP' | 'nopass',
                              },
                            })
                          }
                          className="w-full px-3 py-2 text-sm border border-[#EAEAEA] dark:border-[#232326] bg-white dark:bg-[#141415] rounded-lg focus:outline-none focus:border-[#111111] dark:focus:border-white"
                        >
                          <option value="WPA">WPA / WPA2 / WPA3</option>
                          <option value="WEP">WEP</option>
                          <option value="nopass">Tanpa Password</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {config.payloadType === 'text' && (
                  <div>
                    <label className="block text-sm font-medium text-[#111111] dark:text-[#EDEDED] mb-1.5">
                      Teks Plain
                    </label>
                    <textarea
                      rows={3}
                      value={config.rawText}
                      onChange={(e) => setConfig({ ...config, rawText: e.target.value })}
                      placeholder="Ketik teks apa pun di sini..."
                      className="w-full px-3.5 py-2 text-sm border border-[#EAEAEA] dark:border-[#232326] bg-transparent rounded-lg focus:outline-none focus:border-[#111111] dark:focus:border-white font-mono-code transition-colors"
                    />
                  </div>
                )}

                {config.payloadType === 'email' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-[#111111] dark:text-[#EDEDED] mb-1.5">
                        Alamat Email Penerima
                      </label>
                      <input
                        type="email"
                        value={config.email.to}
                        onChange={(e) =>
                          setConfig({ ...config, email: { ...config.email, to: e.target.value } })
                        }
                        placeholder="nama@perusahaan.com"
                        className="w-full px-3.5 py-2 text-sm border border-[#EAEAEA] dark:border-[#232326] bg-transparent rounded-lg focus:outline-none focus:border-[#111111] dark:focus:border-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#111111] dark:text-[#EDEDED] mb-1.5">
                        Subjek
                      </label>
                      <input
                        type="text"
                        value={config.email.subject}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            email: { ...config.email, subject: e.target.value },
                          })
                        }
                        placeholder="Permintaan informasi..."
                        className="w-full px-3.5 py-2 text-sm border border-[#EAEAEA] dark:border-[#232326] bg-transparent rounded-lg focus:outline-none focus:border-[#111111] dark:focus:border-white transition-colors"
                      />
                    </div>
                  </div>
                )}

                {config.payloadType === 'vcard' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-[#111111] dark:text-[#EDEDED] mb-1.5">
                        Nama Depan
                      </label>
                      <input
                        type="text"
                        value={config.vcard.firstName}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            vcard: { ...config.vcard, firstName: e.target.value },
                          })
                        }
                        placeholder="Budi"
                        className="w-full px-3 py-1.5 text-sm border border-[#EAEAEA] dark:border-[#232326] bg-transparent rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#111111] dark:text-[#EDEDED] mb-1.5">
                        Nama Belakang
                      </label>
                      <input
                        type="text"
                        value={config.vcard.lastName}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            vcard: { ...config.vcard, lastName: e.target.value },
                          })
                        }
                        placeholder="Santoso"
                        className="w-full px-3 py-1.5 text-sm border border-[#EAEAEA] dark:border-[#232326] bg-transparent rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#111111] dark:text-[#EDEDED] mb-1.5">
                        Nomor HP
                      </label>
                      <input
                        type="tel"
                        value={config.vcard.phone}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            vcard: { ...config.vcard, phone: e.target.value },
                          })
                        }
                        placeholder="+62812345678"
                        className="w-full px-3 py-1.5 text-sm border border-[#EAEAEA] dark:border-[#232326] bg-transparent rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#111111] dark:text-[#EDEDED] mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        value={config.vcard.email}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            vcard: { ...config.vcard, email: e.target.value },
                          })
                        }
                        placeholder="budi@example.com"
                        className="w-full px-3 py-1.5 text-sm border border-[#EAEAEA] dark:border-[#232326] bg-transparent rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Visual Customizer Panel */}
        <div className="border border-[#EAE5DC] dark:border-[#272A33] bg-white dark:bg-[#1A1B20] rounded-2xl p-6 sm:p-7 space-y-6 shadow-xs">
          <div className="pb-3 border-b border-[#EAE5DC] dark:border-[#272A33] flex items-center justify-between">
            <h3 className="text-base font-bold text-[#1C1917] dark:text-[#F5F4F0]">
              Kustomisasi Visual & Logo
            </h3>
            <span className="text-xs text-[#78716C]">Clean Vector Styling</span>
          </div>

          {/* Preset Studio Box */}
          <div className="p-3 bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] rounded-lg space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#1C1917] dark:text-[#F5F4F0]">
                Template Desain Brand:
              </span>
              {presetNotice && (
                <span className="text-xs text-[#2D6A4F] dark:text-emerald-400 font-medium">
                  {presetNotice}
                </span>
              )}
            </div>

            {presets.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {presets.map((p) => (
                  <div
                    key={p.id}
                    className="inline-flex items-center border border-[#EAE5DC] dark:border-[#272A33] bg-white dark:bg-[#1A1B20] rounded-md overflow-hidden text-xs"
                  >
                    <button
                      type="button"
                      onClick={() => handleLoadPreset(p)}
                      className="px-2 py-1 text-[#1C1917] dark:text-[#F5F4F0] hover:bg-[#F3EFEA] dark:hover:bg-[#22242B] cursor-pointer flex items-center gap-1"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/20"
                        style={{ backgroundColor: p.config?.fgColor || '#E14D2A' }}
                      />
                      <span>{p.name}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePreset(p.id, p.name)}
                      className="px-1.5 py-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer border-l border-[#EAE5DC] dark:border-[#272A33] flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 pt-1 text-xs">
              <input
                type="text"
                value={presetNameInput}
                onChange={(e) => setPresetNameInput(e.target.value)}
                placeholder="Nama template (cth: Brand Kafe)..."
                className="flex-1 px-2.5 py-1 text-xs border border-[#EAE5DC] dark:border-[#272A33] rounded bg-white dark:bg-[#1A1B20]"
              />
              <button
                type="button"
                onClick={handleSavePreset}
                className="px-3 py-1 font-semibold bg-[#E14D2A] hover:bg-[#C83B1B] text-white rounded cursor-pointer transition-colors"
              >
                Simpan Desain Ini
              </button>
            </div>
          </div>

          {/* Color pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#6F6E6B] dark:text-[#9B9A97] mb-1.5">
                Warna QR (Foreground)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.fgColor}
                  onChange={(e) => setConfig({ ...config, fgColor: e.target.value })}
                  className="w-8 h-8 rounded border border-[#EAEAEA] dark:border-[#232326] cursor-pointer p-0 bg-transparent"
                />
                <input
                  type="text"
                  value={config.fgColor}
                  onChange={(e) => setConfig({ ...config, fgColor: e.target.value })}
                  className="flex-1 px-3 py-1.5 text-xs font-mono-code uppercase border border-[#EAEAEA] dark:border-[#232326] rounded-md bg-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#6F6E6B] dark:text-[#9B9A97] mb-1.5">
                Warna Latar (Background)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.bgColor}
                  onChange={(e) => setConfig({ ...config, bgColor: e.target.value })}
                  className="w-8 h-8 rounded border border-[#EAEAEA] dark:border-[#232326] cursor-pointer p-0 bg-transparent"
                />
                <input
                  type="text"
                  value={config.bgColor}
                  onChange={(e) => setConfig({ ...config, bgColor: e.target.value })}
                  className="flex-1 px-3 py-1.5 text-xs font-mono-code uppercase border border-[#EAEAEA] dark:border-[#232326] rounded-md bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* Dot and Corner shapes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#6F6E6B] dark:text-[#9B9A97] mb-1.5">
                Bentuk Dot
              </label>
              <select
                value={config.dotStyle}
                onChange={(e) => setConfig({ ...config, dotStyle: e.target.value as DotStyle })}
                className="w-full px-3 py-1.5 text-xs border border-[#EAEAEA] dark:border-[#232326] bg-white dark:bg-[#141415] rounded-lg focus:outline-none"
              >
                <option value="rounded">Rounded</option>
                <option value="dots">Dots (Lingkaran)</option>
                <option value="classy">Classy</option>
                <option value="classy-rounded">Classy Rounded</option>
                <option value="square">Square (Klasik)</option>
                <option value="extra-rounded">Extra Rounded</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#6F6E6B] dark:text-[#9B9A97] mb-1.5">
                Bentuk Sudut (Corner)
              </label>
              <select
                value={config.cornerStyle}
                onChange={(e) =>
                  setConfig({ ...config, cornerStyle: e.target.value as CornerStyle })
                }
                className="w-full px-3 py-1.5 text-xs border border-[#EAEAEA] dark:border-[#232326] bg-white dark:bg-[#141415] rounded-lg focus:outline-none"
              >
                <option value="extra-rounded">Extra Rounded</option>
                <option value="dot">Dot</option>
                <option value="square">Square</option>
              </select>
            </div>
          </div>

          {/* Frame Banner Customizer */}
          <div className="pt-2">
            <label className="block text-sm font-medium text-[#57534E] dark:text-[#A8A29E] mb-1.5">
              Bingkai Teks Cetak (Frame Banner)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-xs">
              {[
                { id: 'none', label: 'Polos' },
                { id: 'scan_me', label: 'SCAN SAYA' },
                { id: 'menu', label: 'MENU KAFE' },
                { id: 'wifi', label: 'WIFI GRATIS' },
                { id: 'pay', label: 'BAYAR DI SINI' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFrameBanner(f.id as typeof frameBanner)}
                  className={`py-1.5 px-2 rounded-lg font-medium transition-colors cursor-pointer text-center truncate ${
                    frameBanner === f.id
                      ? 'bg-[#E14D2A] text-white shadow-xs'
                      : 'border border-[#EAE5DC] dark:border-[#272A33] text-[#57534E] dark:text-[#A8A29E] hover:bg-[#F3EFEA] dark:hover:bg-[#22242B]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Logo Upload Section */}
          <div className="pt-3 border-t border-[#EAEAEA] dark:border-[#232326] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[#111111] dark:text-[#EDEDED]">
                Sematkan Logo di Tengah (Opsional)
              </label>
              {config.logoUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setConfig({ ...config, logoUrl: '', errorCorrection: 'Q' })
                    showToast('Logo Dihapus', 'Logo di tengah QR Code telah dicopot.', 'info')
                  }}
                  className="text-xs text-rose-600 hover:underline cursor-pointer font-medium"
                >
                  Hapus Logo
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm flex-1 flex items-center justify-center border border-dashed border-[#EAEAEA] dark:border-[#232326] rounded-lg py-2.5 px-4 cursor-pointer hover:border-[#111111] dark:hover:border-white transition-colors">
                <span className="text-xs text-[#6F6E6B] dark:text-[#9B9A97]">
                  {config.logoUrl ? 'Ganti file logo (PNG/SVG/WEBP)' : 'Pilih file logo (PNG/SVG/WEBP)'}
                </span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/svg+xml, image/webp"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
            </div>

            {config.logoUrl && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-[#6F6E6B] dark:text-[#9B9A97]">
                  <span>Ukuran Logo</span>
                  <span>{Math.round(config.logoSize * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.15"
                  max="0.32"
                  step="0.01"
                  value={config.logoSize}
                  onChange={(e) =>
                    setConfig({ ...config, logoSize: parseFloat(e.target.value) })
                  }
                  className="w-full accent-[#111111] dark:accent-white"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right: Live Preview & Export Hub (5 cols) */}
      <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-6">
        <div className="relative border border-[#EAE5DC] dark:border-[#272A33] bg-white dark:bg-[#1A1B20] rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col items-center overflow-hidden">
          <BorderBeam size={160} duration={12} colorFrom="#E14D2A" colorTo="#D4A373" />

          <div className="w-full flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-[#EAE5DC] dark:border-[#272A33]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#1C1917] dark:text-[#F5F4F0]">
                Pratinjau Nyata
              </span>
              {config.isDynamic && (
                <span className="text-[10px] font-mono-code px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 font-bold">
                  DYNAMIC
                </span>
              )}
            </div>
            <span className="text-xs font-mono-code text-[#78716C]">
              Rasio Kontras: {scannability.ratio}:1
            </span>
          </div>

          {/* Preview Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] rounded-xl w-full mb-4 text-xs font-medium">
            <button
              type="button"
              aria-label="Kanvas"
              onClick={() => setPreviewMode('canvas')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                previewMode === 'canvas'
                  ? 'bg-white dark:bg-[#1A1B20] text-[#E14D2A] font-bold shadow-xs'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kanvas</span>
            </button>
            <button
              type="button"
              aria-label="Standee Meja"
              onClick={() => setPreviewMode('standee')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                previewMode === 'standee'
                  ? 'bg-white dark:bg-[#1A1B20] text-[#E14D2A] font-bold shadow-xs'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Standee Meja</span>
            </button>
            <button
              type="button"
              aria-label="Kamera HP"
              onClick={() => setPreviewMode('scanner')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                previewMode === 'scanner'
                  ? 'bg-white dark:bg-[#1A1B20] text-[#E14D2A] font-bold shadow-xs'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kamera HP</span>
            </button>
          </div>

          {/* Standee Mockup Container */}
          {previewMode === 'standee' ? (
            <div className="w-full p-4 sm:p-6 bg-gradient-to-b from-[#F3EFEA] to-[#EAE5DC] dark:from-[#1E2028] dark:to-[#121316] rounded-2xl flex flex-col items-center justify-center border border-[#EAE5DC] dark:border-[#272A33] shadow-inner">
              <div className="w-full max-w-[260px] bg-white text-[#1C1917] p-5 rounded-2xl shadow-xl border border-slate-200 text-center space-y-3 relative">
                <div className="font-extrabold text-xs tracking-wider uppercase text-[#E14D2A] font-mono-code">
                  {frameBanner === 'none' ? 'SCAN DI SINI' : frameBanner.replace('_', ' ').toUpperCase()}
                </div>
                <div className="flex items-center justify-center overflow-hidden p-2 bg-white rounded-xl border border-slate-100">
                  <div ref={qrRef} className="overflow-hidden flex items-center justify-center max-w-full [&>canvas]:max-w-full [&>canvas]:h-auto [&>svg]:max-w-full [&>svg]:h-auto" />
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  Arahkan kamera smartphone Anda untuk membuka tautan
                </div>
              </div>
              <div className="w-32 h-2.5 bg-black/10 dark:bg-black/30 rounded-full blur-xs mt-2" />
            </div>
          ) : previewMode === 'scanner' ? (
            /* Smartphone Viewfinder Mockup */
            <div className="w-full p-4 sm:p-6 bg-[#0E0F12] rounded-2xl flex flex-col items-center justify-center border border-slate-800 relative overflow-hidden">
              <div className="w-full max-w-[260px] rounded-3xl border-4 border-slate-700 bg-black/90 p-4 text-center space-y-3 shadow-2xl">
                <div className="flex items-center justify-between text-[10px] font-mono-code text-slate-400 pt-1">
                  <span>Kamera 1x</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span>QR Terdeteksi</span>
                    <Check className="w-3 h-3" />
                  </span>
                </div>

                <div className="relative p-2">
                  {/* Viewfinder brackets hug the QR card, not the phone frame */}
                  <div className="absolute inset-0 pointer-events-none border-2 border-emerald-400/80 rounded-2xl animate-pulse" />
                  <div className="flex items-center justify-center overflow-hidden p-2 bg-white rounded-xl">
                    <div ref={qrRef} className="overflow-hidden flex items-center justify-center max-w-full [&>canvas]:max-w-full [&>canvas]:h-auto [&>svg]:max-w-full [&>svg]:h-auto" />
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-[10px] font-mono-code text-slate-200 truncate flex items-center gap-1.5">
                  <Link2 className="w-3 h-3 shrink-0 text-slate-400" />
                  <span className="truncate">{payloadString}</span>
                </div>
              </div>
            </div>
          ) : (
            /* Standard Canvas Mode with optional Frame Banner & Shine Border */
            <div className="w-full flex flex-col items-center">
              {frameBanner !== 'none' && (
                <div className="mb-2 text-xs font-extrabold font-mono-code uppercase tracking-wider text-[#E14D2A] px-3 py-1 rounded-full bg-[#E14D2A]/10 border border-[#E14D2A]/20">
                  {frameBanner === 'scan_me'
                    ? 'SCAN SAYA'
                    : frameBanner === 'menu'
                    ? 'MENU KAFE'
                    : frameBanner === 'wifi'
                    ? 'WIFI GRATIS'
                    : 'BAYAR DI SINI'}
                </div>
              )}

              {/* Magic UI Shine Border on QR Canvas Render Container */}
              <ShineBorder
                borderRadius={20}
                borderWidth={2}
                duration={10}
                color={['#E14D2A', '#F06543', '#D4A373', '#E14D2A']}
                className="w-full flex items-center justify-center p-1 bg-[#FAF8F5] dark:bg-[#121316]"
              >
                <div
                  className="p-3 sm:p-5 w-full rounded-[18px] flex items-center justify-center transition-colors shadow-inner"
                  style={{ backgroundColor: config.bgColor }}
                >
                  <div ref={qrRef} className="overflow-hidden flex items-center justify-center max-w-full [&>canvas]:max-w-full [&>canvas]:h-auto [&>svg]:max-w-full [&>svg]:h-auto" />
                </div>
              </ShineBorder>
            </div>
          )}

          {/* Contrast & Scannability Guard Banner */}
          {scannability.warning && (
            <div
              className={`mt-4 w-full p-2.5 rounded-lg text-xs leading-relaxed border ${
                scannability.safe
                  ? 'bg-[#FBF3DB] text-[#956400] border-[#E8D9A8]'
                  : 'bg-[#FDEBEC] text-[#9F2F2D] border-[#F2B8B8]'
              }`}
            >
              <strong>Perhatian:</strong> {scannability.warning}
            </div>
          )}

          {/* Encoded payload inspect */}
          <div className="w-full mt-4 p-2.5 bg-[#FBFBFA] dark:bg-[#0C0C0D] border border-[#EAEAEA] dark:border-[#232326] rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#8F8E8A] dark:text-[#6E6D6A]">
                {config.isDynamic ? 'Tautan Pengalihan (Shortlink):' : 'Payload Terkode:'}
              </span>
              <div className="flex gap-2">
                {config.isDynamic && (
                  <a
                    href={payloadString}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#1F6C9F] dark:text-[#8ec5fc] hover:underline flex items-center gap-1"
                  >
                    <span>Uji Buka</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(payloadString)
                    setIsCopied(true)
                    setTimeout(() => setIsCopied(false), 1500)
                  }}
                  className="text-xs text-[#111111] dark:text-white hover:underline cursor-pointer"
                >
                  {isCopied ? 'Tersalin' : 'Salin'}
                </button>
              </div>
            </div>
            <p className="text-xs font-mono-code text-[#111111] dark:text-[#EDEDED] truncate">
              {payloadString}
            </p>
          </div>

          {/* Export Controls */}
          <div className="w-full mt-6 space-y-4">
            <div className="flex items-center justify-between text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E] font-medium">
              <span>Resolusi Ekspor</span>
              <div className="flex gap-2">
                {[512, 1024, 2048].map((res) => (
                  <button
                    key={res}
                    type="button"
                    onClick={() => setExportSize(res)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono-code font-bold transition-all ${
                      exportSize === res
                        ? 'bg-[#E14D2A] text-white shadow-xs'
                        : 'border border-[#EAE5DC] dark:border-[#272A33] hover:bg-[#F3EFEA] dark:hover:bg-[#22242B]'
                    }`}
                  >
                    {res}px
                  </button>
                ))}
              </div>
            </div>

            {/* Download Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => handleDownload('png')}
                className="w-full py-3.5 px-4 text-sm font-bold bg-[#E14D2A] hover:bg-[#C83B1B] text-white rounded-xl shadow-md shadow-[#E14D2A]/25 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Gambar QR (Format PNG)</span>
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleDownload('svg')}
                  className="py-2.5 px-3 font-semibold border border-[#EAE5DC] dark:border-[#272A33] bg-transparent text-[#1C1917] dark:text-[#F5F4F0] rounded-xl hover:bg-[#F3EFEA] dark:hover:bg-[#22242B] active:scale-[0.98] transition-all cursor-pointer text-center"
                >
                  Vektor SVG (Cetak Besar)
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload('jpeg')}
                  className="py-2.5 px-3 font-semibold border border-[#EAE5DC] dark:border-[#272A33] bg-transparent text-[#1C1917] dark:text-[#F5F4F0] rounded-xl hover:bg-[#F3EFEA] dark:hover:bg-[#22242B] active:scale-[0.98] transition-all cursor-pointer text-center"
                >
                  Format JPEG
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
