import { z } from 'zod'

export const CARD_CATEGORIES = ['pokemon', 'trainer', 'energy'] as const

export const DECK_SIZE = 60
export const MAX_COPIES_PER_NAME = 4

/**
 * The one rule for quantities, shared by the forms and every stored or imported count. Not zod's int(): that
 * rejects values above 2^53 that a form can save. Infinity (a digit string past the float range) is rejected.
 */
export function isCount(value: number, min: number): boolean {
  return Number.isInteger(value) && value >= min
}

const countSchema = (min: number) => z.number().refine((value) => isCount(value, min))

const cardCategorySchema = z.enum(CARD_CATEGORIES)
export type CardCategory = z.infer<typeof cardCategorySchema>

const deckCardSchema = z.object({
  category: cardCategorySchema,
  key: z.string(),
  displayName: z.string(),
  quantity: countSchema(1),
})
export type DeckCard = z.infer<typeof deckCardSchema>

export const deckSchema = z.object({
  id: z.string(),
  name: z.string(),
  cards: z.array(deckCardSchema),
})
export type Deck = z.infer<typeof deckSchema>

export const ownedEntrySchema = z.object({
  displayName: z.string(),
  category: cardCategorySchema,
  quantity: countSchema(0),
})
export type OwnedEntry = z.infer<typeof ownedEntrySchema>

const ownedMapSchema = z.record(z.string(), ownedEntrySchema)
export type OwnedMap = z.infer<typeof ownedMapSchema>

export const persistedDataSchema = z.object({
  decks: z.array(deckSchema),
  owned: ownedMapSchema,
})
export type PersistedData = z.infer<typeof persistedDataSchema>

/** Success payload merged with `ok: true`, or an error message with `ok: false`. */
export type Result<T extends object = object> = ({ ok: true } & T) | { ok: false; error: string }
