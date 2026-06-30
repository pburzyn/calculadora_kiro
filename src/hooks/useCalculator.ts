import { useState, useCallback } from 'react'
import { evaluate } from '../engine/evaluator'
import { toDecimal, toFraction, canBeRepresentedAsFraction } from '../engine/formatter'
import { memoryAdd, memorySub, memoryRecall, memoryClear, EMPTY_MEMORY } from '../engine/memory'
import { addEntry } from '../engine/history'
import { CalculatorError } from '../engine/errors'
import type { MemoryState } from '../engine/memory'
import type { HistoryEntry } from '../engine/history'

export type AngleMode = 'deg' | 'rad'
export type DisplayMode = 'decimal' | 'fraction'

export interface CalculatorState {
  expression: string
  result: string | null
  error: string | null
  displayMode: DisplayMode
  angleMode: AngleMode
  memory: MemoryState
  history: HistoryEntry[]
  canToggleDisplay: boolean
}

export interface CalculatorActions {
  appendToExpression: (token: string) => void
  clearExpression: () => void
  clearAll: () => void
  calculate: () => void
  toggleDisplayMode: () => void
  toggleAngleMode: () => void
  memoryAdd: () => void
  memorySub: () => void
  memoryRecall: () => void
  memoryClear: () => void
  loadFromHistory: (entry: HistoryEntry) => void
}

const INITIAL_STATE: CalculatorState = {
  expression: '',
  result: null,
  error: null,
  displayMode: 'decimal',
  angleMode: 'deg',
  memory: EMPTY_MEMORY,
  history: [],
  canToggleDisplay: false,
}

export function useCalculator(): CalculatorState & CalculatorActions {
  const [state, setState] = useState<CalculatorState>(INITIAL_STATE)

  // ─── Helpers internos ──────────────────────────────────────────────────────

  /** Formatea un valor numérico según el displayMode actual */
  function formatResult(value: number, mode: DisplayMode): string {
    return mode === 'fraction' ? toFraction(value) : toDecimal(value)
  }

  // ─── Acciones ──────────────────────────────────────────────────────────────

  const appendToExpression = useCallback((token: string) => {
    setState(prev => ({
      ...prev,
      expression: prev.expression + token,
      error: null,
    }))
  }, [])

  const clearExpression = useCallback(() => {
    setState(prev => ({
      ...prev,
      expression: '',
      result: null,
      error: null,
      displayMode: 'decimal',
      canToggleDisplay: false,
    }))
  }, [])

  const clearAll = useCallback(() => {
    setState({
      ...INITIAL_STATE,
      angleMode: state.angleMode, // preservamos el modo angular
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.angleMode])

  const calculate = useCallback(() => {
    setState(prev => {
      if (prev.expression.trim() === '') return prev

      try {
        const evalResult = evaluate(prev.expression, prev.angleMode)
        if (evalResult === null) return prev

        const { value } = evalResult
        const canToggle = canBeRepresentedAsFraction(value)
        const formatted = formatResult(value, prev.displayMode)

        const entry: HistoryEntry = {
          expression: prev.expression,
          result: toDecimal(value),
          timestamp: Date.now(),
        }

        return {
          ...prev,
          result: formatted,
          error: null,
          canToggleDisplay: canToggle,
          history: addEntry(prev.history, entry),
        }
      } catch (err) {
        const message = err instanceof CalculatorError
          ? err.message
          : 'Error: Expresión inválida'

        return {
          ...prev,
          result: null,
          error: message,
          canToggleDisplay: false,
        }
      }
    })
  }, [])

  const toggleDisplayMode = useCallback(() => {
    setState(prev => {
      if (!prev.canToggleDisplay || prev.result === null) return prev

      const newMode: DisplayMode = prev.displayMode === 'decimal' ? 'fraction' : 'decimal'

      // Re-evaluamos para obtener el valor numérico y reformatear
      try {
        const evalResult = evaluate(prev.expression, prev.angleMode)
        if (!evalResult) return prev
        const formatted = formatResult(evalResult.value, newMode)
        return { ...prev, displayMode: newMode, result: formatted }
      } catch {
        return prev
      }
    })
  }, [])

  const toggleAngleMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      angleMode: prev.angleMode === 'deg' ? 'rad' : 'deg',
    }))
  }, [])

  const memoryAddAction = useCallback(() => {
    setState(prev => {
      if (prev.result === null) return prev
      const value = parseFloat(prev.result)
      if (isNaN(value)) return prev
      return { ...prev, memory: memoryAdd(value, prev.memory) }
    })
  }, [])

  const memorySubAction = useCallback(() => {
    setState(prev => {
      if (prev.result === null) return prev
      const value = parseFloat(prev.result)
      if (isNaN(value)) return prev
      return { ...prev, memory: memorySub(value, prev.memory) }
    })
  }, [])

  const memoryRecallAction = useCallback(() => {
    setState(prev => {
      const value = memoryRecall(prev.memory)
      return {
        ...prev,
        expression: prev.expression + value.toString(),
        error: null,
      }
    })
  }, [])

  const memoryClearAction = useCallback(() => {
    setState(prev => ({ ...prev, memory: memoryClear() }))
  }, [])

  const loadFromHistory = useCallback((entry: HistoryEntry) => {
    setState(prev => ({
      ...prev,
      expression: entry.expression,
      result: null,
      error: null,
      displayMode: 'decimal',
      canToggleDisplay: false,
    }))
  }, [])

  return {
    // Estado
    ...state,
    // Acciones
    appendToExpression,
    clearExpression,
    clearAll,
    calculate,
    toggleDisplayMode,
    toggleAngleMode,
    memoryAdd: memoryAddAction,
    memorySub: memorySubAction,
    memoryRecall: memoryRecallAction,
    memoryClear: memoryClearAction,
    loadFromHistory,
  }
}
