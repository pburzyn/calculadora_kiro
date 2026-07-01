# Tech Stack

## Stack

- **Lenguaje**: TypeScript 6
- **Framework**: React 19
- **Bundler**: Vite 8
- **Package manager**: npm
- **Motor de cálculo**: math.js ^15.2.0 (encapsulado en `src/engine/evaluator.ts`)
- **Estilos**: CSS Modules
- **Test unitarios**: Vitest 4 + React Testing Library
- **Test E2E**: Playwright (Chromium + Firefox)
- **Linter**: ESLint

## Decisiones de arquitectura

- `math.js` queda encapsulado detrás de `src/engine/evaluator.ts`. Ningún otro módulo importa math.js directamente.
- Se aplicó **TDD estricto**: tests escritos antes que la implementación en todos los módulos del engine y el hook.
- Cobertura de tests unitarios sobre `src/engine/`: statements 90.84%, lines 93.49%, functions 100%, branches 82.29%.
- La arquitectura permite agregar el modo graficador en v2 sin refactor mayor (ver ADR-001).

## Comandos

| Tarea         | Comando                  |
|---------------|--------------------------|
| Instalar      | `npm install`            |
| Ejecutar      | `npm run dev`            |
| Build         | `npm run build`          |
| Tests         | `npm run test`           |
| Coverage      | `npm run test:coverage`  |
| E2E           | `npm run test:e2e`       |
| Lint          | `npm run lint`           |

## Convenciones

- Componentes en PascalCase, archivos en kebab-case
- Toda lógica de cálculo vive en `src/engine/`, separada de los componentes React
- Los tests unitarios van junto al módulo que testean (`*.test.ts` / `*.test.tsx`)
- Los tests E2E van en `e2e/`
- Mensajes de error al usuario siempre en español
- Selectores E2E usan `data-testid` — no selectores CSS con hashes generados por CSS Modules
