import { create } from 'zustand'

export type Language = 'id' | 'en'

interface I18nState {
  lang: Language
  setLang: (lang: Language) => void
  t: (key: string) => string
}

const DICTIONARY: Record<Language, Record<string, string>> = {
  id: {
    // Nav
    'nav.home': 'Beranda',
    'nav.studio': 'Studio',
    'nav.tools': 'Semua Alat',
    'nav.dashboard': 'Dashboard',
    'nav.catalog': 'Semua Alat',
    'nav.more': 'Lainnya',
    'nav.changelog': 'Catatan Rilis',
    'nav.blog': 'Blog & Panduan',
    'nav.about': 'Tentang Kami',
    'nav.feedback': 'Saran & Review',
    'nav.privacy': 'Kebijakan Privasi',
    'nav.cookies': 'Kebijakan Cookie',
    'nav.terms': 'Ketentuan Layanan',
    'nav.login': 'Masuk',
    'nav.search': 'Cari alat (Ctrl+K)',

    // Hero
    'hero.badge': 'V1.0',
    'hero.title_pre': 'Perangkat utilitas & QR studio ',
    'hero.title_accent': 'presisi',
    'hero.desc':
      'Generator QR kustom vektor murni, pengukur kekuatan sandi, dan 25+ alat produktivitas developer. Semua diproses di browser Anda tanpa watermark.',
    'hero.cta_qr': 'Buka QR Studio →',
    'hero.cta_catalog': 'Jelajahi Semua Alat',

    // Changelog
    'changelog.title': 'Catatan Rilis & Pembaruan',
    'changelog.subtitle': 'Transparansi pembaruan fitur, perbaikan bug, dan peningkatan performa.',

    // About
    'about.title': 'Tentang Kitto',
    'about.subtitle':
      'Platform utilitas web yang cepat dan ringan.',
  },
  en: {
    // Nav
    'nav.home': 'Home',
    'nav.studio': 'Studio',
    'nav.tools': 'Tools',
    'nav.dashboard': 'Dashboard',
    'nav.catalog': 'All Tools',
    'nav.more': 'More',
    'nav.changelog': 'Changelog',
    'nav.blog': 'Blog & Guides',
    'nav.about': 'About Us',
    'nav.feedback': 'Requests & Reviews',
    'nav.privacy': 'Privacy Policy',
    'nav.cookies': 'Cookie Policy',
    'nav.terms': 'Terms of Service',
    'nav.login': 'Sign In',
    'nav.search': 'Search tools (Ctrl+K)',

    // Hero
    'hero.badge': 'V1.0',
    'hero.title_pre': 'Precision utility tools & QR ',
    'hero.title_accent': 'studio',
    'hero.desc':
      'Pure vector custom QR generator, password strength meter, and 25+ developer utilities. Everything runs in your browser with no watermark.',
    'hero.cta_qr': 'Open QR Studio →',
    'hero.cta_catalog': 'Explore All Tools',

    // Changelog
    'changelog.title': 'Changelog & Release Notes',
    'changelog.subtitle': 'Full transparency on new features, bug fixes, and performance updates.',

    // About
    'about.title': 'About Kitto',
    'about.subtitle':
      'A web utility platform with instant performance and uncompromising privacy.',
  },
}

export const useI18n = create<I18nState>((set, get) => ({
  lang: (typeof window !== 'undefined' && (localStorage.getItem('qt_lang') as Language)) || 'id',
  setLang: (lang: Language) => {
    localStorage.setItem('qt_lang', lang)
    set({ lang })
  },
  t: (key: string) => {
    const current = get().lang
    return DICTIONARY[current]?.[key] || DICTIONARY.id[key] || key
  },
}))
