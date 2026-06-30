import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { HistoryPanel } from './HistoryPanel'
import type { HistoryEntry } from '../../engine/history'

const makeEntry = (expression: string, result: string, timestamp = 0): HistoryEntry => ({
  expression,
  result,
  timestamp,
})

describe('HistoryPanel', () => {
  it('muestra mensaje cuando el historial está vacío', () => {
    render(<HistoryPanel history={[]} onLoad={vi.fn()} />)
    expect(screen.getByText(/sin operaciones/i)).toBeInTheDocument()
  })

  it('renderiza las entradas del historial', () => {
    const history = [
      makeEntry('2+2', '4'),
      makeEntry('sqrt(9)', '3'),
    ]
    render(<HistoryPanel history={history} onLoad={vi.fn()} />)
    expect(screen.getByText('2+2')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('sqrt(9)')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('llama onLoad con la entrada al hacer click', () => {
    const onLoad = vi.fn()
    const entry = makeEntry('sin(30)', '0.5')
    render(<HistoryPanel history={[entry]} onLoad={onLoad} />)
    fireEvent.click(screen.getByText('sin(30)'))
    expect(onLoad).toHaveBeenCalledWith(entry)
  })

  it('muestra hasta 10 entradas', () => {
    const history = Array.from({ length: 10 }, (_, i) =>
      makeEntry(`op${i}`, `res${i}`, i),
    )
    render(<HistoryPanel history={history} onLoad={vi.fn()} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(10)
  })

  it('muestra el resultado junto a la expresión con formato "expresión = resultado"', () => {
    const history = [makeEntry('3*4', '12')]
    render(<HistoryPanel history={history} onLoad={vi.fn()} />)
    expect(screen.getByText(/3\*4/)).toBeInTheDocument()
    expect(screen.getByText(/12/)).toBeInTheDocument()
  })
})
