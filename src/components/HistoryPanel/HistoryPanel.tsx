import styles from './HistoryPanel.module.css'
import type { HistoryEntry } from '../../engine/history'

interface HistoryPanelProps {
  history: HistoryEntry[]
  onLoad: (entry: HistoryEntry) => void
}

export function HistoryPanel({ history, onLoad }: HistoryPanelProps) {
  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>Historial</h3>
      {history.length === 0 ? (
        <p className={styles.empty}>Sin operaciones aún</p>
      ) : (
        <ul className={styles.list}>
          {history.map((entry) => (
            <li
              key={`${entry.expression}-${entry.timestamp}`}
              className={styles.entry}
              onClick={() => onLoad(entry)}
              role="listitem"
              title="Click para cargar esta expresión"
            >
              <span className={styles.expression}>{entry.expression}</span>
              <span className={styles.equals}>=</span>
              <span className={styles.result}>{entry.result}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
