# Product

## Overview

- **Nombre**: Calculadora Científica
- **Propósito**: Aplicación web que permite resolver expresiones matemáticas complejas, incluyendo operaciones científicas, fracciones, trigonometría, logaritmos, potencias y raíces.
- **Usuarios objetivo**: Uso personal; nivel matemático equivalente a tercer año del Colegio Nacional Buenos Aires.
- **Plataforma**: Web, exclusivamente desktop (no responsive).

---

## v1 — Calculadora Científica (completada)

### Capacidades
- Ingreso de expresión completa antes de evaluar
- Operaciones básicas con paréntesis para agrupación
- Funciones científicas: trigonométricas, logaritmos, potencias, raíces, factorial
- Soporte para fracciones con toggle decimal ↔ fracción
- Constantes π y e
- Conversión grados/radianes
- Memoria de un slot (M+, M-, MR, MC)
- Historial de las últimas 10 operaciones por sesión
- Entrada por botones y por teclado físico
- Mensajes de error en español

### Criterio de éxito (verificado)
La calculadora resuelve correctamente ejercicios de potencias, raíces y fracciones del nivel de tercer año del Colegio Nacional Buenos Aires.

---

## v2 — Autenticación, Rate Limiting y Audit Logging (en desarrollo)

### Capacidades nuevas
- Pantalla de login con usuario/contraseña
- Sesión con JWT simulado (8 horas, se pierde al cerrar la pestaña)
- 2 usuarios configurados (no hay registro)
- Rutas protegidas — redirige al login si no hay sesión válida
- Logout explícito
- Rate limiting: máximo 20 cálculos/minuto por sesión, con bloqueo y cuenta regresiva
- Audit log de eventos (login, logout, cálculos, errores, rate limit) en localStorage
- Rotación automática del log: entradas con más de 7 días se eliminan al iniciar
- Exportación del log como archivo JSON

### Nota de implementación
La v2 es del lado del cliente — simula los flujos de una auth real con fines de aprendizaje. Todos los puntos que requerirían un backend están marcados con `// TODO(v3)` para facilitar la migración futura.

---

## v3 — Planificado (futuro)

- Backend Node.js con autenticación real
- Rate limiting en servidor con Redis
- Audit log en base de datos
- Modo graficador

## Fuera de alcance (indefinido)

- Álgebra simbólica
- Diseño responsive / mobile
- Números complejos / imaginarios
- Múltiples temas visuales
