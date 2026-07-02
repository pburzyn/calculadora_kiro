// TODO(v3): SESSION_DURATION_MS puede venir de variable de entorno del servidor
// TODO(v3): TOKEN_SECRET DEBE venir de variable de entorno del servidor, nunca del cliente
export const SESSION_DURATION_MS = 8 * 60 * 60 * 1000  // 8 horas
export const TOKEN_SECRET = 'calc-v2-dev-secret-do-not-use-in-production'
