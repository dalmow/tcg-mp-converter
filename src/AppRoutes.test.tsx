// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createHashRouter, createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
import { AppRoutes } from '@/AppRoutes'
import { deckPath, ROUTES } from '@/routes'

afterEach(cleanup)

function renderAt(path: string) {
  const router = createMemoryRouter([{ path: '*', element: <AppRoutes /> }], { initialEntries: [path] })
  return render(<RouterProvider router={router} />)
}

describe('AppRoutes', () => {
  it.each([ROUTES.decks, ROUTES.newDeck, deckPath('abc'), ROUTES.converter, ROUTES.maintenance])(
    'renders %s without a page title',
    (path) => {
      renderAt(path)
      expect(screen.queryByRole('heading', { level: 1 })).toBeNull()
    },
  )

  it('shows the navbar links on every route', () => {
    renderAt(ROUTES.converter)
    const nav = screen.getByRole('navigation')
    expect(nav.querySelector(`a[href="${ROUTES.decks}"]`)?.textContent).toBe('Decks')
    expect(nav.querySelector(`a[href="${ROUTES.converter}"]`)?.textContent).toBe('Conversor')
    expect(nav.querySelector(`a[href="${ROUTES.maintenance}"]`)?.textContent).toBe('Manutenção')
  })

  it('offers the backup items in the Dados dropdown', async () => {
    renderAt(ROUTES.decks)
    await userEvent.click(screen.getByRole('button', { name: 'Dados' }))
    expect(await screen.findByText('Exportar backup')).toBeTruthy()
    expect(screen.getByText('Importar backup')).toBeTruthy()
  })

  it('resolves hash URLs under HashRouter', () => {
    window.location.hash = `#${ROUTES.converter}`
    render(<RouterProvider router={createHashRouter([{ path: '*', element: <AppRoutes /> }])} />)
    expect(screen.getByLabelText('Decklist')).toBeTruthy()
  })
})
