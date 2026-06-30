export type CalculatorErrorCode =
  | 'DIVISION_BY_ZERO'
  | 'INCOMPLETE_EXPRESSION'
  | 'MISSING_ARGUMENT'
  | 'INVALID_FACTORIAL_NEGATIVE'
  | 'INVALID_FACTORIAL_NON_INTEGER'
  | 'NEGATIVE_SQRT'
  | 'UNBALANCED_PARENTHESES'
  | 'UNDEFINED_TAN'
  | 'UNKNOWN'

export const ERROR_MESSAGES: Record<CalculatorErrorCode, string> = {
  DIVISION_BY_ZERO: 'Error: División por cero',
  INCOMPLETE_EXPRESSION: 'Error: Expresión incompleta',
  MISSING_ARGUMENT: 'Error: Argumento faltante',
  INVALID_FACTORIAL_NEGATIVE:
    'Error: El factorial no está definido para números negativos',
  INVALID_FACTORIAL_NON_INTEGER: 'Error: El factorial requiere un número entero',
  NEGATIVE_SQRT: 'Error: Raíz de número negativo no soportada',
  UNBALANCED_PARENTHESES: 'Error: Paréntesis sin cerrar',
  UNDEFINED_TAN: 'Error: Valor sin definición en este ángulo',
  UNKNOWN: 'Error: Expresión inválida',
}

export class CalculatorError extends Error {
  readonly code: CalculatorErrorCode

  constructor(code: CalculatorErrorCode) {
    super(ERROR_MESSAGES[code])
    this.name = 'CalculatorError'
    this.code = code
    // Restaura la cadena de prototipos correctamente en entornos transpilados
    Object.setPrototypeOf(this, CalculatorError.prototype)
  }
}

export function createError(code: CalculatorErrorCode): CalculatorError {
  return new CalculatorError(code)
}
