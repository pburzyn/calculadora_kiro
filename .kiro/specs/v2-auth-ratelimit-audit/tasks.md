# Tasks — v2: Autenticación, Rate Limiting y Audit Logging

## Metodología

TDD estricto: test rojo → implementación → test verde → refactor.
Los tests de v1 deben seguir pasando en todo momento.

---

## Fase 0 — Setup de v2

- [ ] **T2-00** Crear archivos de configuración
  - `src/config/users.ts` con los 2 usuarios (passwordHash generado con script)
  - `src/config/auth-config.ts` con SESSION_DURATION_MS y TOKEN_SECRET
- [ ] **T2-01** Crear script de utilidad para generar password hashes
  - `scripts/generate-hash.ts` — ejecutable con `npx tsx scripts/generate-hash.ts <password>`

---

## Fase 1 — Engine: auditLog.ts (TDD)

- [ ] **T2-10** Escribir tests — `pruneOldEntries`:
  - Elimina entradas con más de 7 días
  - Conserva entradas recientes
  - Retorna array vacío si todas son viejas
  - No muta el array original
- [ ] **T2-11** Escribir tests — `logEvent` / `getLog`:
  - Agrega entradas con timestamp ISO 8601
  - Trunca a MAX_ENTRIES (500) descartando las más antiguas
  - Persiste en localStorage
  - Captura error de localStorage sin romper la app
- [ ] **T2-12** Escribir tests — `exportLog`:
  - Genera un nombre de archivo con fecha: `audit-log-YYYY-MM-DD.json`
  - El contenido es JSON válido con todas las entradas
- [ ] **T2-13** Implementar `auditLog.ts` (pasar T2-10 a T2-12)

---

## Fase 2 — Engine: rateLimiter.ts (TDD)

- [ ] **T2-20** Escribir tests — `createInitialState`:
  - Retorna estado con count=0
- [ ] **T2-21** Escribir tests — `checkAndIncrement`:
  - Incrementa el contador si está por debajo del límite
  - Retorna `allowed: true` y `remaining` correcto
  - Retorna `allowed: false` al alcanzar el límite (count >= 20)
  - Resetea la ventana automáticamente si pasaron más de 60s
  - No muta el estado anterior
- [ ] **T2-22** Escribir tests — `getTimeUntilReset`:
  - Retorna segundos restantes correctamente
  - Retorna 0 si la ventana ya expiró
- [ ] **T2-23** Implementar `rateLimiter.ts` (pasar T2-20 a T2-22)

---

## Fase 3 — Engine: auth.ts (TDD)

- [ ] **T2-30** Escribir tests — `login`:
  - Credenciales válidas → `success: true`, token presente
  - Credenciales inválidas → `success: false`, error `INVALID_CREDENTIALS`
  - Usuario inexistente → `success: false`
- [ ] **T2-31** Escribir tests — `validateToken`:
  - Token válido → retorna payload decodificado
  - Token expirado → retorna null
  - Token manipulado (firma inválida) → retorna null
  - Token vacío/null → retorna null
- [ ] **T2-32** Escribir tests — `getStoredToken` / `clearToken`:
  - `getStoredToken` retorna el token de sessionStorage
  - `clearToken` lo elimina
- [ ] **T2-33** Implementar `auth.ts` (pasar T2-30 a T2-32)

---

## Fase 4 — Hooks (TDD)

### useAuth
- [ ] **T2-40** Escribir tests:
  - Estado inicial: `isAuthenticated: false` si no hay token
  - Estado inicial: `isAuthenticated: true` si hay token válido en sessionStorage
  - `login()` con credenciales válidas → `isAuthenticated: true`
  - `login()` con credenciales inválidas → `isAuthenticated: false`, error disponible
  - `logout()` → `isAuthenticated: false`, token eliminado
  - Token expirado al iniciar → `isAuthenticated: false`, logea `SESSION_EXPIRED`
- [ ] **T2-41** Implementar `useAuth.ts`

