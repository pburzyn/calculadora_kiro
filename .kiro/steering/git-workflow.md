# Git Workflow

## Repositorio

- **Remote**: `git@github.com:pburzyn/calculadora_kiro.git`
- **Rama principal**: `main`

## Estrategia de ramas

- Nunca se trabaja directamente sobre `main`.
- Cada tarea del `tasks.md` (o grupo pequeño de tareas relacionadas) genera su propia rama.
- Formato de nombre de rama: `tipo/descripcion-corta`

### Tipos de rama

| Prefijo | Cuándo usarlo |
|---------|--------------|
| `setup/` | Configuración inicial, tooling |
| `feat/` | Nueva funcionalidad |
| `test/` | Escritura de tests (fase TDD antes de implementar) |
| `fix/` | Corrección de bug |
| `refactor/` | Mejora de código sin cambio de comportamiento |
| `docs/` | Cambios solo en documentación o steering |

### Ejemplos

```
setup/vite-react-ts
test/engine-evaluator-basic-ops
feat/engine-evaluator-basic-ops
test/engine-formatter-fractions
feat/engine-formatter-fractions
feat/component-display
feat/component-keypad
feat/e2e-basic-flow
```

## Reglas para PRs

### Los PRs deben ser pequeños
- Un PR por tarea (o por par test+implementación en TDD).
- Máximo orientativo: **400 líneas cambiadas** por PR. Si se supera, dividir.
- Un PR no debe mezclar lógica de negocio con cambios de UI.
- Un PR no debe mezclar tests nuevos con refactors de código existente.

### Título del PR
- Conciso, menor a 70 caracteres.
- Formato: `[tipo] descripción` — ej: `[feat] evaluator: operaciones básicas y paréntesis`

### Descripción del PR
Usar esta estructura:

```
## Qué hace este PR
Breve descripción del cambio.

## Tareas relacionadas
- T-XX

## Qué se testeó
- Tests unitarios: ✅ / descripción
- Tests E2E: ✅ / N/A

## Notas para el reviewer
Algo que vale la pena mirar con atención, decisiones tomadas, etc.
```

### Checklist antes de abrir un PR
- [ ] Los tests pasan (`npm run test`)
- [ ] La cobertura no bajó del 90% en `src/engine/`
- [ ] No hay errores de lint (`npm run lint`)
- [ ] El PR no mezcla responsabilidades distintas
- [ ] El título es claro y menor a 70 caracteres

## Flujo TDD en git

Dado que se aplica TDD, el flujo típico genera **dos PRs por módulo**:

1. `test/nombre-modulo` → contiene solo los tests (en rojo)
2. `feat/nombre-modulo` → contiene la implementación (tests en verde)

Esto es intencional: permite revisar los tests como contrato antes de ver la implementación.

## Commits

- Commits atómicos: un commit = un cambio lógico.
- Formato de mensaje: `tipo: descripción en imperativo`
  - `feat: agregar función evaluate al evaluator`
  - `test: agregar tests de factorial para casos borde`
  - `fix: corregir manejo de tan(90°) en grados`
  - `refactor: extraer lógica de redondeo a función propia`
  - `docs: actualizar steering con estrategia de PRs`
- No usar `--amend` en commits ya pusheados.
- No usar `git push --force` salvo casos excepcionales y con justificación explícita.
