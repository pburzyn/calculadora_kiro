import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  pruneOldEntries,
  logEvent,
  getLog,
  clearLog,
  RETENTION_DAYS,
  MAX_ENTRIES,
  type AuditEntry,
  type AuditEventType,
} from './auditLog'

// Helper: crea una entrada con timestamp relativo a ahora
function makeEntry(
  event: AuditEventType,
  daysAgo = 0,
  username: string | null = 'admin',
): AuditEntry {
  const ts = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString()
  return {
    id: `test-${Math.random()}`,
    timestamp: ts,
    event,
    username,
    detail: {},
  }
}

describe('RETENTION_DAYS', () => {
  it('vale 7', () => {
    expect(RETENTION_DAYS).toBe(7)
  })
})

describe('MAX_ENTRIES', () => {
  it('vale 500', () => {
    expect(MAX_ENTRIES).toBe(500)
  })
})

describe('pruneOldEntries', () => {
  it('conserva entradas recientes', () => {
    const entries = [makeEntry('LOGIN_SUCCESS', 0), makeEntry('LOGOUT', 1)]
    const result = pruneOldEntries(entries)
    expect(result).toHaveLength(2)
  })

  it('elimina entradas con más de 7 días', () => {
    const entries = [makeEntry('LOGIN_SUCCESS', 8), makeEntry('LOGOUT', 10)]
    const result = pruneOldEntries(entries)
    expect(result).toHaveLength(0)
  })

  it('conserva entradas de exactamente 7 días', () => {
    const entries = [makeEntry('LOGIN_SUCCESS', 7)]
    const result = pruneOldEntries(entries)
    expect(result).toHaveLength(1)
  })

  it('mezcla: conserva recientes y elimina viejas', () => {
    const entries = [
      makeEntry('CALCULATION', 0),
      makeEntry('LOGIN_SUCCESS', 8),
      makeEntry('LOGOUT', 3),
    ]
    const result = pruneOldEntries(entries)
    expect(result).toHaveLength(2)
    expect(result.every(e => e.event !== 'LOGIN_SUCCESS')).toBe(true)
  })

  it('retorna array vacío si todas son viejas', () => {
    const entries = [makeEntry('CALCULATION', 9), makeEntry('LOGOUT', 100)]
    expect(pruneOldEntries(entries)).toHaveLength(0)
  })

  it('no muta el array original', () => {
    const entries = [makeEntry('CALCULATION', 9)]
    const copy = [...entries]
    pruneOldEntries(entries)
    expect(entries).toEqual(copy)
  })

  it('retorna array vacío para input vacío', () => {
    expect(pruneOldEntries([])).toHaveLength(0)
  })
})

describe('logEvent / getLog / clearLog', () => {
  beforeEach(() => {
    clearLog()
  })

  afterEach(() => {
    clearLog()
  })

  it('agrega una entrada al log', () => {
    logEvent('LOGIN_SUCCESS', 'admin', { foo: 'bar' })
    const log = getLog()
    expect(log).toHaveLength(1)
    expect(log[0].event).toBe('LOGIN_SUCCESS')
    expect(log[0].username).toBe('admin')
    expect(log[0].detail).toEqual({ foo: 'bar' })
  })

  it('la entrada tiene timestamp ISO 8601 válido', () => {
    logEvent('LOGOUT', 'admin')
    const entry = getLog()[0]
    expect(() => new Date(entry.timestamp)).not.toThrow()
    expect(new Date(entry.timestamp).toISOString()).toBe(entry.timestamp)
  })

  it('la entrada tiene un id único', () => {
    logEvent('CALCULATION', 'admin')
    logEvent('CALCULATION', 'admin')
    const log = getLog()
    expect(log[0].id).not.toBe(log[1].id)
  })

  it('acumula múltiples entradas', () => {
    logEvent('LOGIN_SUCCESS', 'admin')
    logEvent('CALCULATION', 'admin', { expression: '2+2', result: '4' })
    logEvent('LOGOUT', 'admin')
    expect(getLog()).toHaveLength(3)
  })

  it('permite username null para eventos sin usuario', () => {
    logEvent('LOGIN_FAILURE', null, { attempted: 'hacker' })
    expect(getLog()[0].username).toBeNull()
  })

  it('trunca a MAX_ENTRIES descartando las más antiguas', () => {
    // Llenamos con MAX_ENTRIES entradas
    for (let i = 0; i < MAX_ENTRIES; i++) {
      logEvent('CALCULATION', 'admin', { i })
    }
    expect(getLog()).toHaveLength(MAX_ENTRIES)

    // La siguiente descarta la más antigua
    logEvent('RATE_LIMIT_REACHED', 'admin')
    const log = getLog()
    expect(log).toHaveLength(MAX_ENTRIES)
    // La más reciente es la última
    expect(log[log.length - 1].event).toBe('RATE_LIMIT_REACHED')
  })

  it('clearLog vacía el log', () => {
    logEvent('LOGIN_SUCCESS', 'admin')
    clearLog()
    expect(getLog()).toHaveLength(0)
  })
})

describe('exportLog', () => {
  beforeEach(() => {
    clearLog()
  })

  afterEach(() => {
    clearLog()
  })

  it('exportLog es una función exportada', async () => {
    const { exportLog } = await import('./auditLog')
    expect(typeof exportLog).toBe('function')
  })
})
