// @vitest-environment jsdom
import { act, cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Navbar } from './Navbar'
import { ToastProvider } from '@/shared/ui/Toast'
import { buildBackup } from '@/features/backup'
import { ROUTES } from '@/shared/lib/routes'

afterEach(cleanup)

function openSheetOf(toggle: HTMLElement): HTMLElement {
  const sheet = document.getElementById(toggle.getAttribute('aria-controls') ?? '')
  if (!sheet) throw new Error('navigation sheet is not mounted')
  return sheet
}

function renderNavbar(path: string = ROUTES.converter) {
  const router = createMemoryRouter(
    [
      {
        path: '*',
        element: (
          <ToastProvider>
            <Navbar />
          </ToastProvider>
        ),
      },
    ],
    { initialEntries: [path] },
  )
  return render(<RouterProvider router={router} />)
}

describe('Navbar', () => {
  it('shows the logomark and wordmark linking to the home route', () => {
    renderNavbar()
    const home = screen.getByRole('link', { name: 'PTCG Tools' })
    expect(home.getAttribute('href')).toBe(ROUTES.home)
    expect(home.querySelector('svg')).not.toBeNull()
  })

  it('marks only the current route link as the current page', () => {
    renderNavbar(ROUTES.converter)
    const nav = screen.getByRole('navigation', { name: 'Principal' })
    const current = nav.querySelectorAll('[aria-current="page"]')
    expect(current).toHaveLength(1)
    expect(current[0].textContent).toBe('Conversor')
  })

  it('gives every nav link an icon', () => {
    renderNavbar()
    const nav = screen.getByRole('navigation', { name: 'Principal' })
    for (const label of ['Decks', 'Conversor', 'Manutenção']) {
      const link = within(nav).getAllByRole('link', { name: label })[0]
      expect(link.querySelector('svg[aria-hidden="true"]')).not.toBeNull()
    }
  })

  describe('mobile sheet', () => {
    it('starts closed behind a labelled hamburger button', () => {
      renderNavbar()
      const toggle = screen.getByRole('button', { name: 'Abrir menu de navegação' })
      expect(toggle.getAttribute('aria-expanded')).toBe('false')
      expect(screen.getAllByRole('link', { name: 'Manutenção' })).toHaveLength(1)
    })

    it('opens a sheet with stacked nav rows and the data actions', async () => {
      renderNavbar()
      await userEvent.click(screen.getByRole('button', { name: 'Abrir menu de navegação' }))
      const toggle = screen.getByRole('button', { name: 'Fechar menu de navegação' })
      expect(toggle.getAttribute('aria-expanded')).toBe('true')
      const sheet = openSheetOf(toggle)
      expect(within(sheet).getByRole('link', { name: 'Decks' })).toBeTruthy()
      expect(within(sheet).getByRole('link', { name: 'Conversor' })).toBeTruthy()
      expect(within(sheet).getByRole('link', { name: 'Manutenção' })).toBeTruthy()
      expect(within(sheet).getByRole('button', { name: 'Exportar backup' })).toBeTruthy()
      expect(within(sheet).getByRole('button', { name: 'Importar backup' })).toBeTruthy()
    })

    it('keeps the sheet inside the navigation landmark', async () => {
      renderNavbar()
      await userEvent.click(screen.getByRole('button', { name: 'Abrir menu de navegação' }))
      const toggle = screen.getByRole('button', { name: 'Fechar menu de navegação' })
      const sheet = openSheetOf(toggle)
      expect(screen.getByRole('navigation', { name: 'Principal' }).contains(sheet)).toBe(true)
    })

    it('closes when a nav row is chosen', async () => {
      renderNavbar()
      await userEvent.click(screen.getByRole('button', { name: 'Abrir menu de navegação' }))
      const toggle = screen.getByRole('button', { name: 'Fechar menu de navegação' })
      const sheet = openSheetOf(toggle)
      await userEvent.click(within(sheet).getByRole('link', { name: 'Decks' }))
      expect(screen.getByRole('button', { name: 'Abrir menu de navegação' })).toBeTruthy()
    })

    it('still confirms an import started from the sheet after the sheet closes', async () => {
      renderNavbar()
      await userEvent.click(screen.getByRole('button', { name: 'Abrir menu de navegação' }))
      await userEvent.click(screen.getByRole('button', { name: 'Importar backup' }))
      expect(screen.getByRole('button', { name: 'Abrir menu de navegação' })).toBeTruthy()
      const file = new File([JSON.stringify(buildBackup({ decks: [], owned: {} }))], 'b.json', {
        type: 'application/json',
      })
      await userEvent.upload(screen.getByLabelText('Arquivo de backup'), file)
      expect(await screen.findByRole('alertdialog')).toBeTruthy()
    })

    it('closes when the current route row is chosen again', async () => {
      renderNavbar(ROUTES.converter)
      await userEvent.click(screen.getByRole('button', { name: 'Abrir menu de navegação' }))
      const toggle = screen.getByRole('button', { name: 'Fechar menu de navegação' })
      const sheet = openSheetOf(toggle)
      await userEvent.click(within(sheet).getByRole('link', { name: 'Conversor' }))
      expect(screen.getByRole('button', { name: 'Abrir menu de navegação' })).toBeTruthy()
    })

    it('closes when the viewport grows past the nav breakpoint', async () => {
      let listener: (() => void) | undefined
      const query = {
        matches: false,
        addEventListener: (_: string, fn: () => void) => (listener = fn),
        removeEventListener: () => {},
      }
      vi.stubGlobal('matchMedia', () => query)
      renderNavbar()
      await userEvent.click(screen.getByRole('button', { name: 'Abrir menu de navegação' }))
      query.matches = true
      act(() => listener?.())
      expect(screen.getByRole('button', { name: 'Abrir menu de navegação' })).toBeTruthy()
      vi.unstubAllGlobals()
    })

    it('closes on Escape and returns focus to the hamburger button', async () => {
      renderNavbar()
      await userEvent.click(screen.getByRole('button', { name: 'Abrir menu de navegação' }))
      await userEvent.keyboard('{Escape}')
      const toggle = screen.getByRole('button', { name: 'Abrir menu de navegação' })
      expect(document.activeElement).toBe(toggle)
    })
  })
})
