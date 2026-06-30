# Tasks — Calculadora Científica

## Metodología

Se aplica **TDD estricto**: cada tarea de implementación está precedida por la escritura de sus tests.
Ciclo por cada módulo: **test rojo → implementación → test verde → refactor**.

---

## Fase 0 — Setup del proyecto

- [ ] **T-00** Inicializar proyecto con Vite + React + TypeScript
  ```bash
  npm create vite@latest calculadora-cientifica -- --template react-ts
  ```
- [ ] **T-01** Instalar dependencias de producción
  ```bash
  npm install mathjs
  ```
- [ ] **T-02** Instalar dependencias de desarrollo
  ```bash
  npm install -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/user-event jsdom playwright @playwright/test eslint prettier
  ```
- [ ] **T-03** Configurar Vitest en `vite.config.ts` con coverage threshold 90%
- [ ] **T-04** Configurar Playwright (`playwright.config.ts`)
- [ ] **T-05** Configurar ESLint + Prettier
- [ ] **T-06** Crear estructura de carpetas base (`src/engine/`, `src/components/`, `src/hooks/`, `e2e/`)
- [ ] **T-07** Agregar scripts en `package.json`: `test`, `test:coverage`, `test:e2e`, `lint`

---

## Fase 1 — Engine (TDD)

### errors.ts
- [ ] **T-10** Escribir tests: verificar que cada código de error mapea al mensaje correcto en español
- [ ] **T-11** Implementar `errors.ts` con `CalculatorErrorCode` y `ERROR_MESSAGES`

### formatter.ts
- [ ] **T-12** Escribir tests para `toDecimal`: precisión 10 decimales, notación científica para `> 1e12` y `< 1e-6`
- [ ] **T-13** Escribir tests para `toFraction`: `0.25` → `1/4`, `0.333...` → `1/3`, simplificación automática
- [ ] **T-14** Escribir tests para `canBeRepresentedAsFraction`: irracionales como `π` → false
- [ ] **T-15** Implementar `formatter.ts`

### memory.ts
- [ ] **T-16** Escribir tests: M+, M-, MR, MC, acumulación múltiple, memoria vacía
- [ ] **T-17** Implementar `memory.ts`

### history.ts
- [ ] **T-18** Escribir tests: agregar entradas, truncar a 10, orden cronológico inverso, limpiar
- [ ] **T-19** Implementar `history.ts`

### evaluator.ts
- [ ] **T-20** Escribir tests — operaciones básicas: `+`, `-`, `×`, `÷`, paréntesis, precedencia
- [ ] **T-21** Escribir tests — trigonometría: `sin(30)` en grados, `cos(π)` en radianes, `asin`, `acos`, `atan`
- [ ] **T-22** Escribir tests — logaritmos: `log(100)`, `ln(e)`, `log(1)`
- [ ] **T-23** Escribir tests — potencias y raíces: `2^10`, `√144`, `∛27`, `(-8)^(1/3)`
- [ ] **T-24** Escribir tests — constantes: `π`, `e`
- [ ] **T-25** Escribir tests — factorial: `5!`, `0!`, `(-1)!` (error), `1.5!` (error)
- [ ] **T-26** Escribir tests — fracciones: `3/4 + 1/2`, `(2/3)^2`
- [ ] **T-27** Escribir tests — casos borde: `5/0`, expresión incompleta, `sin()`, `√(-1)`, paréntesis desbalanceados, `tan(90°)`, campo vacío, `0.1 + 0.2`
- [ ] **T-28** Implementar `evaluator.ts` (pasar todos los tests anteriores)
- [ ] **T-29** Verificar cobertura ≥ 90% en `src/engine/`

---

## Fase 2 — Hook de estado

- [ ] **T-30** Escribir tests para `useCalculator`: cada acción modifica el estado correctamente
  - `appendToExpression`, `clearExpression`, `clearAll`
  - `evaluate` (resultado correcto, error correcto, historial actualizado)
  - `toggleDisplayMode`, `toggleAngleMode`
  - operaciones de memoria
  - `loadFromHistory`
- [ ] **T-31** Implementar `useCalculator.ts`

---

## Fase 3 — Componentes UI

### Display
- [ ] **T-40** Escribir tests: muestra expresión, muestra resultado, muestra error, muestra indicadores DEG/RAD y M
- [ ] **T-41** Implementar `<Display />`

### Keypad
- [ ] **T-42** Escribir tests: click en cada botón llama la acción correcta del hook
- [ ] **T-43** Implementar `<Keypad />` con todos los botones definidos en requirements
- [ ] **T-44** Verificar que el teclado físico también dispara las acciones correctas

### HistoryPanel
- [ ] **T-45** Escribir tests: renderiza hasta 10 entradas, click carga expresión
- [ ] **T-46** Implementar `<HistoryPanel />`

### MemoryIndicator
- [ ] **T-47** Escribir tests: visible solo cuando hay valor en memoria
- [ ] **T-48** Implementar `<MemoryIndicator />`

### App
- [ ] **T-49** Componer todos los componentes en `<App />`
- [ ] **T-50** Aplicar estilos CSS Modules (layout desktop, legible, sin responsive)

---

## Fase 4 — Tests E2E

- [ ] **T-60** E2E: flujo básico — ingresar expresión, presionar igual, ver resultado
- [ ] **T-61** E2E: flujo trigonométrico — cambiar modo DEG/RAD, evaluar `sin(30)` y `cos(π)`
- [ ] **T-62** E2E: flujo fracciones — ingresar `3/4 + 1/2`, ver resultado, usar toggle decimal/fracción
- [ ] **T-63** E2E: flujo memoria — M+, limpiar display, MR recupera valor
- [ ] **T-64** E2E: flujo historial — realizar 3 operaciones, hacer click en una del historial
- [ ] **T-65** E2E: flujo errores — ingresar expresiones inválidas y verificar mensajes en español
- [ ] **T-66** E2E: flujo ejercicios CNBA — resolver ejercicios representativos de potencias, raíces y fracciones de tercer año

---

## Fase 5 — Verificación final

- [ ] **T-70** Ejecutar suite completa de tests unitarios y verificar cobertura ≥ 90%
- [ ] **T-71** Ejecutar suite E2E y verificar que todos los flujos pasan
- [ ] **T-72** Resolver ejercicios de guía de matemática de tercer año del CNBA manualmente en la app
- [ ] **T-73** Revisar y actualizar archivos de steering si algo cambió durante la implementación

---

## Resumen de tareas por fase

| Fase | Descripción | Tareas |
|------|-------------|--------|
| 0 | Setup | T-00 a T-07 |
| 1 | Engine (TDD) | T-10 a T-29 |
| 2 | Hook de estado | T-30 a T-31 |
| 3 | Componentes UI | T-40 a T-50 |
| 4 | Tests E2E | T-60 a T-66 |
| 5 | Verificación final | T-70 a T-73 |
