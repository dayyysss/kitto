import { Hono } from 'hono'
import { sql, memoryStore } from '../db'

const presets = new Hono()

presets.get('/', async (c) => {
  const type = c.req.query('type') || 'qr'
  if (sql) {
    try {
      const rows = await sql`SELECT * FROM presets WHERE type = ${type} ORDER BY created_at DESC LIMIT 30;`
      return c.json(rows)
    } catch (err) {
      console.error('Presets query error:', err)
    }
  }
  return c.json(memoryStore.presets.filter((p) => p.type === type))
})

presets.post('/', async (c) => {
  try {
    const body = await c.req.json<{
      type?: string
      name: string
      config: any
    }>()

    if (!body.name) {
      return c.json({ error: 'Nama preset wajib diisi' }, 400)
    }

    if (sql) {
      const inserted = await sql`
        INSERT INTO presets (type, name, config)
        VALUES (${body.type || 'qr'}, ${body.name}, ${JSON.stringify(body.config || {})})
        RETURNING *;
      `
      return c.json(inserted[0], 201)
    }
    const item = { id: Date.now(), ...body }
    memoryStore.presets.unshift(item)
    return c.json(item, 201)
  } catch (err) {
    return c.json({ error: 'Gagal menyimpan preset' }, 400)
  }
})

presets.delete('/:id', async (c) => {
  const id = c.req.param('id')
  if (sql) {
    try {
      await sql`DELETE FROM presets WHERE id = ${parseInt(id)};`
      return c.json({ success: true })
    } catch (err) {
      return c.json({ error: 'Gagal menghapus preset' }, 500)
    }
  }
  return c.json({ success: true })
})

export { presets }
