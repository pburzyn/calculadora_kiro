// TODO(v3): reemplazar con middleware de rate limiting en el servidor (ej: express-rate-limit con Redis)

export const LIMIT = 20
export const WINDOW_MS = 60_000  // 1 minuto

export interface RateLimitState {
  count: number        // cálculos realizados en la ventana actual
  windowStart: number  // timestamp (ms) del inicio de la ventana
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number  // cálculos restantes
  resetIn: number    // segundos hasta que se resetee la ventana
}

/**
 * Crea el estado inicial del rate limiter.
 */
export function createInitialState(): RateLimitState {
  return { count: 0, windowStart: Date.now() }
}

/**
 * Verifica si se puede realizar un cálculo y, si es así, incrementa el contador.
 * Si la ventana de tiempo expiró, la resetea automáticamente.
 * Función pura — no muta el estado anterior.
 */
export function checkAndIncrement(
  state: RateLimitState,
): { result: RateLimitResult; newState: RateLimitState } {
  const now = Date.now()
  const elapsed = now - state.windowStart

  // Si la ventana expiró, creamos una nueva
  if (elapsed >= WINDOW_MS) {
    const newState: RateLimitState = { count: 1, windowStart: now }
    return {
      result: { allowed: true, remaining: LIMIT - 1, resetIn: Math.ceil(WINDOW_MS / 1000) },
      newState,
    }
  }

  const resetIn = Math.ceil((WINDOW_MS - elapsed) / 1000)

  // Si ya alcanzó el límite, no incrementa
  if (state.count >= LIMIT) {
    return {
      result: { allowed: false, remaining: 0, resetIn },
      newState: { ...state },
    }
  }

  const newCount = state.count + 1
  const newState: RateLimitState = { count: newCount, windowStart: state.windowStart }

  return {
    result: { allowed: true, remaining: LIMIT - newCount, resetIn },
    newState,
  }
}

/**
 * Retorna los segundos que faltan para que se resetee la ventana.
 * Retorna 0 si la ventana ya expiró.
 */
export function getTimeUntilReset(state: RateLimitState): number {
  const elapsed = Date.now() - state.windowStart
  const remaining = WINDOW_MS - elapsed
  return Math.max(0, Math.ceil(remaining / 1000))
}
