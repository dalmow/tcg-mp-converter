// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { appRoutes } from './AppRoutes'
import { ROUTES } from '@/shared/lib/routes'

// Every page throws while rendering, so only the route's error element can answer.
const { renderFailure } = vi.hoisted(() => ({
  renderFailure: () => {
    throw new Error('render failed')
  },
}))
vi.mock('@/features/landing/components/LandingPage', () => ({ default: renderFailure }))
vi.mock('@/features/decks/components/DeckListPage', () => ({ default: renderFailure }))
vi.mock('@/features/decks/components/DeckEditorPage', () => ({ default: renderFailure }))
vi.mock('@/features/converter/components/ConverterPage', () => ({ default: renderFailure }))
vi.mock('@/features/maintenance/components/MaintenancePage', () => ({ default: renderFailure }))

beforeEach(() => {
  // React reports every caught render error to the console; the test asserts the UI instead.
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function renderAt(path: string) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] })
  return render(<RouterProvider router={router} />)
}

describe('route error boundaries', () => {
  it.each([[ROUTES.home], [ROUTES.decks], [ROUTES.newDeck], ['/decks/abc'], [ROUTES.converter], [ROUTES.maintenance]])(
    'shows the error state instead of a blank page on %s',
    async (path) => {
      renderAt(path)
      expect(await screen.findByRole('heading', { level: 1, name: 'Algo deu errado' })).toBeTruthy()
    },
  )

  it('links back to the home page from the error state', async () => {
    renderAt(ROUTES.maintenance)
    const back = await screen.findByRole('link', { name: 'Voltar ao início' })
    expect(back.getAttribute('href')).toBe(ROUTES.home)
  })

  it('titles the error state and keeps it out of the index', async () => {
    document.head.insertAdjacentHTML('beforeend', '<link rel="canonical" href="https://example.com/converter" />')
    renderAt(ROUTES.converter)
    await waitFor(() => expect(document.title).toBe('Algo deu errado | PTCG Tools'))
    expect(document.head.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex')
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull()
  })

  it('keeps the navigation so the user can leave the failed page', async () => {
    renderAt(ROUTES.decks)
    await screen.findByRole('heading', { level: 1, name: 'Algo deu errado' })
    expect(screen.getByRole('navigation', { name: 'Principal' })).toBeTruthy()
  })
})
