// @vitest-environment jsdom
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
import { appRoutes } from './AppRoutes'
import { getDeckStore } from '@/features/decks'
import { PAGE_META } from '@/shared/lib/pageMeta'
import { deckPath, ROUTES } from '@/shared/lib/routes'

afterEach(cleanup)

function renderAt(path: string) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] })
  return render(<RouterProvider router={router} />)
}

describe('AppRoutes', () => {
  it('renders / with the landing page hero heading', async () => {
    renderAt(ROUTES.home)
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Monte, converta e mantenha em ordem seus decks favoritos',
      }),
    ).toBeTruthy()
  })

  it('shows a loading state while the page chunk loads', () => {
    renderAt(ROUTES.decks)
    expect(screen.getByRole('status').textContent).toBe('Carregando…')
  })

  it('renders /decks with the visible title block heading "Meus decks"', async () => {
    renderAt(ROUTES.decks)
    expect((await screen.findByRole('heading', { level: 1, name: 'Meus decks' })).className).not.toContain('sr-only')
  })

  it('renders /converter with the visible title block heading "Conversor"', async () => {
    renderAt(ROUTES.converter)
    expect((await screen.findByRole('heading', { level: 1, name: 'Conversor' })).className).not.toContain('sr-only')
  })

  it('renders /maintenance with the visible title block heading "Manutenção"', async () => {
    renderAt(ROUTES.maintenance)
    expect((await screen.findByRole('heading', { level: 1, name: 'Manutenção' })).className).not.toContain('sr-only')
  })

  it.each([[ROUTES.newDeck, 'Novo deck']])('renders %s with sr-only heading "%s"', async (path, heading) => {
    renderAt(path)
    expect((await screen.findByRole('heading', { level: 1, name: heading })).className).toContain('sr-only')
  })

  it('shows the navbar links on every route', () => {
    renderAt(ROUTES.converter)
    const nav = screen.getByRole('navigation')
    expect(within(nav).getByRole('link', { name: 'Decks' }).getAttribute('href')).toBe(ROUTES.decks)
    expect(nav.querySelector(`a[href="${ROUTES.converter}"]`)?.textContent).toBe('Conversor')
    expect(nav.querySelector(`a[href="${ROUTES.maintenance}"]`)?.textContent).toBe('Manutenção')
  })

  it('keeps the skip link, navigation and main landmarks on the landing page', async () => {
    renderAt(ROUTES.home)
    expect(screen.getByRole('link', { name: 'Pular para o conteúdo' })).toBeTruthy()
    expect(screen.getByRole('navigation', { name: 'Principal' })).toBeTruthy()
    expect(await screen.findByRole('main')).toBeTruthy()
    expect(screen.getByRole('contentinfo')).toBeTruthy()
  })

  it('navigates from the landing call to action to the deck list', async () => {
    renderAt(ROUTES.home)
    await userEvent.click(await screen.findByRole('link', { name: /Abrir meus decks/ }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Meus decks' })).toBeTruthy()
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

// Metadata is applied by each page once its chunk has loaded, so every check waits for the page's title first.
describe('AppRoutes page metadata', () => {
  it.each([
    [ROUTES.home, 'PTCG Tools: decks, conversor e manutenção de cartas'],
    [ROUTES.decks, 'Meus decks | PTCG Tools'],
    [ROUTES.converter, 'Conversor | PTCG Tools'],
    [ROUTES.maintenance, 'Manutenção | PTCG Tools'],
    [ROUTES.newDeck, 'Novo deck | PTCG Tools'],
  ])('sets the title of %s to "%s"', async (path, title) => {
    renderAt(path)
    await waitFor(() => expect(document.title).toBe(title))
  })

  it('gives the public routes unique descriptions and no noindex', async () => {
    const descriptions = new Set<string | null>()
    const publicRoutes = [
      [ROUTES.home, PAGE_META.home],
      [ROUTES.decks, PAGE_META.decks],
      [ROUTES.converter, PAGE_META.converter],
      [ROUTES.maintenance, PAGE_META.maintenance],
    ] as const
    for (const [path, page] of publicRoutes) {
      renderAt(path)
      await waitFor(() => expect(document.title).toBe(page.title))
      expect(metaContent('robots')).toBeNull()
      descriptions.add(metaContent('description'))
      cleanup()
    }
    expect(descriptions.has(null)).toBe(false)
    expect(descriptions.size).toBe(4)
  })

  it('titles and marks noindex on the not-found deck route', async () => {
    renderAt(deckPath('missing'))
    await waitFor(() => expect(document.title).toBe('Deck não encontrado | PTCG Tools'))
    expect(metaContent('robots')).toBe('noindex')
  })

  it('puts the deck name in the title of the edit route and marks editing routes noindex', async () => {
    getDeckStore().saveDeck({ id: 'abc', name: 'Alakazam', cards: [] })
    renderAt(deckPath('abc'))
    await waitFor(() => expect(document.title).toBe('Editando deck Alakazam | PTCG Tools'))
    expect(metaContent('robots')).toBe('noindex')
    cleanup()
    renderAt(ROUTES.newDeck)
    await waitFor(() => expect(document.title).toBe('Novo deck | PTCG Tools'))
    expect(metaContent('robots')).toBe('noindex')
  })

  it('drops the prerendered canonical and og:url when navigating from a public page to an editing route', async () => {
    document.head.insertAdjacentHTML(
      'beforeend',
      '<link rel="canonical" href="https://example.com/" /><meta property="og:url" content="https://example.com/" />',
    )
    renderAt(ROUTES.decks)
    await userEvent.click(await screen.findByRole('link', { name: 'Novo deck' }))
    await waitFor(() => expect(document.title).toBe('Novo deck | PTCG Tools'))
    expect(metaContent('robots')).toBe('noindex')
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull()
    expect(document.head.querySelector('meta[property="og:url"]')).toBeNull()
  })

  it('lifts noindex when navigating from an editing route to a public one', async () => {
    renderAt(ROUTES.newDeck)
    await waitFor(() => expect(document.title).toBe('Novo deck | PTCG Tools'))
    expect(metaContent('robots')).toBe('noindex')
    await userEvent.click(screen.getByRole('link', { name: 'Conversor' }))
    await waitFor(() => expect(document.title).toBe('Conversor | PTCG Tools'))
    expect(metaContent('robots')).toBeNull()
  })
})
