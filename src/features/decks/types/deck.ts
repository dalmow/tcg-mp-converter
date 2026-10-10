import { z } from 'zod'

export const CARD_CATEGORIES = ['pokemon', 'trainer', 'energy'] as const

export const DECK_SIZE = 60
export const MAX_COPIES_PER_NAME = 4

export const cardCategorySchema = z.enum(CARD_CATEGORIES)
export type CardCategory = z.infer<typeof cardCategorySchema>

export const deckCardSchema = z.object({
  category: cardCategorySchema,
  key: z.string(),
  displayName: z.string(),
  quantity: z.number().int().min(1),
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
  quantity: z.number().int().min(0),
})
export type OwnedEntry = z.infer<typeof ownedEntrySchema>

export const ownedMapSchema = z.record(z.string(), ownedEntrySchema)
export type OwnedMap = z.infer<typeof ownedMapSchema>

/** Success payload merged with `ok: true`, or an error message with `ok: false`. */
export type Result<T extends object = object> = ({ ok: true } & T) | { ok: false; error: string }
