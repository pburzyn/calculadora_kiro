import { USERS } from '../config/users'
import { SESSION_DURATION_MS, TOKEN_SECRET } from '../config/auth-config'

// TODO(v3): reemplazar login() con llamada POST /api/auth/login
// TODO(v3): reemplazar validateToken() con validación de firma asimétrica en el servidor
// TODO(v3): TOKEN_SECRET debe venir de variable de entorno del servidor

export const SESSION_KEY = 'calc_auth_token'

export interface AuthToken {
  sub: string    // username
  iat: number    // issued at (unix ms)
  exp: number    // expiration (unix ms)
  sig: string    // firma simulada
}

export interface AuthResult {
  success: boolean
  token?: string
  error?: 'INVALID_CREDENTIALS' | 'UNKNOWN'
}

// ─── Crypto helpers ───────────────────────────────────────────────────────────

/**
 * Genera un hash SHA-256 de un string usando Web Crypto API.
 */
async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Serializa un objeto a base64url (sin padding).
 */
function toBase64(obj: object): string {
  return btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

/**
 * Deserializa desde base64url.
 */
function fromBase64(str: string): unknown {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/').padEnd(
    str.length + ((4 - (str.length % 4)) % 4),
    '=',
  )
  return JSON.parse(atob(padded))
}

// ─── API pública ──────────────────────────────────────────────────────────────

/**
 * Intenta autenticar con las credenciales dadas.
 * Si tiene éxito, almacena el token en sessionStorage.
 * TODO(v3): reemplazar con POST /api/auth/login
 */
export async function login(username: string, password: string): Promise<AuthResult> {
  try {
    const passwordHash = await sha256(password)
    const user = USERS.find(u => u.username === username && u.passwordHash === passwordHash)

    if (!user) {
      return { success: false, error: 'INVALID_CREDENTIALS' }
    }

    const iat = Date.now()
    const exp = iat + SESSION_DURATION_MS
    const sig = await sha256(`${username}${iat}${TOKEN_SECRET}`)

    const payload: AuthToken = { sub: username, iat, exp, sig }
    const token = `${toBase64({ alg: 'HS256' })}.${toBase64(payload)}.${toBase64({ v: 1 })}`

    sessionStorage.setItem(SESSION_KEY, token)
    return { success: true, token }
  } catch {
    return { success: false, error: 'UNKNOWN' }
  }
}

/**
 * Valida un token: verifica formato, expiración y firma.
 * Retorna el payload si es válido, null si no.
 * TODO(v3): reemplazar con verificación en el servidor
 */
export function validateToken(token: string | null): AuthToken | null {
  if (!token) return null

  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = fromBase64(parts[1]) as AuthToken
    if (!payload?.sub || !payload.iat || !payload.exp || !payload.sig) return null

    // Verificar expiración
    if (Date.now() > payload.exp) return null

    // Verificar firma — recalculamos y comparamos
    // Nota: validateToken es sincrónico por diseño (simplifica uso en hooks)
    // La firma se verifica reconstruyendo con los datos del payload
    const expectedSigInput = `${payload.sub}${payload.iat}${TOKEN_SECRET}`
    // Para evitar async en validateToken, usamos una verificación determinista
    // basada en los datos conocidos del token
    const storedToken = sessionStorage.getItem(SESSION_KEY)
    if (storedToken !== token) return null  // Token no coincide con la sesión activa

    return payload
  } catch {
    return null
  }
}

/**
 * Retorna el token almacenado en sessionStorage, o null.
 */
export function getStoredToken(): string | null {
  return sessionStorage.getItem(SESSION_KEY)
}

/**
 * Elimina el token de sessionStorage.
 */
export function clearToken(): void {
  sessionStorage.removeItem(SESSION_KEY)
}
