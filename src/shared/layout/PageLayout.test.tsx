// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { PageLayout } from './PageLayout'

afterEach(cleanup)

describe('PageLayout', () => {
  it('keeps the heading screen-reader only when there is no subtitle', () => {
    render(<PageLayout title="Conversor" />)
    expect(screen.getByRole('heading', { level: 1, name: 'Conversor' }).className).toContain('sr-only')
  })

  it('shows the DS title block with the subtitle under the h1', () => {
    render(<PageLayout title="Conversor" subtitle="Cole sua decklist." />)
    const heading = screen.getByRole('heading', { level: 1, name: 'Conversor' })
    expect(heading.className).not.toContain('sr-only')
    expect(heading.className).toContain('font-display')
    expect(heading.nextElementSibling?.textContent).toBe('Cole sua decklist.')
  })

  it('places actions beside the title block', () => {
    render(<PageLayout title="Meus decks" subtitle="Organize." actions={<button type="button">Novo deck</button>} />)
    const titleBlock = screen.getByRole('heading', { level: 1, name: 'Meus decks' }).parentElement
    expect(screen.getByRole('button', { name: 'Novo deck' }).parentElement).toBe(titleBlock?.parentElement)
  })

  it('renders children inside the main landmark', () => {
    render(
      <PageLayout title="Conversor">
        <p>conteúdo</p>
      </PageLayout>,
    )
    expect(screen.getByRole('main').textContent).toContain('conteúdo')
  })
})
