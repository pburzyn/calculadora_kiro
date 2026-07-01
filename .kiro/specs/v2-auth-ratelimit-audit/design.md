# Design — v2: Autenticación, Rate Limiting y Audit Logging

## Arquitectura general

La v2 extiende la arquitectura de v1 sin modificar los módulos existentes del engine. Se agregan tres módulos nuevos en `src/engine/` y dos componentes nuevos en `src/components/`.

```
┌─────────────────────────────────────────────────┐
│              Capa de Presentación               │
│  <LoginPage>  <AuditPanel>  <RateLimitBanner>   │
│  (nuevos)     (nuevo)       (nuevo)             │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│              Capa de Estado                     │
│  useAuth    useRateLimit    (useCalculator v1)  │
│  (nuevo)    (nuevo)                             │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│              Capa de Engine                     │
│  auth.ts    rateLimiter.ts    auditLog.ts        │
│  (nuevo)    (nuevo)           (nuevo)            │
│  ─────────────────────────────────────────────  │
│  evaluator · formatter · memory · history (v1)  │
└─────────────────────────────────────────────────┘
```

---

## Módulos nuevos del engine

### `auth.ts`

Gestiona credenciales y tokens JWT simulados.

```typescript
interface User {
  username: string
  passwordHash: string   // SHA-256 del password, nunca el password en claro
}

interface AuthToken {
  sub: string            // username
  iat: number            // issued at (unix timestamp)
  exp: number            // expiration (iat + 8h)
  sig: string            // firma simulada: SHA-256(sub + iat + SECRET)
}

interface AuthResult {
  success: boolean
  token?: string         // JWT simulado serializado como base64
  error?: 'INVALID_CREDENTIALS' | 'UNKNOWN'
}

// Funciones exportadas
function login(username: string, password: string): AuthResult
function logout(token: string): void
function validateToken(token: string): AuthToken | null
function getStoredToken(): string | null
function clearToken(): void
```

**Decisiones:**
- Las credenciales se leen de `src/config/users.ts` (no hardcodeadas en `auth.ts`).
- El "hash" de contraseña es SHA-256 usando la Web Crypto API (disponible en todos los browsers modernos).
- La "firma" del token es SHA-256 de `(sub + iat + SECRET)` donde SECRET es una constante en `src/config/auth-config.ts`.
- El token se almacena en `sessionStorage` — se pierde al cerrar la pestaña.
- `// TODO(v3): reemplazar login() con llamada POST /api/auth/login`
- `// TODO(v3): reemplazar validateToken() con validación de firma asimétrica en el servidor`

### `rateLimiter.ts`

Gestiona el límite de cálculos por sesión en memoria.

```typescript
interface RateLimitState {
  count: number          // cálculos en la ventana actual
  windowStart: number    // timestamp inicio de la ventana (unix ms)
}

interface RateLimitResult {
  allowed: boolean
  remaining: number      // cálculos restantes en la ventana
  resetIn: number        // segundos hasta reseteo
}

const LIMIT = 20
const WINDOW_MS = 60_000  // 1 minuto

function checkAndIncrement(state: RateLimitState): { result: RateLimitResult; newState: RateLimitState }
function getTimeUntilReset(state: RateLimitState): number   // segundos
function createInitialState(): RateLimitState
```

**Decisiones:**
- El estado vive en memoria (no persiste entre recargas) — consistente con "rate limit por sesión".
- Ventana deslizante fija: se resetea 60s después del inicio de la ventana, no del último cálculo.
- Funciones puras sobre estado inmutable — fácil de testear.
- `// TODO(v3): reemplazar con middleware de rate limiting en el servidor (ej: express-rate-limit)`

### `auditLog.ts`

Gestiona el registro de eventos de auditoría.

```typescript
type AuditEventType =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'LOGOUT'
  | 'CALCULATION'
  | 'CALCULATION_ERROR'
  | 'RATE_LIMIT_REACHED'
  | 'SESSION_EXPIRED'

interface AuditEntry {
  id: string             // UUID v4 simulado
  timestamp: string      // ISO 8601
  event: AuditEventType
  username: string | null
  detail: Record<string, unknown>
}

const MAX_ENTRIES = 500
const RETENTION_DAYS = 7
const STORAGE_KEY = 'audit_log'

function logEvent(event: AuditEventType, username: string | null, detail?: Record<string, unknown>): void
function getLog(): AuditEntry[]
function pruneOldEntries(entries: AuditEntry[]): AuditEntry[]   // elimina > 7 días
function exportLog(): void                                       // descarga JSON
function initLog(): void                                         // llama pruneOldEntries al arrancar
```

