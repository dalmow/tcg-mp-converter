// Public API of the decks feature. Other features import from here, never from `lib/` or `components/`.
// The screens are not re-exported: the backup feature imports this file statically, which would pull them
// into the entry chunk. `app/AppRoutes` lazy-loads them by path.
export { CARD_CATEGORIES, CATEGORY_TITLES, DECK_SIZE, persistedDataSchema } from '@/features/decks/types/deck'
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
export { parseCard } from '@/features/decks/lib/cardParser'
export { parseOwnedText } from '@/features/decks/lib/rowLogic'
export { deckInvariantError, totalQuantity, uniqueDecksById } from '@/features/decks/lib/deckRules'
