export const ROUTES = {
  decks: '/',
  newDeck: '/decks/new',
  deck: '/decks/:id',
  converter: '/converter',
  maintenance: '/maintenance',
} as const

/** Builds the path of an existing deck's editor. */
export function deckPath(id: string): string {
  return `/decks/${id}`
}
