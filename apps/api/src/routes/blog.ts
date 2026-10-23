import { Hono } from 'hono'
import { sql, memoryStore } from '../db'
import { adminAuthMiddleware } from '../middleware/adminAuth'
import { slugify } from '../utils/slug'

const blog = new Hono()

blog.get('/', async (c) => {
  if (sql) {
    try {
      const rows = await sql`SELECT * FROM blog_posts ORDER BY created_at DESC LIMIT 50;`
      return c.json(rows)
    } catch (err) {
      console.error('Blog query error:', err)
    }
  }
  return c.json(memoryStore.blogPosts)
})

blog.get('/:slug', async (c) => {
  const slug = c.req.param('slug')
  if (sql) {
    try {
      const rows = await sql`SELECT * FROM blog_posts WHERE slug = ${slug} LIMIT 1;`
      if (rows.length > 0) return c.json(rows[0])
      if (/^\d+$/.test(slug)) {
        const byId = await sql`SELECT * FROM blog_posts WHERE id = ${parseInt(slug)} LIMIT 1;`
        if (byId.length > 0) return c.json(byId[0])
      }
    } catch (err) {
      console.error('Blog detail query error:', err)
    }
  }
  const item = memoryStore.blogPosts.find((p: any) => p.slug === slug || String(p.id) === slug)
  return item ? c.json(item) : c.json({ error: 'Artikel tidak ditemukan' }, 404)
})

blog.post('/', adminAuthMiddleware, async (c) => {
  try {
    const body = await c.req.json<{
      title: string
      tag: string
      readTime?: string
      summary: string
      content: string[]
      keywords?: string
      coverImage?: string
    }>()

    if (!body.title || !body.summary) {
      return c.json({ error: 'Judul dan ringkasan wajib diisi' }, 400)
    }

    const baseSlug = slugify(body.title) || `artikel-${Date.now()}`
    let slug = baseSlug
    if (sql) {
      const existing = await sql`SELECT id FROM blog_posts WHERE slug = ${slug} LIMIT 1;`
      if (existing.length > 0) slug = `${baseSlug}-${Date.now().toString(36)}`
    }

    if (sql) {
      const inserted = await sql`
        INSERT INTO blog_posts (title, slug, tag, read_time, summary, content, keywords, cover_image)
        VALUES (
          ${body.title},
          ${slug},
          ${body.tag || 'TUTORIAL'},
          ${body.readTime || '4 min read'},
          ${body.summary},
          ${JSON.stringify(body.content || [])},
          ${body.keywords || null},
          ${body.coverImage || null}
        )
        RETURNING *;
      `
      return c.json(inserted[0], 201)
    }
    const item = { id: Date.now(), slug, ...body, created_at: new Date().toISOString() }
    memoryStore.blogPosts.unshift(item)
    return c.json(item, 201)
  } catch (err) {
    return c.json({ error: 'Gagal memposting artikel' }, 500)
  }
})

blog.delete('/:id', adminAuthMiddleware, async (c) => {
  const id = c.req.param('id')
  if (sql) {
    try {
      await sql`DELETE FROM blog_posts WHERE id = ${parseInt(id)};`
      return c.json({ success: true })
    } catch (err) {
      return c.json({ error: 'Gagal menghapus artikel' }, 500)
    }
  }
  return c.json({ success: true })
})

export { blog }
