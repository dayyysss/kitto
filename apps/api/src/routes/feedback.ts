import { Hono } from 'hono'
import { sql, memoryStore } from '../db'
import { adminAuthMiddleware } from '../middleware/adminAuth'
import { rateLimit } from '../middleware/rateLimit'
import { getClientIp, verifyTurnstile } from '../utils/turnstile'

const feedback = new Hono()

feedback.get('/', async (c) => {
  if (sql) {
    try {
      const rows = await sql`SELECT * FROM feedback ORDER BY created_at DESC LIMIT 50;`
      return c.json(rows)
    } catch (err) {
      console.error('Feedback query error:', err)
    }
  }
  return c.json(memoryStore.feedbacks)
})

feedback.post('/', rateLimit(5), async (c) => {
  try {
    const body = await c.req.json<{
      type?: 'review' | 'suggestion'
      name?: string
      role?: string
      rating?: number
      comment?: string
      turnstileToken?: string
    }>()

    const verified = await verifyTurnstile(body.turnstileToken, getClientIp(c))
    if (!verified) {
      return c.json({ error: 'Verifikasi keamanan gagal. Muat ulang halaman lalu coba lagi.' }, 403)
    }

    const type = body.type === 'suggestion' ? 'suggestion' : 'review'
    const name = (body.name || '').trim()
    const role = (body.role || '').trim().slice(0, 80)
    const comment = (body.comment || '').trim()
    const rating = Math.min(5, Math.max(1, Number(body.rating) || 5))

    if (name.length < 2 || name.length > 80 || comment.length < 5 || comment.length > 2000) {
      return c.json({ error: 'Nama atau komentar tidak valid.' }, 400)
    }

    if (sql) {
      const inserted = await sql`
        INSERT INTO feedback (type, name, role, rating, comment)
        VALUES (${type}, ${name}, ${role}, ${rating}, ${comment})
        RETURNING *;
      `
      return c.json(inserted[0], 201)
    }

    const item = { id: Date.now(), type, name, role, rating, comment, created_at: new Date().toISOString() }
    memoryStore.feedbacks.unshift(item)
    return c.json(item, 201)
  } catch (err) {
    return c.json({ error: 'Gagal menyimpan feedback' }, 400)
  }
})

feedback.delete('/:id', adminAuthMiddleware, async (c) => {
  const id = c.req.param('id')
  if (sql) {
    try {
      await sql`DELETE FROM feedback WHERE id = ${parseInt(id)};`
      return c.json({ success: true })
    } catch (err) {
      return c.json({ error: 'Gagal menghapus feedback' }, 500)
    }
  }
  return c.json({ success: true })
})

export { feedback }
