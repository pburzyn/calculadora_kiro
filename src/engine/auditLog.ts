export type AuditEventType =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'LOGOUT'
  | 'CALCULATION'
  | 'CALCULATION_ERROR'
  | 'RATE_LIMIT_REACHED'
  | 'SESSION_EXPIRED'

export interface AuditEntry {
  id: string
  timestamp: string
  event: AuditEventType
  username: string | null
  detail: Record<string, unknown>
}

export const RETENTION_DAYS = 7
export const MAX_ENTRIES = 500
const STORAGE_KEY = 'audit_log'

// ─── Funciones puras ──────────────────────────────────────────────────────────

/**
 * Elimina entradas con más de RETENTION_DAYS días de antigüedad.
 * Función pura — no muta el array original.
 */
export function pruneOldEntries(entries: AuditEntry[]): AuditEntry[] {
  const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000
  return entries.filter(e => new Date(e.timestamp).getTime() >= cutoff)
}

// ─── Persistencia ─────────────────────────────────────────────────────────────

function readLog(): AuditEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as AuditEntry[]
  } catch {
    return []
  }
}

function writeLog(entries: AuditEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch (err) {
    console.warn('[auditLog] No se pudo persistir el log:', err)
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// ─── API pública ──────────────────────────────────────────────────────────────

/**
 * Registra un evento de auditoría.
 * Trunca a MAX_ENTRIES si se supera el límite (descarta los más antiguos).
 * TODO(v3): reemplazar con llamada POST /api/audit
 */
export function logEvent(
  event: AuditEventType,
  username: string | null,
  detail: Record<string, unknown> = {},
): void {
  const entry: AuditEntry = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    event,
    username,
    detail,
  }

  const current = readLog()
  const updated = [...current, entry]

  // Truncar si supera el límite, descartando los más antiguos (primeros del array)
  const trimmed = updated.length > MAX_ENTRIES
    ? updated.slice(updated.length - MAX_ENTRIES)
    : updated

  writeLog(trimmed)
}

/**
 * Retorna todas las entradas del log.
 */
export function getLog(): AuditEntry[] {
  return readLog()
}

/**
 * Limpia el log completamente.
 */
export function clearLog(): void {
  writeLog([])
}

/**
 * Poda entradas antiguas y persiste. Llamar al iniciar la app.
 */
export function initLog(): void {
  const current = readLog()
  const pruned = pruneOldEntries(current)
  if (pruned.length !== current.length) {
    writeLog(pruned)
  }
}

/**
 * Descarga el log completo como archivo JSON.
 * TODO(v3): reemplazar con llamada GET /api/audit/export
 */
export function exportLog(): void {
  const entries = readLog()
  const date = new Date().toISOString().slice(0, 10)
  const filename = `audit-log-${date}.json`
  const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
