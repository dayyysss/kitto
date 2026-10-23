export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  )
  const derived = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  )
  const saltHex = Array.from(salt)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  const hashHex = Array.from(new Uint8Array(derived))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return `${saltHex}:${hashHex}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(':')
  if (!saltHex || !hashHex) return false
  const match = saltHex.match(/.{1,2}/g)
  if (!match) return false
  const salt = new Uint8Array(match.map((byte) => parseInt(byte, 16)))
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  )
  const derived = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  )
  const checkHex = Array.from(new Uint8Array(derived))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return checkHex === hashHex
}

const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET || 'kitto-ops-vermilion-secret-key-2026-auth'

export async function createAdminToken(userId: number, email: string): Promise<string> {
  const enc = new TextEncoder()
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const exp = Math.floor(Date.now() / 1000) + 24 * 60 * 60 // 24 hours
  const payload = Buffer.from(
    JSON.stringify({
      sub: userId,
      email,
      role: 'admin',
      exp,
      iat: Math.floor(Date.now() / 1000),
    })
  ).toString('base64url')

  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(ADMIN_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(`${header}.${payload}`))
  const sigBase64 = Buffer.from(new Uint8Array(signature)).toString('base64url')
  return `${header}.${payload}.${sigBase64}`
}

export async function verifyAdminToken(token: string): Promise<{ valid: boolean; payload?: any }> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return { valid: false }
    const [header, payload, sig] = parts

    const enc = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(ADMIN_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )
    const sigBytes = Buffer.from(sig, 'base64url')
    const isValid = await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(`${header}.${payload}`))
    if (!isValid) return { valid: false }

    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'))
    const now = Math.floor(Date.now() / 1000)
    if (parsed.exp && parsed.exp < now) {
      return { valid: false } // Expired
    }
    if (parsed.role !== 'admin') {
      return { valid: false }
    }
    return { valid: true, payload: parsed }
  } catch {
    return { valid: false }
  }
}
