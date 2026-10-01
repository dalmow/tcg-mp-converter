import { describe, expect, it, vi } from 'vitest'
import { createDeckStore } from './deckStore'
import type { DeckStorage, PersistedData } from './storage'
import { EMPTY_DATA } from './storage'
import type { Deck, OwnedEntry } from './types'

function fakeStorage(initial: PersistedData = EMPTY_DATA) {
  let data = initial
  let external: (() => void) | null = null
  const storage: DeckStorage = {
    load: () => data,
    save: vi.fn((next: PersistedData) => {
      data = next
    }),
    subscribe: (listener) => {
      external = listener
      return () => {
        external = null
      }
    },
  }
  return {
    storage,
    writeExternally(next: PersistedData) {
      data = next
      external?.()
    },
    isListening: () => external !== null,
  }
}

const deck: Deck = { id: 'd1', name: 'Alakazam', cards: [] }
const abra: OwnedEntry = { displayName: 'Abra MEG 54', category: 'pokemon', quantity: 2 }

describe('createDeckStore', () => {
  it('starts from persisted data', () => {
    const { storage } = fakeStorage({ decks: [deck], owned: {} })
    expect(createDeckStore(storage).getSnapshot().decks).toEqual([deck])
  })

  it('saveDeck inserts a new deck and persists', () => {
    const { storage } = fakeStorage()
    const store = createDeckStore(storage)
    store.saveDeck(deck)
    expect(store.getSnapshot().decks).toEqual([deck])
    expect(storage.save).toHaveBeenCalledWith({ decks: [deck], owned: {} })
  })

  it('saveDeck replaces an existing deck with the same id, keeping order', () => {
    const other: Deck = { id: 'd2', name: 'Other', cards: [] }
    const { storage } = fakeStorage({ decks: [deck, other], owned: {} })
    const store = createDeckStore(storage)
    store.saveDeck({ ...deck, name: 'Renamed' })
    expect(store.getSnapshot().decks.map((d) => d.name)).toEqual(['Renamed', 'Other'])
  })

  it('deleteDeck removes by id', () => {
    const { storage } = fakeStorage({ decks: [deck], owned: {} })
    const store = createDeckStore(storage)
    store.deleteDeck('d1')
    expect(store.getSnapshot().decks).toEqual([])
  })

  it('setOwned writes and overwrites an entry; deleteOwned removes it', () => {
    const { storage } = fakeStorage()
    const store = createDeckStore(storage)
    store.setOwned('MEG-54', abra)
    store.setOwned('MEG-54', { ...abra, quantity: 3 })
    expect(store.getSnapshot().owned['MEG-54'].quantity).toBe(3)
    store.deleteOwned('MEG-54')
    expect(store.getSnapshot().owned).toEqual({})
  })

  it('replaceAll swaps the whole data', () => {
    const { storage } = fakeStorage({ decks: [deck], owned: {} })
    const store = createDeckStore(storage)
    store.replaceAll({ decks: [], owned: { 'MEG-54': abra } })
    expect(store.getSnapshot()).toEqual({ decks: [], owned: { 'MEG-54': abra } })
  })

  it('returns a stable snapshot until data changes', () => {
    const { storage } = fakeStorage()
    const store = createDeckStore(storage)
    const first = store.getSnapshot()
    expect(store.getSnapshot()).toBe(first)
    store.saveDeck(deck)
    expect(store.getSnapshot()).not.toBe(first)
  })

  it('does not mutate the previous snapshot', () => {
    const { storage } = fakeStorage()
    const store = createDeckStore(storage)
    const before = store.getSnapshot()
    store.saveDeck(deck)
    store.setOwned('MEG-54', abra)
    expect(before).toEqual(EMPTY_DATA)
  })

  it('notifies subscribers on local changes', () => {
    const { storage } = fakeStorage()
    const store = createDeckStore(storage)
    const listener = vi.fn()
    store.subscribe(listener)
    store.saveDeck(deck)
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('reloads and notifies when storage changes externally (other tab)', () => {
    const fake = fakeStorage()
    const store = createDeckStore(fake.storage)
    const listener = vi.fn()
    store.subscribe(listener)
    fake.writeExternally({ decks: [deck], owned: {} })
    expect(store.getSnapshot().decks).toEqual([deck])
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('listens to storage only while it has subscribers', () => {
    const fake = fakeStorage()
    const store = createDeckStore(fake.storage)
    const unsubscribeA = store.subscribe(() => {})
    const unsubscribeB = store.subscribe(() => {})
    expect(fake.isListening()).toBe(true)
    unsubscribeA()
    expect(fake.isListening()).toBe(true)
    unsubscribeB()
    expect(fake.isListening()).toBe(false)
  })
})
