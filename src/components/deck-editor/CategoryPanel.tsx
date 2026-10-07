import { useRef } from 'react'
import { PlusIcon } from 'lucide-react'
import { Panel } from '@/components/Panel'
import { Button } from '@/components/ui/button'
import { CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CollectionConfig } from '@/lib/types'
import type { CardCategory, Deck, OwnedMap } from '@/lib/deck/types'
import { CardRow, ROW_GRID_CLASS } from './CardRow'
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
  const content = useRef<HTMLDivElement>(null)
  const addButton = useRef<HTMLButtonElement>(null)
  const categoryRows = rows.filter((row) => row.category === category)

  // The focused delete button disappears with its row: hand focus to the next row, the previous one or "Adicionar carta".
  function deleteRow(rowId: string) {
    const index = categoryRows.findIndex((row) => row.id === rowId)
    const neighbour = categoryRows[index + 1] ?? categoryRows[index - 1]
    const target = neighbour
      ? content.current?.querySelector<HTMLElement>(`[data-row-id="${neighbour.id}"] input`)
      : addButton.current
    target?.focus()
    onDeleteRow(rowId)
  }

  return (
    <Panel role="region" aria-label={title} className="self-start gap-space-7 overflow-visible rounded-2xl [--card-spacing:20px]">
      <CardHeader>
        <CardTitle role="heading" aria-level={2} className="font-display text-h2">
          {title}
        </CardTitle>
        <CardAction>
          <Button
            ref={addButton}
            variant="ghost"
            size="icon-sm"
            title="Adicionar carta"
            aria-label={`Adicionar carta de ${title}`}
            onClick={onAddRow}
          >
            <PlusIcon />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent ref={content} className="flex flex-col gap-space-4">
        {/* Names come from each input's own label; the header only aligns the columns visually. */}
        <div aria-hidden="true" className={`${ROW_GRID_CLASS} text-eyebrow text-ink-faint uppercase`}>
          <span className="text-center">#</span>
          <span>Carta</span>
          <span className="text-center">Adq.</span>
        </div>
        {categoryRows.map((row, index) => (
            <CardRow
              key={row.id}
              context={{ category, otherRows: otherRowsDeck(rows, row.id, collections), decks, owned, collections }}
              row={row}
              position={index + 1}
              categoryTitle={title}
              error={rowErrors[row.id] ?? null}
              focusOnMount={row.id === focusRowId}
              onChange={(patch) => onChangeRow(row.id, patch)}
              onDelete={() => deleteRow(row.id)}
            />
          ))}
      </CardContent>
    </Panel>
  )
}
