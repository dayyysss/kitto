import type { MiddlewareHandler } from 'hono'
import { sql } from '../db'

const buckets = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(max = 10, windowMs = 60_000): MiddlewareHandler {
  return async (c, next) => {
    const ip =
      c.req.header('cf-connecting-ip') ||
      c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
      c.req.header('x-real-ip') ||
      'unknown'
    const key = `${c.req.method}:${c.req.path}:${ip}`
    const now = Date.now()
    const resetAt = new Date(now + windowMs)

    if (sql) {
      try {
        const rows = await sql`
          INSERT INTO rate_limits (key, count, reset_at)
          VALUES (${key}, 1, ${resetAt})
          ON CONFLICT (key) DO UPDATE SET
            count = CASE WHEN rate_limits.reset_at <= NOW() THEN 1 ELSE rate_limits.count + 1 END,
            reset_at = CASE WHEN rate_limits.reset_at <= NOW() THEN EXCLUDED.reset_at ELSE rate_limits.reset_at END
          RETURNING count;
        `
        if ((rows[0]?.count || 0) > max) {
          return c.json({ error: 'Terlalu banyak permintaan. Coba lagi sebentar.' }, 429)
        }
        await next()
        return
      } catch (error) {
        console.error('Durable rate limit unavailable, using memory fallback:', error)
      }
    }

    const bucket = buckets.get(key)

    if (!bucket || now >= bucket.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + windowMs })
    } else {
      if (bucket.count >= max) {
        return c.json({ error: 'Terlalu banyak permintaan. Coba lagi sebentar.' }, 429)
      }
      bucket.count += 1
    }

    if (buckets.size > 5000) {
      for (const [k, v] of buckets) {
        if (now >= v.resetAt) buckets.delete(k)
      }
    }

    await next()
  }
}
