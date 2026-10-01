// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
import { AppRoutes } from '@/AppRoutes'

afterEach(cleanup)

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  )
}

describe('AppRoutes', () => {
  it.each([
    ['/', 'Decks'],
    ['/decks/new', 'Novo deck'],
    ['/decks/abc', 'Deck'],
    ['/converter', 'PTCG Marketplace Converter'],
    ['/maintenance', 'Manutenção'],
  ])('renders %s with heading "%s"', (path, heading) => {
    renderAt(path)
    expect(screen.getByRole('heading', { level: 1, name: heading })).toBeTruthy()
  })

  it('shows the navbar links on every route', () => {
    renderAt('/converter')
    const nav = screen.getByRole('navigation')
    expect(nav.querySelector('a[href="/"]')?.textContent).toBe('Decks')
    expect(nav.querySelector('a[href="/converter"]')?.textContent).toBe('Conversor')
    expect(nav.querySelector('a[href="/maintenance"]')?.textContent).toBe('Manutenção')
  })

  it('offers the backup items in the Dados dropdown', async () => {
    renderAt('/')
    await userEvent.click(screen.getByRole('button', { name: 'Dados' }))
    expect(await screen.findByText('Exportar backup')).toBeTruthy()
    expect(screen.getByText('Importar backup')).toBeTruthy()
  })
})
