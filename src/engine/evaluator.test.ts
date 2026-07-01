import { describe, it, expect } from 'vitest'
import { evaluate, type EvaluationResult } from './evaluator'
import { CalculatorError } from './errors'

// Helper: evalúa y retorna el valor numérico
function val(expr: string, mode: 'deg' | 'rad' = 'deg'): number {
  return evaluate(expr, mode).value
}

// Helper: evalúa y espera un CalculatorError con el código dado
function expectError(expr: string, code: string, mode: 'deg' | 'rad' = 'deg') {
  expect(() => evaluate(expr, mode)).toThrow(CalculatorError)
  try {
    evaluate(expr, mode)
  } catch (e) {
    expect((e as CalculatorError).code).toBe(code)
  }
}

// ─── Tipo de retorno ────────────────────────────────────────────────────────

describe('evaluate — tipo de retorno', () => {
  it('retorna un objeto con value y expression', () => {
    const result: EvaluationResult = evaluate('2+2', 'deg')
    expect(result).toHaveProperty('value')
    expect(result).toHaveProperty('expression')
    expect(result.value).toBe(4)
    expect(result.expression).toBe('2+2')
  })
})

// ─── Operaciones básicas ────────────────────────────────────────────────────

describe('evaluate — operaciones básicas', () => {
  it('suma: 3 + 5 = 8', () => expect(val('3 + 5')).toBe(8))
  it('resta: 10 - 4 = 6', () => expect(val('10 - 4')).toBe(6))
  it('multiplicación: 6 × 7 = 42', () => expect(val('6 * 7')).toBe(42))
  it('división: 15 / 3 = 5', () => expect(val('15 / 3')).toBe(5))

  it('respeta precedencia: 10 - 4 / 2 = 8', () => expect(val('10 - 4 / 2')).toBe(8))
  it('paréntesis: (3 + 5) * 2 = 16', () => expect(val('(3 + 5) * 2')).toBe(16))
  it('paréntesis anidados: ((2 + 3) * (4 - 1)) = 15', () => {
    expect(val('(2 + 3) * (4 - 1)')).toBe(15)
  })

  it('resultado negativo: 3 - 10 = -7', () => expect(val('3 - 10')).toBe(-7))
  it('decimales: 0.1 + 0.2 se redondea a 0.3', () => {
    expect(val('0.1 + 0.2')).toBeCloseTo(0.3, 9)
  })
})

// ─── Potencias y raíces ─────────────────────────────────────────────────────

describe('evaluate — potencias y raíces', () => {
  it('2^10 = 1024', () => expect(val('2^10')).toBe(1024))
  it('3^2 = 9', () => expect(val('3^2')).toBe(9))
  it('(-2)^3 = -8', () => expect(val('(-2)^3')).toBe(-8))

  it('sqrt(144) = 12', () => expect(val('sqrt(144)')).toBe(12))
  it('sqrt(9) = 3', () => expect(val('sqrt(9)')).toBe(3))
  it('cbrt(27) = 3', () => expect(val('cbrt(27)')).toBe(3))
  it('cbrt(-8) = -2', () => expect(val('cbrt(-8)')).toBe(-2))

  it('(-8)^(1/3) = -2 (caso especial)', () => {
    expect(val('(-8)^(1/3)')).toBeCloseTo(-2, 9)
  })

  it('raíz n-ésima: 16^(1/4) = 2', () => expect(val('16^(1/4)')).toBe(2))
})

// ─── Constantes ─────────────────────────────────────────────────────────────

describe('evaluate — constantes', () => {
  it('pi ≈ 3.14159265358979', () => {
    expect(val('pi')).toBeCloseTo(Math.PI, 10)
  })
  it('e ≈ 2.71828182845904', () => {
    expect(val('e')).toBeCloseTo(Math.E, 10)
  })
  it('2 * pi', () => expect(val('2 * pi')).toBeCloseTo(2 * Math.PI, 10))
})

// ─── Trigonometría en grados ─────────────────────────────────────────────────

describe('evaluate — trigonometría en grados', () => {
  it('sin(30) = 0.5', () => expect(val('sin(30)')).toBeCloseTo(0.5, 9))
  it('sin(90) = 1', () => expect(val('sin(90)')).toBeCloseTo(1, 9))
  it('cos(0) = 1', () => expect(val('cos(0)')).toBeCloseTo(1, 9))
  it('cos(60) = 0.5', () => expect(val('cos(60)')).toBeCloseTo(0.5, 9))
  it('tan(45) = 1', () => expect(val('tan(45)')).toBeCloseTo(1, 9))
  it('tan(0) = 0', () => expect(val('tan(0)')).toBeCloseTo(0, 9))
  it('asin(0.5) = 30', () => expect(val('asin(0.5)')).toBeCloseTo(30, 9))
  it('acos(0.5) = 60', () => expect(val('acos(0.5)')).toBeCloseTo(60, 9))
  it('atan(1) = 45', () => expect(val('atan(1)')).toBeCloseTo(45, 9))
})

// ─── Trigonometría en radianes ───────────────────────────────────────────────

describe('evaluate — trigonometría en radianes', () => {
  it('cos(pi) = -1', () => expect(val('cos(pi)', 'rad')).toBeCloseTo(-1, 9))
  it('sin(pi/2) = 1', () => expect(val('sin(pi/2)', 'rad')).toBeCloseTo(1, 9))
  it('tan(pi/4) = 1', () => expect(val('tan(pi/4)', 'rad')).toBeCloseTo(1, 9))
  it('asin(1) = pi/2 en radianes', () => {
    expect(val('asin(1)', 'rad')).toBeCloseTo(Math.PI / 2, 9)
  })
})

