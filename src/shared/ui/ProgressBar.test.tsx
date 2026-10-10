// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { ProgressBar } from './ProgressBar'

afterEach(cleanup)

describe('ProgressBar', () => {
  it('exposes the progress to assistive tech, named by its label', () => {
    render(<ProgressBar label="Progresso do deck" value={15} max={60} suffix="cartas" />)

    const bar = screen.getByRole('progressbar', { name: 'Progresso do deck' })
    expect(bar.getAttribute('aria-valuenow')).toBe('15')
    expect(bar.getAttribute('aria-valuemin')).toBe('0')
    expect(bar.getAttribute('aria-valuemax')).toBe('60')
  })

  it('shows the literal count as a bold value plus a muted suffix', () => {
    render(<ProgressBar label="Progresso do deck" value={15} max={60} suffix="cartas" />)

    expect(screen.getByText('15').className).toContain('text-ink')
    const suffix = screen.getByText('/60 cartas')
    expect(suffix.className).toContain('text-ink-subtle')
    expect(suffix.className).toContain('font-semibold')
  })

  it('draws the default label as an uppercase eyebrow in the muted ink of the artboard', () => {
    render(<ProgressBar label="Progresso do deck" value={15} max={60} suffix="cartas" />)

    const label = screen.getByText('Progresso do deck')
    expect(label.className).toContain('uppercase')
    expect(label.className).toContain('text-ink-muted')
    // The artboard puts 10px between the label and the count.
    expect(label.parentElement?.className).toContain('gap-space-4')
  })

  it('omits the unit when no suffix is given', () => {
    render(<ProgressBar label="Progresso" value={2} max={4} />)

    expect(screen.getByText('/4')).toBeTruthy()
  })

  it('sizes the fill to the percentage complete', () => {
    render(<ProgressBar label="Progresso" value={15} max={60} />)

    const fill = screen.getByRole('progressbar').firstElementChild as HTMLElement
    expect(fill.style.width).toBe('25%')
  })

  it('clamps the fill between 0% and 100%', () => {
    render(
      <>
        <ProgressBar label="Acima" value={90} max={60} />
        <ProgressBar label="Abaixo" value={-3} max={60} />
        <ProgressBar label="Vazio" value={0} max={0} />
      </>,
    )

    const widths = screen.getAllByRole('progressbar').map((bar) => (bar.firstElementChild as HTMLElement).style.width)
    expect(widths).toEqual(['100%', '0%', '0%'])
  })

  it('draws a 6px track with a danger to primary gradient and no panel of its own', () => {
    render(<ProgressBar label="Progresso" value={1} max={2} />)

    const bar = screen.getByRole('progressbar')
    expect(bar.className).toContain('h-1.5')
    expect(bar.className).toContain('bg-border-faint')
    expect((bar.firstElementChild as HTMLElement).className).toContain('bg-linear-to-r from-danger to-primary')
    expect(bar.parentElement?.className).not.toMatch(/\b(bg-surface|border)\b/)
  })

  it('compact renders the bar with the count beside it and keeps the accessible name', () => {
    render(<ProgressBar compact label="Progresso do deck" value={45} max={60} />)

    expect(screen.getByRole('progressbar', { name: 'Progresso do deck' }).getAttribute('aria-valuenow')).toBe('45')
    expect(screen.getByText('45/60').className).toContain('text-caption')
    expect(screen.queryByText('Progresso do deck')).toBeNull()
  })
})
