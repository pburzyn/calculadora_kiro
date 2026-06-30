export interface MemoryState {
  value: number
  hasValue: boolean
}

export const EMPTY_MEMORY: MemoryState = {
  value: 0,
  hasValue: false,
}

/**
 * M+: suma el valor actual al slot de memoria.
 * Retorna un nuevo estado sin mutar el anterior.
 */
export function memoryAdd(current: number, memory: MemoryState): MemoryState {
  return {
    value: memory.value + current,
    hasValue: true,
  }
}

/**
 * M-: resta el valor actual del slot de memoria.
 * Retorna un nuevo estado sin mutar el anterior.
 */
export function memorySub(current: number, memory: MemoryState): MemoryState {
  return {
    value: memory.value - current,
    hasValue: true,
  }
}

/**
 * MR: retorna el valor almacenado en memoria.
 * Retorna 0 si la memoria está vacía.
 */
export function memoryRecall(memory: MemoryState): number {
  return memory.value
}

/**
 * MC: limpia la memoria.
 * Retorna un nuevo estado equivalente a EMPTY_MEMORY.
 */
export function memoryClear(): MemoryState {
  return { ...EMPTY_MEMORY }
}
