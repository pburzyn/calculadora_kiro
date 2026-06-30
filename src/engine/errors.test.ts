import { describe, it, expect } from 'vitest'
import {
  CalculatorErrorCode,
  CalculatorError,
  ERROR_MESSAGES,
  createError,
} from './errors'

describe('ERROR_MESSAGES', () => {
  it('tiene un mensaje en español para cada código de error', () => {
    const codes: CalculatorErrorCode[] = [
      'DIVISION_BY_ZERO',
      'INCOMPLETE_EXPRESSION',
      'MISSING_ARGUMENT',
      'INVALID_FACTORIAL_NEGATIVE',
      'INVALID_FACTORIAL_NON_INTEGER',
      'NEGATIVE_SQRT',
      'UNBALANCED_PARENTHESES',
      'UNDEFINED_TAN',
      'UNKNOWN',
    ]

    for (const code of codes) {
      expect(ERROR_MESSAGES[code]).toBeDefined()
      expect(typeof ERROR_MESSAGES[code]).toBe('string')
      expect(ERROR_MESSAGES[code].length).toBeGreaterThan(0)
    }
  })

  it('el mensaje de DIVISION_BY_ZERO contiene "División por cero"', () => {
    expect(ERROR_MESSAGES['DIVISION_BY_ZERO']).toBe('Error: División por cero')
  })

  it('el mensaje de INCOMPLETE_EXPRESSION contiene "Expresión incompleta"', () => {
    expect(ERROR_MESSAGES['INCOMPLETE_EXPRESSION']).toBe('Error: Expresión incompleta')
  })

  it('el mensaje de MISSING_ARGUMENT contiene "Argumento faltante"', () => {
    expect(ERROR_MESSAGES['MISSING_ARGUMENT']).toBe('Error: Argumento faltante')
  })

  it('el mensaje de INVALID_FACTORIAL_NEGATIVE menciona negativos', () => {
    expect(ERROR_MESSAGES['INVALID_FACTORIAL_NEGATIVE']).toBe(
      'Error: El factorial no está definido para números negativos'
    )
  })

  it('el mensaje de INVALID_FACTORIAL_NON_INTEGER menciona entero', () => {
    expect(ERROR_MESSAGES['INVALID_FACTORIAL_NON_INTEGER']).toBe(
      'Error: El factorial requiere un número entero'
    )
  })

  it('el mensaje de NEGATIVE_SQRT menciona raíz negativa', () => {
    expect(ERROR_MESSAGES['NEGATIVE_SQRT']).toBe(
      'Error: Raíz de número negativo no soportada'
    )
  })

  it('el mensaje de UNBALANCED_PARENTHESES menciona paréntesis', () => {
    expect(ERROR_MESSAGES['UNBALANCED_PARENTHESES']).toBe('Error: Paréntesis sin cerrar')
  })

  it('el mensaje de UNDEFINED_TAN menciona ángulo', () => {
    expect(ERROR_MESSAGES['UNDEFINED_TAN']).toBe(
      'Error: Valor sin definición en este ángulo'
    )
  })

  it('el mensaje de UNKNOWN es genérico', () => {
    expect(ERROR_MESSAGES['UNKNOWN']).toBe('Error: Expresión inválida')
  })
})

describe('CalculatorError', () => {
  it('es una instancia de Error', () => {
    const err = new CalculatorError('DIVISION_BY_ZERO')
    expect(err).toBeInstanceOf(Error)
  })

  it('expone el código de error', () => {
    const err = new CalculatorError('NEGATIVE_SQRT')
    expect(err.code).toBe('NEGATIVE_SQRT')
  })

  it('usa el mensaje en español correspondiente al código', () => {
    const err = new CalculatorError('DIVISION_BY_ZERO')
    expect(err.message).toBe(ERROR_MESSAGES['DIVISION_BY_ZERO'])
  })

  it('tiene el nombre correcto', () => {
    const err = new CalculatorError('UNKNOWN')
    expect(err.name).toBe('CalculatorError')
  })

  it('funciona con todos los códigos sin lanzar excepción', () => {
    const codes: CalculatorErrorCode[] = [
      'DIVISION_BY_ZERO',
      'INCOMPLETE_EXPRESSION',
      'MISSING_ARGUMENT',
      'INVALID_FACTORIAL_NEGATIVE',
      'INVALID_FACTORIAL_NON_INTEGER',
      'NEGATIVE_SQRT',
      'UNBALANCED_PARENTHESES',
      'UNDEFINED_TAN',
      'UNKNOWN',
    ]
    for (const code of codes) {
      expect(() => new CalculatorError(code)).not.toThrow()
    }
  })
})

describe('createError', () => {
  it('retorna una instancia de CalculatorError', () => {
    const err = createError('UNKNOWN')
    expect(err).toBeInstanceOf(CalculatorError)
  })

  it('retorna el código correcto', () => {
    const err = createError('MISSING_ARGUMENT')
    expect(err.code).toBe('MISSING_ARGUMENT')
  })

  it('retorna el mensaje en español correcto', () => {
    const err = createError('INCOMPLETE_EXPRESSION')
    expect(err.message).toBe(ERROR_MESSAGES['INCOMPLETE_EXPRESSION'])
  })
})
