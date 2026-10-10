import { describe, expect, it, vi } from 'vitest'
import { createDeckStorage, EMPTY_DATA, recoverPersistedData, STORAGE_KEY, type StringStorage } from './storage'
import type { Deck, DeckCard, OwnedMap } from '@/features/decks/types/deck'

function memoryBackend(initial?: string): StringStorage & { raw: () => string | null } {
  let value: string | null = initial ?? null
  return {
    getItem: () => value,
    setItem: (_key, next) => {
      value = next
    },
    raw: () => value,
  }
}

const card: DeckCard = { category: 'pokemon', key: 'MEG-54', displayName: 'Abra MEG 54', quantity: 4 }
const deck: Deck = { id: 'd1', name: 'Alakazam', cards: [card] }
const owned: OwnedMap = { 'MEG-54': { displayName: 'Abra MEG 54', category: 'pokemon', quantity: 2 } }

describe('recoverPersistedData', () => {
  it('keeps valid data unchanged', () => {
    expect(recoverPersistedData({ decks: [deck], owned })).toEqual({ decks: [deck], owned })
  })

  it('falls back to empty data when the stored value is not an object', () => {
    expect(recoverPersistedData(null)).toEqual(EMPTY_DATA)
  })

  it('keeps the valid owned entries when decks is not an array', () => {
    expect(recoverPersistedData({ decks: {}, owned })).toEqual({ decks: [], owned })
  })

  it('keeps the valid decks when owned is not an object', () => {
    expect(recoverPersistedData({ decks: [deck], owned: [] })).toEqual({ decks: [deck], owned: {} })
  })

  it('keeps the valid decks when the owned key is missing', () => {
    expect(recoverPersistedData({ decks: [deck] })).toEqual({ decks: [deck], owned: {} })
  })

  it.each([
    ['without id', { name: 'x', cards: [] }],
    ['with an unknown category', { ...deck, cards: [{ ...card, category: 'item' }] }],
    ['with a non-integer quantity', { ...deck, cards: [{ ...card, quantity: 1.5 }] }],
    ['with duplicate card keys', { ...deck, cards: [card, card] }],
    [
      'with more than 60 cards',
      {
        ...deck,
        cards: [
          { ...card, quantity: 40 },
          { ...card, key: 'MEG-2', quantity: 21 },
        ],
      },
    ],
  ])('drops a deck %s and keeps the valid decks', (_label, invalidDeck) => {
    expect(recoverPersistedData({ decks: [invalidDeck, deck], owned }).decks).toEqual([deck])
  })

  it('keeps the first of two decks that share an id', () => {
    const renamed = { ...deck, name: 'Outro' }
    expect(recoverPersistedData({ decks: [deck, renamed], owned }).decks).toEqual([deck])
  })

  it('drops owned entries that do not match the schema and keeps the others', () => {
    const invalidEntry = { displayName: 'a', category: 'trainer', quantity: -1 }
    expect(recoverPersistedData({ decks: [], owned: { ...owned, bad: invalidEntry } }).owned).toEqual(owned)
  })

  it('keeps owned quantities above the safe integer range, as the forms can save them', () => {
    const huge: OwnedMap = { fogo: { displayName: 'Energia Fogo', category: 'energy', quantity: 1e20 } }
    expect(recoverPersistedData({ decks: [], owned: huge }).owned).toEqual(huge)
  })

  it('strips unknown fields from a valid deck', () => {
    expect(recoverPersistedData({ decks: [{ ...deck, color: 'red' }], owned: {} }).decks).toEqual([deck])
  })
})

describe('createDeckStorage', () => {
  it('loads empty data when nothing is stored', () => {
    expect(createDeckStorage(memoryBackend()).load()).toEqual(EMPTY_DATA)
  })

  it('round-trips data under the versioned key', () => {
    const getItem = vi.fn<StringStorage['getItem']>(() => null)
    const setItem = vi.fn<StringStorage['setItem']>()
    const storage = createDeckStorage({ getItem, setItem })
    storage.save({ decks: [deck], owned })
    expect(setItem).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify({ decks: [deck], owned }))
    storage.load()
    expect(getItem).toHaveBeenCalledWith(STORAGE_KEY)
  })

  it('loads what it saved', () => {
    const storage = createDeckStorage(memoryBackend())
    storage.save({ decks: [deck], owned })
    expect(storage.load()).toEqual({ decks: [deck], owned })
  })

  it.each(['not json', '{"decks":1}'])('falls back to empty data for corrupt value %s', (raw) => {
    expect(createDeckStorage(memoryBackend(raw)).load()).toEqual(EMPTY_DATA)
  })

  it('keeps the valid decks of a partly corrupt stored value', () => {
    const invalidDeck = { ...deck, id: 'd2', cards: [card, card] }
    const storage = createDeckStorage(memoryBackend(JSON.stringify({ decks: [deck, invalidDeck], owned })))
    expect(storage.load()).toEqual({ decks: [deck], owned })
  })

  it('forwards external changes to subscribers and stops after unsubscribe', () => {
    let emit: () => void = () => {}
    const unlisten = vi.fn()
    const storage = createDeckStorage(memoryBackend(), (onExternalChange) => {
      emit = onExternalChange
      return unlisten
    })
    const listener = vi.fn()
    const unsubscribe = storage.subscribe(listener)
    emit()
    expect(listener).toHaveBeenCalledTimes(1)
    unsubscribe()
    expect(unlisten).toHaveBeenCalled()
  })
})
