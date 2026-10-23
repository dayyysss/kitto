import { Hono } from 'hono'
import { sql, memoryStore } from '../db'
import { adminAuthMiddleware } from '../middleware/adminAuth'
import { rateLimit } from '../middleware/rateLimit'

const stats = new Hono()

function parseUserAgent(ua: string) {
  const uaLower = (ua || '').toLowerCase()
  let device = 'desktop'
  if (/ipad|tablet/i.test(uaLower)) {
    device = 'tablet'
  } else if (/mobile|android|iphone|ipod/i.test(uaLower)) {
    device = 'mobile'
  }

  let browser = 'Lainnya'
  if (/edg\//i.test(uaLower)) {
    browser = 'Edge'
  } else if (/opr\/|opera/i.test(uaLower)) {
    browser = 'Opera'
  } else if (/chrome|crios/i.test(uaLower)) {
    browser = 'Chrome'
  } else if (/firefox|fxios/i.test(uaLower)) {
    browser = 'Firefox'
  } else if (/safari/i.test(uaLower)) {
    browser = 'Safari'
  }

  return { device, browser }
}

// POST /api/stats/visit (Record an anonymous page view)
stats.post('/visit', async (c) => {
  try {
    const { path } = await c.req.json<{ path?: string }>()
    if (!path || path.startsWith('/atelier-ops') || path.startsWith('/api')) {
      return c.json({ ok: true })
    }

    const ua = c.req.header('user-agent') || ''
    const { device, browser } = parseUserAgent(ua)

    if (sql) {
      await sql`
        INSERT INTO page_views (path, device, browser)
        VALUES (${path}, ${device}, ${browser});
      `
      return c.json({ ok: true })
    }

    // In-Memory fallback
    memoryStore.pageViews.unshift({
      id: Date.now(),
      path,
      device,
      browser,
      created_at: new Date().toISOString(),
    })
    if (memoryStore.pageViews.length > 5000) {
      memoryStore.pageViews.pop()
    }

    return c.json({ ok: true })
  } catch (err) {
    return c.json({ ok: true })
  }
})

// POST /api/stats/tool (Record an anonymous tool open)
stats.post('/tool', rateLimit(30), async (c) => {
  try {
    const { toolId } = await c.req.json<{ toolId?: string }>()
    if (!toolId || !/^[a-z0-9-]{1,64}$/.test(toolId)) return c.json({ ok: true })

    if (sql) {
      await sql`INSERT INTO tool_usage (tool_id) VALUES (${toolId});`
      return c.json({ ok: true })
    }

    memoryStore.toolUsage.unshift({ id: Date.now(), tool_id: toolId, created_at: new Date().toISOString() })
    if (memoryStore.toolUsage.length > 5000) memoryStore.toolUsage.pop()

    return c.json({ ok: true })
  } catch {
    return c.json({ ok: true })
  }
})

