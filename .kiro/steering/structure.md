# Project Structure

## Layout actual

```
FirstProject/
├── .kiro/
│   ├── steering/
│   │   ├── product.md          # Propósito, alcance y criterio de éxito
│   │   ├── tech.md             # Stack, comandos y convenciones técnicas
│   │   ├── structure.md        # Este archivo
│   │   └── git-workflow.md     # Estrategia de ramas y PRs
│   └── specs/
│       └── calculadora-cientifica/
│           ├── requirements.md # Requerimientos funcionales y no funcionales
│           ├── design.md       # Arquitectura, componentes y decisiones de diseño
│           └── tasks.md        # Plan de implementación con TDD
├── docs/
│   └── adr/
│       └── ADR-001-arquitectura.md
├── e2e/                        # Tests E2E con Playwright
│   └── calculator.spec.ts
├── src/
│   ├── engine/                 # Motor de cálculo (encapsula math.js)
│   │   ├── evaluator.ts        # Evalúa expresiones string → número
│   │   ├── evaluator.test.ts
│   │   ├── formatter.ts        # Formatea resultados (decimal ↔ fracción)
│   │   ├── formatter.test.ts
│   │   ├── memory.ts           # Lógica de memoria (M+, M-, MR, MC)
│   │   ├── memory.test.ts
│   │   ├── history.ts          # Lógica del historial de sesión
│   │   ├── history.test.ts
│   │   ├── errors.ts           # Errores tipados con mensajes en español
│   │   └── errors.test.ts
│   ├── components/
│   │   ├── Display/            # Pantalla: expresión, resultado, indicadores
│   │   ├── Keypad/             # Grilla de 40 botones
│   │   └── HistoryPanel/       # Panel de historial (últimas 10 ops)
│   ├── hooks/
│   │   ├── useCalculator.ts    # Estado global de la calculadora
│   │   └── useCalculator.test.ts
│   ├── App.tsx                 # Composición + listener de teclado
│   ├── App.module.css
│   ├── main.tsx
│   └── test-setup.ts
├── public/
├── index.html
├── vite.config.ts              # Vitest + cobertura configurados aquí
├── playwright.config.ts
├── tsconfig.app.json
└── package.json
```

## Convenciones

- La lógica de negocio **nunca** vive dentro de los componentes React. Todo va en `src/engine/` o `src/hooks/`.
- Cada módulo en `src/engine/` tiene su archivo de test hermano (`*.test.ts`).
- Los componentes son puramente presentacionales — reciben props y llaman callbacks.
- Los selectores E2E usan `data-testid`, nunca clases CSS con hashes (CSS Modules genera nombres dinámicos).
- Actualizar los archivos de steering cuando cambie el stack, la estructura o las convenciones.
