import { describe, expect, it } from 'vitest'
import type { MaintenanceEntry } from './maintenance'
import { deriveMaintenance, isSatisfied, parseOwnedQuantity, toOwnedEntry } from './maintenance'
import type { Deck, DeckCard, OwnedMap } from '@/features/decks'

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
    expect(rows.find((entry) => entry.key === 'MEG-54')).toMatchObject({ needed: 4, decks: ['A', 'B'] })
    expect(rows.find((entry) => entry.key === 'ordem da chefia')).toMatchObject({ needed: 2, decks: ['B'] })
  })

  it('keeps owned cards that left every deck with needed 0 and no decks', () => {
    const owned: OwnedMap = { 'MEG-54': { displayName: 'Abra MEG 54', category: 'pokemon', quantity: 3 } }
    const rows = deriveMaintenance([{ id: '1', name: 'A', cards: [boss(1)] }], owned)
    expect(rows.find((entry) => entry.key === 'MEG-54')).toEqual({
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

const entry: MaintenanceEntry = {
  key: 'MEG-54',
  displayName: 'Abra MEG 54',
  category: 'pokemon',
  needed: 3,
  decks: ['A'],
}

describe('isSatisfied', () => {
  it('is true when owned reaches needed', () => {
    expect(isSatisfied(entry, 2)).toBe(false)
    expect(isSatisfied(entry, 3)).toBe(true)
    expect(isSatisfied(entry, 4)).toBe(true)
  })
})

describe('toOwnedEntry', () => {
  it('copies name and category with the given quantity', () => {
    expect(toOwnedEntry(entry, 2)).toEqual({ displayName: 'Abra MEG 54', category: 'pokemon', quantity: 2 })
  })
})

describe('parseOwnedQuantity', () => {
  it('parses non-negative integers, trimming spaces', () => {
    expect(parseOwnedQuantity('3')).toBe(3)
    expect(parseOwnedQuantity(' 0 ')).toBe(0)
  })
  it('treats empty input as 0', () => {
    expect(parseOwnedQuantity('')).toBe(0)
    expect(parseOwnedQuantity('   ')).toBe(0)
  })
  it('rejects negative, decimal and non-numeric input', () => {
    for (const text of ['-1', '1.5', '1e2', 'abc']) expect(parseOwnedQuantity(text)).toBeNull()
  })
})
