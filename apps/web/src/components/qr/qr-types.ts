export type PayloadType = 'url' | 'wifi' | 'whatsapp' | 'email' | 'text' | 'vcard'

export type DotStyle = 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'square' | 'extra-rounded'
export type CornerStyle = 'square' | 'dot' | 'extra-rounded'
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'

export interface WifiData {
  ssid: string
  password: string
  encryption: 'WPA' | 'WEP' | 'nopass'
  hidden: boolean
}

export interface WhatsAppData {
  phone: string
  message: string
}

export interface EmailData {
  to: string
  subject: string
  body: string
}

export interface VCardData {
  firstName: string
  lastName: string
  phone: string
  email: string
  organization: string
  title: string
  url: string
}

export interface QrConfig {
  isDynamic: boolean
  dynamicSlug: string
  dynamicTargetUrl: string
  pin?: string
  expiresAt?: string
  payloadType: PayloadType
  rawText: string
  wifi: WifiData
  whatsapp: WhatsAppData
  email: EmailData
  vcard: VCardData
  fgColor: string
  bgColor: string
  dotStyle: DotStyle
  cornerStyle: CornerStyle
  logoUrl?: string
  logoSize: number
  errorCorrection: ErrorCorrectionLevel
  size: number
}

export function formatPayload(config: QrConfig): string {
  if (config.isDynamic) {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
    const cleanSlug = (config.dynamicSlug || '').trim() || 'my-qr'
    return `${origin}/r/${cleanSlug}`
  }

  switch (config.payloadType) {
    case 'url':
    case 'text':
      return config.rawText || 'https://example.com'
    case 'wifi': {
      const { ssid, password, encryption, hidden } = config.wifi
      return `WIFI:S:${ssid};T:${encryption};P:${password};H:${hidden ? 'true' : 'false'};;`
    }
    case 'whatsapp': {
      const cleanPhone = config.whatsapp.phone.replace(/[^0-9]/g, '')
      const msg = encodeURIComponent(config.whatsapp.message || '')
      return `https://wa.me/${cleanPhone}?text=${msg}`
    }
    case 'email': {
      const { to, subject, body } = config.email
      return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    }
    case 'vcard': {
      const { firstName, lastName, phone, email, organization, title, url } = config.vcard
      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${lastName};${firstName};;;`,
        `FN:${firstName} ${lastName}`.trim(),
        organization ? `ORG:${organization}` : '',
        title ? `TITLE:${title}` : '',
        phone ? `TEL:${phone}` : '',
        email ? `EMAIL:${email}` : '',
        url ? `URL:${url}` : '',
        'END:VCARD',
      ].filter(Boolean).join('\n')
    }
    default:
      return config.rawText
  }
}
