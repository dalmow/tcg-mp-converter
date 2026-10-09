import type { CardCategory, Deck, OwnedEntry, OwnedMap } from '@/features/decks'

export interface MaintenanceEntry {
  key: string
  displayName: string
  category: CardCategory
  /** Max quantity of the card across decks (one physical card is reused between decks). */
  needed: number
  /** Names of the decks that use the card (may be empty). */
  decks: string[]
}

/** Every card that is in a deck or has an owned entry (it "appears or once appeared"). */
export function deriveMaintenance(decks: Deck[], owned: OwnedMap): MaintenanceEntry[] {
  const rows = new Map<string, MaintenanceEntry>()

  for (const [key, entry] of Object.entries(owned)) {
    rows.set(key, { key, displayName: entry.displayName, category: entry.category, needed: 0, decks: [] })
  }
  for (const deck of decks) {
    for (const card of deck.cards) {
      const row = rows.get(card.key) ?? {
        key: card.key,
        displayName: card.displayName,
        category: card.category,
        needed: 0,
        decks: [],
      }
      row.needed = Math.max(row.needed, card.quantity)
      row.decks.push(deck.name)
      rows.set(card.key, row)
    }
  }
  return [...rows.values()]
}

/** A card is satisfied when the owned quantity covers what the decks need. */
export function isSatisfied(entry: MaintenanceEntry, owned: number): boolean {
  return owned >= entry.needed
}

/** Builds the owned entry to persist for a maintenance entry. */
export function toOwnedEntry(entry: MaintenanceEntry, quantity: number): OwnedEntry {
  return { displayName: entry.displayName, category: entry.category, quantity }
}

/** Parses the owned-quantity input: empty counts as 0; otherwise a non-negative integer, else null. */
export function parseOwnedQuantity(text: string): number | null {
  const trimmed = text.trim()
  if (trimmed === '') return 0
  if (!/^\d+$/.test(trimmed)) return null
  return Number(trimmed)
}
