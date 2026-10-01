import type { CollectionConfig } from '@/lib/types'
import { normalizeName, parseCard } from '@/lib/deck/cardParser'
import type { ParsedCard } from '@/lib/deck/cardParser'
import { validateQuantity } from '@/lib/deck/deckRules'
import { MAX_COPIES_PER_NAME } from '@/lib/deck/types'
import type { CardCategory, Deck, OwnedMap } from '@/lib/deck/types'

const MAX_SUGGESTIONS = 8

/** Everything a row needs to know about the draft (its other rows) and the stored data around it. */
export interface RowContext {
  category: CardCategory
  /** The other rows of the draft that already form a valid card. */
  deck: Deck
  decks: Deck[]
  owned: OwnedMap
  collections: CollectionConfig
}

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

export function parseIntegerText(text: string): number {
  const trimmed = text.trim()
  return /^\d+$/.test(trimmed) ? Number(trimmed) : Number.NaN
}

/** Empty owned text counts as 0. */
export function parseOwnedText(text: string): number {
  return text.trim() === '' ? 0 : parseIntegerText(text)
}


export interface RowInput {
  text: string
  quantityText: string
  ownedText: string
}

/** Derived validity and feedback of a row (green/red, inline error and warning). */
export function deriveRowState(context: RowContext, input: RowInput) {
  const { category, deck, collections } = context
  const parsed = parseCard(category, input.text, collections)
  const quantity = parseIntegerText(input.quantityText)
  const ownedQuantity = parseOwnedText(input.ownedText)
  // `deck` holds only the other rows, so there is no key of this row to exclude; '' matches none.
  const quantityError = validateQuantity(deck, '', quantity)
  const warning =
    parsed.ok && Number.isInteger(quantity)
      ? copiesWarning(parsed.card, copiesAfterEdit(deck, null, { parsed: parsed.card, quantity }, collections))
      : null
  const valid =
    parsed.ok && !quantityError && Number.isInteger(ownedQuantity) && ownedQuantity >= quantity && !warning
  return { parsed, quantity, ownedQuantity, quantityError, warning, valid }
}
