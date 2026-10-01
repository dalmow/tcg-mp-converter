import { useSyncExternalStore } from 'react'
import { createDeckStorage, EMPTY_DATA, type DeckStorage, type PersistedData } from './storage'
import type { Deck, OwnedEntry, OwnedMap, Result } from './types'

export function createDeckStore(storage: DeckStorage) {
  let snapshot = storage.load()
  const listeners = new Set<() => void>()
  let stopListeningToStorage: (() => void) | null = null

  function notify() {
    listeners.forEach((listener) => listener())
  }

  /** Saves first, so a failing write (quota, private mode) leaves memory and storage in sync. */
  function commit(next: PersistedData) {
    storage.save(next)
    snapshot = next
    notify()
  }

  /** Keeps the current snapshot when the stored data is unchanged, so React does not re-render. */
  function reload(): boolean {
    const loaded = storage.load()
    if (JSON.stringify(loaded) === JSON.stringify(snapshot)) return false
    snapshot = loaded
    return true
  }

  function reloadFromStorage() {
    if (reload()) notify()
  }

  return {
    getSnapshot: () => snapshot,

    subscribe(listener: () => void) {
      if (listeners.size === 0) {
        // Data may have changed in another tab while nobody was subscribed.
        reload()
        stopListeningToStorage = storage.subscribe(reloadFromStorage)
      }
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
        if (listeners.size === 0) {
          stopListeningToStorage?.()
          stopListeningToStorage = null
        }
      }
    },

    /**
     * Inserts the deck, or replaces the one with the same id in place. `owned` entries are written
     * in the same commit, because saving a deck row also persists its owned quantity.
     */
    saveDeck(deck: Deck, owned: OwnedMap = {}) {
      const exists = snapshot.decks.some((d) => d.id === deck.id)
      const decks = exists
        ? snapshot.decks.map((d) => (d.id === deck.id ? deck : d))
        : [...snapshot.decks, deck]
      commit({ decks, owned: { ...snapshot.owned, ...owned } })
    },

    deleteDeck(id: string) {
      commit({ ...snapshot, decks: snapshot.decks.filter((d) => d.id !== id) })
    },

    setOwned(key: string, entry: OwnedEntry) {
      commit({ ...snapshot, owned: { ...snapshot.owned, [key]: entry } })
    },

    /** Removes an owned card, unless a deck still uses it. */
    deleteOwned(key: string): Result {
      if (snapshot.decks.some((deck) => deck.cards.some((card) => card.key === key))) {
        return { ok: false, error: 'Carta em uso em um deck, não pode ser excluída' }
      }
      const { [key]: _removed, ...owned } = snapshot.owned
      commit({ ...snapshot, owned })
      return { ok: true }
    },

    /** Replaces everything, used by backup import. */
    replaceAll(data: PersistedData) {
      commit(data)
    },
  }
}

export type DeckStore = ReturnType<typeof createDeckStore>

let defaultStore: DeckStore | undefined

/** App-wide store backed by `localStorage`, created on first use. */
export function getDeckStore(): DeckStore {
  defaultStore ??= createDeckStore(createDeckStorage(localStorage))
  return defaultStore
}

const subscribe: DeckStore['subscribe'] = (listener) => getDeckStore().subscribe(listener)
const getSnapshot = () => getDeckStore().getSnapshot()
const getServerSnapshot = () => EMPTY_DATA

/** The server snapshot is empty because prerendering has no `localStorage`; hydration then swaps in the stored data. */
export function useDeckData(): PersistedData {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
