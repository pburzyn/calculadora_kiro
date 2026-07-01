import styles from './Display.module.css'
import type { AngleMode, DisplayMode } from '../../hooks/useCalculator'

interface DisplayProps {
  expression: string
  result: string | null
  error: string | null
  angleMode: AngleMode
  memoryActive: boolean
  canToggleDisplay: boolean
  displayMode: DisplayMode
  onToggleDisplay: () => void
  onToggleAngleMode: () => void
}

export function Display({
  expression,
  result,
  error,
  angleMode,
  memoryActive,
  canToggleDisplay,
  onToggleDisplay,
  onToggleAngleMode,
}: DisplayProps) {
  return (
    <div className={styles.display}>
      <div className={styles.indicators}>
        <button
          className={styles.angleMode}
          onClick={onToggleAngleMode}
          aria-label={`Modo angular: ${angleMode}`}
        >
          {angleMode.toUpperCase()}
        </button>
        {memoryActive && <span className={styles.memoryIndicator} data-testid="memory-indicator">M</span>}
      </div>

      <div className={styles.expressionRow}>
        <span className={styles.expression} aria-label="expresión" data-testid="expression">
          {expression || '\u00A0'}
        </span>
      </div>

      <div className={styles.resultRow}>
        {error ? (
          <span className={styles.error} role="alert" data-testid="error">{error}</span>
        ) : (
          <span className={styles.result} data-testid="result">{result ?? '\u00A0'}</span>
        )}
        {canToggleDisplay && (
          <button
            className={styles.toggleButton}
            onClick={onToggleDisplay}
            aria-label="a/b | dec"
          >
            a/b | dec
          </button>
        )}
      </div>
    </div>
  )
}
