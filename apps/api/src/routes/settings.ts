import { Hono } from 'hono'
import { sql, memoryStore } from '../db'
import { adminAuthMiddleware } from '../middleware/adminAuth'

const settings = new Hono()

settings.get('/', async (c) => {
  if (sql) {
    try {
      const rows = await sql`SELECT * FROM site_settings;`
      const settingsMap: Record<string, any> = {}
      rows.forEach((r) => {
        settingsMap[r.key] = r.value
      })
      return c.json(settingsMap)
    } catch (err) {
      console.error('Settings query error:', err)
    }
  }
  return c.json(memoryStore.settings)
})

settings.post('/', adminAuthMiddleware, async (c) => {
  try {
    const body = await c.req.json<{ key: string; value: any }>()
    if (!body.key) return c.json({ error: 'Key required' }, 400)

    if (sql) {
      await sql`
        INSERT INTO site_settings (key, value, updated_at)
        VALUES (${body.key}, ${JSON.stringify(body.value)}, NOW())
        ON CONFLICT (key) DO UPDATE
        SET value = ${JSON.stringify(body.value)}, updated_at = NOW();
      `
      return c.json({ success: true })
    }
    memoryStore.settings[body.key] = body.value
    return c.json({ success: true })
  } catch (err) {
    return c.json({ error: 'Gagal menyimpan setelan' }, 500)
  }
})

export { settings }
