import { create } from 'zustand'

export interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
}

interface ConfirmState {
  isOpen: boolean
  options: ConfirmOptions | null
  ask: (options: ConfirmOptions) => void
  close: () => void
}

export const useConfirm = create<ConfirmState>((set) => ({
  isOpen: false,
  options: null,
  ask: (options) => set({ isOpen: true, options }),
  close: () => set({ isOpen: false, options: null }),
}))
