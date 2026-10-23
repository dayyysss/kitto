import type { Context } from 'hono'

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export function getClientIp(c: Context): string | undefined {
  return (
    c.req.header('cf-connecting-ip') ||
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip')
  )
}

export async function verifyTurnstile(token: unknown, remoteIp?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    console.error('TURNSTILE_SECRET_KEY belum dikonfigurasi.')
    return false
  }

  if (typeof token !== 'string' || token.length < 10) return false

  try {
    const body = new URLSearchParams({ secret, response: token })
    if (remoteIp) body.set('remoteip', remoteIp)

    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return false

    const data = (await res.json()) as { success?: boolean }
    return data.success === true
  } catch {
    return false
  }
}
