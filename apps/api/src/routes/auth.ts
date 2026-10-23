import { Hono } from 'hono'
import { sql, memoryStore } from '../db'
import { hashPassword, verifyPassword, createAdminToken } from '../utils/crypto'
import { adminAuthMiddleware } from '../middleware/adminAuth'
import { rateLimit } from '../middleware/rateLimit'
import { getClientIp, verifyTurnstile } from '../utils/turnstile'

const auth = new Hono()

// Rate-limiting for administrator login to prevent brute force attacks
const adminLoginAttempts = new Map<string, { count: number; lockedUntil: number }>()

// POST /api/auth/register (For regular creators / users)
auth.post('/register', rateLimit(5), async (c) => {
  try {
    const { name, email, password, turnstileToken } = await c.req.json<{
      name?: string
      email?: string
      password?: string
      turnstileToken?: string
    }>()

    if (!name?.trim() || !email?.trim() || !password) {
      return c.json({ error: 'Nama, email, dan kata sandi wajib diisi.' }, 400)
    }

    const cleanEmail = email.trim().toLowerCase()
    if (name.trim().length > 80) {
      return c.json({ error: 'Nama maksimal 80 karakter.' }, 400)
    }
    if (cleanEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return c.json({ error: 'Format email tidak valid.' }, 400)
    }
    if (password.length < 6 || password.length > 128) {
      return c.json({ error: 'Kata sandi harus 6-128 karakter.' }, 400)
    }

    const verified = await verifyTurnstile(turnstileToken, getClientIp(c))
    if (!verified) {
      return c.json({ error: 'Verifikasi keamanan gagal. Muat ulang halaman lalu coba lagi.' }, 403)
    }

    const passwordHash = await hashPassword(password)

    if (sql) {
      const existing = await sql`SELECT id FROM users WHERE email = ${cleanEmail} LIMIT 1;`
      if (existing.length > 0) {
        return c.json({ error: 'Email ini sudah terdaftar.' }, 409)
      }

      const inserted = await sql`
        INSERT INTO users (name, email, password_hash, role)
        VALUES (${name.trim()}, ${cleanEmail}, ${passwordHash}, 'kreator')
        RETURNING id, name, email, role, avatar, bio, phone, created_at;
      `
      return c.json({
        success: true,
        message: 'Akun Kreator berhasil dibuat.',
        user: inserted[0],
      }, 201)
    }

    if (memoryStore.users.some((u) => u.email === cleanEmail)) {
      return c.json({ error: 'Email ini sudah terdaftar.' }, 409)
    }

    const newUser = {
      id: memoryStore.users.length + 1,
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      role: 'kreator',
      avatar: undefined,
      bio: undefined,
      phone: undefined,
      createdAt: new Date().toISOString(),
    }
    memoryStore.users.push(newUser)

    return c.json({
      success: true,
      message: 'Akun Kreator berhasil dibuat.',
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, avatar: newUser.avatar, bio: newUser.bio, phone: newUser.phone },
    }, 201)
  } catch (err) {
    console.error('Register error:', err)
    return c.json({ error: 'Gagal memproses pendaftaran akun.' }, 500)
  }
})

// POST /api/auth/login (Regular Creator Login)
auth.post('/login', rateLimit(10), async (c) => {
  try {
    const { email, password, turnstileToken } = await c.req.json<{
      email?: string
      password?: string
      turnstileToken?: string
    }>()

    if (!email?.trim() || !password) {
      return c.json({ error: 'Email dan kata sandi wajib diisi.' }, 400)
    }

    const cleanEmail = email.trim().toLowerCase()
    if (cleanEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) || password.length > 128) {
      return c.json({ error: 'Email atau kata sandi salah.' }, 401)
    }

    const verified = await verifyTurnstile(turnstileToken, getClientIp(c))
    if (!verified) {
      return c.json({ error: 'Verifikasi keamanan gagal. Muat ulang halaman lalu coba lagi.' }, 403)
    }

    if (sql) {
      const rows = await sql`
        SELECT id, name, email, password_hash, role, avatar, bio, phone, created_at
        FROM users
        WHERE email = ${cleanEmail}
        LIMIT 1;
      `
      const user = rows[0]
      if (!user) {
        return c.json({ error: 'Email atau kata sandi salah.' }, 401)
      }

      const isValid = await verifyPassword(password, user.password_hash as string)
      if (!isValid) {
        return c.json({ error: 'Email atau kata sandi salah.' }, 401)
      }

      return c.json({
        success: true,
        message: 'Berhasil masuk ke Ruang Kerja.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          bio: user.bio,
          phone: user.phone,
        },
      })
    }

    const memUser = memoryStore.users.find((u) => u.email === cleanEmail)
    if (!memUser || !(await verifyPassword(password, memUser.passwordHash))) {
      return c.json({ error: 'Email atau kata sandi salah.' }, 401)
    }

    return c.json({
      success: true,
      message: 'Berhasil masuk ke Ruang Kerja.',
      user: {
        id: memUser.id,
        name: memUser.name,
        email: memUser.email,
        role: memUser.role,
        avatar: memUser.avatar,
        bio: memUser.bio,
        phone: memUser.phone,
      },
    })
  } catch (err) {
    console.error('Login error:', err)
    return c.json({ error: 'Gagal memproses login.' }, 500)
  }
})

