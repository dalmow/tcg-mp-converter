export type CardCategory = 'pokemon' | 'trainer' | 'energy'

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
