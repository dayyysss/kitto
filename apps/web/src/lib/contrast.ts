function hexToRgb(hex: string): [number, number, number] {
  let clean = hex.replace('#', '')
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('')
  }
  const num = parseInt(clean, 16)
  if (isNaN(num)) return [0, 0, 0]
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

function luminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const [r1, g1, b1] = hexToRgb(hex1)
  const [r2, g2, b2] = hexToRgb(hex2)
  const lum1 = luminance(r1, g1, b1)
  const lum2 = luminance(r2, g2, b2)
  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)
  return Number(((brightest + 0.05) / (darkest + 0.05)).toFixed(2))
}

export function checkScannability(fgColor: string, bgColor: string): {
  ratio: number
  safe: boolean
  warning?: string
} {
  const ratio = getContrastRatio(fgColor, bgColor)
  if (ratio < 2.5) {
    return {
      ratio,
      safe: false,
      warning: 'Kontras terlalu rendah (< 2.5:1). Kamera scanner kemungkinan besar akan gagal membaca QR ini.',
    }
  }
  if (ratio < 4.0) {
    return {
      ratio,
      safe: true,
      warning: 'Kontras agak rendah (< 4:1). Gunakan di pencahayaan baik atau tingkatkan kontras.',
    }
  }
  return { ratio, safe: true }
}