// GET /api/stats/overview (Aggregate visitor analytics for Admin)
stats.get('/overview', adminAuthMiddleware, async (c) => {
  try {
    if (sql) {
      // 1. Total Views
      const totalRes = await sql`SELECT count(*)::int as total FROM page_views;`
      const totalViews = totalRes[0]?.total || 0

      // 2. Today's Views
      const todayRes = await sql`
        SELECT count(*)::int as today
        FROM page_views
        WHERE created_at >= CURRENT_DATE;
      `
      const todayViews = todayRes[0]?.today || 0

      // 3. Last 7 Days Daily Breakdown
      const last7DaysRes = await sql`
        SELECT 
          TO_CHAR(d.day, 'DD Mon') as date_label,
          COUNT(p.id)::int as views
        FROM GENERATE_SERIES(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day'::interval) d(day)
        LEFT JOIN page_views p ON DATE(p.created_at) = DATE(d.day)
        GROUP BY d.day
        ORDER BY d.day ASC;
      `

      // 4. Top 6 Visited Pages
      const topPagesRes = await sql`
        SELECT path, count(*)::int as views
        FROM page_views
        GROUP BY path
        ORDER BY views DESC
        LIMIT 6;
      `

      // 5. Device Breakdown
      const devicesRes = await sql`
        SELECT device, count(*)::int as count
        FROM page_views
        GROUP BY device;
      `

      // 6. Browser Breakdown
      const browsersRes = await sql`
        SELECT browser, count(*)::int as count
        FROM page_views
        GROUP BY browser
        ORDER BY count DESC
        LIMIT 5;
      `

      // 7. Recent Visits
      const recentRes = await sql`
        SELECT path, device, browser, created_at
        FROM page_views
        ORDER BY created_at DESC
        LIMIT 10;
      `

      return c.json({
        totalViews,
        todayViews,
        last7Days: last7DaysRes,
        topPages: topPagesRes,
        devices: devicesRes,
        browsers: browsersRes,
        recentVisits: recentRes,
      })
    }

    // In-memory calculation
    const totalViews = memoryStore.pageViews.length
    const todayStr = new Date().toISOString().slice(0, 10)
    const todayViews = memoryStore.pageViews.filter((p) => p.created_at.startsWith(todayStr)).length

    // 7 days mockup
    const last7Days: Array<{ date_label: string; views: number }> = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const ds = d.toISOString().slice(0, 10)
      const label = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
      const count = memoryStore.pageViews.filter((p) => p.created_at.startsWith(ds)).length
      last7Days.push({ date_label: label, views: count })
    }

    // Top pages
    const pageCounts: Record<string, number> = {}
    memoryStore.pageViews.forEach((p) => {
      pageCounts[p.path] = (pageCounts[p.path] || 0) + 1
    })
    const topPages = Object.entries(pageCounts)
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 6)

    // Devices
    const devCounts: Record<string, number> = {}
    memoryStore.pageViews.forEach((p) => {
      devCounts[p.device] = (devCounts[p.device] || 0) + 1
    })
    const devices = Object.entries(devCounts).map(([device, count]) => ({ device, count }))

    // Browsers
    const brCounts: Record<string, number> = {}
    memoryStore.pageViews.forEach((p) => {
      brCounts[p.browser] = (brCounts[p.browser] || 0) + 1
    })
    const browsers = Object.entries(brCounts)
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return c.json({
      totalViews,
      todayViews,
      last7Days,
      topPages,
      devices,
      browsers,
      recentVisits: memoryStore.pageViews.slice(0, 10),
    })
  } catch (err) {
    console.error('Stats error:', err)
    return c.json({ error: 'Gagal memuat statistik.' }, 500)
  }
})

// GET /api/stats/tools (Aggregate tool usage for Admin)
stats.get('/tools', adminAuthMiddleware, async (c) => {
  try {
    if (sql) {
      const totalsRes = await sql`
        SELECT
          count(*)::int AS total,
          count(DISTINCT tool_id)::int AS unique_tools,
          count(*) FILTER (WHERE created_at >= CURRENT_DATE)::int AS today
        FROM tool_usage;
      `
      const toolsRes = await sql`
        SELECT tool_id, count(*)::int AS uses, max(created_at) AS last_used_at
        FROM tool_usage
        GROUP BY tool_id
        ORDER BY uses DESC;
      `
      const last7Res = await sql`
        SELECT
          TO_CHAR(d.day, 'DD Mon') AS date_label,
          count(t.id)::int AS uses
        FROM GENERATE_SERIES(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day'::interval) d(day)
        LEFT JOIN tool_usage t ON DATE(t.created_at) = DATE(d.day)
        GROUP BY d.day
        ORDER BY d.day ASC;
      `
      const recentRes = await sql`
        SELECT tool_id, created_at
        FROM tool_usage
        ORDER BY created_at DESC
        LIMIT 10;
      `

      return c.json({
        totalUses: totalsRes[0]?.total || 0,
        todayUses: totalsRes[0]?.today || 0,
        uniqueTools: totalsRes[0]?.unique_tools || 0,
        last7Days: last7Res,
        tools: toolsRes,
        recent: recentRes,
      })
    }

    const usage = memoryStore.toolUsage
    const todayStr = new Date().toISOString().slice(0, 10)
    const counts: Record<string, { uses: number; last_used_at: string }> = {}
    usage.forEach((item) => {
      const entry = counts[item.tool_id] || { uses: 0, last_used_at: item.created_at }
      entry.uses += 1
      if (item.created_at > entry.last_used_at) entry.last_used_at = item.created_at
      counts[item.tool_id] = entry
    })

    const last7Days: Array<{ date_label: string; uses: number }> = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const ds = d.toISOString().slice(0, 10)
      const label = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
      last7Days.push({
        date_label: label,
        uses: usage.filter((item) => item.created_at.startsWith(ds)).length,
      })
    }

    return c.json({
      totalUses: usage.length,
      todayUses: usage.filter((item) => item.created_at.startsWith(todayStr)).length,
      uniqueTools: Object.keys(counts).length,
      last7Days,
      tools: Object.entries(counts)
        .map(([tool_id, value]) => ({ tool_id, uses: value.uses, last_used_at: value.last_used_at }))
        .sort((a, b) => b.uses - a.uses),
      recent: usage.slice(0, 10),
    })
  } catch (err) {
    console.error('Tool stats error:', err)
    return c.json({ error: 'Gagal memuat statistik alat.' }, 500)
  }
})

export { stats }
