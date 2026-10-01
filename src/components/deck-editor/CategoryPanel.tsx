import { PlusIcon } from 'lucide-react'
import { Panel } from '@/components/Panel'
import { Button } from '@/components/ui/button'
import { CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CollectionConfig } from '@/lib/types'
import type { CardCategory, Deck, OwnedMap } from '@/lib/deck/types'
import { CardRow } from './CardRow'
import { otherRowsDeck } from './draft'
import type { DraftRow } from './draft'

export interface CategoryPanelProps {
  title: string
  category: CardCategory
  /** Every row of the draft; the panel shows the ones of its category. */
  rows: DraftRow[]
  rowErrors: Record<string, string>
  decks: Deck[]
  owned: OwnedMap
  collections: CollectionConfig
  /** Id of the row just added, which takes focus on mount. */
  focusRowId: string | null
  onAddRow: () => void
  onChangeRow: (rowId: string, patch: Partial<DraftRow>) => void
  onDeleteRow: (rowId: string) => void
}

export function CategoryPanel({
  title,
  category,
  rows,
  rowErrors,
  decks,
  owned,
  collections,
  focusRowId,
  onAddRow,
  onChangeRow,
  onDeleteRow,
}: CategoryPanelProps) {
  return (
    <Panel role="region" aria-label={title} className="self-start">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardAction>
          <Button variant="outline" size="icon" aria-label="Adicionar carta" onClick={onAddRow}>
            <PlusIcon />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {rows
          .filter((row) => row.category === category)
          .map((row) => (
            <CardRow
              key={row.id}
              context={{ category, otherRows: otherRowsDeck(rows, row.id, collections), decks, owned, collections }}
              row={row}
              error={rowErrors[row.id] ?? null}
              focusOnMount={row.id === focusRowId}
              onChange={(patch) => onChangeRow(row.id, patch)}
              onDelete={() => onDeleteRow(row.id)}
            />
          ))}
      </CardContent>
    </Panel>
  )
}
