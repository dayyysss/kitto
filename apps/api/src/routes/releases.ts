import { Hono } from 'hono'
import { sql, memoryStore } from '../db'
import { adminAuthMiddleware } from '../middleware/adminAuth'

const releases = new Hono()

releases.get('/', async (c) => {
  if (sql) {
    try {
      const rows = await sql`SELECT * FROM release_notes ORDER BY created_at DESC LIMIT 50;`
      return c.json(rows)
    } catch (err) {
      console.error('Releases query error:', err)
    }
  }
  return c.json(memoryStore.releases)
})

releases.post('/', adminAuthMiddleware, async (c) => {
  try {
    const body = await c.req.json<{
      title: string
      date: string
      badge?: string
      highlights: string
      changes: Array<{ type: string; label: string; text: string }>
    }>()

    if (!body.title) {
      return c.json({ error: 'Judul rilis wajib diisi' }, 400)
    }

    if (sql) {
      const inserted = await sql`
        INSERT INTO release_notes (title, date, badge, highlights, changes)
        VALUES (
          ${body.title},
          ${body.date || new Date().toLocaleDateString('id-ID')},
          ${body.badge || null},
          ${body.highlights},
          ${JSON.stringify(body.changes || [])}
        )
        RETURNING *;
      `
      return c.json(inserted[0], 201)
    }
    const item = { id: Date.now(), ...body, created_at: new Date().toISOString() }
    memoryStore.releases.unshift(item)
    return c.json(item, 201)
  } catch (err) {
    return c.json({ error: 'Gagal menyimpan rilis' }, 500)
  }
})

releases.delete('/:id', adminAuthMiddleware, async (c) => {
  const id = c.req.param('id')
  if (sql) {
    try {
      await sql`DELETE FROM release_notes WHERE id = ${parseInt(id)};`
      return c.json({ success: true })
    } catch (err) {
      return c.json({ error: 'Gagal menghapus rilis' }, 500)
    }
  }
  return c.json({ success: true })
})

export { releases }
