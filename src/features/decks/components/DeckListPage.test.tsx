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
    cards.map((c) => [c.key, { displayName: c.displayName, category: c.category, quantity: c.quantity - missing }]),
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
  it('shows an empty state with the new deck action when there are no decks', () => {
    renderPage()
    expect(screen.getByText('Nenhum deck salvo ainda.')).toBeTruthy()
    const actions = screen.getAllByRole('link', { name: 'Novo deck' })
    expect(actions.map((action) => action.getAttribute('href'))).toEqual(['/decks/new', '/decks/new'])
    expect(screen.getByRole('heading', { level: 1, name: 'Meus decks' })).toBeTruthy()
  })

  it('groups the new deck action in the page header', () => {
    renderPage()
    const group = screen.getByRole('group', { name: 'Ações dos decks' })
    expect(within(group).getByRole('link', { name: 'Novo deck' }).getAttribute('href')).toBe('/decks/new')
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

  it('flags a deck missing owned cards by icon and count, without a missing-cards sentence', () => {
    const cards = [abra, fire]
    seed([{ id: 'd1', name: 'Mega Absol', cards }], ownedFor(cards, 1))
    renderPage()
    const link = screen.getByRole('link', { name: /Mega Absol/ })
    expect(within(link).getByRole('img', { name: 'Deck inválido' })).toBeTruthy()
    expect(within(link).getByText('60/60')).toBeTruthy()
    expect(within(link).queryByText(/faltam/)).toBeNull()
  })

  it('lists the new deck action before the deck links', () => {
    seed([
      { id: 'd1', name: 'A', cards: [] },
      { id: 'd2', name: 'B', cards: [] },
    ])
    renderPage()
    const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href'))
    expect(hrefs).toEqual(['/decks/new', '/decks/d1', '/decks/d2'])
  })
})
