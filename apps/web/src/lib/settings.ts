import { create } from 'zustand'

export interface SiteSettings {
  logoLight?: string
  logoDark?: string
  favicon?: string
  ogImage?: string
  title?: string
  desc?: string
  keywords?: string
  author?: string
  twitterHandle?: string
  canonicalUrl?: string
}

interface SiteSettingsState {
  settings: SiteSettings
  setSettings: (settings: SiteSettings) => void
  fetchSettings: () => Promise<void>
}

function applyHeadMeta(newSettings: SiteSettings) {
  if (typeof window === 'undefined') return

  if (newSettings.title) {
    document.title = newSettings.title
    const ogTitle = document.querySelector("meta[property='og:title']")
    if (ogTitle) ogTitle.setAttribute('content', newSettings.title)
    const twTitle = document.querySelector("meta[name='twitter:title']")
    if (twTitle) twTitle.setAttribute('content', newSettings.title)
  }

  if (newSettings.desc) {
    const metaDesc = document.querySelector("meta[name='description']")
    if (metaDesc) metaDesc.setAttribute('content', newSettings.desc)
    const ogDesc = document.querySelector("meta[property='og:description']")
    if (ogDesc) ogDesc.setAttribute('content', newSettings.desc)
    const twDesc = document.querySelector("meta[name='twitter:description']")
    if (twDesc) twDesc.setAttribute('content', newSettings.desc)
  }

  if (newSettings.keywords) {
    const metaKw = document.querySelector("meta[name='keywords']")
    if (metaKw) metaKw.setAttribute('content', newSettings.keywords)
  }

  if (newSettings.favicon) {
    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']")
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = newSettings.favicon

    let appleLink: HTMLLinkElement | null = document.querySelector("link[rel='apple-touch-icon']")
    if (!appleLink) {
      appleLink = document.createElement('link')
      appleLink.rel = 'apple-touch-icon'
      document.head.appendChild(appleLink)
    }
    appleLink.href = newSettings.favicon
  }

  if (newSettings.ogImage) {
    let ogImg: HTMLMetaElement | null = document.querySelector("meta[property='og:image']")
    if (!ogImg) {
      ogImg = document.createElement('meta')
      ogImg.setAttribute('property', 'og:image')
      document.head.appendChild(ogImg)
    }
    ogImg.setAttribute('content', newSettings.ogImage)
  }
}

export const useSiteSettings = create<SiteSettingsState>((set) => {
  const defaultSettings: SiteSettings = {
    title: 'Kitto — Precision QR & Utilities',
    desc: 'Generator QR kustom vektor murni, kalkulator entropi sandi, dan 25+ perangkat utilitas presisi.',
    keywords: 'kitto, qr vector, password generator, uuid, pph 21',
    author: 'Kitto Team',
    twitterHandle: '@kitto_dev',
    canonicalUrl: 'https://kitto.dev',
  }

  // Load cached settings from localStorage if available
  const cached =
    typeof window !== 'undefined' ? localStorage.getItem('kitto_site_settings') : null
  const initial = cached ? { ...defaultSettings, ...JSON.parse(cached) } : defaultSettings

  if (cached) {
    applyHeadMeta(initial)
  }

  return {
    settings: initial,
    setSettings: (newSettings) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('kitto_site_settings', JSON.stringify(newSettings))
        applyHeadMeta(newSettings)
      }
      set({ settings: newSettings })
    },
    fetchSettings: async () => {
      try {
        const res = await fetch('/api/settings')
        if (res.ok) {
          const data = await res.json()
          if (data && typeof data === 'object') {
            const merged = { ...defaultSettings, ...data }
            if (typeof window !== 'undefined') {
              localStorage.setItem('kitto_site_settings', JSON.stringify(merged))
              applyHeadMeta(merged)
            }
            set({ settings: merged })
          }
        }
      } catch (err) {
        console.warn('Failed fetching site settings:', err)
      }
    },
  }
})
