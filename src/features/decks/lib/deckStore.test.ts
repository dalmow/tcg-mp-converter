import { describe, expect, it, vi } from 'vitest'
import { createDeckStore } from './deckStore'
import type { DeckStorage, PersistedData } from './storage'
import { EMPTY_DATA } from './storage'
import type { Deck, OwnedEntry } from '@/features/decks/types/deck'

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

  it('saveDeck writes owned entries in the same commit', () => {
    const { storage } = fakeStorage()
    const store = createDeckStore(storage)
    const listener = vi.fn()
    store.subscribe(listener)
    store.saveDeck(deck, { 'MEG-54': abra })
    expect(store.getSnapshot().owned['MEG-54']).toEqual(abra)
    expect(storage.save).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('keeps memory unchanged when saving fails', () => {
    const { storage } = fakeStorage()
    storage.save = vi.fn(() => {
      throw new Error('quota')
    })
    const store = createDeckStore(storage)
    expect(() => store.saveDeck(deck)).toThrow('quota')
    expect(store.getSnapshot()).toEqual(EMPTY_DATA)
  })

  it('keeps the snapshot and stays silent when an external change leaves data equal', () => {
    const fake = fakeStorage({ decks: [deck], owned: {} })
    const store = createDeckStore(fake.storage)
    const listener = vi.fn()
    store.subscribe(listener)
    const before = store.getSnapshot()
    fake.writeExternally({ decks: [deck], owned: {} })
    expect(store.getSnapshot()).toBe(before)
    expect(listener).not.toHaveBeenCalled()
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
    expect(store.deleteOwned('MEG-54')).toEqual({ ok: true })
    expect(store.getSnapshot().owned).toEqual({})
  })

  it('deleteOwned is refused while a deck uses the card', () => {
    const used: Deck = {
      ...deck,
      cards: [{ category: 'pokemon', key: 'MEG-54', displayName: 'Abra MEG 54', quantity: 4 }],
    }
    const { storage } = fakeStorage({ decks: [used], owned: { 'MEG-54': abra } })
    const store = createDeckStore(storage)
    expect(store.deleteOwned('MEG-54').ok).toBe(false)
    expect(store.getSnapshot().owned['MEG-54']).toEqual(abra)
    store.deleteDeck('d1')
    expect(store.getSnapshot().owned['MEG-54']).toEqual(abra)
    expect(store.deleteOwned('MEG-54')).toEqual({ ok: true })
  })

  it('shares owned quantity between a deck row save and a later maintenance edit', () => {
    const { storage } = fakeStorage()
    const store = createDeckStore(storage)
    store.saveDeck(deck, { 'MEG-54': abra })
    store.setOwned('MEG-54', { ...abra, quantity: 4 })
    expect(store.getSnapshot().owned['MEG-54'].quantity).toBe(4)
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
