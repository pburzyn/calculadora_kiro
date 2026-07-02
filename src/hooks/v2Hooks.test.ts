import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuth } from './useAuth'
import { useRateLimit } from './useRateLimit'

// ─── useAuth ────────────────────────────────────────────────────────────────

describe('useAuth — estado inicial', () => {
  beforeEach(() => sessionStorage.clear())
  afterEach(() => { sessionStorage.clear(); vi.useRealTimers() })

  it('isAuthenticated es false sin token', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('username es null sin token', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.username).toBeNull()
  })

  it('isAuthenticated es true si hay token válido en sessionStorage', async () => {
    // Hacemos login previo para tener token
    const { login } = await import('../engine/auth')
    await login('admin', 'Admin1234!')
    const { result } = renderHook(() => useAuth())
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.username).toBe('admin')
  })
})

describe('useAuth — login', () => {
  beforeEach(() => sessionStorage.clear())
  afterEach(() => sessionStorage.clear())

  it('login con credenciales válidas → isAuthenticated: true', async () => {
    const { result } = renderHook(() => useAuth())
    await act(async () => {
      await result.current.login('admin', 'Admin1234!')
    })
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.username).toBe('admin')
  })

  it('login con credenciales inválidas → isAuthenticated: false', async () => {
    const { result } = renderHook(() => useAuth())
    await act(async () => {
      await result.current.login('admin', 'wrong')
    })
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('login fallido expone el error', async () => {
    const { result } = renderHook(() => useAuth())
    await act(async () => {
      await result.current.login('admin', 'wrong')
    })
    expect(result.current.error).toBe('INVALID_CREDENTIALS')
  })

  it('login exitoso limpia el error previo', async () => {
    const { result } = renderHook(() => useAuth())
    await act(async () => { await result.current.login('admin', 'wrong') })
    expect(result.current.error).not.toBeNull()
    await act(async () => { await result.current.login('admin', 'Admin1234!') })
    expect(result.current.error).toBeNull()
  })
})

describe('useAuth — logout', () => {
  beforeEach(() => sessionStorage.clear())
  afterEach(() => sessionStorage.clear())

  it('logout → isAuthenticated: false', async () => {
    const { result } = renderHook(() => useAuth())
    await act(async () => { await result.current.login('admin', 'Admin1234!') })
    act(() => result.current.logout())
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.username).toBeNull()
  })
})

// ─── useRateLimit ────────────────────────────────────────────────────────────

describe('useRateLimit — estado inicial', () => {
  it('isLimited es false inicialmente', () => {
    const { result } = renderHook(() => useRateLimit())
    expect(result.current.isLimited).toBe(false)
  })

  it('remaining empieza en 20', () => {
    const { result } = renderHook(() => useRateLimit())
    expect(result.current.remaining).toBe(20)
  })
})

describe('useRateLimit — recordCalculation', () => {
  it('retorna true cuando está permitido', () => {
    const { result } = renderHook(() => useRateLimit())
    let allowed: boolean = false
    act(() => { allowed = result.current.recordCalculation() })
    expect(allowed).toBe(true)
  })

  it('decrementa remaining en 1', () => {
    const { result } = renderHook(() => useRateLimit())
    act(() => { result.current.recordCalculation() })
    expect(result.current.remaining).toBe(19)
  })

  it('retorna false cuando está limitado', () => {
    const { result } = renderHook(() => useRateLimit())
    // Hacemos 20 cálculos
    act(() => {
      for (let i = 0; i < 20; i++) result.current.recordCalculation()
    })
    let allowed: boolean = true
    act(() => { allowed = result.current.recordCalculation() })
    expect(allowed).toBe(false)
  })

  it('isLimited es true al alcanzar el límite', () => {
    const { result } = renderHook(() => useRateLimit())
    act(() => {
      for (let i = 0; i < 20; i++) result.current.recordCalculation()
    })
    expect(result.current.isLimited).toBe(true)
  })

  it('resetIn es mayor a 0 cuando está limitado', () => {
    const { result } = renderHook(() => useRateLimit())
    act(() => {
      for (let i = 0; i < 20; i++) result.current.recordCalculation()
    })
    expect(result.current.resetIn).toBeGreaterThan(0)
  })
})
