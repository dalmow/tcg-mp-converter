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

  it.each([
    ['null', null],
    ['decks not an array', { decks: {}, owned }],
    ['owned is an array', { decks: [], owned: [] }],
  ])('falls back to empty data when the top level is %s', (_label, value) => {
    expect(recoverPersistedData(value)).toEqual(EMPTY_DATA)
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

  it('drops owned entries that do not match the schema and keeps the others', () => {
    const invalidEntry = { displayName: 'a', category: 'trainer', quantity: -1 }
    expect(recoverPersistedData({ decks: [], owned: { ...owned, bad: invalidEntry } }).owned).toEqual(owned)
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
