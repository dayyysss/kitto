import { create } from 'zustand'

export interface User {
  id: number
  name: string
  email: string
  role?: string
  avatar?: string
  bio?: string
  phone?: string
}

interface AuthState {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
}

export const useAuth = create<AuthState>((set) => {
  const saved =
    typeof window !== 'undefined' ? localStorage.getItem('qt_user') : null

  return {
    user: saved ? JSON.parse(saved) : null,
    setUser: (user) => {
      if (user) {
        localStorage.setItem('qt_user', JSON.stringify(user))
      } else {
        localStorage.removeItem('qt_user')
      }
      set({ user })
    },
    logout: () => {
      localStorage.removeItem('qt_user')
      set({ user: null })
    },
  }
})
