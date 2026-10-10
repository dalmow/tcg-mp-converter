export const CARD_CATEGORIES = ['pokemon', 'trainer', 'energy'] as const
export type CardCategory = (typeof CARD_CATEGORIES)[number]

export const DECK_SIZE = 60
export const MAX_COPIES_PER_NAME = 4

export interface DeckCard {
  category: CardCategory
  key: string
  displayName: string
  quantity: number
}

export interface Deck {
  id: string
  name: string
  cards: DeckCard[]
}

export interface OwnedEntry {
  displayName: string
  category: CardCategory
  quantity: number
}

export type OwnedMap = Record<string, OwnedEntry>

/** Success payload merged with `ok: true`, or an error message with `ok: false`. */
export type Result<T extends object = object> = ({ ok: true } & T) | { ok: false; error: string }
