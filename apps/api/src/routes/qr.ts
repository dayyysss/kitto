import { Hono } from 'hono'
import { sql, memoryStore } from '../db'

const qr = new Hono()

// GET /r/:slug (Dynamic QR 302 Redirect Engine)
qr.get('/r/:slug', async (c) => {
  const slug = c.req.param('slug')
  const userPin = c.req.query('pin')

  if (sql) {
    try {
      const rows = await sql`SELECT target_url, pin, expires_at FROM qr_codes WHERE slug = ${slug} LIMIT 1;`
      const first = rows[0]
      if (first && first.target_url) {
        // Expiry verification
        if (first.expires_at && new Date(first.expires_at as string) < new Date()) {
          return c.html(`
            <!DOCTYPE html><html><head><meta charset="utf-8"><title>Tautan Kedaluwarsa</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
            <body style="font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #FAF8F5; margin: 0; color: #1C1917;">
              <div style="background: white; padding: 32px; border: 1px solid #EAE5DC; border-radius: 16px; max-width: 360px; width: 100%; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                <div style="font-size: 32px; margin-bottom: 8px;">⏳</div>
                <h3 style="margin: 0 0 8px; font-size: 16px; font-weight: 700;">Tautan Telah Kedaluwarsa</h3>
                <p style="font-size: 12px; color: #78716C; line-height: 1.5; margin: 0;">Masa aktif Dynamic QR ini sudah berakhir dan tidak dapat lagi diakses.</p>
              </div>
            </body></html>
          `, 410)
        }

        // PIN Protection verification
        if (first.pin && String(first.pin).trim() !== '') {
          if (!userPin || userPin !== String(first.pin).trim()) {
            return c.html(`
              <!DOCTYPE html><html><head><meta charset="utf-8"><title>Proteksi PIN QR</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
              <body style="font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #FAF8F5; margin: 0; color: #1C1917;">
                <form method="GET" style="background: white; padding: 32px; border: 1px solid #EAE5DC; border-radius: 16px; max-width: 320px; width: 100%; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                  <div style="font-size: 32px; margin-bottom: 8px;">🔒</div>
                  <h3 style="margin: 0 0 6px; font-size: 16px; font-weight: 700;">Tautan Dilindungi PIN</h3>
                  <p style="font-size: 12px; color: #78716C; margin: 0 0 16px;">Masukkan kode PIN untuk membuka tujuan.</p>
                  ${userPin ? '<div style="color: #E14D2A; font-size: 11px; margin-bottom: 8px; font-weight: 600;">PIN yang Anda masukkan salah.</div>' : ''}
                  <input type="password" name="pin" placeholder="Masukkan PIN" required autofocus style="width: 100%; padding: 10px; font-size: 15px; border: 1px solid #EAE5DC; border-radius: 8px; box-sizing: border-box; text-align: center; margin-bottom: 12px; outline: none;" />
                  <button type="submit" style="width: 100%; padding: 10px; background: #E14D2A; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;">Buka Tautan &rarr;</button>
                </form>
              </body></html>
            `)
          }
        }

        const targetUrl = first.target_url as string
        const userAgent = c.req.header('user-agent') || 'Unknown'
        sql`INSERT INTO scans (qr_slug, device) VALUES (${slug}, ${userAgent});`.catch(console.error)
        return c.redirect(targetUrl, 302)
      }
    } catch (err) {
      console.error('Neon redirect lookup error:', err)
    }
  }

  const mem = memoryStore.qrCodes.get(slug)
  if (mem) {
    mem.scans += 1
    return c.redirect(mem.targetUrl, 302)
  }

  return c.text('404 Tautan Dinamis Tidak Ditemukan.', 404)
})

