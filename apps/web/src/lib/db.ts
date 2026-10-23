export interface HistoryItem {
  id?: number
  tool: 'qr' | 'password' | 'uuid' | 'codec'
  title: string
  payload: string
  metadata?: Record<string, unknown>
  createdAt: number
}

export interface QrPreset {
  id?: number
  name: string
  config: Record<string, unknown>
  createdAt: number
}

// Client connector to Neon Postgres via API
export const db = {
  history: {
    add: async (item: Omit<HistoryItem, 'id'>): Promise<void> => {
      try {
        await fetch('/api/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        })
      } catch (err) {
        console.warn('Gagal sinkronisasi ke Neon Postgres, fallback lokal:', err)
        const cached = JSON.parse(localStorage.getItem('qt_history_cache') || '[]')
        cached.unshift({ ...item, id: Date.now() })
        localStorage.setItem('qt_history_cache', JSON.stringify(cached.slice(0, 30)))
      }
    },
    orderBy: (_field: string) => ({
      reverse: () => ({
        limit: (_n: number) => ({
          toArray: async (): Promise<HistoryItem[]> => {
            try {
              const res = await fetch('/api/history')
              if (res.ok) {
                const data = await res.json()
                if (Array.isArray(data)) return data
              }
            } catch (err) {
              console.warn('Gagal memuat history dari Neon Postgres:', err)
            }
            return JSON.parse(localStorage.getItem('qt_history_cache') || '[]')
          },
        }),
      }),
    }),
    clear: async (): Promise<void> => {
      try {
        await fetch('/api/history', { method: 'DELETE' })
      } catch (err) {
        console.warn('Gagal menghapus data di Neon Postgres:', err)
      }
      localStorage.removeItem('qt_history_cache')
    },
  },
}
