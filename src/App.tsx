import { useEffect, useCallback } from 'react'
import { useCalculator } from './hooks/useCalculator'
import { Display } from './components/Display/Display'
import { Keypad } from './components/Keypad/Keypad'
import { HistoryPanel } from './components/HistoryPanel/HistoryPanel'
import styles from './App.module.css'

// Mapa de teclas del teclado físico → token de expresión
const KEY_MAP: Record<string, string> = {
  '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
  '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
  '+': '+', '-': '-', '*': '*', '/': '/',
  '.': '.', '(': '(', ')': ')', '^': '^',
  '!': '!',
}

export default function App() {
  const calc = useCalculator()

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === '=') {
      e.preventDefault()
      calc.calculate()
    } else if (e.key === 'Escape') {
      calc.clearExpression()
    } else if (e.key === 'Backspace') {
      // No implementado en v1 — ignorar silenciosamente
    } else if (KEY_MAP[e.key] !== undefined) {
      calc.appendToExpression(KEY_MAP[e.key])
    }
  }, [calc])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>Calculadora Científica</h1>
      </header>

      <main className={styles.main}>
        <div className={styles.calculatorPane}>
          <Display
            expression={calc.expression}
            result={calc.result}
            error={calc.error}
            angleMode={calc.angleMode}
            memoryActive={calc.memory.hasValue}
            canToggleDisplay={calc.canToggleDisplay}
            displayMode={calc.displayMode}
            onToggleDisplay={calc.toggleDisplayMode}
            onToggleAngleMode={calc.toggleAngleMode}
          />
          <Keypad
            onAppend={calc.appendToExpression}
            onCalculate={calc.calculate}
            onClear={calc.clearExpression}
            onClearAll={calc.clearAll}
            onMemoryAdd={calc.memoryAdd}
            onMemorySub={calc.memorySub}
            onMemoryRecall={calc.memoryRecall}
            onMemoryClear={calc.memoryClear}
          />
        </div>

        <div className={styles.historyPane}>
          <HistoryPanel
            history={calc.history}
            onLoad={calc.loadFromHistory}
          />
        </div>
      </main>
    </div>
  )
}
