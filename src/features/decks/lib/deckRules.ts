import type { CollectionConfig } from '@/shared/types/domain'
import { parseCard } from './cardParser'
import { DECK_SIZE, MAX_COPIES_PER_NAME } from '@/features/decks/types/deck'
import type { Deck, DeckCard, OwnedMap, Result } from '@/features/decks/types/deck'

export function totalQuantity(cards: DeckCard[]): number {
  return cards.reduce((sum, card) => sum + card.quantity, 0)
}

/** Returns a Portuguese error for the first deck invariant the deck breaks, or null. Shared by storage and backup. */
export function deckInvariantError(deck: Deck): string | null {
  if (new Set(deck.cards.map((card) => card.key)).size !== deck.cards.length) {
    return `Deck "${deck.name}" tem cartas duplicadas`
  }
  if (totalQuantity(deck.cards) > DECK_SIZE) {
    return `Deck "${deck.name}" tem mais de ${DECK_SIZE} cartas`
  }
  return null
}

/** Keeps the first deck of each id. Deck ids are what the store matches on, so two decks cannot share one. */
export function uniqueDecksById(decks: Deck[]): Deck[] {
  const seenIds = new Set<string>()
  return decks.filter((deck) => {
    if (seenIds.has(deck.id)) return false
    seenIds.add(deck.id)
    return true
  })
}

/** Largest quantity a row may take, given the other rows of the deck. */
export function maxQuantityFor(deck: Deck, key: string): number {
  const others = deck.cards.filter((card) => card.key !== key)
  return DECK_SIZE - totalQuantity(others)
}

export function validateQuantity(deck: Deck, key: string, quantity: number): string | null {
  if (!Number.isInteger(quantity) || quantity < 1) {
    return 'Quantidade deve ser um número inteiro maior que zero'
  }
  const max = maxQuantityFor(deck, key)
  if (quantity > max) {
    return `Quantidade máxima para esta carta: ${max}`
  }
  return null
}

export type AddDeckCardResult = Result<{ deck: Deck }>

export function addDeckCard(deck: Deck, card: DeckCard): AddDeckCardResult {
  if (deck.cards.some((existing) => existing.key === card.key)) {
    return { ok: false, error: 'Carta já está no deck, edite a linha existente' }
  }
  const quantityError = validateQuantity(deck, card.key, card.quantity)
  if (quantityError) {
    return { ok: false, error: quantityError }
  }
  return { ok: true, deck: { ...deck, cards: [...deck.cards, card] } }
}

export interface DeckValidation {
  valid: boolean
  total: number
  /** Rule 1: quantities sum to exactly 60. */
  totalOk: boolean
  /** Rule 2: every row parses, collection exists, number within total. */
  rowsOk: boolean
  /** Rule 3: at most 4 copies per normalized name (basic energy exempt). */
  copiesOk: boolean
  /** Rule 4: owned >= quantity for every row. */
  ownedOk: boolean
  /** Sum of (quantity - owned) over rows lacking cards. */
  missingCount: number
  /** "falta 1 carta" / "faltam N cartas", only when rule 4 is the only failing rule. */
  missingMessage: string | null
}

export function missingForCard(card: DeckCard, owned: OwnedMap): number {
  return Math.max(0, card.quantity - (owned[card.key]?.quantity ?? 0))
}

export function formatMissing(count: number): string {
  return count === 1 ? 'falta 1 carta' : `faltam ${count} cartas`
}

export function validateDeck(deck: Deck, owned: OwnedMap, collections: CollectionConfig): DeckValidation {
  const total = totalQuantity(deck.cards)
  const totalOk = total === DECK_SIZE

  let rowsOk = true
  const copiesByName = new Map<string, number>()
  for (const card of deck.cards) {
    // Re-parse the stored text so rows are always checked against the current collection config.
    const parsed = parseCard(card.category, card.displayName, collections)
    if (!parsed.ok || parsed.card.key !== card.key) {
      rowsOk = false
      continue
    }
    if (!parsed.card.basicEnergy) {
      const name = parsed.card.normalizedName
      copiesByName.set(name, (copiesByName.get(name) ?? 0) + card.quantity)
    }
  }
  const copiesOk = [...copiesByName.values()].every((copies) => copies <= MAX_COPIES_PER_NAME)

  const missingCount = deck.cards.reduce((sum, card) => sum + missingForCard(card, owned), 0)
  const ownedOk = missingCount === 0

  const valid = totalOk && rowsOk && copiesOk && ownedOk
  const onlyOwnedFails = totalOk && rowsOk && copiesOk && !ownedOk

  return {
    valid,
    total,
    totalOk,
    rowsOk,
    copiesOk,
    ownedOk,
    missingCount,
    missingMessage: onlyOwnedFails ? formatMissing(missingCount) : null,
  }
}
