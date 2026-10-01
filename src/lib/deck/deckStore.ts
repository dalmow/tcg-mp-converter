import { useSyncExternalStore } from 'react'
import { createDeckStorage, type DeckStorage, type PersistedData } from './storage'
import type { Deck, OwnedEntry } from './types'

export function createDeckStore(storage: DeckStorage) {
  let snapshot = storage.load()
  const listeners = new Set<() => void>()
  let stopListeningToStorage: (() => void) | null = null

  function commit(next: PersistedData) {
    snapshot = next
    storage.save(next)
    listeners.forEach((listener) => listener())
  }

  function reloadFromStorage() {
    snapshot = storage.load()
    listeners.forEach((listener) => listener())
  }

  return {
    getSnapshot: () => snapshot,

    subscribe(listener: () => void) {
      if (listeners.size === 0) {
        // Data may have changed in another tab while nobody was subscribed.
        snapshot = storage.load()
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

    /** Inserts the deck, or replaces the one with the same id in place. */
    saveDeck(deck: Deck) {
      const exists = snapshot.decks.some((d) => d.id === deck.id)
      const decks = exists
        ? snapshot.decks.map((d) => (d.id === deck.id ? deck : d))
        : [...snapshot.decks, deck]
      commit({ ...snapshot, decks })
    },

    deleteDeck(id: string) {
      commit({ ...snapshot, decks: snapshot.decks.filter((d) => d.id !== id) })
    },

    setOwned(key: string, entry: OwnedEntry) {
      commit({ ...snapshot, owned: { ...snapshot.owned, [key]: entry } })
    },

    deleteOwned(key: string) {
      const { [key]: _removed, ...owned } = snapshot.owned
      commit({ ...snapshot, owned })
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

export function useDeckData(): PersistedData {
  const store = getDeckStore()
  return useSyncExternalStore(store.subscribe, store.getSnapshot)
}
