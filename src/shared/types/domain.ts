export const CONDITIONS = ['M', 'NM', 'SP', 'MP', 'HP', 'D'] as const
export type Condition = (typeof CONDITIONS)[number]

export const LANGUAGES = ['PTEN', 'PT', 'EN'] as const
export type Language = (typeof LANGUAGES)[number]

export type CollectionConfig = Record<string, number>

export interface UnresolvedCard {
  line: string
  reason: string
}

export interface ConvertDecklistResult {
  ligaPokemon: string
  mypCards: string
  unresolvedCards: UnresolvedCard[]
}
