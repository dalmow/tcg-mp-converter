import type { CardCategory, Deck, DeckCard, OwnedEntry, OwnedMap, Result } from './types'

export const STORAGE_KEY = 'ptcg:v1'

export interface PersistedData {
  decks: Deck[]
  owned: OwnedMap
}

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

const CATEGORIES: readonly string[] = ['pokemon', 'trainer', 'energy'] satisfies CardCategory[]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isCategory(value: unknown): value is CardCategory {
  return typeof value === 'string' && CATEGORIES.includes(value)
}

function isCount(value: unknown, min: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min
}

function isDeckCard(value: unknown): value is DeckCard {
  return (
    isRecord(value) &&
    isCategory(value.category) &&
    typeof value.key === 'string' &&
    typeof value.displayName === 'string' &&
    isCount(value.quantity, 1)
  )
}

function isDeck(value: unknown): value is Deck {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    Array.isArray(value.cards) &&
    value.cards.every(isDeckCard)
  )
}

function isOwnedEntry(value: unknown): value is OwnedEntry {
  return (
    isRecord(value) &&
    typeof value.displayName === 'string' &&
    isCategory(value.category) &&
    isCount(value.quantity, 0)
  )
}

/** Validates unknown input (storage or backup file) into `PersistedData`. */
export function parsePersistedData(value: unknown): Result<{ data: PersistedData }> {
  if (!isRecord(value) || !Array.isArray(value.decks) || !isRecord(value.owned)) {
    return { ok: false, error: 'Dados inválidos' }
  }
  if (!value.decks.every(isDeck) || !Object.values(value.owned).every(isOwnedEntry)) {
    return { ok: false, error: 'Dados inválidos' }
  }
  return { ok: true, data: { decks: value.decks, owned: value.owned as OwnedMap } }
}

/** Subscribes to external changes; returns the cleanup function. */
type ExternalChangeListener = (onChange: () => void) => () => void

const listenToStorageEvents: ExternalChangeListener = (onChange) => {
  const handler = (event: StorageEvent) => {
    // `key` is null when the whole storage was cleared.
    if (event.key === null || event.key === STORAGE_KEY) onChange()
  }
  window.addEventListener('storage', handler)
  return () => window.removeEventListener('storage', handler)
}

export function createDeckStorage(
  backend: StringStorage,
  listen: ExternalChangeListener = listenToStorageEvents,
): DeckStorage {
  return {
    load() {
      const raw = backend.getItem(STORAGE_KEY)
      if (raw === null) return EMPTY_DATA
      try {
        const parsed = parsePersistedData(JSON.parse(raw))
        return parsed.ok ? parsed.data : EMPTY_DATA
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
