import { z } from 'zod'
import { deckInvariantError } from '@/features/decks/lib/deckRules'
import { deckSchema, ownedEntrySchema, ownedMapSchema } from '@/features/decks/types/deck'
import type { Deck, OwnedMap } from '@/features/decks/types/deck'

export const STORAGE_KEY = 'ptcg:v1'

export const persistedDataSchema = z.object({
  decks: z.array(deckSchema),
  owned: ownedMapSchema,
})
export type PersistedData = z.infer<typeof persistedDataSchema>

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

const storedShapeSchema = z.object({
  decks: z.array(z.unknown()),
  owned: z.record(z.string(), z.unknown()),
})

/**
 * Keeps every deck and owned entry that is valid, and drops the rest, so one bad entry does not erase
 * the saved data. Data without the top-level shape falls back to empty.
 */
export function recoverPersistedData(value: unknown): PersistedData {
  const shape = storedShapeSchema.safeParse(value)
  if (!shape.success) return EMPTY_DATA

  const decks: Deck[] = []
  for (const item of shape.data.decks) {
    const deck = deckSchema.safeParse(item)
    if (deck.success && deckInvariantError(deck.data) === null) decks.push(deck.data)
  }

  const owned: OwnedMap = {}
  for (const [key, item] of Object.entries(shape.data.owned)) {
    const entry = ownedEntrySchema.safeParse(item)
    if (entry.success) owned[key] = entry.data
  }

  return { decks, owned }
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
