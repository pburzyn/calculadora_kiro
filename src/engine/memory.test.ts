import { describe, it, expect } from 'vitest'
import {
  memoryAdd,
  memorySub,
  memoryRecall,
  memoryClear,
  EMPTY_MEMORY,
  type MemoryState,
} from './memory'

describe('EMPTY_MEMORY', () => {
  it('tiene value 0', () => {
    expect(EMPTY_MEMORY.value).toBe(0)
  })

  it('tiene hasValue en false', () => {
    expect(EMPTY_MEMORY.hasValue).toBe(false)
  })
})

describe('memoryAdd', () => {
  it('suma el valor actual a una memoria vacía', () => {
    const result = memoryAdd(10, EMPTY_MEMORY)
    expect(result.value).toBe(10)
    expect(result.hasValue).toBe(true)
  })

  it('acumula correctamente con un valor previo en memoria', () => {
    const withValue: MemoryState = { value: 5, hasValue: true }
    const result = memoryAdd(3, withValue)
    expect(result.value).toBe(8)
    expect(result.hasValue).toBe(true)
  })

  it('M+ dos veces acumula ambos valores', () => {
    const step1 = memoryAdd(10, EMPTY_MEMORY)
    const step2 = memoryAdd(10, step1)
    expect(step2.value).toBe(20)
  })

  it('no muta el estado anterior', () => {
    const original: MemoryState = { value: 5, hasValue: true }
    memoryAdd(3, original)
    expect(original.value).toBe(5)
  })

  it('suma valores negativos correctamente', () => {
    const withValue: MemoryState = { value: 10, hasValue: true }
    const result = memoryAdd(-4, withValue)
    expect(result.value).toBe(6)
  })

  it('suma cero no cambia el valor', () => {
    const withValue: MemoryState = { value: 7, hasValue: true }
    const result = memoryAdd(0, withValue)
    expect(result.value).toBe(7)
    expect(result.hasValue).toBe(true)
  })
})

describe('memorySub', () => {
  it('resta el valor actual a una memoria vacía (0 - x)', () => {
    const result = memorySub(3, EMPTY_MEMORY)
    expect(result.value).toBe(-3)
    expect(result.hasValue).toBe(true)
  })

  it('resta correctamente con un valor previo en memoria', () => {
    const withValue: MemoryState = { value: 10, hasValue: true }
    const result = memorySub(4, withValue)
    expect(result.value).toBe(6)
    expect(result.hasValue).toBe(true)
  })

  it('M- dos veces acumula correctamente', () => {
    const step1 = memorySub(5, EMPTY_MEMORY)  // 0 - 5 = -5
    const step2 = memorySub(3, step1)          // -5 - 3 = -8
    expect(step2.value).toBe(-8)
  })

  it('no muta el estado anterior', () => {
    const original: MemoryState = { value: 10, hasValue: true }
    memorySub(3, original)
    expect(original.value).toBe(10)
  })
})

describe('memoryRecall', () => {
  it('retorna 0 cuando la memoria está vacía', () => {
    expect(memoryRecall(EMPTY_MEMORY)).toBe(0)
  })

  it('retorna el valor almacenado', () => {
    const withValue: MemoryState = { value: 42, hasValue: true }
    expect(memoryRecall(withValue)).toBe(42)
  })

  it('retorna un valor negativo correctamente', () => {
    const withValue: MemoryState = { value: -7.5, hasValue: true }
    expect(memoryRecall(withValue)).toBe(-7.5)
  })
})

describe('memoryClear', () => {
  it('retorna un estado con value 0', () => {
    const result = memoryClear()
    expect(result.value).toBe(0)
  })

  it('retorna un estado con hasValue en false', () => {
    const result = memoryClear()
    expect(result.hasValue).toBe(false)
  })

  it('es equivalente a EMPTY_MEMORY', () => {
    expect(memoryClear()).toEqual(EMPTY_MEMORY)
  })
})

describe('flujo completo M+, MR, M-, MC', () => {
  it('M+(50), MR retorna 50', () => {
    const m1 = memoryAdd(50, EMPTY_MEMORY)
    expect(memoryRecall(m1)).toBe(50)
  })

  it('M+(50), M+(20), MR retorna 70', () => {
    const m1 = memoryAdd(50, EMPTY_MEMORY)
    const m2 = memoryAdd(20, m1)
    expect(memoryRecall(m2)).toBe(70)
  })

  it('M+(50), M-(20), MR retorna 30', () => {
    const m1 = memoryAdd(50, EMPTY_MEMORY)
    const m2 = memorySub(20, m1)
    expect(memoryRecall(m2)).toBe(30)
  })

  it('M+(50), MC, MR retorna 0', () => {
    const m1 = memoryAdd(50, EMPTY_MEMORY)
    const m2 = memoryClear()
    expect(memoryRecall(m1)).toBe(50)   // m1 no cambió
    expect(memoryRecall(m2)).toBe(0)    // m2 es memoria limpia
  })
})
