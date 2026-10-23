import { create } from 'zustand'

export type RoutePath = string

interface RouterState {
  currentPath: string
  navigate: (path: string) => void
}

function getInitialPath(): string {
  if (typeof window === 'undefined') return '/'
  const p = window.location.pathname
  return p || '/'
}

export const useRouter = create<RouterState>((set) => {
  if (typeof window !== 'undefined') {
    window.addEventListener('popstate', () => {
      set({ currentPath: getInitialPath() })
    })
  }

  return {
    currentPath: getInitialPath(),
    navigate: (path: string) => {
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', path)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
      set({ currentPath: path })
    },
  }
})