// POST /api/qr (Create dynamic QR)
qr.post('/api/qr', async (c) => {
  try {
    const body = await c.req.json<{
      slug: string
      targetUrl: string
      title?: string
      payloadType?: string
      styleConfig?: any
      pin?: string
      expiresAt?: string
    }>()

    if (!body.slug || !body.targetUrl) {
      return c.json({ error: 'slug dan targetUrl wajib diisi' }, 400)
    }

    if (sql) {
      await sql`
        INSERT INTO qr_codes (title, slug, target_url, payload_type, style_config, pin, expires_at)
        VALUES (
          ${body.title || 'Untitled QR'},
          ${body.slug},
          ${body.targetUrl},
          ${body.payloadType || 'url'},
          ${JSON.stringify(body.styleConfig || {})},
          ${body.pin || null},
          ${body.expiresAt ? new Date(body.expiresAt) : null}
        );
      `
      return c.json({
        success: true,
        slug: body.slug,
        shortUrl: `/r/${body.slug}`,
        targetUrl: body.targetUrl,
        storage: 'Neon Postgres',
      })
    }

    memoryStore.qrCodes.set(body.slug, {
      targetUrl: body.targetUrl,
      scans: 0,
      createdAt: Date.now(),
      pin: body.pin,
      expiresAt: body.expiresAt,
    })

    return c.json({
      success: true,
      slug: body.slug,
      shortUrl: `/r/${body.slug}`,
      targetUrl: body.targetUrl,
      storage: 'Memory Fallback',
    })
  } catch (err: any) {
    if (err?.code === '23505') {
      return c.json({ error: 'Slug sudah digunakan, pilih nama lain' }, 409)
    }
    return c.json({ error: 'Gagal membuat QR Code dinamis' }, 500)
  }
})

// PUT /api/qr/:slug (Update target URL)
qr.put('/api/qr/:slug', async (c) => {
  const slug = c.req.param('slug')
  try {
    const body = await c.req.json<{ targetUrl: string; title?: string }>()
    if (!body.targetUrl) {
      return c.json({ error: 'targetUrl wajib diisi' }, 400)
    }

    if (sql) {
      const res = await sql`
        UPDATE qr_codes
        SET target_url = ${body.targetUrl}, title = COALESCE(${body.title || null}, title)
        WHERE slug = ${slug}
        RETURNING *;
      `
      if (res.length === 0) {
        return c.json({ error: 'QR Code tidak ditemukan' }, 404)
      }
      return c.json({ success: true, message: 'Target URL berhasil diubah', qr: res[0] })
    }

    const mem = memoryStore.qrCodes.get(slug)
    if (!mem) return c.json({ error: 'QR Code tidak ditemukan' }, 404)
    mem.targetUrl = body.targetUrl
    return c.json({ success: true, message: 'Target URL berhasil diubah', qr: { slug, targetUrl: mem.targetUrl } })
  } catch (err) {
    return c.json({ error: 'Gagal memperbarui target URL' }, 500)
  }
})

// GET /api/qr (List all dynamic QRs)
qr.get('/api/qr', async (c) => {
  if (sql) {
    try {
      const rows = await sql`
        SELECT q.id, q.title, q.slug, q.target_url, q.payload_type, q.created_at,
               count(s.id)::int as total_scans
        FROM qr_codes q
        LEFT JOIN scans s ON s.qr_slug = q.slug
        GROUP BY q.id, q.title, q.slug, q.target_url, q.payload_type, q.created_at
        ORDER BY q.created_at DESC
        LIMIT 30;
      `
      return c.json(rows)
    } catch (err) {
      console.error('Neon list qr error:', err)
    }
  }

  const list = Array.from(memoryStore.qrCodes.entries()).map(([slug, data]) => ({
    slug,
    title: slug,
    target_url: data.targetUrl,
    total_scans: data.scans,
    created_at: new Date(data.createdAt).toISOString(),
  }))
  return c.json(list)
})

// GET /api/qr/:slug/analytics (Analytics metrics)
qr.get('/api/qr/:slug/analytics', async (c) => {
  const slug = c.req.param('slug')

  if (sql) {
    try {
      const qrRows = await sql`SELECT * FROM qr_codes WHERE slug = ${slug} LIMIT 1;`
      const qrItem = qrRows[0]
      if (!qrItem) {
        return c.json({ error: 'Data QR tidak ditemukan' }, 404)
      }
      const scanRows = await sql`SELECT count(*)::int as count FROM scans WHERE qr_slug = ${slug};`
      const firstScan = scanRows[0]
      return c.json({
        slug,
        title: qrItem.title,
        targetUrl: qrItem.target_url,
        totalScans: firstScan?.count || 0,
        createdAt: qrItem.created_at,
      })
    } catch (err) {
      return c.json({ error: 'Gagal membaca analitik' }, 500)
    }
  }

  const mem = memoryStore.qrCodes.get(slug)
  if (!mem) return c.json({ error: 'Data QR tidak ditemukan' }, 404)
  return c.json({
    slug,
    targetUrl: mem.targetUrl,
    totalScans: mem.scans,
    createdAt: new Date(mem.createdAt).toISOString(),
  })
})

export { qr }
