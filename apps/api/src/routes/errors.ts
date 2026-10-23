import { Hono } from 'hono'
import { rateLimit } from '../middleware/rateLimit'

const errors = new Hono()

errors.post('/client', rateLimit(20), async (c) => {
  try {
    const body = await c.req.json<{ message?: string; stack?: string; url?: string }>()
    console.error(
      '[client-error]',
      JSON.stringify({
        message: (body.message || '').slice(0, 500),
        stack: (body.stack || '').slice(0, 4000),
        url: (body.url || '').slice(0, 500),
        ip:
          c.req.header('cf-connecting-ip') ||
          c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
          'unknown',
      })
    )
  } catch {
    // Ignore malformed reports.
  }
  return c.json({ ok: true })
})

export { errors }
