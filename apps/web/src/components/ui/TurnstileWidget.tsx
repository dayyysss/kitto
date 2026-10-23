import { useEffect, useRef } from 'react'

interface TurnstileApi {
  render: (el: HTMLElement, options: Record<string, unknown>) => string
  remove: (id: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

interface TurnstileWidgetProps {
  onVerify: (token: string) => void
  onExpire?: () => void
  resetKey?: number
  className?: string
}

const SCRIPT_ID = 'cf-turnstile-script'
let scriptPromise: Promise<void> | null = null

function loadTurnstile(): Promise<void> {
  if (window.turnstile) return Promise.resolve()
  if (scriptPromise) return scriptPromise

  const loader = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Turnstile gagal dimuat')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Turnstile gagal dimuat'))
    document.head.appendChild(script)
  })

  scriptPromise = loader.catch((err) => {
    scriptPromise = null
    throw err
  })

  return scriptPromise
}

export function TurnstileWidget({ onVerify, onExpire, resetKey = 0, className = '' }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const verifyRef = useRef(onVerify)
  const expireRef = useRef(onExpire)

  useEffect(() => {
    verifyRef.current = onVerify
  }, [onVerify])

  useEffect(() => {
    expireRef.current = onExpire
  }, [onExpire])

  useEffect(() => {
    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY
    if (!siteKey || !containerRef.current) return

    let cancelled = false

    loadTurnstile()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: 'auto',
          size: 'flexible',
          callback: (token: string) => verifyRef.current(token),
          'expired-callback': () => expireRef.current?.(),
          'error-callback': () => expireRef.current?.(),
        })
      })
      .catch(() => expireRef.current?.())

    return () => {
      cancelled = true
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
      if (containerRef.current) containerRef.current.innerHTML = ''
    }
  }, [resetKey])

  if (!import.meta.env.VITE_TURNSTILE_SITE_KEY) {
    return (
      <p className={`text-xs text-amber-700 dark:text-amber-400 ${className}`}>
        Verifikasi Cloudflare belum dikonfigurasi.
      </p>
    )
  }

  return <div ref={containerRef} className={className} />
}
