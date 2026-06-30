# Tech Stack

## Stack

- **Lenguaje**: TypeScript
- **Framework**: React 18
- **Bundler**: Vite
- **Package manager**: npm
- **Motor de cálculo**: math.js (encapsulado en módulo propio para desacoplamiento)
- **Estilos**: CSS Modules
- **Test unitarios**: Vitest + React Testing Library
- **Test E2E**: Playwright
- **Linter**: ESLint + Prettier

## Decisiones de arquitectura

- `math.js` se usa como motor de evaluación de expresiones pero queda encapsulado detrás de una interfaz propia (`src/engine/`). Esto permite reemplazarlo en el futuro sin impactar el resto de la app.
- Se aplica **TDD**: los tests se escriben antes que la implementación.
- Cobertura mínima de tests unitarios: **90%** sobre la lógica de cálculo.
- La arquitectura debe permitir agregar el modo graficador en v2 sin refactor mayor.

## Comandos

| Tarea    | Comando             |
|----------|---------------------|
| Instalar | `npm install`       |
| Ejecutar | `npm run dev`       |
| Build    | `npm run build`     |
| Tests    | `npm run test`      |
| E2E      | `npm run test:e2e`  |
| Lint     | `npm run lint`      |

## Convenciones

- Componentes en PascalCase, archivos en kebab-case
- Toda lógica de cálculo vive en `src/engine/`, separada de los componentes React
- Los tests unitarios van junto al módulo que testean (`*.test.ts`)
- Los tests E2E van en `e2e/`
- Mensajes de error al usuario siempre en español
