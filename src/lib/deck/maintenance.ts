import type { CardCategory, Deck, OwnedMap } from './types'

export interface MaintenanceRow {
  key: string
  displayName: string
  category: CardCategory
  /** Max quantity of the card across decks (one physical card is reused between decks). */
  needed: number
  /** Names of the decks that use the card (may be empty). */
  decks: string[]
}

/** Every card that is in a deck or has an owned entry (it "appears or once appeared"). */
export function deriveMaintenance(decks: Deck[], owned: OwnedMap): MaintenanceRow[] {
  const rows = new Map<string, MaintenanceRow>()

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
