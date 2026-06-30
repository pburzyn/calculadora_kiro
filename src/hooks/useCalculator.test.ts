import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCalculator } from './useCalculator'

describe('useCalculator — estado inicial', () => {
  it('expression empieza vacía', () => {
    const { result } = renderHook(() => useCalculator())
    expect(result.current.expression).toBe('')
  })

  it('result empieza en null', () => {
    const { result } = renderHook(() => useCalculator())
    expect(result.current.result).toBeNull()
  })

  it('error empieza en null', () => {
    const { result } = renderHook(() => useCalculator())
    expect(result.current.error).toBeNull()
  })

  it('displayMode empieza en decimal', () => {
    const { result } = renderHook(() => useCalculator())
    expect(result.current.displayMode).toBe('decimal')
  })

  it('angleMode empieza en deg', () => {
    const { result } = renderHook(() => useCalculator())
    expect(result.current.angleMode).toBe('deg')
  })

  it('memory empieza vacía', () => {
    const { result } = renderHook(() => useCalculator())
    expect(result.current.memory.hasValue).toBe(false)
    expect(result.current.memory.value).toBe(0)
  })

  it('history empieza vacío', () => {
    const { result } = renderHook(() => useCalculator())
    expect(result.current.history).toHaveLength(0)
  })

  it('canToggleDisplay empieza en false', () => {
    const { result } = renderHook(() => useCalculator())
    expect(result.current.canToggleDisplay).toBe(false)
  })
})

describe('useCalculator — appendToExpression', () => {
  it('agrega un token a la expresión vacía', () => {
    const { result } = renderHook(() => useCalculator())
    act(() => result.current.appendToExpression('5'))
    expect(result.current.expression).toBe('5')
  })

  it('acumula tokens correctamente', () => {
    const { result } = renderHook(() => useCalculator())
    act(() => result.current.appendToExpression('3'))
    act(() => result.current.appendToExpression('+'))
    act(() => result.current.appendToExpression('4'))
    expect(result.current.expression).toBe('3+4')
  })

  it('limpia el error al escribir', () => {
    const { result } = renderHook(() => useCalculator())
    act(() => result.current.appendToExpression('3 +'))
    act(() => result.current.calculate())
    expect(result.current.error).not.toBeNull()
    act(() => result.current.appendToExpression('2'))
    expect(result.current.error).toBeNull()
  })
})

