# Design — Calculadora Científica

## Arquitectura general

La aplicación sigue una separación estricta entre **lógica de negocio** y **presentación**:

```
UI (React components)
       ↓
  useCalculator (hook)
       ↓
  src/engine/ (lógica pura, testeable sin React)
       ↓
  math.js (dependencia encapsulada)
```

Los componentes React son puramente presentacionales. Todo el estado y la lógica viven en el hook `useCalculator`. La capa `engine` es independiente de React y puede testearse con Vitest sin montar ningún componente.

---

## Módulos del engine

### `evaluator.ts`
**Responsabilidad**: Recibir una expresión como string y retornar un resultado numérico o lanzar un error tipado.

```typescript
interface EvaluationResult {
  value: number;
  expression: string;
}

function evaluate(expression: string, mode: 'deg' | 'rad'): EvaluationResult
```

- Encapsula `math.js`. El resto de la app nunca importa `math.js` directamente.
- Maneja conversión de grados a radianes antes de pasar la expresión al motor.
- Captura errores de `math.js` y los transforma en errores propios (ver `errors.ts`).
- Maneja el caso especial de `(-8)^(1/3)` → `-2`.
- Redondea resultados a 10 decimales significativos para evitar ruido de punto flotante.
- Aplica notación científica para valores `> 1e12` o `< 1e-6`.

### `formatter.ts`
**Responsabilidad**: Transformar un número en su representación como string (decimal o fracción).

```typescript
function toDecimal(value: number, precision?: number): string
function toFraction(value: number): string   // retorna "3/4", "1/2", etc.
function canBeRepresentedAsFraction(value: number): boolean
```

- Las fracciones se simplifican automáticamente (MCD).
- `canBeRepresentedAsFraction` determina si el toggle debe habilitarse.

### `memory.ts`
**Responsabilidad**: Gestión del slot de memoria.

```typescript
interface MemoryState {
  value: number;
  hasValue: boolean;
}

function memoryAdd(current: number, memory: MemoryState): MemoryState
function memorySub(current: number, memory: MemoryState): MemoryState
function memoryRecall(memory: MemoryState): number
function memoryClear(): MemoryState
```

### `history.ts`
**Responsabilidad**: Gestión del historial de sesión (máximo 10 entradas).

```typescript
interface HistoryEntry {
  expression: string;
  result: string;
  timestamp: number;
}

function addEntry(history: HistoryEntry[], entry: HistoryEntry): HistoryEntry[]
function clearHistory(): HistoryEntry[]
```

- `addEntry` agrega al inicio y trunca a 10 entradas.

### `errors.ts`
**Responsabilidad**: Definición de errores tipados y sus mensajes en español.

```typescript
type CalculatorErrorCode =
  | 'DIVISION_BY_ZERO'
  | 'INCOMPLETE_EXPRESSION'
  | 'MISSING_ARGUMENT'
  | 'INVALID_FACTORIAL_NEGATIVE'
  | 'INVALID_FACTORIAL_NON_INTEGER'
  | 'NEGATIVE_SQRT'
  | 'UNBALANCED_PARENTHESES'
  | 'UNDEFINED_TAN'
  | 'UNKNOWN';

const ERROR_MESSAGES: Record<CalculatorErrorCode, string> = {
  DIVISION_BY_ZERO: 'Error: División por cero',
  INCOMPLETE_EXPRESSION: 'Error: Expresión incompleta',
  MISSING_ARGUMENT: 'Error: Argumento faltante',
  INVALID_FACTORIAL_NEGATIVE: 'Error: El factorial no está definido para números negativos',
  INVALID_FACTORIAL_NON_INTEGER: 'Error: El factorial requiere un número entero',
  NEGATIVE_SQRT: 'Error: Raíz de número negativo no soportada',
  UNBALANCED_PARENTHESES: 'Error: Paréntesis sin cerrar',
  UNDEFINED_TAN: 'Error: Valor sin definición en este ángulo',
  UNKNOWN: 'Error: Expresión inválida',
};
```

