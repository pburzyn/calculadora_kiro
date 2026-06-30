import { describe, it, expect } from 'vitest'
import { toDecimal, toFraction, canBeRepresentedAsFraction } from './formatter'

describe('toDecimal', () => {
  it('formatea un entero sin decimales', () => {
    expect(toDecimal(5)).toBe('5')
  })

  it('formatea un decimal simple', () => {
    expect(toDecimal(0.5)).toBe('0.5')
  })

  it('redondea a 10 decimales significativos', () => {
    // 0.1 + 0.2 en JS = 0.30000000000000004
    expect(toDecimal(0.30000000000000004)).toBe('0.3')
  })

  it('elimina ceros a la derecha del decimal', () => {
    expect(toDecimal(1.5000000000)).toBe('1.5')
  })

  it('aplica notación científica para valores mayores a 1e12', () => {
    expect(toDecimal(1e13)).toBe('1e+13')
  })

  it('aplica notación científica para valores menores a 1e-6 (positivos)', () => {
    expect(toDecimal(1e-7)).toBe('1e-7')
  })

  it('maneja el cero correctamente', () => {
    expect(toDecimal(0)).toBe('0')
  })

  it('maneja números negativos', () => {
    expect(toDecimal(-3.5)).toBe('-3.5')
  })

  it('aplica notación científica para negativos grandes', () => {
    expect(toDecimal(-1e13)).toBe('-1e+13')
  })

  it('formatea π con precisión razonable', () => {
    expect(toDecimal(Math.PI)).toBe('3.1415926536')
  })
})

describe('toFraction', () => {
  it('convierte 0.5 a 1/2', () => {
    expect(toFraction(0.5)).toBe('1/2')
  })

  it('convierte 0.25 a 1/4', () => {
    expect(toFraction(0.25)).toBe('1/4')
  })

  it('convierte 0.75 a 3/4', () => {
    expect(toFraction(0.75)).toBe('3/4')
  })

  it('convierte 1.25 a 5/4', () => {
    expect(toFraction(1.25)).toBe('5/4')
  })

  it('simplifica automáticamente: 0.4 → 2/5', () => {
    expect(toFraction(0.4)).toBe('2/5')
  })

  it('simplifica automáticamente: 4/8 → 1/2 (valor 0.5)', () => {
    expect(toFraction(0.5)).toBe('1/2')
  })

  it('convierte un entero a fracción con denominador 1', () => {
    expect(toFraction(3)).toBe('3')
  })

  it('maneja fracciones negativas', () => {
    expect(toFraction(-0.5)).toBe('-1/2')
  })

  it('convierte 0.333... a 1/3', () => {
    expect(toFraction(1 / 3)).toBe('1/3')
  })

  it('convierte 0.1 a 1/10', () => {
    expect(toFraction(0.1)).toBe('1/10')
  })

  it('convierte (2/3)^2 = 0.4444... a 4/9', () => {
    expect(toFraction((2 / 3) ** 2)).toBe('4/9')
  })
})

describe('canBeRepresentedAsFraction', () => {
  it('retorna true para 0.5', () => {
    expect(canBeRepresentedAsFraction(0.5)).toBe(true)
  })

  it('retorna true para 0.25', () => {
    expect(canBeRepresentedAsFraction(0.25)).toBe(true)
  })

  it('retorna true para 1/3 (0.333...)', () => {
    expect(canBeRepresentedAsFraction(1 / 3)).toBe(true)
  })

  it('retorna true para enteros', () => {
    expect(canBeRepresentedAsFraction(7)).toBe(true)
  })

  it('retorna false para Infinity', () => {
    expect(canBeRepresentedAsFraction(Infinity)).toBe(false)
  })

  it('retorna false para NaN', () => {
    expect(canBeRepresentedAsFraction(NaN)).toBe(false)
  })

  it('retorna false para -Infinity', () => {
    expect(canBeRepresentedAsFraction(-Infinity)).toBe(false)
  })

  it('retorna true para números negativos racionales', () => {
    expect(canBeRepresentedAsFraction(-0.75)).toBe(true)
  })

  it('retorna false para π (irracional)', () => {
    // π no tiene representación exacta como fracción de enteros pequeños
    expect(canBeRepresentedAsFraction(Math.PI)).toBe(false)
  })
})
