import type { CollectionConfig } from '@/shared/types/domain'
import { parseCard } from './cardParser'
import { addDeckCard } from './deckRules'
import { isCountAtLeast } from '@/features/decks/types/deck'
import type { CardCategory, Deck, DeckCard, OwnedMap } from '@/features/decks/types/deck'
import { parseIntegerText } from '@/shared/lib/integer'
import { parseOwnedText } from './rowLogic'

export const NAME_REQUIRED = 'Informe o nome do deck'
export const OWNED_INVALID = 'Adquirido deve ser um número inteiro maior ou igual a zero'

/** One row of the in-memory draft: raw field texts, nothing validated or persisted yet. */
export interface DraftRow {
  id: string
  category: CardCategory
  quantityText: string
  text: string
  /**
   * null = no edit of the owned field in this draft, so it follows the stored owned map
   * (kept in sync with other tabs and Maintenance). A string is an edit and is written on save.
   */
  ownedText: string | null
  /** Key of the saved row this one came from, used to follow its stored owned quantity. */
  originalKey: string | null
}

export function newRow(category: CardCategory): DraftRow {
  return { id: crypto.randomUUID(), category, quantityText: '', text: '', ownedText: null, originalKey: null }
}

export function rowsFromDeck(deck: Deck): DraftRow[] {
  return deck.cards.map((card) => ({
    id: crypto.randomUUID(),
    category: card.category,
    quantityText: String(card.quantity),
    text: card.displayName,
    ownedText: null,
    originalKey: card.key,
  }))
}

/** The card a row describes, or null when its text or quantity is not valid yet. */
function rowToCard(row: DraftRow, collections: CollectionConfig): DeckCard | null {
  const parsed = parseCard(row.category, row.text, collections)
  const quantity = parseIntegerText(row.quantityText)
  if (!parsed.ok || quantity < 1) return null
  return { category: row.category, key: parsed.card.key, displayName: parsed.card.displayName, quantity }
}

/** A row with no quantity and no card is silently discarded on save. */
export function isBlankRow(row: DraftRow): boolean {
  return row.quantityText.trim() === '' && row.text.trim() === ''
}

/** The deck formed by every other row that is already a valid card, for per-row rule checks. */
export function otherRowsDeck(rows: DraftRow[], rowId: string, collections: CollectionConfig): Deck {
  const cards: DeckCard[] = []
  for (const row of rows) {
    if (row.id === rowId) continue
    const card = rowToCard(row, collections)
    if (card) cards.push(card)
  }
  return { id: '', name: '', cards }
}

/** Cards the draft already holds: the quantities of the rows that resolve to a card with a whole quantity. */
export function draftCardTotal(rows: DraftRow[], collections: CollectionConfig): number {
  let total = 0
  for (const row of rows) {
    const card = rowToCard(row, collections)
    // A blank quantity parses to NaN, which is not a count.
    if (card && isCountAtLeast(card.quantity, 1)) total += card.quantity
  }
  return total
}

/** True when the draft differs from the saved deck in name, rows or edited owned quantities. */
export function isDirty(name: string, rows: DraftRow[], saved: Deck | undefined): boolean {
  if (name.trim() !== (saved?.name ?? '')) return true
  const current = rows.filter((row) => !isBlankRow(row))
  if (current.some((row) => row.ownedText !== null)) return true
  const cards = saved?.cards ?? []
  return (
    current.length !== cards.length ||
    current.some((row, index) => {
      const card = cards[index]
      return (
        row.category !== card.category ||
        row.quantityText.trim() !== String(card.quantity) ||
        row.text.trim() !== card.displayName
      )
    })
  )
}

export type DeckSaveResult =
  { ok: true; deck: Deck; owned: OwnedMap } | { ok: false; nameError: string | null; rowErrors: Record<string, string> }

/**
 * Turns the draft into the deck and the owned entries to write, or reports every error that stops
 * the save (all or nothing). Only data errors block; warnings never do. Owned is written only for
 * rows edited in the draft or without an owned record yet.
 */
export function buildDeckSave(
  draft: { id: string; name: string; rows: DraftRow[] },
  storedOwned: OwnedMap,
  collections: CollectionConfig,
): DeckSaveResult {
  const nameError = draft.name.trim() ? null : NAME_REQUIRED
  const rowErrors: Record<string, string> = {}
  let deck: Deck = { id: draft.id, name: draft.name.trim(), cards: [] }
  const owned: OwnedMap = {}

  for (const row of draft.rows) {
    if (isBlankRow(row)) continue
    const parsed = parseCard(row.category, row.text, collections)
    if (!parsed.ok) {
      rowErrors[row.id] = parsed.error
      continue
    }
    const card: DeckCard = {
      category: row.category,
      key: parsed.card.key,
      displayName: parsed.card.displayName,
      quantity: parseIntegerText(row.quantityText),
    }
    const added = addDeckCard(deck, card)
    if (!added.ok) {
      rowErrors[row.id] = added.error
      continue
    }
    // Keep the row in the running deck even when its owned value is invalid, so later duplicates
    // and the 60-card cap are still reported in the same attempt.
    deck = added.deck
    const ownedQuantity = parseOwnedText(row.ownedText ?? '')
    if (row.ownedText !== null && !isCountAtLeast(ownedQuantity, 0)) {
      rowErrors[row.id] = OWNED_INVALID
      continue
    }
    if (row.ownedText !== null || storedOwned[card.key] === undefined) {
      owned[card.key] = { displayName: card.displayName, category: card.category, quantity: ownedQuantity }
    }
  }

  if (nameError || Object.keys(rowErrors).length > 0) return { ok: false, nameError, rowErrors }
  return { ok: true, deck, owned }
}