---

## Estado global — `useCalculator`

```typescript
interface CalculatorState {
  expression: string;           // lo que se muestra en el campo de entrada
  result: string | null;        // resultado de la última evaluación
  displayMode: 'decimal' | 'fraction';
  angleMode: 'deg' | 'rad';
  memory: MemoryState;
  history: HistoryEntry[];
  error: string | null;
}
```

**Acciones:**
- `appendToExpression(token: string)`
- `clearExpression()`
- `clearAll()`
- `evaluate()`
- `toggleDisplayMode()`
- `toggleAngleMode()`
- `memoryAdd()` / `memorySub()` / `memoryRecall()` / `memoryClear()`
- `loadFromHistory(entry: HistoryEntry)`

---

## Componentes React

### `<App />`
Raíz de la aplicación. Instancia `useCalculator` y distribuye estado/acciones a los hijos.

### `<Display />`
Muestra la expresión actual y el resultado (o error). Incluye:
- Indicador de modo angular (`DEG` / `RAD`)
- Indicador de memoria activa (`M`)
- Botón toggle `a/b ↔ dec` (habilitado solo cuando aplica)

### `<Keypad />`
Grilla de botones. Organizado en secciones:
- Fila superior: funciones científicas (sin, cos, tan, log, ln, √, etc.)
- Sección central: dígitos y operadores básicos
- Sección lateral: memoria, constantes, factorial, paréntesis

### `<HistoryPanel />`
Lista las últimas 10 operaciones. Cada entrada es clickeable para recargar la expresión.

### `<MemoryIndicator />`
Pequeño indicador que muestra el valor actual en memoria (si existe).

---

## Layout de la interfaz

```
┌─────────────────────────────────────┐
│  [DEG/RAD]  [M: 42]                 │
│  ┌─────────────────────────────────┐│
│  │  sin(30) + 2^3                  ││  ← Display (expresión)
│  │  = 8.5                [a/b|dec] ││  ← Display (resultado + toggle)
│  └─────────────────────────────────┘│
│  ┌──────────────┐  ┌───────────────┐│
│  │   KEYPAD     │  │   HISTORIAL   ││
│  │              │  │ sin(30)+2^3=  ││
│  │  [sin][cos]  │  │   8.5         ││
│  │  [tan][log]  │  │ log(100) = 2  ││
│  │  [ln] [√  ]  │  │ ...           ││
│  │  [7][8][9][÷]│  │               ││
│  │  [4][5][6][×]│  │               ││
│  │  [1][2][3][-]│  │               ││
│  │  [0][.][=][+]│  │               ││
│  └──────────────┘  └───────────────┘│
└─────────────────────────────────────┘
```

---

## Decisiones de diseño

| Decisión | Alternativa descartada | Justificación |
|----------|----------------------|---------------|
| Usar `math.js` como motor | Parser propio | El foco es aprender Kiro, no construir un parser. El motor queda encapsulado para poder reemplazarlo. |
| Engine separado de React | Lógica en componentes | Facilita TDD: el engine es testeable sin montar la UI. |
| Un solo slot de memoria | Variables con nombre | Fidelidad a la experiencia Casio; suficiente para v1. |
| Errores tipados con código | Strings directos | Permite testear el tipo de error sin depender del texto. |
| Toggle decimal/fracción | Mostrar siempre fracción | Flexibilidad para el usuario; evita fracciones feas en resultados irracionales. |
| Historial solo en sesión | localStorage | Menor complejidad; suficiente para v1. |

---

## Extensibilidad para v2 (graficador)

El módulo `evaluator.ts` expone una función pura `evaluate(expression, mode)`. Para el graficador, solo se necesita:
1. Llamar `evaluate` con valores de `x` para generar puntos `(x, y)`.
2. Agregar un componente `<GraphPanel />` sin modificar el engine existente.

No se requiere refactor del core.
