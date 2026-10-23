import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    fetch('/api/errors/client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        url: `${window.location.pathname}${window.location.search}`,
      }),
    }).catch(() => {})
    console.error('Application error:', error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF8F5] px-6 text-[#1C1917] dark:bg-[#121316] dark:text-[#F5F4F0]">
        <div className="max-w-md space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E14D2A]/10 text-lg font-black text-[#E14D2A]">
            K
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Terjadi kesalahan.</h1>
          <p className="text-sm leading-relaxed text-[#57534E] dark:text-[#A8A29E]">
            Something went wrong while loading this page. Coba muat ulang halaman ini.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-xl bg-[#E14D2A] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#C83B1B]"
          >
            Muat ulang / Reload
          </button>
        </div>
      </div>
    )
  }
}
