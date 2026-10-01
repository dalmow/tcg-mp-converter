import { describe, expect, it } from 'vitest'
import { deriveMaintenance } from './maintenance'
import type { Deck, DeckCard, OwnedMap } from './types'

const abra = (quantity: number): DeckCard => ({
  category: 'pokemon',
  key: 'MEG-54',
  displayName: 'Abra MEG 54',
  quantity,
})
const boss = (quantity: number): DeckCard => ({
  category: 'trainer',
  key: 'ordem da chefia',
  displayName: 'Ordem da Chefia',
  quantity,
})

describe('deriveMaintenance', () => {
  it('needs the max quantity across decks, not the sum', () => {
    const decks: Deck[] = [
      { id: '1', name: 'A', cards: [abra(4)] },
      { id: '2', name: 'B', cards: [abra(4), boss(2)] },
    ]
    const rows = deriveMaintenance(decks, {})
    expect(rows.find((r) => r.key === 'MEG-54')).toMatchObject({ needed: 4, decks: ['A', 'B'] })
    expect(rows.find((r) => r.key === 'ordem da chefia')).toMatchObject({ needed: 2, decks: ['B'] })
  })

  it('keeps owned cards that left every deck with needed 0 and no decks', () => {
    const owned: OwnedMap = { 'MEG-54': { displayName: 'Abra MEG 54', category: 'pokemon', quantity: 3 } }
    const rows = deriveMaintenance([{ id: '1', name: 'A', cards: [boss(1)] }], owned)
    expect(rows.find((r) => r.key === 'MEG-54')).toEqual({
      key: 'MEG-54',
      displayName: 'Abra MEG 54',
      category: 'pokemon',
      needed: 0,
      decks: [],
    })
  })

  it('lists a card once per deck even with several decks sharing the name', () => {
    const decks: Deck[] = [
      { id: '1', name: 'A', cards: [abra(1)] },
      { id: '2', name: 'A', cards: [abra(2)] },
    ]
    expect(deriveMaintenance(decks, {})[0]).toMatchObject({ needed: 2, decks: ['A', 'A'] })
  })
})
