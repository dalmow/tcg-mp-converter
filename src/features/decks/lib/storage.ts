import { z } from 'zod'
import { deckInvariantError } from '@/features/decks/lib/deckRules'
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

// Loose shapes: each container is checked on its own, so a broken `owned` keeps valid decks and vice versa.
const storedShapeSchema = z.object({ decks: z.unknown(), owned: z.unknown() })
const storedDecksSchema = z.array(z.unknown())
const storedOwnedSchema = z.record(z.string(), z.unknown())

/** Keeps the first deck of each id that is valid and passes the invariants; drops the rest. */
function recoverDecks(value: unknown): Deck[] {
  const items = storedDecksSchema.safeParse(value)
  if (!items.success) return []

  const decks: Deck[] = []
  const seenIds = new Set<string>()
  for (const item of items.data) {
    const parsedDeck = deckSchema.safeParse(item)
    if (!parsedDeck.success) continue
    const deck = parsedDeck.data
    if (seenIds.has(deck.id) || deckInvariantError(deck) !== null) continue
    seenIds.add(deck.id)
    decks.push(deck)
  }
  return decks
}

function recoverOwned(value: unknown): OwnedMap {
  const entries = storedOwnedSchema.safeParse(value)
  if (!entries.success) return {}

  const owned: OwnedMap = {}
  for (const [key, item] of Object.entries(entries.data)) {
    const parsedEntry = ownedEntrySchema.safeParse(item)
    if (parsedEntry.success) owned[key] = parsedEntry.data
  }
  return owned
}

/**
 * Keeps every valid deck and owned entry, and drops the rest, so one bad entry does not erase the saved
 * data. A value that is not an object falls back to empty.
 */
export function recoverPersistedData(value: unknown): PersistedData {
  const shape = storedShapeSchema.safeParse(value)
  if (!shape.success) return EMPTY_DATA
  return { decks: recoverDecks(shape.data.decks), owned: recoverOwned(shape.data.owned) }
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
