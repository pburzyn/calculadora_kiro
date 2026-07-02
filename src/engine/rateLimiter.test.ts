import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  createInitialState,
  checkAndIncrement,
  getTimeUntilReset,
  LIMIT,
  WINDOW_MS,
  type RateLimitState,
} from './rateLimiter'

afterEach(() => {
  vi.useRealTimers()
})

describe('LIMIT y WINDOW_MS', () => {
  it('LIMIT vale 20', () => {
    expect(LIMIT).toBe(20)
  })

  it('WINDOW_MS vale 60000 (1 minuto)', () => {
    expect(WINDOW_MS).toBe(60_000)
  })
})

describe('createInitialState', () => {
  it('retorna count = 0', () => {
    expect(createInitialState().count).toBe(0)
  })

  it('retorna windowStart cercano al momento actual', () => {
    const before = Date.now()
    const state = createInitialState()
    const after = Date.now()
    expect(state.windowStart).toBeGreaterThanOrEqual(before)
    expect(state.windowStart).toBeLessThanOrEqual(after)
  })
})

describe('checkAndIncrement', () => {
  it('retorna allowed: true cuando count < LIMIT', () => {
    const state = createInitialState()
    const { result } = checkAndIncrement(state)
    expect(result.allowed).toBe(true)
  })

  it('incrementa el contador correctamente', () => {
    const state = createInitialState()
    const { newState } = checkAndIncrement(state)
    expect(newState.count).toBe(1)
  })

  it('retorna remaining correcto', () => {
    const state = createInitialState()
    const { result } = checkAndIncrement(state)
    expect(result.remaining).toBe(LIMIT - 1)
  })

  it('retorna allowed: false cuando count alcanza el límite', () => {
    const state: RateLimitState = { count: LIMIT, windowStart: Date.now() }
    const { result } = checkAndIncrement(state)
    expect(result.allowed).toBe(false)
  })

  it('no incrementa el contador cuando está limitado', () => {
    const state: RateLimitState = { count: LIMIT, windowStart: Date.now() }
    const { newState } = checkAndIncrement(state)
    expect(newState.count).toBe(LIMIT)
  })

  it('retorna remaining: 0 cuando está limitado', () => {
    const state: RateLimitState = { count: LIMIT, windowStart: Date.now() }
    const { result } = checkAndIncrement(state)
    expect(result.remaining).toBe(0)
  })

  it('resetea la ventana automáticamente si pasaron más de WINDOW_MS', () => {
    vi.useFakeTimers()
    const state: RateLimitState = {
      count: LIMIT,
      windowStart: Date.now() - WINDOW_MS - 1000,  // ventana expirada
    }
    const { result, newState } = checkAndIncrement(state)
    expect(result.allowed).toBe(true)
    expect(newState.count).toBe(1)
    expect(newState.windowStart).toBeGreaterThan(state.windowStart)
  })

  it('no muta el estado anterior', () => {
    const state = createInitialState()
    const original = { ...state }
    checkAndIncrement(state)
    expect(state).toEqual(original)
  })

  it('acumulación: 20 cálculos → el 21° está bloqueado', () => {
    let state = createInitialState()
    for (let i = 0; i < LIMIT; i++) {
      const { newState } = checkAndIncrement(state)
      state = newState
    }
    const { result } = checkAndIncrement(state)
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('incluye resetIn en el resultado', () => {
    const state = createInitialState()
    const { result } = checkAndIncrement(state)
    expect(typeof result.resetIn).toBe('number')
    expect(result.resetIn).toBeGreaterThanOrEqual(0)
  })
})

describe('getTimeUntilReset', () => {
  it('retorna segundos restantes correctamente', () => {
    vi.useFakeTimers()
    const state: RateLimitState = {
      count: LIMIT,
      windowStart: Date.now() - 10_000,  // 10 segundos usados
    }
    const secs = getTimeUntilReset(state)
    expect(secs).toBe(50)  // 60 - 10 = 50
  })

  it('retorna 0 si la ventana ya expiró', () => {
    vi.useFakeTimers()
    const state: RateLimitState = {
      count: LIMIT,
      windowStart: Date.now() - WINDOW_MS - 5000,
    }
    expect(getTimeUntilReset(state)).toBe(0)
  })

  it('retorna número entero (ceil)', () => {
    vi.useFakeTimers()
    const state: RateLimitState = {
      count: 1,
      windowStart: Date.now() - 500,  // medio segundo usado
    }
    const secs = getTimeUntilReset(state)
    expect(Number.isInteger(secs)).toBe(true)
  })
})
