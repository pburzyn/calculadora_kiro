export interface HistoryEntry {
  expression: string
  result: string
  timestamp: number
}

export const HISTORY_LIMIT = 10

/**
 * Agrega una nueva entrada al inicio del historial.
 * Si se supera HISTORY_LIMIT, descarta la entrada más antigua.
 * No muta el array original — retorna uno nuevo.
 */
export function addEntry(
  history: HistoryEntry[],
  entry: HistoryEntry,
): HistoryEntry[] {
  return [entry, ...history].slice(0, HISTORY_LIMIT)
}

/**
 * Limpia el historial completo.
 * Retorna siempre un nuevo array vacío.
 */
export function clearHistory(): HistoryEntry[] {
  return []
}
