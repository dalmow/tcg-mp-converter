// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { RowState } from './row-state'

afterEach(cleanup)

describe('RowState', () => {
  it('renders a pendency as a danger tint with a danger status border', () => {
    render(<RowState state="pendency">linha</RowState>)

    const row = screen.getByText('linha')
    expect(row.dataset.state).toBe('pendency')
    expect(row.className).toContain('bg-danger-tint')
    expect(row.className).toContain('status-border')
    expect(row.className).toContain('border-danger')
  })

  it('renders a complete row as a secondary tint with a secondary status border', () => {
    render(<RowState state="complete">linha</RowState>)

    const row = screen.getByText('linha')
    expect(row.dataset.state).toBe('complete')
    expect(row.className).toContain('bg-secondary-tint')
    expect(row.className).toContain('status-border')
    expect(row.className).toContain('border-secondary')
  })

  it('renders a no-op row with a 1px dashed border and no status color', () => {
    render(<RowState state="noop">linha</RowState>)

    const row = screen.getByText('linha')
    expect(row.dataset.state).toBe('noop')
    expect(row.className).toContain('border-dashed')
    expect(row.className).toContain('border-border-dashed')
    expect(row.className).not.toContain('status-border')
    expect(row.className).not.toContain('bg-danger-tint')
    expect(row.className).not.toContain('bg-secondary-tint')
  })

  it('is less rounded than a panel (radius-2xl)', () => {
    render(<RowState state="complete">linha</RowState>)

    expect(screen.getByText('linha').className).toContain('rounded-md')
  })

  it('forwards native props and merges className', () => {
    render(
      <RowState state="pendency" id="row-1" className="p-2">
        linha
      </RowState>,
    )

    const row = screen.getByText('linha')
    expect(row.id).toBe('row-1')
    expect(row.className).toContain('p-2')
  })
})
