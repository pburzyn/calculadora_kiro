# Project Structure

## Layout

```
FirstProject/
├── .kiro/
│   ├── steering/
│   │   ├── product.md          # Propósito, alcance y criterio de éxito
│   │   ├── tech.md             # Stack, comandos y convenciones técnicas
│   │   └── structure.md        # Este archivo
│   └── specs/
│       └── calculadora-cientifica/
│           ├── requirements.md # Requerimientos funcionales y no funcionales
│           ├── design.md       # Arquitectura, componentes y decisiones de diseño
│           └── tasks.md        # Plan de implementación con TDD
├── src/
│   ├── engine/                 # Motor de cálculo (encapsula math.js)
│   │   ├── evaluator.ts        # Evalúa expresiones string → resultado
│   │   ├── formatter.ts        # Formatea resultados (decimal ↔ fracción, notación científica)
│   │   ├── memory.ts           # Lógica de memoria (M+, M-, MR, MC)
│   │   ├── history.ts          # Lógica del historial de sesión
│   │   └── errors.ts           # Mensajes de error en español
│   ├── components/
│   │   ├── Display/            # Pantalla de expresión y resultado
│   │   ├── Keypad/             # Grilla de botones
│   │   ├── History/            # Panel de historial
│   │   └── MemoryIndicator/    # Indicador de valor en memoria
│   ├── hooks/
│   │   └── useCalculator.ts    # Estado global de la calculadora
│   ├── App.tsx
│   └── main.tsx
├── e2e/                        # Tests E2E con Playwright
├── public/
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Convenciones

- La lógica de negocio **nunca** vive dentro de los componentes React. Todo va en `src/engine/` o `src/hooks/`.
- Cada módulo en `src/engine/` tiene su archivo de test hermano (`*.test.ts`).
- Los componentes son puramente presentacionales cuando es posible.
- Actualizar los archivos de steering cuando cambie el stack, la estructura o las convenciones.
