import type { MiddlewareHandler } from 'hono'
import { verifyAdminToken } from '../utils/crypto'

export const adminAuthMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json(
      { error: 'Akses ditolak: Token autentikasi administrator tidak disertakan.' },
      401
    )
  }

  const token = authHeader.substring(7).trim()
  const result = await verifyAdminToken(token)

  if (!result.valid) {
    return c.json(
      { error: 'Akses ditolak: Sesi administrator tidak valid atau telah kedaluwarsa. Silakan masuk kembali.' },
      401
    )
  }

  c.set('admin', result.payload)
  await next()
}