### useRateLimit
- [ ] **T2-42** Escribir tests:
  - Estado inicial: `isLimited: false`, `remaining: 20`
  - `recordCalculation()` decrementa `remaining`
  - Al llegar a 0: `isLimited: true`
  - `resetIn` disminuye con el tiempo
  - Después de 60s: `isLimited: false`, `remaining: 20`
- [ ] **T2-43** Implementar `useRateLimit.ts`

---

## Fase 5 — Componentes UI

### LoginPage
- [ ] **T2-50** Escribir tests:
  - Renderiza campos de usuario y contraseña
  - Renderiza botón "Ingresar"
  - Muestra error con credenciales inválidas
  - Llama `onLoginSuccess` con credenciales válidas
  - Campo contraseña tiene `type="password"`
- [ ] **T2-51** Implementar `<LoginPage />` con CSS Module

### RateLimitBanner
- [ ] **T2-52** Escribir tests:
  - Muestra mensaje con `resetIn` en segundos
  - Actualiza el mensaje cuando cambia `resetIn`
  - Tiene `role="alert"` para accesibilidad
- [ ] **T2-53** Implementar `<RateLimitBanner />` con CSS Module

### AuditPanel
- [ ] **T2-54** Escribir tests:
  - Muestra entradas del log
  - Botón "Exportar log" llama a `exportLog()`
  - Muestra "Sin eventos" cuando el log está vacío
- [ ] **T2-55** Implementar `<AuditPanel />` con CSS Module

---

## Fase 6 — Integración en App

- [ ] **T2-60** Integrar `useAuth` en `App.tsx`:
  - Si `!isAuthenticated` → renderizar `<LoginPage />`
  - Si `isAuthenticated` → renderizar la calculadora
  - Agregar botón de logout en el header
  - Llamar `auditLog.initLog()` al montar la app
- [ ] **T2-61** Integrar `useRateLimit` en `App.tsx`:
  - `recordCalculation()` antes de llamar a `calculate()`
  - Si limitado: mostrar `<RateLimitBanner resetIn={resetIn} />`
  - Deshabilitar botón `=` cuando `isLimited`
- [ ] **T2-62** Agregar botón de audit panel en el header
- [ ] **T2-63** Verificar que todos los tests de v1 siguen pasando

---

## Fase 7 — Tests E2E de v2

- [ ] **T2-70** E2E: flujo de login correcto → accede a la calculadora
- [ ] **T2-71** E2E: flujo de login incorrecto → mensaje de error
- [ ] **T2-72** E2E: logout → redirige al login
- [ ] **T2-73** E2E: rate limit → hacer 21 cálculos, verificar bloqueo y mensaje
- [ ] **T2-74** E2E: audit log → verificar que aparecen entradas tras calcular
- [ ] **T2-75** E2E: exportar log → verificar descarga del archivo

---

## Fase 8 — Verificación final

- [ ] **T2-80** Cobertura ≥ 90% en `src/engine/auth.ts`, `rateLimiter.ts`, `auditLog.ts`
- [ ] **T2-81** Suite completa v1 + v2: todos los tests unitarios pasan
- [ ] **T2-82** Suite E2E completa: todos los tests pasan
- [ ] **T2-83** Actualizar steering con estado final de v2

---

## Resumen por fase

| Fase | Descripción | Tareas |
|------|-------------|--------|
| 0 | Setup | T2-00, T2-01 |
| 1 | Engine: auditLog | T2-10 a T2-13 |
| 2 | Engine: rateLimiter | T2-20 a T2-23 |
| 3 | Engine: auth | T2-30 a T2-33 |
| 4 | Hooks | T2-40 a T2-43 |
| 5 | Componentes UI | T2-50 a T2-55 |
| 6 | Integración | T2-60 a T2-63 |
| 7 | Tests E2E | T2-70 a T2-75 |
| 8 | Verificación final | T2-80 a T2-83 |
