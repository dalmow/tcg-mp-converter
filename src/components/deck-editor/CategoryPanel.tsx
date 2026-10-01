import { PlusIcon } from 'lucide-react'
import { Panel } from '@/components/Panel'
import { Button } from '@/components/ui/button'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Result } from '@/lib/deck/types'
import { CardRow } from './CardRow'
import type { RowContext, RowSave } from './rowLogic'

export interface CategoryPanelProps {
  title: string
  context: RowContext
  /** Ids of rows that were added but not saved yet. */
  draftIds: string[]
  onAddDraft: () => void
  onDiscardDraft: (draftId: string) => void
  onSaveRow: (save: RowSave) => Result
  onDeleteRow: (key: string) => void
}

export function CategoryPanel({
  title,
  context,
  draftIds,
  onAddDraft,
  onDiscardDraft,
  onSaveRow,
  onDeleteRow,
}: CategoryPanelProps) {
  const { category, deck } = context
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
              context={context}
              card={card}
              onSave={onSaveRow}
              onDelete={() => onDeleteRow(card.key)}
            />
          ))}
        {draftIds.map((draftId) => (
          <CardRow
            key={draftId}
            context={context}
            card={null}
            onSave={(save) => onSaveRow({ ...save, draftId })}
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
