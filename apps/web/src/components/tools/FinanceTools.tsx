import { useState, useEffect } from 'react'
import { Save, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { useToast } from '../../lib/toast'
import { useConfirm } from '../../lib/confirm'

export function FinanceTools({
  initialTool = 'invoice',
  hideTabs = true,
}: {
  initialTool?: string
  hideTabs?: boolean
}) {
  const [userTab, setUserTab] = useState<'invoice' | 'receipt' | 'currency' | 'loan' | 'tax' | null>(null)
  const activeSub = !hideTabs && userTab ? userTab : (
    initialTool === 'receipt'
      ? 'receipt'
      : initialTool === 'currency'
      ? 'currency'
      : initialTool === 'loan'
      ? 'loan'
      : initialTool === 'tax'
      ? 'tax'
      : 'invoice'
  )

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Subtab navigation */}
      {!hideTabs && (
        <div className="flex flex-wrap border-b border-[#EAE5DC] dark:border-[#272A33] gap-x-4 gap-y-1 pb-1">
          {[
            { id: 'invoice', label: 'Generator Invoice' },
            { id: 'receipt', label: 'Bon Kasir / Struk' },
            { id: 'currency', label: 'Konverter Kurs' },
            { id: 'loan', label: 'Kalkulator Pinjaman' },
            { id: 'tax', label: 'Kalkulator Pajak (PPh 21)' },
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

      {activeSub === 'invoice' && <InvoiceGenerator />}
      {activeSub === 'receipt' && <ReceiptGenerator />}
      {activeSub === 'currency' && <CurrencyConverter />}
      {activeSub === 'loan' && <LoanCalculator />}
      {activeSub === 'tax' && <TaxCalculator />}
    </div>
  )
}

function InvoiceGenerator() {
  const [fromCompany, setFromCompany] = useState('Studio Digital Anda')
  const [toClient, setToClient] = useState('PT Klien Sejahtera')
  const [invoiceNum, setInvoiceNum] = useState('INV-2026-001')
  const [items, setItems] = useState([
    { description: 'Desain UI/UX & Frontend Development', qty: 1, price: 5000000 },
    { description: 'Integrasi Custom QR Code System', qty: 1, price: 2000000 },
  ])
  const [taxPercent, setTaxPercent] = useState(11)
  const [invoices, setInvoices] = useState<Array<{
    id: number
    invoice_num: string
    from_company: string
    client_name: string
    total_amount: number
    status: string
    items: any[]
    created_at: string
  }>>([])
  const [saveStatus, setSaveStatus] = useState<string | null>(null)

  const { showToast } = useToast()
  const { ask } = useConfirm()

  const fetchInvoices = () => {
    fetch('/api/invoices')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setInvoices(data)
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetchInvoices()
  }, [])

  const handleSaveToVault = async () => {
    setSaveStatus('Menyimpan...')
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceNum,
          fromCompany,
          clientName: toClient,
          totalAmount: grandTotal,
          status: 'unpaid',
          items,
        }),
      })
      if (res.ok) {
        setSaveStatus('Tersimpan di Vault!')
        showToast('Faktur Tersimpan!', `Faktur ${invoiceNum} berhasil diarsipkan ke database.`, 'success')
        fetchInvoices()
        setTimeout(() => setSaveStatus(null), 2500)
      } else {
        setSaveStatus('Gagal menyimpan.')
        showToast('Gagal Menyimpan', 'Terjadi kesalahan saat mengarsipkan faktur.', 'error')
      }
    } catch {
      setSaveStatus('Koneksi server gagal.')
      showToast('Koneksi Gagal', 'Tidak dapat menghubungi server API.', 'error')
    }
  }

  const handleToggleStatus = async (id: number, current: string) => {
    const nextStatus = current === 'paid' ? 'unpaid' : 'paid'
    try {
      await fetch(`/api/invoices/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      showToast(
        'Status Faktur Diperbarui',
        `Faktur kini berstatus: ${nextStatus === 'paid' ? 'LUNAS' : 'BELUM LUNAS'}`,
        'info'
      )
      fetchInvoices()
    } catch {}
  }

  const handleDelete = (id: number) => {
    ask({
      title: 'Hapus Arsip Faktur Ini?',
      message: 'Faktur tagihan ini akan dihapus permanen dari database cloud Anda.',
      confirmText: 'Ya, Hapus Faktur',
      variant: 'danger',
      onConfirm: async () => {
        await fetch(`/api/invoices/${id}`, { method: 'DELETE' })
        showToast('Faktur Dihapus', 'Faktur berhasil dihapus dari arsip database.', 'info')
        fetchInvoices()
      },
    })
  }

  const handleLoad = (inv: (typeof invoices)[0]) => {
    setFromCompany(inv.from_company)
    setToClient(inv.client_name)
    setInvoiceNum(inv.invoice_num)
    if (Array.isArray(inv.items)) {
      setItems(inv.items)
    }
    showToast('Faktur Dimuat', `Faktur ${inv.invoice_num} berhasil dimuat ke formulir.`, 'info')
  }

  const addItem = () => {
    setItems([...items, { description: 'Item / Layanan Baru', qty: 1, price: 1000000 }])
    showToast('Baris Item Ditambahkan', 'Item baru ditambahkan ke daftar tagihan.', 'info')
  }

  const updateItem = (index: number, field: string, val: string | number) => {
    const next = [...items]
    next[index] = { ...next[index], [field]: val }
    setItems(next)
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
      showToast('Baris Item Dihapus', 'Item berhasil dihapus dari tagihan.', 'info')
    }
  }

  const subtotal = items.reduce((acc, curr) => acc + curr.qty * curr.price, 0)
  const taxAmount = (subtotal * taxPercent) / 100
  const grandTotal = subtotal + taxAmount

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="border border-[#EAEAEA] dark:border-[#232326] bg-white dark:bg-[#141415] rounded-xl p-6 shadow-xs space-y-6">
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#EAEAEA] dark:border-[#232326] gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[#1C1917] dark:text-[#F5F4F0]">
            Generator & Vault Invoice Tagihan
          </h3>
          <p className="text-xs text-[#78716C]">
            Buat faktur rapi, simpan arsip, dan cetak dokumen PDF.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveToVault}
            className="px-3 py-1.5 text-xs font-semibold border border-[#EAE5DC] dark:border-[#272A33] rounded-md hover:bg-[#F3EFEA] dark:hover:bg-[#22242B] cursor-pointer flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saveStatus || 'Simpan Faktur'}</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-1.5 text-xs font-semibold bg-[#E14D2A] hover:bg-[#C83B1B] text-white rounded-md active:scale-[0.98] cursor-pointer shadow-sm shadow-[#E14D2A]/20"
          >
            Cetak / Unduh PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="text-sm block text-[#6F6E6B] dark:text-[#9B9A97] mb-1">Nama Usaha / Pengirim</label>
          <input
            type="text"
            value={fromCompany}
            onChange={(e) => setFromCompany(e.target.value)}
            className="w-full px-3 py-1.5 border border-[#EAEAEA] dark:border-[#232326] rounded-md bg-transparent"
          />
        </div>

        <div>
          <label className="text-sm block text-[#6F6E6B] dark:text-[#9B9A97] mb-1">Nama Klien / Penerima</label>
          <input
            type="text"
            value={toClient}
            onChange={(e) => setToClient(e.target.value)}
            className="w-full px-3 py-1.5 border border-[#EAEAEA] dark:border-[#232326] rounded-md bg-transparent"
          />
        </div>

        <div>
          <label className="text-sm block text-[#6F6E6B] dark:text-[#9B9A97] mb-1">Nomor Invoice</label>
          <input
            type="text"
            value={invoiceNum}
            onChange={(e) => setInvoiceNum(e.target.value)}
            className="w-full px-3 py-1.5 border border-[#EAEAEA] dark:border-[#232326] rounded-md bg-transparent font-mono-code"
          />
        </div>

        <div>
          <label className="text-sm block text-[#6F6E6B] dark:text-[#9B9A97] mb-1">Pajak (PPN %)</label>
          <input
            type="number"
            value={taxPercent}
            onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-1.5 border border-[#EAEAEA] dark:border-[#232326] rounded-md bg-transparent font-mono-code"
          />
        </div>
      </div>

      {/* Items list */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs font-semibold text-[#111111] dark:text-[#EDEDED]">
          <span>Daftar Layanan / Barang</span>
          <button
            type="button"
            onClick={addItem}
            className="text-xs text-[#1F6C9F] dark:text-[#8ec5fc] hover:underline cursor-pointer"
          >
            + Tambah Item
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 sm:p-0 rounded-xl sm:rounded-none bg-[#FAF8F5] sm:bg-transparent dark:bg-[#121316] sm:dark:bg-transparent border border-[#EAE5DC] sm:border-0 dark:border-[#272A33]">
              <input
                type="text"
                value={item.description}
                onChange={(e) => updateItem(idx, 'description', e.target.value)}
                placeholder="Deskripsi layanan atau barang..."
                className="flex-1 px-3.5 py-2 text-xs sm:text-sm border border-[#EAE5DC] dark:border-[#272A33] rounded-xl bg-transparent"
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={item.qty}
                  onChange={(e) => updateItem(idx, 'qty', parseInt(e.target.value) || 1)}
                  placeholder="Jml"
                  className="w-20 px-2.5 py-2 text-xs sm:text-sm border border-[#EAE5DC] dark:border-[#272A33] rounded-xl bg-transparent text-center font-mono-code"
                />
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) => updateItem(idx, 'price', parseFloat(e.target.value) || 0)}
                  placeholder="Harga (Rp)"
                  className="flex-1 sm:w-36 px-3 py-2 text-xs sm:text-sm border border-[#EAE5DC] dark:border-[#272A33] rounded-xl bg-transparent font-mono-code"
                />
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="p-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl cursor-pointer flex items-center justify-center shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="pt-4 border-t border-[#EAEAEA] dark:border-[#232326] flex justify-end">
        <div className="w-64 space-y-2 text-xs font-mono-code">
          <div className="flex justify-between text-[#6F6E6B] dark:text-[#9B9A97]">
            <span>Subtotal:</span>
            <span>Rp {subtotal.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-[#6F6E6B] dark:text-[#9B9A97]">
            <span>PPN ({taxPercent}%):</span>
            <span>Rp {taxAmount.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-[#111111] dark:text-[#EDEDED] pt-2 border-t border-[#EAEAEA] dark:border-[#232326]">
            <span>Total Akhir:</span>
            <span>Rp {grandTotal.toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>

      {/* Saved Invoices Vault */}
      {invoices.length > 0 && (
        <div className="pt-6 border-t border-[#EAEAEA] dark:border-[#232326] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#1C1917] dark:text-[#F5F4F0]">
              Arsip Faktur Tersimpan ({invoices.length})
            </span>
            <span className="text-xs font-mono-code text-[#78716C]">Klik 'Muat' untuk mengisi form</span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="p-3 bg-[#FBFBFA] dark:bg-[#0C0C0D] border border-[#EAEAEA] dark:border-[#232326] rounded-lg text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono-code text-[#111111] dark:text-[#EDEDED]">
                      {inv.invoice_num}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(inv.id, inv.status)}
                      className={`text-[10px] font-mono-code font-bold uppercase px-2 py-0.5 rounded cursor-pointer ${
                        inv.status === 'paid'
                          ? 'bg-[#EDF3EC] text-[#346538] dark:bg-[#1A2E1C] dark:text-[#8FD194]'
                          : 'bg-[#FDEBEC] text-[#9F2F2D] dark:bg-[#2C1819] dark:text-[#E88C8F]'
                      }`}
                    >
                      {inv.status === 'paid' ? 'LUNAS' : 'BELUM LUNAS'}
                    </button>
                  </div>
                  <div className="text-xs text-[#6F6E6B] dark:text-[#9B9A97] mt-0.5">
                    Klien: {inv.client_name} • Rp {Number(inv.total_amount).toLocaleString('id-ID')}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleLoad(inv)}
                    className="px-2.5 py-1 text-xs border border-[#EAEAEA] dark:border-[#232326] rounded hover:bg-white dark:hover:bg-[#1C1C1F] text-[#1F6C9F] dark:text-[#8ec5fc] cursor-pointer"
                  >
                    Muat ke Form
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(inv.id)}
                    className="p-1 text-xs text-[#9F2F2D] hover:underline cursor-pointer"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ReceiptGenerator() {
  const [storeName, setStoreName] = useState('WARUNG KAFE KITTO')
  const [address, setAddress] = useState('Jl. Senopati No. 45, Jakarta Selatan')
  const [cashier, setCashier] = useState('Rian (Kasir 01)')
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>('58mm')
  const [paymentMethod, setPaymentMethod] = useState<'TUNAI' | 'QRIS' | 'DEBIT'>('QRIS')
  const [items, setItems] = useState([
    { name: 'Kopi Susu Gula Aren', qty: 2, price: 18000 },
    { name: 'Croissant Coklat Keju', qty: 1, price: 24000 },
    { name: 'Cold Brew Peach Tea', qty: 1, price: 22000 },
  ])
  const [paid, setPaid] = useState(100000)
  const [currentDate] = useState(() => new Date().toLocaleString('id-ID'))
  const [barcodeSeed] = useState(() => Math.floor(10000000 + Math.random() * 90000000))
  const { showToast } = useToast()

  const addItem = () => {
    setItems([...items, { name: 'Item Baru', qty: 1, price: 10000 }])
    showToast('Menu Struk Ditambahkan', 'Item baru ditambahkan ke daftar struk.', 'info')
  }

  const removeItem = (idx: number) => {
    if (items.length <= 1) return
    setItems(items.filter((_, i) => i !== idx))
    showToast('Menu Struk Dihapus', 'Item dihapus dari struk.', 'info')
  }

  const total = items.reduce((acc, curr) => acc + curr.qty * curr.price, 0)
  const change = Math.max(0, paid - total)

  return (
    <div className="border border-[#EAE5DC] dark:border-[#272A33] bg-white dark:bg-[#1A1B20] rounded-2xl p-6 shadow-xs space-y-6">
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#EAE5DC] dark:border-[#272A33] gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#1C1917] dark:text-[#F5F4F0]">
            Bon Kasir & Struk Thermal Interaktif
          </h3>
          <p className="text-xs text-[#78716C]">
            Pratinjau struk kasir thermal realistis (58mm/80mm) dengan barcode & metode bayar lengkap.
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="px-4 py-2 text-xs font-bold bg-[#E14D2A] text-white hover:bg-[#C83B1B] rounded-xl shadow-sm cursor-pointer"
        >
          Cetak Struk Sekarang
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Form Controls */}
        <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm block text-[#57534E] dark:text-[#A8A29E] mb-1 font-medium">Ukuran Lebar Kertas</label>
              <div className="flex gap-2">
                {(['58mm', '80mm'] as const).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setPaperWidth(w)}
                    className={`flex-1 py-1.5 rounded-lg font-mono-code transition-colors cursor-pointer ${
                      paperWidth === w
                        ? 'bg-[#E14D2A] text-white font-bold'
                        : 'border border-[#EAE5DC] dark:border-[#272A33] text-[#78716C]'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm block text-[#57534E] dark:text-[#A8A29E] mb-1 font-medium">Metode Pembayaran</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-2.5 py-1.5 border border-[#EAE5DC] dark:border-[#272A33] rounded-lg bg-transparent font-medium"
              >
                <option value="QRIS">QRIS Dinamis</option>
                <option value="TUNAI">Tunai / Cash</option>
                <option value="DEBIT">Kartu Debit</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm block text-[#57534E] dark:text-[#A8A29E] mb-1 font-medium">Nama Usaha / Toko</label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full px-3 py-2 border border-[#EAE5DC] dark:border-[#272A33] rounded-lg bg-transparent"
            />
          </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm block text-[#57534E] dark:text-[#A8A29E] mb-1 font-medium">Alamat Singkat</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-[#EAE5DC] dark:border-[#272A33] rounded-lg bg-transparent"
              />
            </div>
            <div>
              <label className="text-sm block text-[#57534E] dark:text-[#A8A29E] mb-1 font-medium">Nama Kasir</label>
              <input
                type="text"
                value={cashier}
                onChange={(e) => setCashier(e.target.value)}
                className="w-full px-3 py-2 border border-[#EAE5DC] dark:border-[#272A33] rounded-lg bg-transparent"
              />
            </div>
          </div>

          {/* Dynamic Item list on Receipt */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between font-medium">
              <span>Item Menu Pesanan</span>
              <button
                type="button"
                onClick={addItem}
                className="text-[#E14D2A] hover:underline cursor-pointer font-bold text-xs"
              >
                + Tambah Item
              </button>
            </div>
            {items.map((it, idx) => (
              <div key={idx} className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={it.name}
                  onChange={(e) => {
                    const next = [...items]
                    next[idx].name = e.target.value
                    setItems(next)
                  }}
                  className="w-full sm:w-auto sm:flex-1 px-2.5 py-1.5 border border-[#EAE5DC] dark:border-[#272A33] rounded-lg bg-transparent text-xs"
                />
                <input
                  type="number"
                  min="1"
                  value={it.qty}
                  onChange={(e) => {
                    const next = [...items]
                    next[idx].qty = parseInt(e.target.value) || 1
                    setItems(next)
                  }}
                  className="w-14 px-2 py-1.5 border border-[#EAE5DC] dark:border-[#272A33] rounded-lg bg-transparent text-center font-mono-code text-xs"
                />
                <input
                  type="number"
                  value={it.price}
                  onChange={(e) => {
                    const next = [...items]
                    next[idx].price = parseFloat(e.target.value) || 0
                    setItems(next)
                  }}
                  className="w-24 px-2 py-1.5 border border-[#EAE5DC] dark:border-[#272A33] rounded-lg bg-transparent font-mono-code text-xs"
                />
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="p-1.5 text-rose-600 hover:opacity-80 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div>
            <label className="text-sm block text-[#57534E] dark:text-[#A8A29E] mb-1 font-medium">Nominal Uang Dibayar (Rp)</label>
            <input
              type="number"
              value={paid}
              onChange={(e) => setPaid(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-[#EAE5DC] dark:border-[#272A33] rounded-lg bg-transparent font-mono-code"
            />
          </div>
        </div>

        {/* Thermal Receipt Visual Preview Container */}
        <div className="flex flex-col items-center">
          <div
            className={`bg-[#FFFEFC] text-[#111111] p-6 border border-[#EAE5DC] shadow-xl font-mono-code text-xs space-y-3 relative transition-all rounded-xs ${
              paperWidth === '58mm' ? 'max-w-[280px] w-full' : 'max-w-[340px] w-full'
            }`}
          >
            {/* Top receipt tear zig zag pattern */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[radial-gradient(ellipse_at_top,_transparent_4px,_#EAE5DC_4px)] bg-repeat-x bg-[length:10px_6px] -mt-1.5 opacity-60" />

            <div className="text-center space-y-1">
              <div className="font-extrabold text-sm tracking-wider uppercase">{storeName}</div>
              <div className="text-[10px] text-neutral-600 leading-tight">{address}</div>
              <div className="text-[10px] text-neutral-500 pt-1">
                {currentDate} • {cashier}
              </div>
            </div>

            <div className="border-t border-dashed border-neutral-400 my-2" />

            <div className="space-y-1.5 text-xs">
              {items.map((it, i) => (
                <div key={i} className="flex justify-between">
                  <span className="truncate pr-2">
                    {it.qty}x {it.name}
                  </span>
                  <span className="font-semibold whitespace-nowrap">{(it.qty * it.price).toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-neutral-400 my-2" />

            <div className="space-y-1 text-xs">
              <div className="flex justify-between font-extrabold text-sm">
                <span>TOTAL</span>
                <span>Rp {total.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-neutral-700 text-xs">
                <span>BAYAR ({paymentMethod})</span>
                <span>Rp {paid.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-neutral-700 text-xs">
                <span>KEMBALI</span>
                <span>Rp {change.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-neutral-400 my-2" />

            {/* Receipt Barcode Simulation */}
            <div className="flex flex-col items-center pt-1 space-y-1">
              <div className="flex items-center justify-center gap-0.5 h-6">
                {[2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 1, 2, 3, 1].map((w, idx) => (
                  <div key={idx} className="bg-black h-full" style={{ width: `${w * 1.5}px` }} />
                ))}
              </div>
              <span className="text-[10px] text-neutral-500 tracking-widest font-mono-code">
                *KT-{barcodeSeed}*
              </span>
            </div>

            <div className="text-center text-[10px] text-neutral-500 pt-1">
              Terima kasih atas kunjungan Anda!
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CurrencyConverter() {
  const [amount, setAmount] = useState<number>(100)
  const [from, setFrom] = useState<string>('USD')
  const [to, setTo] = useState<string>('IDR')

  // Sample static reference rates
  const rates: Record<string, number> = {
    USD: 1,
    IDR: 16250,
    EUR: 0.92,
    JPY: 154.5,
    SGD: 1.35,
    GBP: 0.79,
  }

  const inUSD = amount / (rates[from] || 1)
  const converted = inUSD * (rates[to] || 1)

  return (
    <div className="border border-[#EAEAEA] dark:border-[#232326] bg-white dark:bg-[#141415] rounded-xl p-6 shadow-xs space-y-6">
      <div className="pb-3 border-b border-[#EAEAEA] dark:border-[#232326]">
        <h3 className="text-sm font-semibold text-[#111111] dark:text-[#EDEDED]">
          Konverter Mata Uang
        </h3>
        <p className="text-xs text-[#8F8E8A] dark:text-[#6E6D6A]">
          Konversi estimasi nilai tukar valas utama dunia.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div>
          <label className="text-sm block text-[#6F6E6B] dark:text-[#9B9A97] mb-1">Jumlah</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-1.5 border border-[#EAEAEA] dark:border-[#232326] rounded-md bg-transparent font-mono-code"
          />
        </div>

        <div>
          <label className="text-sm block text-[#6F6E6B] dark:text-[#9B9A97] mb-1">Dari</label>
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full px-3 py-1.5 border border-[#EAEAEA] dark:border-[#232326] rounded-md bg-transparent font-mono-code"
          >
            {Object.keys(rates).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm block text-[#6F6E6B] dark:text-[#9B9A97] mb-1">Ke</label>
          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full px-3 py-1.5 border border-[#EAEAEA] dark:border-[#232326] rounded-md bg-transparent font-mono-code"
          >
            {Object.keys(rates).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-4 bg-[#FBFBFA] dark:bg-[#0C0C0D] border border-[#EAEAEA] dark:border-[#232326] rounded-lg">
        <span className="text-xs text-[#8F8E8A]">Hasil Konversi:</span>
        <div className="text-2xl font-bold font-mono-code text-[#111111] dark:text-[#EDEDED] mt-1">
          {converted.toLocaleString('id-ID', { maximumFractionDigits: 2 })} {to}
        </div>
      </div>
    </div>
  )
}

function LoanCalculator() {
  const [loanAmount, setLoanAmount] = useState<number>(50000000)
  const [annualRate, setAnnualRate] = useState<number>(8.5)
  const [months, setMonths] = useState<number>(24)
  const [showSchedule, setShowSchedule] = useState<boolean>(false)

  const monthlyRate = annualRate / 100 / 12
  const monthlyPayment =
    monthlyRate > 0
      ? (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months))) /
        (Math.pow(1 + monthlyRate, months) - 1)
      : loanAmount / months

  const totalPayment = monthlyPayment * months
  const totalInterest = totalPayment - loanAmount
  const principalPct = Math.round((loanAmount / totalPayment) * 100)
  const interestPct = 100 - principalPct

  // Generate amortization table
  const schedule = []
  let balance = loanAmount
  for (let i = 1; i <= Math.min(months, 36); i++) {
    const interestPart = balance * monthlyRate
    const principalPart = monthlyPayment - interestPart
    balance = Math.max(0, balance - principalPart)
    schedule.push({
      month: i,
      principalPart,
      interestPart,
      balance,
    })
  }

  return (
    <div className="border border-[#EAE5DC] dark:border-[#272A33] bg-white dark:bg-[#1A1B20] rounded-2xl p-6 shadow-xs space-y-6">
      <div className="pb-3 border-b border-[#EAE5DC] dark:border-[#272A33]">
        <h3 className="text-base sm:text-lg font-bold text-[#1C1917] dark:text-[#F5F4F0]">
          Kalkulator Cicilan Pinjaman & Jadwal Amortisasi
        </h3>
        <p className="text-sm text-[#78716C] mt-1">
          Simulasi cicilan bulanan anuitas, rasio bunga pelunasan, dan jadwal angsuran per bulan.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="block text-sm sm:text-sm font-semibold text-[#1C1917] dark:text-[#F5F4F0]">
            Pokok Pinjaman (Rp)
          </label>
          <input
            type="number"
            step="1000000"
            value={loanAmount}
            onChange={(e) => setLoanAmount(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-3 border border-[#EAE5DC] dark:border-[#272A33] rounded-xl bg-transparent font-mono-code text-sm sm:text-base outline-none focus:border-[#E14D2A]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm sm:text-sm font-semibold text-[#1C1917] dark:text-[#F5F4F0]">Bunga Tahunan (%)</label>
          <input
            type="number"
            step="0.1"
            value={annualRate}
            onChange={(e) => setAnnualRate(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-3 border border-[#EAE5DC] dark:border-[#272A33] rounded-xl bg-transparent font-mono-code text-sm sm:text-base outline-none focus:border-[#E14D2A]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm sm:text-sm font-semibold text-[#1C1917] dark:text-[#F5F4F0]">Tenor (Bulan)</label>
          <input
            type="number"
            value={months}
            onChange={(e) => setMonths(parseInt(e.target.value) || 1)}
            className="w-full px-4 py-3 border border-[#EAE5DC] dark:border-[#272A33] rounded-xl bg-transparent font-mono-code text-sm sm:text-base outline-none focus:border-[#E14D2A]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono-code">
        <div className="p-4 bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] rounded-xl">
          <span className="text-[#78716C]">Cicilan per Bulan:</span>
          <div className="text-lg font-bold text-[#1C1917] dark:text-[#F5F4F0] mt-1">
            Rp {Math.round(monthlyPayment).toLocaleString('id-ID')}
          </div>
        </div>

        <div className="p-4 bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] rounded-xl">
          <span className="text-[#78716C]">Total Bunga:</span>
          <div className="text-lg font-bold text-[#E14D2A] mt-1">
            Rp {Math.round(totalInterest).toLocaleString('id-ID')}
          </div>
        </div>

        <div className="p-4 bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] rounded-xl">
          <span className="text-[#78716C]">Total Pengembalian:</span>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            Rp {Math.round(totalPayment).toLocaleString('id-ID')}
          </div>
        </div>
      </div>

      {/* Visual Proportion Bar */}
      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between text-xs font-mono-code">
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">Pokok: {principalPct}%</span>
          <span className="text-[#E14D2A] font-bold">Bunga: {interestPct}%</span>
        </div>
        <div className="w-full h-3 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden flex">
          <div style={{ width: `${principalPct}%` }} className="bg-emerald-500 h-full" />
          <div style={{ width: `${interestPct}%` }} className="bg-[#E14D2A] h-full" />
        </div>
      </div>

      {/* Toggle Amortization Schedule */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowSchedule(!showSchedule)}
          className="text-xs font-bold text-[#E14D2A] hover:underline cursor-pointer flex items-center gap-1.5"
        >
          {showSchedule ? (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Sembunyikan Jadwal Angsuran</span>
            </>
          ) : (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              <span>Tampilkan Tabel Jadwal Angsuran (Amortisasi)</span>
            </>
          )}
        </button>

        {showSchedule && (
          <div className="mt-3 overflow-x-auto border border-[#EAE5DC] dark:border-[#272A33] rounded-xl max-h-60 overflow-y-auto">
            <table className="w-full text-left text-xs font-mono-code">
              <thead className="bg-[#FAF8F5] dark:bg-[#121316] border-b border-[#EAE5DC] dark:border-[#272A33] text-[#78716C]">
                <tr>
                  <th className="p-2.5">Bulan</th>
                  <th className="p-2.5">Porsi Pokok</th>
                  <th className="p-2.5">Porsi Bunga</th>
                  <th className="p-2.5">Sisa Hutang</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE5DC] dark:divide-[#272A33]">
                {schedule.map((row) => (
                  <tr key={row.month} className="hover:bg-[#FAF8F5]/50">
                    <td className="p-2.5 font-bold">#{row.month}</td>
                    <td className="p-2.5">Rp {Math.round(row.principalPart).toLocaleString('id-ID')}</td>
                    <td className="p-2.5 text-[#E14D2A]">Rp {Math.round(row.interestPart).toLocaleString('id-ID')}</td>
                    <td className="p-2.5 font-semibold">Rp {Math.round(row.balance).toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function TaxCalculator() {
  const [salary, setSalary] = useState<number>(12000000)
  const [allowance, setAllowance] = useState<number>(2000000)
  const [ptkp, setPtkp] = useState<number>(54000000) // TK/0 default

  const ptkpMap: Record<string, number> = {
    'TK/0': 54000000,
    'TK/1': 58500000,
    'K/0': 58500000,
    'K/1': 63000000,
    'K/2': 67500000,
    'K/3': 72000000,
  }

  // Monthly gross
  const grossMonthly = salary + allowance
  const grossAnnual = grossMonthly * 12

  // Biaya Jabatan (5% max 500rb/bln = 6jt/thn)
  const jobExpenseAnnual = Math.min(6000000, grossAnnual * 0.05)
  const netAnnual = grossAnnual - jobExpenseAnnual

  // PKP (Penghasilan Kena Pajak)
  const pkp = Math.max(0, netAnnual - ptkp)

  // UU HPP Tax Brackets
  let annualTax = 0
  if (pkp <= 60000000) {
    annualTax = pkp * 0.05
  } else if (pkp <= 250000000) {
    annualTax = 60000000 * 0.05 + (pkp - 60000000) * 0.15
  } else if (pkp <= 500000000) {
    annualTax = 60000000 * 0.05 + 190000000 * 0.15 + (pkp - 250000000) * 0.25
  } else if (pkp <= 5000000000) {
    annualTax =
      60000000 * 0.05 + 190000000 * 0.15 + 250000000 * 0.25 + (pkp - 500000000) * 0.3
  } else {
    annualTax =
      60000000 * 0.05 +
      190000000 * 0.15 +
      250000000 * 0.25 +
      4500000000 * 0.3 +
      (pkp - 5000000000) * 0.35
  }

  const monthlyTax = Math.round(annualTax / 12)
  const takeHomePay = grossMonthly - monthlyTax
  const effectiveRate = grossMonthly > 0 ? ((monthlyTax / grossMonthly) * 100).toFixed(1) : '0'

  return (
    <div className="border border-[#EAE5DC] dark:border-[#272A33] bg-white dark:bg-[#1A1B20] rounded-2xl p-6 shadow-xs space-y-6">
      <div className="pb-3 border-b border-[#EAE5DC] dark:border-[#272A33]">
        <h3 className="text-sm font-bold text-[#1C1917] dark:text-[#F5F4F0]">
          Kalkulator Pajak Penghasilan (PPh 21) & Take Home Pay
        </h3>
        <p className="text-xs text-[#78716C]">
          Simulasi tarif progresif UU HPP Indonesia dan persentase tarif efektif bulanan.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="block text-sm sm:text-sm font-semibold text-[#1C1917] dark:text-[#F5F4F0]">
            Gaji Pokok Bulanan (Rp)
          </label>
          <input
            type="number"
            step="500000"
            value={salary}
            onChange={(e) => setSalary(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-3 border border-[#EAE5DC] dark:border-[#272A33] rounded-xl bg-transparent font-mono-code text-sm sm:text-base outline-none focus:border-[#E14D2A]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm sm:text-sm font-semibold text-[#1C1917] dark:text-[#F5F4F0]">
            Tunjangan Bulanan (Rp)
          </label>
          <input
            type="number"
            step="100000"
            value={allowance}
            onChange={(e) => setAllowance(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-3 border border-[#EAE5DC] dark:border-[#272A33] rounded-xl bg-transparent font-mono-code text-sm sm:text-base outline-none focus:border-[#E14D2A]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm sm:text-sm font-semibold text-[#1C1917] dark:text-[#F5F4F0]">Status PTKP</label>
          <select
            value={Object.keys(ptkpMap).find((k) => ptkpMap[k] === ptkp) || 'TK/0'}
            onChange={(e) => setPtkp(ptkpMap[e.target.value] || 54000000)}
            className="w-full px-4 py-3 border border-[#EAE5DC] dark:border-[#272A33] rounded-xl bg-transparent font-mono-code text-sm outline-none focus:border-[#E14D2A]"
          >
            <option value="TK/0">TK/0 (Lajang, 0 Tanggungan - 54jt)</option>
            <option value="TK/1">TK/1 (Lajang, 1 Tanggungan - 58.5jt)</option>
            <option value="K/0">K/0 (Menikah, 0 Tanggungan - 58.5jt)</option>
            <option value="K/1">K/1 (Menikah, 1 Tanggungan - 63jt)</option>
            <option value="K/2">K/2 (Menikah, 2 Tanggungan - 67.5jt)</option>
            <option value="K/3">K/3 (Menikah, 3 Tanggungan - 72jt)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono-code">
        <div className="p-4 bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] rounded-xl">
          <span className="text-[#78716C]">Potongan PPh 21 / Bulan:</span>
          <div className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-1">
            Rp {monthlyTax.toLocaleString('id-ID')}
          </div>
          <div className="text-[10px] text-[#78716C] mt-0.5">Tarif Efektif: {effectiveRate}%</div>
        </div>

        <div className="p-4 bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] rounded-xl">
          <span className="text-[#78716C]">Pajak Terutang Tahunan:</span>
          <div className="text-lg font-bold text-[#E14D2A] mt-1">
            Rp {Math.round(annualTax).toLocaleString('id-ID')}
          </div>
          <div className="text-[10px] text-[#78716C] mt-0.5">PKP: Rp {pkp.toLocaleString('id-ID')}</div>
        </div>

        <div className="p-4 bg-[#FAF8F5] dark:bg-[#121316] border border-[#EAE5DC] dark:border-[#272A33] rounded-xl">
          <span className="text-[#78716C]">Gaji Bersih (Take Home):</span>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            Rp {takeHomePay.toLocaleString('id-ID')}
          </div>
          <div className="text-[10px] text-emerald-700 dark:text-emerald-300 mt-0.5">
            {grossMonthly > 0 ? Math.round((takeHomePay / grossMonthly) * 100) : 0}% dari gaji kotor
          </div>
        </div>
      </div>
    </div>
  )
}
