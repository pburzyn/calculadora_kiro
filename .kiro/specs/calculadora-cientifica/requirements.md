# Requirements — Calculadora Científica

## Historia de usuario

**Como** usuario de matemática,
**quiero** una calculadora científica web
**para** resolver expresiones matemáticas complejas (potencias, raíces, fracciones, trigonometría) de forma rápida y confiable desde el navegador.

---

## Requerimientos Funcionales

### RF-01 — Entrada de expresión completa
El usuario puede ingresar una expresión matemática completa en un campo de entrada (por teclado o por botones) antes de evaluarla. No existe modo de entrada secuencial.

### RF-02 — Operaciones básicas
El sistema evalúa expresiones con:
- Suma (`+`), resta (`-`), multiplicación (`×`), división (`÷`)
- Paréntesis para agrupación de subexpresiones

### RF-03 — Funciones trigonométricas
El sistema evalúa: `sin`, `cos`, `tan`, `asin`, `acos`, `atan`.
El usuario puede alternar entre modo **grados** y **radianes**.

### RF-04 — Logaritmos
El sistema evalúa:
- `log(x)` → logaritmo base 10
- `ln(x)` → logaritmo natural (base e)

### RF-05 — Potencias y raíces
El sistema evalúa:
- Potencias: `x²`, `x³`, `xⁿ`
- Raíces: `√x` (cuadrada), `∛x` (cúbica), raíz n-ésima

### RF-06 — Constantes
El sistema reconoce y evalúa las constantes `π` y `e`.

### RF-07 — Factorial
El sistema evalúa `n!` para números enteros no negativos.

### RF-08 — Fracciones
El usuario puede ingresar fracciones como parte de una expresión (ej: `3/4 + 1/2`).
El resultado puede mostrarse como decimal o fracción simplificada mediante un toggle `a/b ↔ dec`.

### RF-09 — Conversión grados/radianes
El usuario puede cambiar el modo angular con un indicador visible en pantalla (`DEG` / `RAD`). El cambio afecta todas las funciones trigonométricas.

### RF-10 — Memoria
El sistema dispone de un slot de memoria con las operaciones:
- `M+`: suma el resultado actual a la memoria
- `M-`: resta el resultado actual a la memoria
- `MR`: recupera el valor de memoria en la expresión actual
- `MC`: limpia la memoria

### RF-11 — Historial de sesión
El sistema muestra las últimas 10 operaciones realizadas en la sesión actual, en formato `expresión = resultado`.

### RF-12 — Reutilización desde historial
El usuario puede hacer click en cualquier entrada del historial para cargar esa expresión en el campo de entrada.

---

## Requerimientos No Funcionales

### RNF-01 — Compatibilidad de navegadores
La aplicación debe funcionar en Chrome, Firefox y Edge (últimas 2 versiones mayores).

### RNF-02 — Rendimiento
El tiempo de respuesta para evaluar cualquier expresión debe ser menor a 500ms.

### RNF-03 — TDD
Los tests se escriben **antes** que la implementación. El ciclo es: test rojo → implementación → test verde → refactor.

### RNF-04 — Cobertura
Cobertura mínima de tests unitarios del **90%** sobre los módulos de `src/engine/`.

### RNF-05 — Tests E2E
Deben existir tests E2E con Playwright que cubran los flujos principales de uso.

### RNF-06 — Usabilidad
Un usuario nuevo debe poder resolver una expresión sin necesitar instrucciones. La interfaz es desktop-only.

### RNF-07 — Extensibilidad
La arquitectura debe permitir agregar el modo graficador en v2 sin refactor mayor del motor de cálculo ni de los componentes existentes.

### RNF-08 — Idioma
Todos los mensajes de error y etiquetas de la interfaz deben estar en español.

---

## Criterios de Aceptación

### CA-01 — Operaciones básicas con agrupación
- `(3 + 5) × 2` → `16`
- `10 - 4 / 2` → `8` (precedencia correcta)

### CA-02 — Potencias y raíces
- `2^10` → `1024`
- `√144` → `12`
- `∛27` → `3`
- `(-8)^(1/3)` → `-2`

### CA-03 — Fracciones
- `3/4 + 1/2` → `1.25` (decimal) o `5/4` (fracción)
- `(2/3)^2` → `0.4444...` (decimal) o `4/9` (fracción)
- Las fracciones se simplifican automáticamente: `4/8` → `1/2`

### CA-04 — Trigonometría
- Modo grados: `sin(30)` → `0.5`
- Modo radianes: `cos(π)` → `-1`
- Modo grados: `tan(45)` → `1`

### CA-05 — Logaritmos
- `log(100)` → `2`
- `ln(e)` → `1`
- `log(1)` → `0`

### CA-06 — Factorial
- `5!` → `120`
- `0!` → `1`

### CA-07 — Constantes
- `π` → `3.14159265...`
- `2 × e` → `5.43656...`

### CA-08 — Memoria
- Ingresar `50`, M+, luego MR en nueva expresión recupera `50`
- M+ seguido de M+ acumula correctamente
- MC limpia la memoria a `0`

### CA-09 — Historial
- Después de 3 operaciones, el historial muestra las 3 en orden cronológico inverso
- Al hacer click en una entrada, la expresión se carga en el campo de entrada
- El historial no persiste al recargar la página

### CA-10 — Toggle decimal/fracción
- `1 ÷ 4` en modo decimal → `0.25`; al presionar toggle → `1/4`
- El toggle solo aparece habilitado cuando el resultado es convertible a fracción

---

## Manejo de errores y casos borde

| Caso | Comportamiento esperado |
|------|------------------------|
| `5/0` | `"Error: División por cero"` |
| Expresión incompleta (`3 +`) | `"Error: Expresión incompleta"` |
| `sin()` sin argumento | `"Error: Argumento faltante"` |
| `(-1)!` | `"Error: El factorial no está definido para números negativos"` |
| `1.5!` | `"Error: El factorial requiere un número entero"` |
| `√(-1)` | `"Error: Raíz de número negativo no soportada"` |
| Paréntesis desbalanceados | `"Error: Paréntesis sin cerrar"` |
| `tan(90°)` | `"Error: Valor sin definición en este ángulo"` |
| Campo vacío + `=` | No hace nada, sin error |
| Resultado muy grande/pequeño | Notación científica para valores `> 1e12` o `< 1e-6` |
| `0.1 + 0.2` (floating point) | Se redondea a 10 decimales significativos antes de mostrar |
| `1000!` | Resultado en notación científica |
