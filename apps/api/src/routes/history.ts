import { Hono } from 'hono'
import { sql, memoryStore } from '../db'

const history = new Hono()

history.get('/', async (c) => {
  if (sql) {
    try {
      const rows = await sql`
        SELECT id, tool, title, payload, metadata, created_at as "createdAt"
        FROM history
        ORDER BY created_at DESC
        LIMIT 30;
      `
      return c.json(rows)
    } catch (err) {
      console.error('Neon query error /api/history:', err)
    }
  }

  return c.json(memoryStore.history.slice(-30).reverse())
})

history.post('/', async (c) => {
  try {
    const body = await c.req.json<{
      tool: string
      title: string
      payload: string
      metadata?: any
      createdAt?: number
    }>()

    const createdAt = body.createdAt || Date.now()

    if (sql) {
      const inserted = await sql`
        INSERT INTO history (tool, title, payload, metadata, created_at)
        VALUES (${body.tool}, ${body.title}, ${body.payload}, ${JSON.stringify(body.metadata || {})}, ${createdAt})
        RETURNING id, tool, title, payload, metadata, created_at as "createdAt";
      `
      return c.json(inserted[0], 201)
    }

    const newItem = {
      id: memoryStore.history.length + 1,
      tool: body.tool,
      title: body.title,
      payload: body.payload,
      metadata: body.metadata,
      createdAt,
    }
    memoryStore.history.push(newItem)
    return c.json(newItem, 201)
  } catch (err) {
    return c.json({ error: 'Gagal menyimpan history ke database' }, 400)
  }
})

history.delete('/', async (c) => {
  if (sql) {
    try {
      await sql`DELETE FROM history;`
      return c.json({ success: true, message: 'History berhasil dikosongkan' })
    } catch (err) {
      return c.json({ error: 'Gagal mengosongkan database' }, 500)
    }
  }

  memoryStore.history.length = 0
  return c.json({ success: true, message: 'History lokal dikosongkan' })
})

export { history }
