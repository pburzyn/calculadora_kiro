import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  login,
  validateToken,
  getStoredToken,
  clearToken,
  SESSION_KEY,
  type AuthResult,
} from './auth'

// Limpiamos sessionStorage entre tests
beforeEach(() => {
  sessionStorage.clear()
})
afterEach(() => {
  sessionStorage.clear()
  vi.useRealTimers()
})

describe('login', () => {
  it('credenciales válidas retornan success: true', async () => {
    const result = await login('admin', 'Admin1234!')
    expect(result.success).toBe(true)
  })

  it('credenciales válidas retornan un token', async () => {
    const result = await login('admin', 'Admin1234!')
    expect(result.token).toBeDefined()
    expect(typeof result.token).toBe('string')
    expect(result.token!.length).toBeGreaterThan(0)
  })

  it('credenciales inválidas retornan success: false', async () => {
    const result = await login('admin', 'wrongpassword')
    expect(result.success).toBe(false)
  })

  it('credenciales inválidas retornan error INVALID_CREDENTIALS', async () => {
    const result = await login('admin', 'wrongpassword')
    expect(result.error).toBe('INVALID_CREDENTIALS')
  })

  it('usuario inexistente retorna success: false', async () => {
    const result = await login('hacker', 'cualquiercosa')
    expect(result.success).toBe(false)
    expect(result.error).toBe('INVALID_CREDENTIALS')
  })

  it('segundo usuario válido también puede hacer login', async () => {
    const result = await login('usuario', 'User1234!')
    expect(result.success).toBe(true)
    expect(result.token).toBeDefined()
  })

  it('login exitoso almacena el token en sessionStorage', async () => {
    await login('admin', 'Admin1234!')
    expect(sessionStorage.getItem(SESSION_KEY)).not.toBeNull()
  })

  it('login fallido no almacena token', async () => {
    await login('admin', 'wrong')
    expect(sessionStorage.getItem(SESSION_KEY)).toBeNull()
  })
})

describe('validateToken', () => {
  it('token válido retorna el payload', async () => {
    const { token } = await login('admin', 'Admin1234!')
    const payload = validateToken(token!)
    expect(payload).not.toBeNull()
    expect(payload!.sub).toBe('admin')
  })

  it('token válido tiene iat y exp', async () => {
    const { token } = await login('admin', 'Admin1234!')
    const payload = validateToken(token!)
    expect(typeof payload!.iat).toBe('number')
    expect(typeof payload!.exp).toBe('number')
    expect(payload!.exp).toBeGreaterThan(payload!.iat)
  })

  it('token null retorna null', () => {
    expect(validateToken(null)).toBeNull()
  })

  it('token vacío retorna null', () => {
    expect(validateToken('')).toBeNull()
  })

  it('token malformado retorna null', () => {
    expect(validateToken('esto.no.es.un.token')).toBeNull()
  })

  it('token con firma manipulada retorna null', async () => {
    const { token } = await login('admin', 'Admin1234!')
    // Modificamos el payload pero dejamos la firma original
    const parts = token!.split('.')
    const fakePayload = btoa(JSON.stringify({ sub: 'hacker', iat: 0, exp: 9999999999 }))
    const tamperedToken = `${parts[0]}.${fakePayload}.${parts[2]}`
    expect(validateToken(tamperedToken)).toBeNull()
  })

  it('token expirado retorna null', async () => {
    vi.useFakeTimers()
    // Congelamos el tiempo para el login
    const loginTime = Date.now()
    vi.setSystemTime(loginTime)
    const { token } = await login('admin', 'Admin1234!')

    // Avanzamos 9 horas (sesión dura 8h)
    vi.setSystemTime(loginTime + 9 * 60 * 60 * 1000)
    expect(validateToken(token!)).toBeNull()
  })
})

describe('getStoredToken / clearToken', () => {
  it('getStoredToken retorna null cuando no hay token', () => {
    expect(getStoredToken()).toBeNull()
  })

  it('getStoredToken retorna el token almacenado tras login', async () => {
    const { token } = await login('admin', 'Admin1234!')
    expect(getStoredToken()).toBe(token)
  })

  it('clearToken elimina el token de sessionStorage', async () => {
    await login('admin', 'Admin1234!')
    clearToken()
    expect(getStoredToken()).toBeNull()
  })
})
