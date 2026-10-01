import type { CollectionConfig } from '@/lib/types'
import { normalizeName, parseCard } from '@/lib/deck/cardParser'
import type { ParsedCard } from '@/lib/deck/cardParser'
import { addDeckCard } from '@/lib/deck/deckRules'
import { MAX_COPIES_PER_NAME } from '@/lib/deck/types'
import type { CardCategory, Deck, DeckCard, OwnedMap, Result } from '@/lib/deck/types'

export const MAX_SUGGESTIONS = 8

export interface CardSuggestion {
  key: string
  displayName: string
  quantity: number
}

/** Known cards of a category (in a deck or in the owned map) whose name contains the typed text. */
export function suggestCards(
  category: CardCategory,
  text: string,
  decks: Deck[],
  owned: OwnedMap,
): CardSuggestion[] {
  const known = new Map<string, CardSuggestion>()
  for (const [key, entry] of Object.entries(owned)) {
    if (entry.category === category) known.set(key, { key, displayName: entry.displayName, quantity: entry.quantity })
  }
  for (const deck of decks) {
    for (const card of deck.cards) {
      if (card.category === category && !known.has(card.key)) {
        known.set(card.key, { key: card.key, displayName: card.displayName, quantity: owned[card.key]?.quantity ?? 0 })
      }
    }
  }
  const needle = normalizeName(text)
  return [...known.values()]
    .filter((card) => normalizeName(card.displayName).includes(needle))
    .sort((a, b) => a.displayName.localeCompare(b.displayName))
    .slice(0, MAX_SUGGESTIONS)
}

/** Copies of a card name in the deck once `candidate` replaces the row at `originalKey`. Basic energy is exempt. */
export function copiesAfterEdit(
  deck: Deck,
  originalKey: string | null,
  candidate: { parsed: ParsedCard; quantity: number },
  collections: CollectionConfig,
): number {
  if (candidate.parsed.basicEnergy) return 0
  let copies = candidate.quantity
  for (const card of deck.cards) {
    if (card.key === originalKey || card.key === candidate.parsed.key) continue
    const parsed = parseCard(card.category, card.displayName, collections)
    if (parsed.ok && parsed.card.normalizedName === candidate.parsed.normalizedName) copies += card.quantity
  }
  return copies
}

export function copiesWarning(parsed: ParsedCard, copies: number): string | null {
  return copies > MAX_COPIES_PER_NAME
    ? `Mais de ${MAX_COPIES_PER_NAME} cópias de ${parsed.displayName} no deck`
    : null
}

/** Replaces the row at `originalKey` (or appends a new row), keeping the row position. */
export function applyRowSave(deck: Deck, originalKey: string | null, card: DeckCard): Result<{ deck: Deck }> {
  const index = originalKey === null ? -1 : deck.cards.findIndex((existing) => existing.key === originalKey)
  const base: Deck = { ...deck, cards: deck.cards.filter((existing) => existing.key !== originalKey) }
  const added = addDeckCard(base, card)
  if (!added.ok || index === -1) return added
  const cards = added.deck.cards.slice(0, -1)
  cards.splice(index, 0, card)
  return { ok: true, deck: { ...added.deck, cards } }
}

export function parseIntegerText(text: string): number {
  const trimmed = text.trim()
  return /^\d+$/.test(trimmed) ? Number(trimmed) : Number.NaN
}

/** Empty owned text counts as 0. */
export function parseOwnedText(text: string): number {
  return text.trim() === '' ? 0 : parseIntegerText(text)
}