function parseJwtPayload(token: string): any {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const base64Url = parts[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const buff = Buffer.from(base64, 'base64')
    return JSON.parse(buff.toString('utf-8'))
  } catch {
    return null
  }
}

// POST /api/auth/google (Google One-Tap / OAuth Credential Sign-In)
auth.post('/google', async (c) => {
  try {
    const { credential, email, name, avatar } = await c.req.json<{
      credential?: string
      email?: string
      name?: string
      avatar?: string
    }>()

    let userEmail = email?.trim().toLowerCase()
    let userName = name?.trim() || 'Kreator Kitto'
    let userAvatar = avatar

    if (credential) {
      const payload = parseJwtPayload(credential)
      if (payload && payload.email) {
        userEmail = payload.email.toLowerCase()
        userName = payload.name || userName
        userAvatar = payload.picture || userAvatar
      } else {
        return c.json({ error: 'Kredensial token Google tidak valid.' }, 400)
      }
    }

    if (!userEmail) {
      return c.json({ error: 'Email Google wajib disertakan.' }, 400)
    }

    if (sql) {
      const existing = await sql`
        SELECT id, name, email, role, avatar, bio, phone, created_at
        FROM users
        WHERE email = ${userEmail}
        LIMIT 1;
      `

      if (existing.length > 0) {
        const user = existing[0]
        if (userAvatar && !user.avatar) {
          await sql`UPDATE users SET avatar = ${userAvatar} WHERE id = ${user.id};`
        }
        return c.json({
          success: true,
          message: 'Berhasil masuk dengan akun Google.',
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar || userAvatar,
            bio: user.bio,
            phone: user.phone,
          },
        })
      }

      // First-time Google user registration
      const randomPassword = `GGL_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
      const passwordHash = await hashPassword(randomPassword)

      const inserted = await sql`
        INSERT INTO users (name, email, password_hash, role, avatar)
        VALUES (${userName}, ${userEmail}, ${passwordHash}, 'kreator', ${userAvatar || null})
        RETURNING id, name, email, role, avatar, bio, phone, created_at;
      `

      return c.json({
        success: true,
        message: 'Akun Kreator berhasil dibuat melalui Google.',
        user: inserted[0],
      }, 201)
    }

    // In-memory fallback
    const memUser = memoryStore.users.find((u) => u.email === userEmail)
    if (memUser) {
      if (userAvatar && !memUser.avatar) memUser.avatar = userAvatar
      return c.json({
        success: true,
        message: 'Berhasil masuk dengan akun Google.',
        user: {
          id: memUser.id,
          name: memUser.name,
          email: memUser.email,
          role: memUser.role,
          avatar: memUser.avatar,
          bio: memUser.bio,
          phone: memUser.phone,
        },
      })
    }

    const newUser = {
      id: memoryStore.users.length + 1,
      name: userName,
      email: userEmail,
      passwordHash: await hashPassword(`GGL_${Date.now()}`),
      role: 'kreator',
      avatar: userAvatar,
      bio: undefined,
      phone: undefined,
      createdAt: new Date().toISOString(),
    }
    memoryStore.users.push(newUser)

    return c.json({
      success: true,
      message: 'Akun Kreator berhasil dibuat melalui Google.',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar,
        bio: newUser.bio,
        phone: newUser.phone,
      },
    }, 201)
  } catch (err) {
    console.error('Google auth error:', err)
    return c.json({ error: 'Gagal memproses autentikasi Google.' }, 500)
  }
})

// PUT /api/auth/profile (Update Username, Avatar, Bio, Phone, Password)
auth.put('/profile', async (c) => {
  try {
    const { id, name, avatar, bio, phone, currentPassword, newPassword } = await c.req.json<{
      id: number
      name?: string
      avatar?: string | null
      bio?: string | null
      phone?: string | null
      currentPassword?: string
      newPassword?: string
    }>()

    if (!id) {
      return c.json({ error: 'ID akun pengguna wajib disertakan.' }, 400)
    }

    if (name !== undefined && !name.trim()) {
      return c.json({ error: 'Nama pengguna tidak boleh kosong.' }, 400)
    }

    // High security check for password modification
    let newHash: string | null = null
    if (newPassword) {
      if (!currentPassword) {
        return c.json({ error: 'Kata sandi saat ini (lama) wajib diisi untuk mengubah kata sandi baru.' }, 400)
      }

      if (newPassword.length < 6) {
        return c.json({ error: 'Kata sandi baru minimal 6 karakter.' }, 400)
      }

      if (newPassword === currentPassword) {
        return c.json({ error: 'Kata sandi baru harus berbeda dari kata sandi lama.' }, 400)
      }
    }

    if (sql) {
      // If changing password, verify old password first
      if (newPassword) {
        const userRows = await sql`SELECT password_hash FROM users WHERE id = ${id} LIMIT 1;`
        if (userRows.length === 0) {
          return c.json({ error: 'Pengguna tidak ditemukan.' }, 404)
        }
        const isMatch = await verifyPassword(currentPassword as string, userRows[0].password_hash as string)
        if (!isMatch) {
          return c.json({ error: 'Kata sandi saat ini (lama) yang Anda masukkan salah.' }, 401)
        }
        newHash = await hashPassword(newPassword)
      }

      let updated
      if (newHash) {
        updated = await sql`
          UPDATE users
          SET name = COALESCE(${name?.trim() || null}, name),
              avatar = ${avatar !== undefined ? avatar : sql`avatar`},
              bio = ${bio !== undefined ? bio?.trim() || null : sql`bio`},
              phone = ${phone !== undefined ? phone?.trim() || null : sql`phone`},
              password_hash = ${newHash}
          WHERE id = ${id}
          RETURNING id, name, email, role, avatar, bio, phone, created_at;
        `
      } else {
        updated = await sql`
          UPDATE users
          SET name = COALESCE(${name?.trim() || null}, name),
              avatar = ${avatar !== undefined ? avatar : sql`avatar`},
              bio = ${bio !== undefined ? bio?.trim() || null : sql`bio`},
              phone = ${phone !== undefined ? phone?.trim() || null : sql`phone`}
          WHERE id = ${id}
          RETURNING id, name, email, role, avatar, bio, phone, created_at;
        `
      }

      if (updated.length === 0) {
        return c.json({ error: 'Pengguna tidak ditemukan.' }, 404)
      }

      return c.json({
        success: true,
        message: 'Profil berhasil diperbarui.',
        user: updated[0],
      })
    }

    // In-memory fallback
    const userIdx = memoryStore.users.findIndex((u) => u.id === id)
    if (userIdx === -1) {
      return c.json({ error: 'Pengguna tidak ditemukan.' }, 404)
    }

    if (newPassword) {
      const isMatch = await verifyPassword(currentPassword as string, memoryStore.users[userIdx].passwordHash)
      if (!isMatch) {
        return c.json({ error: 'Kata sandi saat ini (lama) yang Anda masukkan salah.' }, 401)
      }
      newHash = await hashPassword(newPassword)
    }

    if (name) memoryStore.users[userIdx].name = name.trim()
    if (avatar !== undefined) memoryStore.users[userIdx].avatar = avatar || undefined
    if (bio !== undefined) memoryStore.users[userIdx].bio = bio?.trim() || undefined
    if (phone !== undefined) memoryStore.users[userIdx].phone = phone?.trim() || undefined
    if (newHash) memoryStore.users[userIdx].passwordHash = newHash

    const u = memoryStore.users[userIdx]
    return c.json({
      success: true,
      message: 'Profil berhasil diperbarui.',
      user: {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        avatar: u.avatar,
        bio: u.bio,
        phone: u.phone,
      },
    })
  } catch (err) {
    console.error('Update profile error:', err)
    return c.json({ error: 'Gagal memperbarui profil pengguna.' }, 500)
  }
})

// POST /api/auth/admin-login (Dedicated Administrator Portal Login with Rate-Limiting & JWT)
auth.post('/admin-login', async (c) => {
  try {
    const { email, password } = await c.req.json<{ email?: string; password?: string }>()

    if (!email?.trim() || !password) {
      return c.json({ error: 'Email dan kata sandi administrator wajib diisi.' }, 400)
    }

    const cleanEmail = email.trim().toLowerCase()
    const now = Date.now()
    const attempt = adminLoginAttempts.get(cleanEmail)

    // Check brute-force lockout (5 attempts -> 15 min lockout)
    if (attempt && attempt.lockedUntil > now) {
      const remainingMin = Math.ceil((attempt.lockedUntil - now) / 60000)
      return c.json(
        { error: `Terlalu banyak percobaan gagal. Akses dikunci sementara selama ${remainingMin} menit.` },
        429
      )
    }

    const recordFailedAttempt = () => {
      const current = adminLoginAttempts.get(cleanEmail) || { count: 0, lockedUntil: 0 }
      current.count += 1
      if (current.count >= 5) {
        current.lockedUntil = now + 15 * 60 * 1000 // Lock for 15 minutes
      }
      adminLoginAttempts.set(cleanEmail, current)
    }

    if (sql) {
      const rows = await sql`
        SELECT id, name, email, password_hash, role
        FROM users
        WHERE email = ${cleanEmail}
        LIMIT 1;
      `
      const user = rows[0]
      if (!user) {
        recordFailedAttempt()
        return c.json({ error: 'Kredensial administrator tidak valid.' }, 401)
      }

      if (user.role !== 'admin') {
        recordFailedAttempt()
        return c.json({ error: 'Akses ditolak: Akun ini bukan administrator.' }, 403)
      }

      const isValid = await verifyPassword(password, user.password_hash as string)
      if (!isValid) {
        recordFailedAttempt()
        return c.json({ error: 'Kredensial administrator tidak valid.' }, 401)
      }

      // Reset failed attempts on success
      adminLoginAttempts.delete(cleanEmail)

      // Generate cryptographically signed HMAC-SHA256 Token
      const token = await createAdminToken(user.id as number, user.email as string)

      return c.json({
        success: true,
        message: 'Autentikasi Administrator Berhasil.',
        token,
        admin: { id: user.id, name: user.name, email: user.email, role: user.role },
      })
    }

    if (cleanEmail === 'admin@kitto.dev' && password === 'admin12345') {
      adminLoginAttempts.delete(cleanEmail)
      const token = await createAdminToken(1, 'admin@kitto.dev')
      return c.json({
        success: true,
        message: 'Autentikasi Administrator Berhasil (Fallback).',
        token,
        admin: { id: 1, name: 'Administrator Kitto', email: 'admin@kitto.dev', role: 'admin' },
      })
    }

    recordFailedAttempt()
    return c.json({ error: 'Kredensial administrator tidak valid.' }, 401)
  } catch (err) {
    console.error('Admin login error:', err)
    return c.json({ error: 'Gagal memproses autentikasi administrator.' }, 500)
  }
})

// GET /api/auth/admin-verify (Verify token validity & role on page reload)
auth.get('/admin-verify', adminAuthMiddleware, async (c) => {
  const admin = c.get('admin')
  return c.json({ ok: true, admin })
})

// GET /api/auth/users (Admin-only list of users with Middleware Guard)
auth.get('/users', adminAuthMiddleware, async (c) => {
  if (sql) {
    try {
      const rows = await sql`
        SELECT id, name, email, role, created_at
        FROM users
        ORDER BY created_at DESC;
      `
      return c.json(rows)
    } catch (err) {
      console.error('Fetch users error:', err)
      return c.json([])
    }
  }
  return c.json(memoryStore.users)
})

// DELETE /api/auth/users/:id (Admin-only delete user with Middleware Guard)
auth.delete('/users/:id', adminAuthMiddleware, async (c) => {
  const id = c.req.param('id')
  if (sql) {
    try {
      await sql`DELETE FROM users WHERE id = ${parseInt(id)};`
      return c.json({ success: true, message: 'Pengguna berhasil dihapus.' })
    } catch (err) {
      return c.json({ error: 'Gagal menghapus pengguna.' }, 500)
    }
  }
  return c.json({ success: true })
})

// PUT /api/auth/users/:id/role (Admin-only change user role with Middleware Guard)
auth.put('/users/:id/role', adminAuthMiddleware, async (c) => {
  const id = c.req.param('id')
  try {
    const { role } = await c.req.json<{ role: string }>()
    if (!role || !['kreator', 'admin'].includes(role)) {
      return c.json({ error: 'Peran tidak valid.' }, 400)
    }
    if (sql) {
      await sql`UPDATE users SET role = ${role} WHERE id = ${parseInt(id)};`
    }
    return c.json({ success: true })
  } catch (err) {
    return c.json({ error: 'Gagal mengubah peran.' }, 500)
  }
})

// POST /api/auth/users/bulk-delete (Admin-only bulk delete with Middleware Guard)
auth.post('/users/bulk-delete', adminAuthMiddleware, async (c) => {
  try {
    const { ids } = await c.req.json<{ ids: number[] }>()
    if (!ids || ids.length === 0) {
      return c.json({ error: 'Tidak ada pengguna yang dipilih.' }, 400)
    }
    if (sql) {
      await sql`DELETE FROM users WHERE id = ANY(${ids}) AND role != 'admin';`
    }
    return c.json({ success: true, deleted: ids.length })
  } catch (err) {
    return c.json({ error: 'Gagal menghapus pengguna.' }, 500)
  }
})

export { auth }
