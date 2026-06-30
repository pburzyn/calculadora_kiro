import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Display } from './Display'

const defaultProps = {
  expression: '',
  result: null,
  error: null,
  angleMode: 'deg' as const,
  memoryActive: false,
  canToggleDisplay: false,
  displayMode: 'decimal' as const,
  onToggleDisplay: vi.fn(),
  onToggleAngleMode: vi.fn(),
}

describe('Display', () => {
  it('muestra la expresión actual', () => {
    render(<Display {...defaultProps} expression="sin(30) + 2^3" />)
    expect(screen.getByText('sin(30) + 2^3')).toBeInTheDocument()
  })

  it('muestra el resultado cuando existe', () => {
    render(<Display {...defaultProps} result="8.5" />)
    expect(screen.getByText('8.5')).toBeInTheDocument()
  })

  it('muestra el error cuando existe', () => {
    render(<Display {...defaultProps} error="Error: División por cero" />)
    expect(screen.getByText('Error: División por cero')).toBeInTheDocument()
  })

  it('muestra el indicador DEG por defecto', () => {
    render(<Display {...defaultProps} angleMode="deg" />)
    expect(screen.getByText('DEG')).toBeInTheDocument()
  })

  it('muestra el indicador RAD en modo radianes', () => {
    render(<Display {...defaultProps} angleMode="rad" />)
    expect(screen.getByText('RAD')).toBeInTheDocument()
  })

  it('llama onToggleAngleMode al hacer click en el indicador de ángulo', () => {
    const onToggleAngleMode = vi.fn()
    render(<Display {...defaultProps} onToggleAngleMode={onToggleAngleMode} />)
    fireEvent.click(screen.getByText('DEG'))
    expect(onToggleAngleMode).toHaveBeenCalledOnce()
  })

  it('muestra el indicador M cuando hay valor en memoria', () => {
    render(<Display {...defaultProps} memoryActive={true} />)
    expect(screen.getByText('M')).toBeInTheDocument()
  })

  it('no muestra el indicador M cuando la memoria está vacía', () => {
    render(<Display {...defaultProps} memoryActive={false} />)
    expect(screen.queryByText('M')).not.toBeInTheDocument()
  })

  it('muestra el botón toggle cuando canToggleDisplay es true', () => {
    render(<Display {...defaultProps} canToggleDisplay={true} result="0.75" />)
    expect(screen.getByRole('button', { name: /a\/b|dec/i })).toBeInTheDocument()
  })

  it('no muestra el botón toggle cuando canToggleDisplay es false', () => {
    render(<Display {...defaultProps} canToggleDisplay={false} />)
    expect(screen.queryByRole('button', { name: /a\/b|dec/i })).not.toBeInTheDocument()
  })

  it('llama onToggleDisplay al hacer click en el toggle', () => {
    const onToggleDisplay = vi.fn()
    render(<Display {...defaultProps} canToggleDisplay={true} result="0.75" onToggleDisplay={onToggleDisplay} />)
    fireEvent.click(screen.getByRole('button', { name: /a\/b|dec/i }))
    expect(onToggleDisplay).toHaveBeenCalledOnce()
  })
})
