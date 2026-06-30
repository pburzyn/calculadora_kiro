import styles from './Keypad.module.css'

interface KeypadProps {
  onAppend: (token: string) => void
  onCalculate: () => void
  onClear: () => void
  onClearAll: () => void
  onMemoryAdd: () => void
  onMemorySub: () => void
  onMemoryRecall: () => void
  onMemoryClear: () => void
}

type ButtonDef =
  | { label: string; action: 'append'; value: string; variant?: string }
  | { label: string; action: 'calculate' | 'clear' | 'clearAll' | 'memoryAdd' | 'memorySub' | 'memoryRecall' | 'memoryClear'; variant?: string }

const BUTTONS: ButtonDef[][] = [
  // Fila 1: Memoria
  [
    { label: 'MC', action: 'memoryClear', variant: 'memory' },
    { label: 'MR', action: 'memoryRecall', variant: 'memory' },
    { label: 'M-', action: 'memorySub', variant: 'memory' },
    { label: 'M+', action: 'memoryAdd', variant: 'memory' },
  ],
  // Fila 2: Funciones científicas
  [
    { label: 'sin', action: 'append', value: 'sin(' },
    { label: 'cos', action: 'append', value: 'cos(' },
    { label: 'tan', action: 'append', value: 'tan(' },
    { label: 'π', action: 'append', value: 'pi', variant: 'constant' },
  ],
  // Fila 3: Funciones científicas 2
  [
    { label: 'asin', action: 'append', value: 'asin(' },
    { label: 'acos', action: 'append', value: 'acos(' },
    { label: 'atan', action: 'append', value: 'atan(' },
    { label: 'e', action: 'append', value: 'e', variant: 'constant' },
  ],
  // Fila 4: Logaritmos y raíces
  [
    { label: 'log', action: 'append', value: 'log(' },
    { label: 'ln', action: 'append', value: 'ln(' },
    { label: '√', action: 'append', value: 'sqrt(' },
    { label: '∛', action: 'append', value: 'cbrt(' },
  ],
  // Fila 5: Potencias y factorial
  [
    { label: 'x²', action: 'append', value: '^2' },
    { label: 'x³', action: 'append', value: '^3' },
    { label: 'xⁿ', action: 'append', value: '^(' },
    { label: 'n!', action: 'append', value: '!' },
  ],
  // Fila 6: Paréntesis, limpiar
  [
    { label: '(', action: 'append', value: '(' },
    { label: ')', action: 'append', value: ')' },
    { label: 'C', action: 'clear', variant: 'clear' },
    { label: 'AC', action: 'clearAll', variant: 'clear' },
  ],
  // Fila 7: 7 8 9 ÷
  [
    { label: '7', action: 'append', value: '7' },
    { label: '8', action: 'append', value: '8' },
    { label: '9', action: 'append', value: '9' },
    { label: '÷', action: 'append', value: '/', variant: 'operator' },
  ],
  // Fila 8: 4 5 6 ×
  [
    { label: '4', action: 'append', value: '4' },
    { label: '5', action: 'append', value: '5' },
    { label: '6', action: 'append', value: '6' },
    { label: '×', action: 'append', value: '*', variant: 'operator' },
  ],
  // Fila 9: 1 2 3 -
  [
    { label: '1', action: 'append', value: '1' },
    { label: '2', action: 'append', value: '2' },
    { label: '3', action: 'append', value: '3' },
    { label: '-', action: 'append', value: '-', variant: 'operator' },
  ],
  // Fila 10: 0 . = +
  [
    { label: '0', action: 'append', value: '0' },
    { label: '.', action: 'append', value: '.' },
    { label: '=', action: 'calculate', variant: 'equals' },
    { label: '+', action: 'append', value: '+', variant: 'operator' },
  ],
]

export function Keypad({
  onAppend,
  onCalculate,
  onClear,
  onClearAll,
  onMemoryAdd,
  onMemorySub,
  onMemoryRecall,
  onMemoryClear,
}: KeypadProps) {
  function handleClick(btn: ButtonDef) {
    switch (btn.action) {
      case 'append':
        onAppend(btn.value)
        break
      case 'calculate':
        onCalculate()
        break
      case 'clear':
        onClear()
        break
      case 'clearAll':
        onClearAll()
        break
      case 'memoryAdd':
        onMemoryAdd()
        break
      case 'memorySub':
        onMemorySub()
        break
      case 'memoryRecall':
        onMemoryRecall()
        break
      case 'memoryClear':
        onMemoryClear()
        break
    }
  }

  return (
    <div className={styles.keypad}>
      {BUTTONS.map((row, rowIdx) => (
        <div key={rowIdx} className={styles.row}>
          {row.map((btn) => (
            <button
              key={btn.label}
              className={`${styles.btn} ${btn.variant ? styles[btn.variant] : ''}`}
              onClick={() => handleClick(btn)}
              aria-label={btn.label}
            >
              {btn.label}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}
