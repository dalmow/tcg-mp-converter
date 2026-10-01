import { describe, expect, it, vi } from 'vitest'
import {
  createDeckStorage,
  EMPTY_DATA,
  parsePersistedData,
  STORAGE_KEY,
  type StringStorage,
} from './storage'
import type { Deck, OwnedMap } from './types'

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

const deck: Deck = {
  id: 'd1',
  name: 'Alakazam',
  cards: [{ category: 'pokemon', key: 'MEG-54', displayName: 'Abra MEG 54', quantity: 4 }],
}
const owned: OwnedMap = { 'MEG-54': { displayName: 'Abra MEG 54', category: 'pokemon', quantity: 2 } }

describe('parsePersistedData', () => {
  it('accepts a valid payload', () => {
    expect(parsePersistedData({ decks: [deck], owned })).toEqual({ ok: true, data: { decks: [deck], owned } })
  })

  it.each([
    ['null', null],
    ['decks not an array', { decks: {}, owned }],
    ['owned is an array', { decks: [], owned: [] }],
    ['deck without id', { decks: [{ name: 'x', cards: [] }], owned }],
    ['unknown category', { decks: [{ ...deck, cards: [{ ...deck.cards[0], category: 'item' }] }], owned }],
    ['non-integer quantity', { decks: [{ ...deck, cards: [{ ...deck.cards[0], quantity: 1.5 }] }], owned }],
    ['negative owned', { decks: [], owned: { a: { displayName: 'a', category: 'trainer', quantity: -1 } } }],
  ])('rejects %s', (_label, value) => {
    expect(parsePersistedData(value).ok).toBe(false)
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
