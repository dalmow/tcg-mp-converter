import { z } from 'zod'
import { deckInvariantError, uniqueDecksById } from './deckRules'
import { deckSchema, ownedEntrySchema } from '@/features/decks/types/deck'
import type { Deck, OwnedMap, PersistedData } from '@/features/decks/types/deck'

export const STORAGE_KEY = 'ptcg:v1'

export const EMPTY_DATA: PersistedData = { decks: [], owned: {} }

/** The subset of the Web Storage API the app relies on. */
export interface StringStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export interface DeckStorage {
  load(): PersistedData
  save(data: PersistedData): void
  /** Notifies when another tab changes the stored data. Returns an unsubscribe function. */
  subscribe(onExternalChange: () => void): () => void
}

/** Keeps the valid decks that pass the invariants, and only the first deck of each id. */
function recoverDecks(value: unknown): Deck[] {
  const parsedDecks = z.array(z.unknown()).safeParse(value)
  if (!parsedDecks.success) return []

  const validDecks: Deck[] = []
  for (const item of parsedDecks.data) {
    const parsedDeck = deckSchema.safeParse(item)
    if (parsedDeck.success && deckInvariantError(parsedDeck.data) === null) validDecks.push(parsedDeck.data)
  }
  return uniqueDecksById(validDecks)
}

function recoverOwned(value: unknown): OwnedMap {
  const parsedOwned = z.record(z.string(), z.unknown()).safeParse(value)
  if (!parsedOwned.success) return {}

  const owned: OwnedMap = {}
  for (const [key, item] of Object.entries(parsedOwned.data)) {
    const parsedEntry = ownedEntrySchema.safeParse(item)
    if (parsedEntry.success) owned[key] = parsedEntry.data
  }
  return owned
}

/**
 * Keeps every valid deck and owned entry, and drops the rest, so one bad entry does not erase the saved
 * data. Each container is checked on its own, so a broken or missing `owned` keeps valid decks and vice
 * versa. A value that is not an object falls back to empty.
 */
export function recoverPersistedData(value: unknown): PersistedData {
  const parsedShape = z.object({ decks: z.unknown().optional(), owned: z.unknown().optional() }).safeParse(value)
  if (!parsedShape.success) return EMPTY_DATA
  return { decks: recoverDecks(parsedShape.data.decks), owned: recoverOwned(parsedShape.data.owned) }
}

/** Calls `onChange` when another tab changes the stored data; returns the cleanup function. */
const listenToStorageEvents: DeckStorage['subscribe'] = (onChange) => {
  const handler = (event: StorageEvent) => {
    // `key` is null when the whole storage was cleared.
    if (event.key === null || event.key === STORAGE_KEY) onChange()
  }
  window.addEventListener('storage', handler)
  return () => window.removeEventListener('storage', handler)
}

export function createDeckStorage(
  backend: StringStorage,
  listen: DeckStorage['subscribe'] = listenToStorageEvents,
): DeckStorage {
  return {
    load() {
      // Unreadable storage falls back to empty; the next save replaces it.
      try {
        const raw = backend.getItem(STORAGE_KEY)
        if (raw === null) return EMPTY_DATA
        return recoverPersistedData(JSON.parse(raw))
      } catch {
        return EMPTY_DATA
      }
    },
    save(data) {
      backend.setItem(STORAGE_KEY, JSON.stringify(data))
    },
    subscribe: listen,
  }
}
