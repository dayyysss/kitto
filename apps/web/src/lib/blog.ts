export interface BlogPost {
  id: string | number
  slug: string
  title: string
  date: string
  readTime: string
  tag: string
  summary: string
  author?: {
    name: string
    role?: string
  }
  coverImage?: string
  keywords?: string[]
  content: string[]
  actionLink?: {
    label: string
    path: string
  }
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export function mapBlogPost(d: any, lang: string): BlogPost {
  let kwList: string[] = []
  if (d.keywords) {
    kwList = typeof d.keywords === 'string'
      ? d.keywords.split(',').map((k: string) => k.trim()).filter(Boolean)
      : Array.isArray(d.keywords) ? d.keywords : []
  }

  let contentList: string[] = []
  if (Array.isArray(d.content)) {
    contentList = d.content
  } else if (typeof d.content === 'string') {
    try {
      const parsed = JSON.parse(d.content)
      contentList = Array.isArray(parsed) ? parsed : [d.content]
    } catch {
      contentList = [d.content]
    }
  } else {
    contentList = [d.summary || '']
  }

  const tagUpper = (d.tag || '').toUpperCase()
  let actionLink = { label: 'Buka Studio QR', path: '/qr' }
  if (tagUpper.includes('KRIPTO') || tagUpper.includes('SANDI')) {
    actionLink = { label: 'Kalkulator Sandi', path: '/password' }
  } else if (tagUpper.includes('DESAIN') || tagUpper.includes('VISUAL')) {
    actionLink = { label: 'Suite Visual', path: '/image-compressor' }
  } else if (tagUpper.includes('KEUANGAN')) {
    actionLink = { label: 'Pembuat Faktur', path: '/invoice' }
  } else if (tagUpper.includes('ARSITEKTUR')) {
    actionLink = { label: 'Semua 26 Alat', path: '/tools' }
  }

  return {
    id: d.id,
    slug: d.slug || String(d.id),
    title: d.title || 'Artikel Tanpa Judul',
    date: d.created_at
      ? new Date(d.created_at).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : 'Terbaru',
    readTime: d.read_time || '4 min read',
    tag: d.tag || 'PANDUAN',
    summary: d.summary || '',
    author: {
      name: 'Tim Pengembang Kitto',
      role: 'Core Engineering',
    },
    coverImage: d.cover_image || undefined,
    keywords: kwList,
    content: contentList,
    actionLink,
  }
}
