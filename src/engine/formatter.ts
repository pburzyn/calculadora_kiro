// Umbral para aplicar notación científica
const SCIENTIFIC_UPPER = 1e12
const SCIENTIFIC_LOWER = 1e-6
const DECIMAL_PLACES = 10

// Límite de denominador para considerar que un número es "representable" como fracción
const MAX_DENOMINATOR = 100

// Tolerancia: si la fracción no aproxima el valor con este error, no es representable
const FRACTION_EPSILON = 1e-6

/**
 * Formatea un número como string decimal.
 * - Redondea a DECIMAL_PLACES decimales
 * - Usa notación científica para valores muy grandes o muy pequeños
 */
export function toDecimal(value: number): string {
  if (value === 0) return '0'

  const abs = Math.abs(value)

  if (abs > SCIENTIFIC_UPPER || (abs < SCIENTIFIC_LOWER && abs > 0)) {
    return parseFloat(value.toExponential()).toExponential()
  }

  // toFixed da exactamente DECIMAL_PLACES decimales; parseFloat elimina ceros finales
  return parseFloat(value.toFixed(DECIMAL_PLACES)).toString()
}

/**
 * Convierte un número a su representación como fracción simplificada.
 * Si el número es entero, retorna solo el entero.
 */
export function toFraction(value: number): string {
  if (Number.isInteger(value)) return value.toString()

  const negative = value < 0
  const abs = Math.abs(value)

  const result = toRatio(abs, 1000)
  if (!result) return toDecimal(value)

  const [num, den] = result
  if (den === 1) return negative ? `-${num}` : `${num}`
  return negative ? `-${num}/${den}` : `${num}/${den}`
}

/**
 * Determina si un número puede representarse como fracción simple.
 * Retorna false para Infinity, NaN, y valores irracionales como π.
 */
export function canBeRepresentedAsFraction(value: number): boolean {
  if (!Number.isFinite(value) || Number.isNaN(value)) return false
  if (Number.isInteger(value)) return true

  const result = toRatio(Math.abs(value), MAX_DENOMINATOR)
  return result !== null
}

// — Helpers internos —

/**
 * Algoritmo de fracciones continuas.
 * Retorna [numerador, denominador] si existe una fracción con den <= maxDen
 * que aproxime value con error < FRACTION_EPSILON.
 * Retorna null si no existe tal fracción.
 */
function toRatio(value: number, maxDen: number): [number, number] | null {
  if (Number.isInteger(value)) return [value, 1]

  let h1 = 1, h2 = 0
  let k1 = 0, k2 = 1
  let b = value
  let bestH = 1, bestK = 1

  for (let i = 0; i < 64; i++) {
    const a = Math.floor(b)
    const h = a * h1 + h2
    const k = a * k1 + k2

    if (k > maxDen) break

    h2 = h1; h1 = h
    k2 = k1; k1 = k
    bestH = h1; bestK = k1

    const remainder = b - a
    if (Math.abs(remainder) < 1e-9) break
    b = 1 / remainder
  }

  // Verificamos que la fracción encontrada realmente aproxima el valor
  if (Math.abs(bestH / bestK - value) > FRACTION_EPSILON) return null

  return [bestH, bestK]
}
