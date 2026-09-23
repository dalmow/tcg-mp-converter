export type Condition = 'M' | 'NM' | 'SP' | 'MP' | 'HP' | 'D'

export type Language = 'PTEN' | 'PT' | 'EN'

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
