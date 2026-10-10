// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
import { AppRoutes } from './AppRoutes'
import { getDeckStore } from '@/features/decks'
import { deckPath, ROUTES } from '@/shared/lib/routes'

afterEach(cleanup)

function renderAt(path: string) {
  const router = createMemoryRouter([{ path: '*', element: <AppRoutes /> }], { initialEntries: [path] })
  return render(<RouterProvider router={router} />)
}

describe('AppRoutes', () => {
  it('renders / with the landing page hero heading', () => {
    renderAt(ROUTES.home)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Monte, converta e mantenha em ordem seus decks favoritos' }),
    ).toBeTruthy()
  })

  it('renders /decks with the visible title block heading "Meus decks"', () => {
    renderAt(ROUTES.decks)
    expect(screen.getByRole('heading', { level: 1, name: 'Meus decks' }).className).not.toContain('sr-only')
  })

  it('renders /converter with the visible title block heading "Conversor"', () => {
    renderAt(ROUTES.converter)
    expect(screen.getByRole('heading', { level: 1, name: 'Conversor' }).className).not.toContain('sr-only')
  })

  it('renders /maintenance with the visible title block heading "Manutenção"', () => {
    renderAt(ROUTES.maintenance)
    expect(screen.getByRole('heading', { level: 1, name: 'Manutenção' }).className).not.toContain('sr-only')
  })

  it.each([[ROUTES.newDeck, 'Novo deck']])('renders %s with sr-only heading "%s"', (path, heading) => {
    renderAt(path)
    expect(screen.getByRole('heading', { level: 1, name: heading }).className).toContain('sr-only')
  })

  it('shows the navbar links on every route', () => {
    renderAt(ROUTES.converter)
    const nav = screen.getByRole('navigation')
    expect(within(nav).getByRole('link', { name: 'Decks' }).getAttribute('href')).toBe(ROUTES.decks)
    expect(nav.querySelector(`a[href="${ROUTES.converter}"]`)?.textContent).toBe('Conversor')
    expect(nav.querySelector(`a[href="${ROUTES.maintenance}"]`)?.textContent).toBe('Manutenção')
  })

  it('keeps the skip link, navigation and main landmarks on the landing page', () => {
    renderAt(ROUTES.home)
    expect(screen.getByRole('link', { name: 'Pular para o conteúdo' })).toBeTruthy()
    expect(screen.getByRole('navigation', { name: 'Principal' })).toBeTruthy()
    expect(screen.getByRole('main')).toBeTruthy()
    expect(screen.getByRole('contentinfo')).toBeTruthy()
  })

  it('navigates from the landing call to action to the deck list', async () => {
    renderAt(ROUTES.home)
    await userEvent.click(screen.getByRole('link', { name: /Abrir meus decks/ }))
    expect(screen.getByRole('heading', { level: 1, name: 'Meus decks' })).toBeTruthy()
  })

  it('labels the navigation landmark', () => {
    renderAt(ROUTES.decks)
    expect(screen.getByRole('navigation', { name: 'Principal' })).toBeTruthy()
  })

  it('offers a skip link to the main content as the first tab stop', async () => {
    renderAt(ROUTES.decks)
    await userEvent.tab()
    const skip = screen.getByRole('link', { name: 'Pular para o conteúdo' })
    expect(document.activeElement).toBe(skip)
    const target = document.getElementById((skip.getAttribute('href') ?? '').slice(1))
    expect(target?.tagName).toBe('MAIN')
    expect(target?.getAttribute('tabindex')).toBe('-1')
  })

  it('renders the Dados menu inside the navigation landmark', async () => {
    renderAt(ROUTES.decks)
    await userEvent.click(screen.getByRole('button', { name: 'Dados' }))
    const menu = await screen.findByRole('menu')
    expect(screen.getByRole('navigation', { name: 'Principal' }).contains(menu)).toBe(true)
  })

  it('points the Dados trigger at an existing menu when open', async () => {
    renderAt(ROUTES.decks)
    const trigger = screen.getByRole('button', { name: 'Dados' })
    await userEvent.click(trigger)
    await screen.findByRole('menu')
    const controlled = trigger.getAttribute('aria-controls')
    expect(controlled).toBeTruthy()
    expect(document.getElementById(controlled ?? '')).toBeTruthy()
  })

  it('offers the backup items in the Dados dropdown', async () => {
    renderAt(ROUTES.decks)
    await userEvent.click(screen.getByRole('button', { name: 'Dados' }))
    expect(await screen.findByText('Exportar backup')).toBeTruthy()
    expect(screen.getByText('Importar backup')).toBeTruthy()
  })
})

function metaContent(name: string): string | null {
  return document.head.querySelector(`meta[name="${name}"]`)?.getAttribute('content') ?? null
}

describe('AppRoutes page metadata', () => {
  it.each([
    [ROUTES.home, 'PTCG Tools: decks, conversor e manutenção de cartas'],
    [ROUTES.decks, 'Meus decks | PTCG Tools'],
    [ROUTES.converter, 'Conversor | PTCG Tools'],
    [ROUTES.maintenance, 'Manutenção | PTCG Tools'],
    [ROUTES.newDeck, 'Novo deck | PTCG Tools'],
  ])('sets the title of %s to "%s"', (path, title) => {
    renderAt(path)
    expect(document.title).toBe(title)
  })

  it('gives the public routes unique descriptions and no noindex', () => {
    const descriptions = new Set<string | null>()
    for (const path of [ROUTES.home, ROUTES.decks, ROUTES.converter, ROUTES.maintenance]) {
      renderAt(path)
      expect(metaContent('robots')).toBeNull()
      descriptions.add(metaContent('description'))
      cleanup()
    }
    expect(descriptions.has(null)).toBe(false)
    expect(descriptions.size).toBe(4)
  })

  it('titles and marks noindex on the not-found deck route', () => {
    renderAt(deckPath('missing'))
    expect(document.title).toBe('Deck não encontrado | PTCG Tools')
    expect(metaContent('robots')).toBe('noindex')
  })

  it('puts the deck name in the title of the edit route and marks editing routes noindex', () => {
    getDeckStore().saveDeck({ id: 'abc', name: 'Alakazam', cards: [] })
    renderAt(deckPath('abc'))
    expect(document.title).toBe('Editando deck Alakazam | PTCG Tools')
    expect(metaContent('robots')).toBe('noindex')
    cleanup()
    renderAt(ROUTES.newDeck)
    expect(metaContent('robots')).toBe('noindex')
  })

  it('drops the prerendered canonical and og:url when navigating from a public page to an editing route', async () => {
    document.head.insertAdjacentHTML(
      'beforeend',
      '<link rel="canonical" href="https://example.com/" /><meta property="og:url" content="https://example.com/" />',
    )
    renderAt(ROUTES.decks)
    await userEvent.click(screen.getByRole('link', { name: 'Novo deck' }))
    expect(metaContent('robots')).toBe('noindex')
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull()
    expect(document.head.querySelector('meta[property="og:url"]')).toBeNull()
  })

  it('lifts noindex when navigating from an editing route to a public one', async () => {
    renderAt(ROUTES.newDeck)
    expect(metaContent('robots')).toBe('noindex')
    await userEvent.click(screen.getByRole('link', { name: 'Conversor' }))
    expect(document.title).toBe('Conversor | PTCG Tools')
    expect(metaContent('robots')).toBeNull()
  })
})
