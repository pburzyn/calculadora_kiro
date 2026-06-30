import { describe, it, expect, beforeEach } from 'vitest'
import {
  addEntry,
  clearHistory,
  HISTORY_LIMIT,
  type HistoryEntry,
} from './history'

function makeEntry(expression: string, result: string, timestamp = 0): HistoryEntry {
  return { expression, result, timestamp }
}

describe('HISTORY_LIMIT', () => {
  it('vale 10', () => {
    expect(HISTORY_LIMIT).toBe(10)
  })
})

describe('addEntry', () => {
  it('agrega una entrada a un historial vacío', () => {
    const history = addEntry([], makeEntry('2+2', '4'))
    expect(history).toHaveLength(1)
    expect(history[0].expression).toBe('2+2')
    expect(history[0].result).toBe('4')
  })

  it('agrega la nueva entrada al inicio (orden cronológico inverso)', () => {
    const h1 = addEntry([], makeEntry('1+1', '2', 1))
    const h2 = addEntry(h1, makeEntry('3+3', '6', 2))
    expect(h2[0].expression).toBe('3+3')
    expect(h2[1].expression).toBe('1+1')
  })

  it('no muta el array original', () => {
    const original: HistoryEntry[] = [makeEntry('1+1', '2')]
    addEntry(original, makeEntry('2+2', '4'))
    expect(original).toHaveLength(1)
  })

  it('trunca a HISTORY_LIMIT entradas cuando se supera el límite', () => {
    let history: HistoryEntry[] = []
    for (let i = 0; i < 12; i++) {
      history = addEntry(history, makeEntry(`${i}+${i}`, `${i * 2}`, i))
    }
    expect(history).toHaveLength(HISTORY_LIMIT)
  })

  it('descarta la entrada más antigua cuando se supera el límite', () => {
    let history: HistoryEntry[] = []
    for (let i = 0; i < 10; i++) {
      history = addEntry(history, makeEntry(`op${i}`, `res${i}`, i))
    }
    // La última entrada agregada (op9) debe estar al inicio
    expect(history[0].expression).toBe('op9')
    // La primera entrada (op0) debe seguir presente
    expect(history[HISTORY_LIMIT - 1].expression).toBe('op0')

    // Agregamos una más: op0 debe desaparecer
    history = addEntry(history, makeEntry('op10', 'res10', 10))
    expect(history).toHaveLength(HISTORY_LIMIT)
    expect(history[0].expression).toBe('op10')
    expect(history.find(e => e.expression === 'op0')).toBeUndefined()
  })

  it('preserva el timestamp de la entrada', () => {
    const entry = makeEntry('sin(30)', '0.5', 1234567890)
    const history = addEntry([], entry)
    expect(history[0].timestamp).toBe(1234567890)
  })

  it('preserva la expresión y el resultado exactamente', () => {
    const entry = makeEntry('√144 + 2^3', '20')
    const history = addEntry([], entry)
    expect(history[0].expression).toBe('√144 + 2^3')
    expect(history[0].result).toBe('20')
  })
})

describe('clearHistory', () => {
  it('retorna un array vacío', () => {
    expect(clearHistory()).toEqual([])
  })

  it('retorna un array vacío sin importar el estado previo', () => {
    let history: HistoryEntry[] = []
    for (let i = 0; i < 5; i++) {
      history = addEntry(history, makeEntry(`op${i}`, `res${i}`))
    }
    expect(clearHistory()).toEqual([])
  })

  it('retorna siempre un nuevo array', () => {
    const a = clearHistory()
    const b = clearHistory()
    expect(a).not.toBe(b)
  })
})

describe('flujo completo', () => {
  let history: HistoryEntry[]

  beforeEach(() => {
    history = []
  })

  it('3 operaciones quedan en orden inverso', () => {
    history = addEntry(history, makeEntry('1+1', '2', 1))
    history = addEntry(history, makeEntry('2×3', '6', 2))
    history = addEntry(history, makeEntry('√9', '3', 3))

    expect(history[0].expression).toBe('√9')
    expect(history[1].expression).toBe('2×3')
    expect(history[2].expression).toBe('1+1')
  })

  it('tras clearHistory el historial queda vacío', () => {
    history = addEntry(history, makeEntry('1+1', '2'))
    history = clearHistory()
    expect(history).toHaveLength(0)
  })
})
