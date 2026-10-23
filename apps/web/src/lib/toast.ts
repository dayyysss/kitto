import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  title: string
  message?: string
  type: ToastType
}

interface ToastState {
  toasts: Toast[]
  showToast: (title: string, message?: string, type?: ToastType) => void
  removeToast: (id: string) => void
}

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  showToast: (title, message, type = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`
    set((state) => ({
      toasts: [...state.toasts, { id, title, message, type }],
    }))
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }))
    }, 3500)
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}))
