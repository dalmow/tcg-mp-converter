import { PlusIcon } from 'lucide-react'
import { Panel } from '@/components/Panel'
import { Button } from '@/components/ui/button'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CardCategory, Deck, DeckCard, OwnedEntry, OwnedMap, Result } from '@/lib/deck/types'
import type { CollectionConfig } from '@/lib/types'
import { CardRow } from './CardRow'

export interface CategoryPanelProps {
  category: CardCategory
  title: string
  deck: Deck
  decks: Deck[]
  owned: OwnedMap
  collections: CollectionConfig
  /** Ids of rows that were added but not saved yet. */
  draftIds: string[]
  onAddDraft: () => void
  onDiscardDraft: (draftId: string) => void
  onSaveRow: (
    originalKey: string | null,
    card: DeckCard,
    ownedEntry: OwnedEntry,
    draftId?: string,
  ) => Result
  onDeleteRow: (key: string) => void
}

export function CategoryPanel({
  category,
  title,
  deck,
  decks,
  owned,
  collections,
  draftIds,
  onAddDraft,
  onDiscardDraft,
  onSaveRow,
  onDeleteRow,
}: CategoryPanelProps) {
  const shared = { category, deck, decks, owned, collections }
  return (
    <Panel role="region" aria-label={title} className="self-start">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {deck.cards
          .filter((card) => card.category === category)
          .map((card) => (
            <CardRow
              key={card.key}
              {...shared}
              card={card}
              onSave={(originalKey, next, ownedEntry) => onSaveRow(originalKey, next, ownedEntry)}
              onDelete={() => onDeleteRow(card.key)}
            />
          ))}
        {draftIds.map((draftId) => (
          <CardRow
            key={draftId}
            {...shared}
            card={null}
            onSave={(originalKey, next, ownedEntry) => onSaveRow(originalKey, next, ownedEntry, draftId)}
            onDelete={() => onDiscardDraft(draftId)}
          />
        ))}
        <Button variant="outline" onClick={onAddDraft}>
          <PlusIcon />
          Adicionar carta
        </Button>
      </CardContent>
    </Panel>
  )
}