**Decisiones:**
- `logEvent` lee el log actual, agrega la entrada nueva, trunca si supera MAX_ENTRIES, y persiste.
- `pruneOldEntries` es una función pura — recibe y retorna arrays, fácil de testear.
- Si `localStorage` falla (cuota excedida), el error se captura y se loguea en `console.warn`.
- `// TODO(v3): reemplazar logEvent() con llamada POST /api/audit`

---

## Componentes nuevos

### `<LoginPage />`

Pantalla completa de login. Reemplaza la calculadora cuando no hay sesión válida.

```
┌─────────────────────────────────┐
│                                 │
│      Calculadora Científica     │
│                                 │
│   ┌─────────────────────────┐   │
│   │  Usuario                │   │
│   └─────────────────────────┘   │
│   ┌─────────────────────────┐   │
│   │  Contraseña             │   │
│   └─────────────────────────┘   │
│                                 │
│   [    Ingresar    ]            │
│                                 │
│   ⚠ Credenciales incorrectas    │
│                                 │
└─────────────────────────────────┘
```

Props: `onLoginSuccess: (token: string) => void`

### `<RateLimitBanner />`

Banner que aparece sobre el keypad cuando se alcanza el límite.

```
┌─────────────────────────────────────────────────┐
│  ⏱ Límite alcanzado: máximo 20 cálculos/min.   │
│     Disponible en 43s.                          │
└─────────────────────────────────────────────────┘
```

Props: `resetIn: number` (segundos)

### `<AuditPanel />`

Panel colapsable (drawer) accesible desde un botón en el header.
Muestra las últimas N entradas del log con filtro por tipo de evento.
Incluye botón "Exportar log".

---

## Hooks nuevos

### `useAuth`

```typescript
interface AuthState {
  isAuthenticated: boolean
  username: string | null
  token: string | null
}

interface AuthActions {
  login: (username: string, password: string) => Promise<AuthResult>
  logout: () => void
}
```

Inicializa leyendo el token de `sessionStorage` y validándolo. Si está expirado, llama a `auditLog.logEvent('SESSION_EXPIRED', ...)` y limpia el token.

### `useRateLimit`

```typescript
interface RateLimitHookResult {
  isLimited: boolean
  remaining: number
  resetIn: number
  recordCalculation: () => boolean   // retorna false si está limitado
}
```

Mantiene el `RateLimitState` en memoria. Usa `setInterval` para actualizar `resetIn` cada segundo cuando está limitado.

---

## Flujo de arranque de la app

```
App carga
    │
    ├─► auditLog.initLog()         // poda entradas > 7 días
    │
    ├─► useAuth.init()             // lee token de sessionStorage
    │         │
    │         ├── token válido  → muestra calculadora
    │         └── token inválido/ausente → muestra LoginPage
    │
    └─► useRateLimit.init()        // estado fresco en memoria
```

## Flujo de un cálculo con v2

```
Usuario presiona =
    │
    ├─► useRateLimit.recordCalculation()
    │         │
    │         ├── limitado → muestra RateLimitBanner
    │         │              logEvent('RATE_LIMIT_REACHED', ...)
    │         │              return (no evalúa)
    │         └── ok → continúa
    │
    ├─► useCalculator.calculate()  (lógica v1 sin cambios)
    │         │
    │         ├── éxito → logEvent('CALCULATION', expr, result)
    │         └── error → logEvent('CALCULATION_ERROR', expr, errorCode)
    │
    └─► actualiza UI
```

---

## Archivos de configuración nuevos

### `src/config/users.ts`
```typescript
// TODO(v3): eliminar este archivo — los usuarios viven en la base de datos del servidor
export const USERS = [
  { username: 'admin', passwordHash: '<sha256-del-password>' },
  { username: 'usuario', passwordHash: '<sha256-del-password>' },
]
```

### `src/config/auth-config.ts`
```typescript
// TODO(v3): SECRET debe venir de variable de entorno del servidor, nunca del cliente
export const SESSION_DURATION_MS = 8 * 60 * 60 * 1000  // 8 horas
export const TOKEN_SECRET = 'calc-v2-dev-secret'
```

---

## Extensibilidad para v3 (backend real)

Todos los puntos de extensión están marcados con `// TODO(v3)`. Para migrar a backend real:

1. `auth.ts`: `login()` → POST `/api/auth/login`, `validateToken()` → verificación en servidor
2. `rateLimiter.ts`: reemplazar por middleware Express con Redis
3. `auditLog.ts`: `logEvent()` → POST `/api/audit`, almacenamiento en base de datos
4. `src/config/users.ts`: eliminar, usuarios en DB
5. `src/config/auth-config.ts`: SECRET desde variable de entorno del servidor