describe('useCalculator — clearExpression', () => {
  it('limpia solo la expresión y el resultado', () => {
    const { result } = renderHook(() => useCalculator())
    act(() => result.current.appendToExpression('5'))
    act(() => result.current.clearExpression())
    expect(result.current.expression).toBe('')
    expect(result.current.result).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('no limpia el historial', () => {
    const { result } = renderHook(() => useCalculator())
    act(() => result.current.appendToExpression('2+2'))
    act(() => result.current.calculate())
    act(() => result.current.clearExpression())
    expect(result.current.history).toHaveLength(1)
  })
})

describe('useCalculator — clearAll', () => {
  it('limpia expresión, resultado, error, historial y memoria', () => {
    const { result } = renderHook(() => useCalculator())
    act(() => result.current.appendToExpression('2+2'))
    act(() => result.current.calculate())
    act(() => result.current.memoryAdd())
    act(() => result.current.clearAll())
    expect(result.current.expression).toBe('')
    expect(result.current.result).toBeNull()
    expect(result.current.error).toBeNull()
    expect(result.current.history).toHaveLength(0)
    expect(result.current.memory.hasValue).toBe(false)
  })
})

describe('useCalculator — calculate', () => {
  it('evalúa una expresión y guarda el resultado', () => {
    const { result } = renderHook(() => useCalculator())
    act(() => result.current.appendToExpression('2+2'))
    act(() => result.current.calculate())
    expect(result.current.result).toBe('4')
    expect(result.current.error).toBeNull()
  })

  it('agrega la operación al historial', () => {
    const { result } = renderHook(() => useCalculator())
    act(() => result.current.appendToExpression('5*3'))
    act(() => result.current.calculate())
    expect(result.current.history).toHaveLength(1)
    expect(result.current.history[0].expression).toBe('5*3')
    expect(result.current.history[0].result).toBe('15')
  })

  it('no hace nada con expresión vacía', () => {
    const { result } = renderHook(() => useCalculator())
    act(() => result.current.calculate())
    expect(result.current.result).toBeNull()
    expect(result.current.history).toHaveLength(0)
  })

  it('guarda el error y no agrega al historial si hay error', () => {
    const { result } = renderHook(() => useCalculator())
    act(() => result.current.appendToExpression('3+'))
    act(() => result.current.calculate())
    expect(result.current.error).not.toBeNull()
    expect(result.current.result).toBeNull()
    expect(result.current.history).toHaveLength(0)
  })

  it('el resultado muestra el valor formateado en decimal', () => {
    const { result } = renderHook(() => useCalculator())
    act(() => result.current.appendToExpression('1/3'))
    act(() => result.current.calculate())
    expect(result.current.result).toBe('0.3333333333')
  })

  it('habilita canToggleDisplay cuando el resultado es una fracción', () => {
    const { result } = renderHook(() => useCalculator())
    act(() => result.current.appendToExpression('1/4'))
    act(() => result.current.calculate())
    expect(result.current.canToggleDisplay).toBe(true)
  })

  it('no habilita canToggleDisplay para π', () => {
    const { result } = renderHook(() => useCalculator())
    act(() => result.current.appendToExpression('pi'))
    act(() => result.current.calculate())
    expect(result.current.canToggleDisplay).toBe(false)
  })
})

describe('useCalculator — toggleDisplayMode', () => {
  it('cambia de decimal a fracción cuando canToggleDisplay es true', () => {
    const { result } = renderHook(() => useCalculator())
    act(() => result.current.appendToExpression('3/4'))
    act(() => result.current.calculate())
    act(() => result.current.toggleDisplayMode())
    expect(result.current.displayMode).toBe('fraction')
    expect(result.current.result).toBe('3/4')
  })

  it('vuelve a decimal al hacer toggle nuevamente', () => {
    const { result } = renderHook(() => useCalculator())
    act(() => result.current.appendToExpression('3/4'))
    act(() => result.current.calculate())
    act(() => result.current.toggleDisplayMode())
    act(() => result.current.toggleDisplayMode())
    expect(result.current.displayMode).toBe('decimal')
    expect(result.current.result).toBe('0.75')
  })

  it('no hace nada si canToggleDisplay es false', () => {
    const { result } = renderHook(() => useCalculator())
    act(() => result.current.appendToExpression('pi'))
    act(() => result.current.calculate())
    act(() => result.current.toggleDisplayMode())
    expect(result.current.displayMode).toBe('decimal')
  })
})

describe('useCalculator — toggleAngleMode', () => {
  it('cambia de deg a rad', () => {
    const { result } = renderHook(() => useCalculator())
    act(() => result.current.toggleAngleMode())
    expect(result.current.angleMode).toBe('rad')
  })

  it('vuelve a deg al hacer toggle nuevamente', () => {
    const { result } = renderHook(() => useCalculator())
    act(() => result.current.toggleAngleMode())
    act(() => result.current.toggleAngleMode())
    expect(result.current.angleMode).toBe('deg')
  })

  it('afecta el resultado de funciones trig', () => {
    const { result } = renderHook(() => useCalculator())
    // En grados: sin(30) = 0.5
    act(() => result.current.appendToExpression('sin(30)'))
    act(() => result.current.calculate())
    const resultDeg = result.current.result

    // En radianes: sin(30) ≠ 0.5
    act(() => result.current.clearExpression())
    act(() => result.current.toggleAngleMode())
    act(() => result.current.appendToExpression('sin(30)'))
    act(() => result.current.calculate())
    const resultRad = result.current.result

    expect(resultDeg).not.toBe(resultRad)
  })
})

describe('useCalculator — memoria', () => {
  it('memoryAdd guarda el resultado en memoria', () => {
    const { result } = renderHook(() => useCalculator())
    act(() => result.current.appendToExpression('50'))
    act(() => result.current.calculate())
    act(() => result.current.memoryAdd())
    expect(result.current.memory.value).toBe(50)
    expect(result.current.memory.hasValue).toBe(true)
  })

  it('memoryAdd no hace nada si no hay resultado', () => {
    const { result } = renderHook(() => useCalculator())
    act(() => result.current.memoryAdd())
    expect(result.current.memory.hasValue).toBe(false)
  })

  it('memorySub resta el resultado a la memoria', () => {
    const { result } = renderHook(() => useCalculator())
    act(() => result.current.appendToExpression('100'))
    act(() => result.current.calculate())
    act(() => result.current.memoryAdd())
    act(() => result.current.clearExpression())
    act(() => result.current.appendToExpression('30'))
    act(() => result.current.calculate())
    act(() => result.current.memorySub())
    expect(result.current.memory.value).toBe(70)
  })

  it('memoryRecall agrega el valor de memoria a la expresión', () => {
    const { result } = renderHook(() => useCalculator())
    act(() => result.current.appendToExpression('42'))
    act(() => result.current.calculate())
    act(() => result.current.memoryAdd())
    act(() => result.current.clearExpression())
    act(() => result.current.memoryRecall())
    expect(result.current.expression).toContain('42')
  })

  it('memoryClear limpia la memoria', () => {
    const { result } = renderHook(() => useCalculator())
    act(() => result.current.appendToExpression('10'))
    act(() => result.current.calculate())
    act(() => result.current.memoryAdd())
    act(() => result.current.memoryClear())
    expect(result.current.memory.hasValue).toBe(false)
    expect(result.current.memory.value).toBe(0)
  })
})

describe('useCalculator — loadFromHistory', () => {
  it('carga la expresión del historial en el campo de entrada', () => {
    const { result } = renderHook(() => useCalculator())
    act(() => result.current.appendToExpression('sqrt(144)'))
    act(() => result.current.calculate())
    const entry = result.current.history[0]
    act(() => result.current.clearExpression())
    act(() => result.current.loadFromHistory(entry))
    expect(result.current.expression).toBe('sqrt(144)')
  })

  it('limpia el resultado y error al cargar del historial', () => {
    const { result } = renderHook(() => useCalculator())
    act(() => result.current.appendToExpression('2+2'))
    act(() => result.current.calculate())
    const entry = result.current.history[0]
    act(() => result.current.loadFromHistory(entry))
    expect(result.current.result).toBeNull()
    expect(result.current.error).toBeNull()
  })
})
