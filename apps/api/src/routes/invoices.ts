import { Hono } from 'hono'
import { sql, memoryStore } from '../db'

const invoices = new Hono()

invoices.get('/', async (c) => {
  if (sql) {
    try {
      const rows = await sql`SELECT * FROM invoices ORDER BY created_at DESC LIMIT 50;`
      return c.json(rows)
    } catch (err) {
      console.error('Invoices query error:', err)
    }
  }
  return c.json(memoryStore.invoices)
})

invoices.post('/', async (c) => {
  try {
    const body = await c.req.json<{
      invoiceNum: string
      fromCompany: string
      clientName: string
      totalAmount: number
      status?: string
      items: any[]
    }>()

    if (sql) {
      const inserted = await sql`
        INSERT INTO invoices (invoice_num, from_company, client_name, total_amount, status, items)
        VALUES (
          ${body.invoiceNum},
          ${body.fromCompany},
          ${body.clientName},
          ${body.totalAmount},
          ${body.status || 'unpaid'},
          ${JSON.stringify(body.items || [])}
        )
        RETURNING *;
      `
      return c.json(inserted[0], 201)
    }
    const item = { id: Date.now(), ...body }
    memoryStore.invoices.unshift(item)
    return c.json(item, 201)
  } catch (err) {
    return c.json({ error: 'Gagal menyimpan invoice' }, 400)
  }
})

invoices.put('/:id/status', async (c) => {
  const id = c.req.param('id')
  try {
    const body = await c.req.json<{ status: string }>()
    if (sql) {
      const res = await sql`
        UPDATE invoices SET status = ${body.status} WHERE id = ${parseInt(id)} RETURNING *;
      `
      return c.json({ success: true, invoice: res[0] })
    }
    return c.json({ success: true })
  } catch (err) {
    return c.json({ error: 'Gagal mengubah status' }, 500)
  }
})

invoices.delete('/:id', async (c) => {
  const id = c.req.param('id')
  if (sql) {
    try {
      await sql`DELETE FROM invoices WHERE id = ${parseInt(id)};`
      return c.json({ success: true })
    } catch (err) {
      return c.json({ error: 'Gagal menghapus invoice' }, 500)
    }
  }
  return c.json({ success: true })
})

export { invoices }
