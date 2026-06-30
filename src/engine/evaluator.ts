import { create, all } from 'mathjs'
import { CalculatorError, createError } from './errors'

// Instancia de math.js con todas las funciones
const math = create(all)

// tan(90°) produce un valor finito muy grande por precisión de punto flotante
// Consideramos "indefinido" cualquier valor con |x| > 1e14
const TAN_UNDEFINED_THRESHOLD = 1e14

export interface EvaluationResult {
  value: number
  expression: string
}

/**
 * Evalúa una expresión matemática completa.
 *
 * @param expression - Expresión como string (ej: "sin(30) + 2^3")
 * @param mode       - Modo angular: 'deg' (grados) o 'rad' (radianes)
 * @returns EvaluationResult con el valor numérico, o null si la expresión está vacía
 * @throws CalculatorError con el código de error apropiado
 */
export function evaluate(
  expression: string,
  mode: 'deg' | 'rad',
): EvaluationResult | null {
  const trimmed = expression.trim()
  if (trimmed === '') return null

  // Validaciones previas al parse
  validateExpression(trimmed, mode)

  // Normalización: adapta la expresión para math.js
  const normalized = normalizeExpression(trimmed, mode)

  let result: unknown
  try {
    result = math.evaluate(normalized)
  } catch (err) {
    throw mapMathError(err, trimmed)
  }

  const value = extractNumber(result, trimmed)

  return { value, expression: trimmed }
}

// ─── Validaciones previas al parse ──────────────────────────────────────────

function validateExpression(expr: string, mode: 'deg' | 'rad'): void {
  // Paréntesis desbalanceados
  let depth = 0
  for (const ch of expr) {
    if (ch === '(') depth++
    else if (ch === ')') depth--
    if (depth < 0) throw createError('UNBALANCED_PARENTHESES')
  }
  if (depth !== 0) throw createError('UNBALANCED_PARENTHESES')

  // Expresión que termina en operador binario
  if (/[+\-*/^]\s*$/.test(expr)) throw createError('INCOMPLETE_EXPRESSION')

  // Funciones con paréntesis vacíos
  if (/\b(sin|cos|tan|asin|acos|atan|log|ln|sqrt|cbrt)\s*\(\s*\)/.test(expr)) {
    throw createError('MISSING_ARGUMENT')
  }

  // Factorial de número negativo explícito: (-n)!
  if (/\(-\s*\d+(\.\d+)?\s*\)\s*!/.test(expr)) {
    throw createError('INVALID_FACTORIAL_NEGATIVE')
  }

  // Factorial de decimal: n.m!
  if (/\d+\.\d+\s*!/.test(expr)) {
    throw createError('INVALID_FACTORIAL_NON_INTEGER')
  }

  // tan(90°) y múltiplos impares de 90 en modo grados
  if (mode === 'deg') {
    // Detecta tan(N) donde N es múltiplo impar de 90
    const tanMatch = expr.match(/\btan\s*\(\s*(-?\d+(?:\.\d+)?)\s*\)/)
    if (tanMatch) {
      const angle = parseFloat(tanMatch[1])
      const normalized = ((angle % 180) + 180) % 180
      if (Math.abs(normalized - 90) < 1e-9) {
        throw createError('UNDEFINED_TAN')
      }
    }
  }
}

// ─── Normalización de la expresión ──────────────────────────────────────────

function normalizeExpression(expr: string, mode: 'deg' | 'rad'): string {
  let normalized = expr

  // Manejo de logaritmos:
  // En nuestra calculadora:
  //   ln(x)  → logaritmo natural  → math.js: log(x)
  //   log(x) → logaritmo base 10 → math.js: log10(x)
  //
  // Importante: primero reemplazamos ln → __LN__ (placeholder),
  // luego log → log10, luego __LN__ → log.
  // Esto evita la doble transformación de ln → log → log10.
  normalized = normalized.replace(/\bln\s*\(/g, '__LN__(')
  normalized = normalized.replace(/\blog\s*\((?![^)]*,)/g, 'log10(')
  normalized = normalized.replace(/__LN__\s*\(/g, 'log(')

  if (mode === 'deg') {
    normalized = wrapTrigForDegrees(normalized)
  }

  // Caso especial: base negativa con exponente fraccionario impar
  // (-8)^(1/3) → -(8^(1/3)) para obtener -2 en lugar de NaN
  normalized = normalized.replace(
    /\(\s*-\s*(\d+(?:\.\d+)?)\s*\)\s*\^\s*\(\s*1\s*\/\s*(\d+)\s*\)/g,
    (_, base, root) => {
      const r = parseInt(root)
      if (r % 2 === 1) return `-(${base}^(1/${root}))`
      return `(-(${base}))^(1/${root})`
    },
  )

  return normalized
}

/**
 * Envuelve las funciones trigonométricas para trabajar en grados.
 * math.js opera en radianes por defecto.
 */
function wrapTrigForDegrees(expr: string): string {
  let result = expr

  // sin/cos/tan: multiplicamos el argumento por pi/180 para convertir grados → rad
  result = result.replace(/\b(sin|cos|tan)\s*\(/g, (_, fn) => `${fn}(pi/180*`)

  // asin/acos/atan: resultado en rad → multiplicamos por 180/pi para convertir a grados
  result = result.replace(/\b(asin|acos|atan)\s*\(/g, (_, fn) => `(180/pi)*${fn}(`)

  return result
}

// ─── Extracción y validación del resultado ───────────────────────────────────

function extractNumber(result: unknown, expr: string): number {
  // math.js puede retornar números complejos para operaciones como sqrt(-1)
  if (result !== null && typeof result === 'object' && 're' in (result as object)) {
    // Es un número complejo — en v1 no soportamos imaginarios
    if (/sqrt\s*\(\s*-/.test(expr)) throw createError('NEGATIVE_SQRT')
    throw createError('UNKNOWN')
  }

  if (typeof result !== 'number') {
    throw createError('UNKNOWN')
  }

  if (isNaN(result)) {
    if (/sqrt\s*\(\s*-/.test(expr)) throw createError('NEGATIVE_SQRT')
    throw createError('UNKNOWN')
  }

  if (!isFinite(result)) {
    if (/\/\s*0/.test(expr)) throw createError('DIVISION_BY_ZERO')
    throw createError('UNDEFINED_TAN')
  }

  // tan(90°) por precisión de punto flotante da un número finito muy grande
  if (Math.abs(result) > TAN_UNDEFINED_THRESHOLD && /\btan\s*\(/.test(expr)) {
    throw createError('UNDEFINED_TAN')
  }

  return result
}

// ─── Mapeo de errores de math.js ─────────────────────────────────────────────

function mapMathError(err: unknown, expr: string): CalculatorError {
  if (err instanceof CalculatorError) return err

  const message = err instanceof Error ? err.message.toLowerCase() : ''

  if (message.includes('parenthes') || message.includes('unexpected end')) {
    return createError('UNBALANCED_PARENTHESES')
  }
  if (message.includes('unexpected') || message.includes('parse')) {
    return createError('INCOMPLETE_EXPRESSION')
  }
  if (message.includes('undefined') && message.includes('symbol')) {
    return createError('UNKNOWN')
  }
  // División por cero puede llegar como error en algunos contextos
  if (message.includes('division') || message.includes('zero')) {
    return createError('DIVISION_BY_ZERO')
  }

  // Verificamos el contexto de la expresión para dar mejor diagnóstico
  if (/sqrt\s*\(\s*-/.test(expr)) return createError('NEGATIVE_SQRT')

  return createError('UNKNOWN')
}
