# ADR-001 — Arquitectura de la Calculadora Científica

| Campo       | Valor                          |
|-------------|-------------------------------|
| **Estado**  | Aceptado                      |
| **Fecha**   | 2026-06-30                    |
| **Autores** | pburzyn                       |

---

## Contexto

Se va a desarrollar una calculadora científica web como primer proyecto en Kiro. El objetivo principal es aprender el flujo de trabajo de Kiro (specs, tasks, steering) trabajando sobre un proyecto concreto. La aplicación debe:

- Evaluar expresiones matemáticas completas (no modo secuencial)
- Soportar operaciones científicas: trigonometría, logaritmos, potencias, raíces, fracciones, factorial
- Ser extensible: en v2 se agregará un modo graficador
- Desarrollarse con TDD estricto (tests antes que implementación)
- Desplegarse como aplicación web desktop-only

---

## Decisión

Se adopta una arquitectura en **tres capas desacopladas**:

```
┌─────────────────────────────────────────────┐
│           Capa de Presentación              │
│   React components + CSS Modules            │
│   (puramente presentacional)                │
└────────────────────┬────────────────────────┘
                     │
┌────────────────────▼────────────────────────┐
│           Capa de Estado                    │
│   useCalculator (React hook)                │
│   (orquesta engine + estado de la UI)       │
└────────────────────┬────────────────────────┘
                     │
┌────────────────────▼────────────────────────┐
│           Capa de Engine                    │
│   src/engine/ (lógica pura, sin React)      │
│   evaluator · formatter · memory · history  │
└────────────────────┬────────────────────────┘
                     │
┌────────────────────▼────────────────────────┐
│           Dependencia externa               │
│   math.js (encapsulada, no expuesta)        │
└─────────────────────────────────────────────┘
```

### Stack tecnológico

| Rol | Tecnología |
|-----|-----------|
| Framework UI | React 18 |
| Lenguaje | TypeScript |
| Bundler | Vite |
| Motor de cálculo | math.js (encapsulado) |
| Estilos | CSS Modules |
| Tests unitarios | Vitest + React Testing Library |
| Tests E2E | Playwright |
| Linter/Formatter | ESLint + Prettier |

---

## Estructura de la capa Engine

La capa `src/engine/` contiene módulos de funciones puras, sin efectos secundarios ni dependencias de React:

### `evaluator.ts`
Punto de entrada principal del engine. Recibe una expresión como `string` y el modo angular, retorna un resultado numérico o lanza un error tipado.

```
evaluate(expression: string, mode: 'deg' | 'rad'): EvaluationResult
```

Responsabilidades:
- Encapsular `math.js` (único lugar donde se importa)
- Convertir grados a radianes cuando corresponde
- Manejar el caso `(-8)^(1/3)` → `-2` (math.js retorna NaN por defecto)
- Redondear a 10 decimales significativos (elimina ruido de punto flotante)
- Aplicar notación científica para valores `> 1e12` o `< 1e-6`
- Capturar excepciones de math.js y relanzarlas como `CalculatorError`

### `formatter.ts`
Transforma un número en su representación visual.

```
toDecimal(value: number): string
toFraction(value: number): string       // "3/4", simplificada automáticamente
canBeRepresentedAsFraction(value: number): boolean
```

### `memory.ts`
Gestiona el slot único de memoria (M+, M-, MR, MC). Funciones puras que reciben y retornan estado.

### `history.ts`
Gestiona el historial de sesión. Mantiene las últimas 10 entradas. Funciones puras sobre arrays.

### `errors.ts`
Define los códigos de error tipados y sus mensajes en español. Desacopla el mensaje del lugar donde se lanza el error.

---

## Componentes React

Los componentes son **puramente presentacionales**: reciben props y llaman callbacks. No tienen lógica de negocio.

| Componente | Responsabilidad |
|-----------|----------------|
| `<App />` | Raíz. Instancia `useCalculator` y distribuye estado/acciones |
| `<Display />` | Muestra expresión, resultado/error, indicadores DEG/RAD y M, toggle decimal↔fracción |
| `<Keypad />` | Grilla de botones. Cada botón llama una acción del hook |
| `<HistoryPanel />` | Lista las últimas 10 operaciones; click recarga expresión |
| `<MemoryIndicator />` | Muestra valor en memoria cuando existe |

---

## Alternativas consideradas

### Alternativa A: Lógica directamente en componentes React
**Descartada.** Hace los tests unitarios dependientes de React (más lentos, más frágiles). El engine no sería reutilizable en v2 (graficador).

### Alternativa B: Construir un parser propio en lugar de usar math.js
**Descartada.** Construir un parser completo (tokenizer, AST, evaluador) es un proyecto de semanas y desvía el foco del objetivo: aprender Kiro. math.js queda encapsulado para poder reemplazarlo en el futuro.

### Alternativa C: Redux o Zustand para el estado global
**Descartada.** El estado de la calculadora es simple y local a un único árbol de componentes. Un hook personalizado (`useCalculator`) es suficiente y evita agregar dependencias innecesarias.

### Alternativa D: Estado en Context API
**Descartada por ahora.** Si en v2 la app crece (múltiples vistas: calculadora + graficador), se puede migrar `useCalculator` a un Context sin cambiar el engine ni los componentes presentacionales.

---

## Consecuencias

### Positivas
- **Testabilidad**: el engine es 100% testeable sin montar ningún componente React. Facilita el ciclo TDD.
- **Extensibilidad**: agregar el graficador en v2 requiere solo un nuevo componente `<GraphPanel />` que llama a `evaluate(expression, mode)` con valores de `x`. Sin refactor del engine.
- **Reemplazabilidad**: si en el futuro se quiere cambiar math.js por otro motor, el cambio está acotado a `evaluator.ts`.
- **Separación de responsabilidades**: cada módulo tiene una única razón para cambiar.

### Negativas / trade-offs
- El flujo de datos unidireccional (engine → hook → componentes) requiere algo más de boilerplate que poner todo en un componente.
- `math.js` agrega ~170KB al bundle. Aceptable para una aplicación desktop donde el tamaño de bundle no es crítico.

---

## Diagrama de flujo de una evaluación

```
Usuario presiona "="
        │
        ▼
useCalculator.evaluate()
        │
        ├─► evaluator.evaluate(expression, angleMode)
        │         │
        │         ├─► [validaciones pre-parse]
        │         ├─► math.js.evaluate(normalizedExpr)
        │         ├─► [manejo de casos especiales]
        │         └─► EvaluationResult | CalculatorError
        │
        ├─► history.addEntry(expression, result)
        │
        ├─► [si error] → state.error = ERROR_MESSAGES[code]
        │
        └─► [si ok] → state.result = formatter.toDecimal(value)
                       state.canToggle = formatter.canBeRepresentedAsFraction(value)
```

---

## Referencias

- [requirements.md](../specs/calculadora-cientifica/requirements.md)
- [design.md](../specs/calculadora-cientifica/design.md)
- [tasks.md](../specs/calculadora-cientifica/tasks.md)
- [math.js documentation](https://mathjs.org/docs/)
