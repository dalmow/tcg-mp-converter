// Public API of the decks feature. Other features import from here, never from `lib/` or `components/`.
export { default as DeckEditorPage } from '@/features/decks/components/DeckEditorPage'
export { default as DeckListPage } from '@/features/decks/components/DeckListPage'
export { CARD_CATEGORIES, DECK_SIZE } from '@/features/decks/types/deck'
export type { CardCategory, Deck, DeckCard, OwnedEntry, OwnedMap, Result } from '@/features/decks/types/deck'
export { getDeckStore, useDeckData } from '@/features/decks/lib/deckStore'
export { persistedDataSchema } from '@/features/decks/lib/storage'
export type { PersistedData } from '@/features/decks/lib/storage'
export { deckInvariantError, totalQuantity } from '@/features/decks/lib/deckRules'
