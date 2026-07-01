# Requirements — v2: Autenticación, Rate Limiting y Audit Logging

## Contexto

Esta versión agrega seguridad y observabilidad a la calculadora científica. La implementación es del lado del cliente (sin backend), simulando fielmente los flujos de una aplicación web real. Los puntos de extensión están marcados para cuando se agregue un servidor en v3.

> ⚠️ **Nota de seguridad documentada**: al no existir un backend, las credenciales están en el bundle del cliente y el rate limiting es bypasseable borrando el storage. Esto es intencional para v2 — el objetivo es el flujo UX y la estructura del código, no la seguridad real.

---

## Requerimientos Funcionales

### RF-01 — Pantalla de login
El usuario ve una pantalla de login antes de acceder a la calculadora. Incluye:
- Campo de usuario
- Campo de contraseña (texto oculto)
- Botón "Ingresar"
- Mensaje de error si las credenciales son incorrectas

### RF-02 — Credenciales
Existen exactamente 2 usuarios configurados (no hay registro). Las credenciales se definen en un archivo de configuración separado del código de negocio.

### RF-03 — Sesión con JWT simulado
Al hacer login exitoso, se genera un JWT en el cliente con:
- `sub`: nombre de usuario
- `iat`: timestamp de emisión
- `exp`: timestamp de expiración (sesión de 8 horas)

El token se almacena en `sessionStorage` (se borra al cerrar la pestaña).

### RF-04 — Rutas protegidas
Si el usuario no tiene sesión válida (token ausente o expirado), es redirigido al login automáticamente.

### RF-05 — Logout
El usuario puede cerrar sesión desde un botón visible en la app. El token se elimina y se redirige al login.

### RF-06 — Rate limiting por sesión
Máximo 20 cálculos por minuto por sesión activa. El contador se resetea automáticamente cada 60 segundos.

### RF-07 — Bloqueo y mensaje de rate limit
Al alcanzar el límite:
- El botón `=` queda deshabilitado
- Se muestra un mensaje: `"Límite alcanzado: máximo 20 cálculos por minuto. Disponible en Xs."`
- La cuenta regresiva se actualiza en tiempo real hasta que se libere el límite

### RF-08 — Registro de eventos de audit
Se registran los siguientes eventos con timestamp ISO 8601, usuario y detalle:

| Evento | Detalle registrado |
|--------|--------------------|
| `LOGIN_SUCCESS` | usuario |
| `LOGIN_FAILURE` | usuario intentado |
| `LOGOUT` | usuario |
| `CALCULATION` | expresión, resultado |
| `CALCULATION_ERROR` | expresión, código de error |
| `RATE_LIMIT_REACHED` | usuario, timestamp |
| `SESSION_EXPIRED` | usuario |

### RF-09 — Persistencia del log
El log se almacena en `localStorage` como array JSON bajo la clave `audit_log`.

### RF-10 — Rotación automática del log
Al iniciar la app, se eliminan automáticamente las entradas con más de 7 días de antigüedad.

### RF-11 — Exportación del log
El usuario puede descargar el log completo como archivo `audit-log-YYYY-MM-DD.json` desde un botón en la interfaz.

---

## Requerimientos No Funcionales

### RNF-01 — Simulación fiel
La UX debe ser indistinguible de una auth real: mismo flujo de login, mismos estados de error, misma experiencia de sesión expirada.

### RNF-02 — Puntos de extensión marcados
Cada módulo que requeriría un backend real debe tener un comentario `// TODO(v3): reemplazar con llamada a API` en el punto exacto de extensión.

### RNF-03 — TDD
Los tres módulos nuevos (`auth`, `rateLimiter`, `auditLog`) se desarrollan con TDD.

### RNF-04 — Cobertura
Cobertura mínima del 90% en statements y lines sobre los módulos nuevos de `src/engine/`.

### RNF-05 — Sin regresiones
Todos los tests de v1 (212 unitarios + 60 E2E) deben seguir pasando.

### RNF-06 — Tamaño del log
El log en localStorage no debe superar 500 entradas. Si se alcanza el límite, se descartan las entradas más antiguas (FIFO).

---

## Criterios de Aceptación

### CA-01 — Login correcto
- Dado un usuario y contraseña válidos → accede a la calculadora
- El token existe en `sessionStorage`

### CA-02 — Login incorrecto
- Credenciales inválidas → mensaje de error, no accede
- El evento `LOGIN_FAILURE` queda registrado en el log

### CA-03 — Sesión expirada
- Con un token vencido → redirige al login automáticamente
- El evento `SESSION_EXPIRED` queda registrado

### CA-04 — Logout
- Al hacer logout → redirige al login, token eliminado
- El evento `LOGOUT` queda registrado

### CA-05 — Rate limiting
- 20 cálculos en menos de 60 segundos → el 21° está bloqueado con mensaje y cuenta regresiva
- Después de 60 segundos desde el primer cálculo → el límite se resetea y se puede calcular de nuevo

### CA-06 — Audit log de cálculos
- Cada cálculo exitoso genera una entrada `CALCULATION` en el log
- Cada error genera una entrada `CALCULATION_ERROR`

### CA-07 — Rotación del log
- Entradas de más de 7 días son eliminadas al iniciar la app
- Entradas recientes se conservan

### CA-08 — Exportación
- El botón "Exportar log" descarga un archivo JSON válido con todas las entradas actuales

---

## Casos borde y decisiones

| Caso | Decisión |
|------|----------|
| Token manipulado manualmente en sessionStorage | Se considera inválido (falla la validación de firma simulada) y redirige al login |
| localStorage lleno | Se captura el error, se loguea en consola, la app sigue funcionando sin persistencia |
| Log con 500+ entradas | Se trunca eliminando las más antiguas antes de agregar la nueva |
| Rate limit al recargar la página | El contador se resetea (vive en memoria, no en storage) |
| Dos pestañas del mismo usuario | Cada pestaña tiene su propio contador de rate limit (por sessionStorage) |
