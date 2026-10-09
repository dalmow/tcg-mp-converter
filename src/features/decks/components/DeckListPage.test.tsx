// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { getDeckStore } from '@/features/decks/lib/deckStore'
import type { Deck, DeckCard, OwnedMap } from '@/features/decks/types/deck'
import DeckListPage from './DeckListPage'

const abra: DeckCard = { category: 'pokemon', key: 'MEG-54', displayName: 'Abra MEG 54', quantity: 4 }
const fire: DeckCard = { category: 'energy', key: 'energy:fogo', displayName: 'Energia Fogo', quantity: 56 }

function ownedFor(cards: DeckCard[], missing = 0): OwnedMap {
  return Object.fromEntries(
    cards.map((c) => [
      c.key,
      { displayName: c.displayName, category: c.category, quantity: c.quantity - missing },
    ]),
  )
}

function seed(decks: Deck[], owned: OwnedMap = {}) {
  getDeckStore().replaceAll({ decks, owned })
}

function renderPage() {
  return render(
    <MemoryRouter>
      <DeckListPage />
    </MemoryRouter>,
  )
}

beforeEach(() => seed([]))
afterEach(cleanup)

describe('DeckListPage', () => {
  it('shows only the new deck block when there are no decks', () => {
    renderPage()
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(1)
    expect(links[0].getAttribute('href')).toBe('/decks/new')
    expect(screen.getByRole('heading', { level: 1, name: 'Meus decks' })).toBeTruthy()
  })

  it('shows a valid deck with a check, count and link to the editor', () => {
    const cards = [abra, fire]
    seed([{ id: 'd1', name: 'Alakazam', cards }], ownedFor(cards))
    renderPage()
    const link = screen.getByRole('link', { name: /Alakazam/ })
    expect(link.getAttribute('href')).toBe('/decks/d1')
    expect(within(link).getByText('60/60')).toBeTruthy()
    expect(within(link).getByRole('img', { name: 'Deck válido' })).toBeTruthy()
    expect(within(link).queryByText(/falta/)).toBeNull()
  })

  it('shows an invalid deck with an exclamation and no missing message', () => {
    seed([{ id: 'd1', name: 'Draft', cards: [abra] }], ownedFor([abra]))
    renderPage()
    const link = screen.getByRole('link', { name: /Draft/ })
    expect(within(link).getByRole('img', { name: 'Deck inválido' })).toBeTruthy()
    expect(within(link).getByText('4/60')).toBeTruthy()
    expect(within(link).queryByText(/falta/)).toBeNull()
  })

  it('shows how many cards are missing when only the owned rule fails', () => {
    const cards = [abra, fire]
    seed([{ id: 'd1', name: 'Mega Absol', cards }], ownedFor(cards, 1))
    renderPage()
    const link = screen.getByRole('link', { name: /Mega Absol/ })
    expect(within(link).getByRole('img', { name: 'Deck inválido' })).toBeTruthy()
    expect(within(link).getByText('faltam 2 cartas')).toBeTruthy()
  })

  it('renders the new deck block after all decks', () => {
    seed([
      { id: 'd1', name: 'A', cards: [] },
      { id: 'd2', name: 'B', cards: [] },
    ])
    renderPage()
    const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href'))
    expect(hrefs).toEqual(['/decks/d1', '/decks/d2', '/decks/new'])
  })
})
