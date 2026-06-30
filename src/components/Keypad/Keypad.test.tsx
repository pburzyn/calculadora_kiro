import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Keypad } from './Keypad'

const defaultProps = {
  onAppend: vi.fn(),
  onCalculate: vi.fn(),
  onClear: vi.fn(),
  onClearAll: vi.fn(),
  onMemoryAdd: vi.fn(),
  onMemorySub: vi.fn(),
  onMemoryRecall: vi.fn(),
  onMemoryClear: vi.fn(),
}

describe('Keypad', () => {
  it('renderiza los dígitos del 0 al 9', () => {
    render(<Keypad {...defaultProps} />)
    for (let i = 0; i <= 9; i++) {
      expect(screen.getByRole('button', { name: i.toString() })).toBeInTheDocument()
    }
  })

  it('renderiza los operadores básicos', () => {
    render(<Keypad {...defaultProps} />)
    expect(screen.getByRole('button', { name: '+' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '-' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '×' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '÷' })).toBeInTheDocument()
  })

  it('renderiza el botón igual', () => {
    render(<Keypad {...defaultProps} />)
    expect(screen.getByRole('button', { name: '=' })).toBeInTheDocument()
  })

  it('renderiza funciones científicas', () => {
    render(<Keypad {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'sin' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'cos' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'tan' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'log' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ln' })).toBeInTheDocument()
  })

  it('renderiza botones de memoria', () => {
    render(<Keypad {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'M+' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'M-' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'MR' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'MC' })).toBeInTheDocument()
  })

  it('llama onAppend con el dígito al hacer click en un número', () => {
    const onAppend = vi.fn()
    render(<Keypad {...defaultProps} onAppend={onAppend} />)
    fireEvent.click(screen.getByRole('button', { name: '5' }))
    expect(onAppend).toHaveBeenCalledWith('5')
  })

  it('llama onAppend con el operador al hacer click en +', () => {
    const onAppend = vi.fn()
    render(<Keypad {...defaultProps} onAppend={onAppend} />)
    fireEvent.click(screen.getByRole('button', { name: '+' }))
    expect(onAppend).toHaveBeenCalledWith('+')
  })

  it('llama onCalculate al hacer click en =', () => {
    const onCalculate = vi.fn()
    render(<Keypad {...defaultProps} onCalculate={onCalculate} />)
    fireEvent.click(screen.getByRole('button', { name: '=' }))
    expect(onCalculate).toHaveBeenCalledOnce()
  })

  it('llama onClear al hacer click en C', () => {
    const onClear = vi.fn()
    render(<Keypad {...defaultProps} onClear={onClear} />)
    fireEvent.click(screen.getByRole('button', { name: 'C' }))
    expect(onClear).toHaveBeenCalledOnce()
  })

  it('llama onAppend con "sin(" al hacer click en sin', () => {
    const onAppend = vi.fn()
    render(<Keypad {...defaultProps} onAppend={onAppend} />)
    fireEvent.click(screen.getByRole('button', { name: 'sin' }))
    expect(onAppend).toHaveBeenCalledWith('sin(')
  })

  it('llama onMemoryAdd al hacer click en M+', () => {
    const onMemoryAdd = vi.fn()
    render(<Keypad {...defaultProps} onMemoryAdd={onMemoryAdd} />)
    fireEvent.click(screen.getByRole('button', { name: 'M+' }))
    expect(onMemoryAdd).toHaveBeenCalledOnce()
  })
})
