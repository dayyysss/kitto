import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { initDatabase, sql } from './src/db'
import { auth } from './src/routes/auth'
import { qr } from './src/routes/qr'
import { invoices } from './src/routes/invoices'
import { presets } from './src/routes/presets'
import { blog } from './src/routes/blog'
import { releases } from './src/routes/releases'
import { feedback } from './src/routes/feedback'
import { settings } from './src/routes/settings'
import { history } from './src/routes/history'
import { stats } from './src/routes/stats'
import { errors } from './src/routes/errors'

const app = new Hono()

app.onError((err, c) => {
  console.error('[api-error]', c.req.method, c.req.path, err)
  return c.json({ error: 'Terjadi kesalahan pada server.' }, 500)
})

// CORS Middleware
app.use(
  '*',
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', '*'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
)

// Initialize database tables & seed initial administrator
initDatabase()

// Health check endpoint
app.get('/', (c) => {
  return c.json({
    name: 'Kitto API Server',
    database: sql ? 'Neon Postgres (Connected)' : 'In-Memory (Awaiting DATABASE_URL)',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  })
})

// Mount Modular Routes
app.route('/', qr) // Serves /r/:slug and /api/qr
app.route('/api/auth', auth) // Serves /api/auth/register, /login, /admin-login, /users
app.route('/api/history', history)
app.route('/api/invoices', invoices)
app.route('/api/presets', presets)
app.route('/api/blog', blog)
app.route('/api/releases', releases)
app.route('/api/feedback', feedback)
app.route('/api/settings', settings)
app.route('/api/stats', stats)
app.route('/api/errors', errors)

export default {
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  fetch: app.fetch,
}