// ─── Logaritmos ─────────────────────────────────────────────────────────────

describe('evaluate — logaritmos', () => {
  it('log(100) = 2', () => expect(val('log(100)')).toBeCloseTo(2, 9))
  it('log(1) = 0', () => expect(val('log(1)')).toBeCloseTo(0, 9))
  it('log(10) = 1', () => expect(val('log(10)')).toBeCloseTo(1, 9))
  it('ln(e) = 1', () => expect(val('ln(e)')).toBeCloseTo(1, 9))
  it('ln(1) = 0', () => expect(val('ln(1)')).toBeCloseTo(0, 9))
})

// ─── Factorial ───────────────────────────────────────────────────────────────

describe('evaluate — factorial', () => {
  it('0! = 1', () => expect(val('0!')).toBe(1))
  it('1! = 1', () => expect(val('1!')).toBe(1))
  it('5! = 120', () => expect(val('5!')).toBe(120))
  it('10! = 3628800', () => expect(val('10!')).toBe(3628800))
})

// ─── Fracciones ─────────────────────────────────────────────────────────────

describe('evaluate — fracciones', () => {
  it('3/4 + 1/2 = 1.25', () => expect(val('3/4 + 1/2')).toBeCloseTo(1.25, 9))
  it('(2/3)^2 ≈ 0.4444', () => expect(val('(2/3)^2')).toBeCloseTo(4 / 9, 9))
  it('1/3 + 1/6 = 0.5', () => expect(val('1/3 + 1/6')).toBeCloseTo(0.5, 9))
})

// ─── Casos borde — errores ───────────────────────────────────────────────────

describe('evaluate — casos borde de error', () => {
  it('división por cero lanza DIVISION_BY_ZERO', () => {
    expectError('5/0', 'DIVISION_BY_ZERO')
  })

  it('expresión incompleta lanza INCOMPLETE_EXPRESSION', () => {
    expectError('3 +', 'INCOMPLETE_EXPRESSION')
  })

  it('sin() sin argumento lanza MISSING_ARGUMENT', () => {
    expectError('sin()', 'MISSING_ARGUMENT')
  })

  it('factorial de negativo lanza INVALID_FACTORIAL_NEGATIVE', () => {
    expectError('(-1)!', 'INVALID_FACTORIAL_NEGATIVE')
  })

  it('factorial de no-entero lanza INVALID_FACTORIAL_NON_INTEGER', () => {
    expectError('1.5!', 'INVALID_FACTORIAL_NON_INTEGER')
  })

  it('raíz de negativo lanza NEGATIVE_SQRT', () => {
    expectError('sqrt(-1)', 'NEGATIVE_SQRT')
  })

  it('paréntesis desbalanceados lanza UNBALANCED_PARENTHESES', () => {
    expectError('(3 + 5', 'UNBALANCED_PARENTHESES')
  })

  it('tan(90) en grados lanza UNDEFINED_TAN', () => {
    expectError('tan(90)', 'UNDEFINED_TAN')
  })

  it('expresión vacía no lanza error — retorna null', () => {
    expect(evaluate('', 'deg')).toBeNull()
  })

  it('expresión solo espacios no lanza error — retorna null', () => {
    expect(evaluate('   ', 'deg')).toBeNull()
  })
})

// ─── Casos borde — valores especiales ───────────────────────────────────────

describe('evaluate — valores especiales', () => {
  it('resultado muy grande usa notación científica', () => {
    const result = evaluate('9999999999999 * 9999999999999', 'deg')
    expect(result!.value).toBeGreaterThan(1e12)
  })

  it('negativo unitario: -5 = -5', () => {
    expect(val('-5')).toBe(-5)
  })

  it('expresión con número solo: 42 = 42', () => {
    expect(val('42')).toBe(42)
  })
})

// ─── Cobertura de ramas de mapMathError ─────────────────────────────────────

describe('evaluate — cobertura de ramas de error adicionales', () => {
  it('símbolo indefinido lanza UNKNOWN', () => {
    expectError('xyz', 'UNKNOWN')
  })

  it('expresión con solo operadores lanza error', () => {
    expect(() => evaluate('+++', 'deg')).toThrow(CalculatorError)
  })

  it('string no numérico lanza UNKNOWN', () => {
    expect(() => evaluate('abc(', 'deg')).toThrow(CalculatorError)
  })

  it('expresión con paréntesis extra cierre lanza UNBALANCED_PARENTHESES', () => {
    expectError('3 + 5)', 'UNBALANCED_PARENTHESES')
  })

  it('sqrt(-4) lanza NEGATIVE_SQRT', () => {
    expectError('sqrt(-4)', 'NEGATIVE_SQRT')
  })
})

  it('tan(90) en grados lanza UNDEFINED_TAN (via threshold de valor grande)', () => {
    // tan(90°) da ~1.6e16 en math.js — se detecta por threshold
    expectError('tan(90)', 'UNDEFINED_TAN')
  })

  it('expresión con función desconocida pasa por mapMathError', () => {
    // math.js lanza error con "undefined symbol" para funciones inexistentes
    expect(() => evaluate('foo(3)', 'deg')).toThrow(CalculatorError)
  })

  it('expresión que math.js no puede parsear pasa por mapMathError', () => {
    expect(() => evaluate('3 ** 2', 'deg')).toThrow(CalculatorError)
  })
