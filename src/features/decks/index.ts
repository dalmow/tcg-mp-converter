// Public API of the decks feature. Other features import from here, never from `lib/` or `components/`.
export { default as DeckEditorPage } from '@/features/decks/components/DeckEditorPage'
export { default as DeckListPage } from '@/features/decks/components/DeckListPage'
export { CARD_CATEGORIES, DECK_SIZE, persistedDataSchema } from '@/features/decks/types/deck'
export type {
  CardCategory,
  Deck,
  DeckCard,
  OwnedEntry,
  OwnedMap,
  PersistedData,
  Result,
} from '@/features/decks/types/deck'
export { getDeckStore, useDeckData } from '@/features/decks/lib/deckStore'
export { deckInvariantError, totalQuantity, uniqueDecksById } from '@/features/decks/lib/deckRules'
