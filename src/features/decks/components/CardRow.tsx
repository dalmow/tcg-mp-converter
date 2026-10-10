import { useEffect, useId, useRef } from 'react'
import { CheckIcon, CircleAlertIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { RowState } from '@/shared/ui/RowState'
import { parseCard } from '@/features/decks/lib/cardParser'
import { isCount, type CardCategory } from '@/features/decks/types/deck'
import { cn } from '@/shared/lib/utils'
import { CardCombobox } from './CardCombobox'
import { deriveRowState, suggestCards } from '@/features/decks/lib/rowLogic'
import type { DraftRow } from '@/features/decks/lib/draft'
import type { CardSuggestion, RowContext } from '@/features/decks/lib/rowLogic'

/** Shared by the column header of the panel and every row, so the cells line up. */
export const ROW_GRID_CLASS = 'grid grid-cols-[36px_minmax(0,1fr)_36px_36px] items-start gap-x-space-3'

// The input sits inside its RowState cell, which carries the border and tint.
const CELL_INPUT_CLASS =
  'h-9 border-0 bg-transparent px-2 text-center text-ui focus-visible:ring-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'

const TEXT_PLACEHOLDER: Record<CardCategory, string> = {
  pokemon: 'Nome COLEÇÃO número',
  trainer: 'Nome do treinador',
  energy: 'Energia básica ou Nome COLEÇÃO número',
}

interface CardRowProps {
  context: RowContext
  /** 1-based position of the row inside its panel, used to give its controls unique names. */
  position: number
  /** Title of the panel the row belongs to. */
  categoryTitle: string
  row: DraftRow
  /** Blocking error reported by the last failed save of the deck, shown on this row. */
  error: string | null
  /** Focus and scroll to this row when it mounts, used for a row the user just added. */
  focusOnMount?: boolean
  onChange: (patch: Partial<DraftRow>) => void
  onDelete: () => void
}

export function CardRow({
  context,
  position,
  categoryTitle,
  row,
  error,
  focusOnMount,
  onChange,
  onDelete,
}: CardRowProps) {
  const messageId = useId()
  const quantityInput = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (!focusOnMount) return
    quantityInput.current?.focus()
    quantityInput.current?.scrollIntoView?.({ block: 'nearest' })
  }, [focusOnMount])
  const { category, decks, owned, collections } = context
  const { quantityText, text } = row
  // A null owned edit follows the stored owned map; a string is an unsaved edit of this draft.
  const ownedText = row.ownedText ?? (row.originalKey ? String(owned[row.originalKey]?.quantity ?? 0) : '')
  const { parsed, quantity, ownedQuantity, warning, valid } = deriveRowState(context, { text, quantityText, ownedText })
  const cellState = valid ? 'complete' : 'pendency'
  const message = error ?? warning
  const where = `da linha ${position} de ${categoryTitle}`
  // A save error concerns the whole row; the copies warning concerns the card and its quantity only.
  const ownedInvalid = !isCount(ownedQuantity, quantity)
  function fieldA11y(invalid: boolean, described: boolean) {
    return {
      'aria-invalid': invalid ? true : undefined,
      'aria-describedby': described && message ? messageId : undefined,
    } as const
  }
  const copiesRelated = fieldA11y(Boolean(message), true)

  function changeText(next: string) {
    const nextParsed = parseCard(category, next, collections)
    const nextKey = nextParsed.ok ? nextParsed.card.key : null
    const previousKey = parsed.ok ? parsed.card.key : null
    const patch: Partial<DraftRow> = { text: next }
    if (nextKey !== null && nextKey === row.originalKey) {
      // Typing the saved card back is no owned edit: follow the stored map again.
      patch.ownedText = null
    } else if (nextKey !== previousKey) {
      // A text that resolves to a known key takes its owned quantity from the map.
      if (nextKey !== null && owned[nextKey]) patch.ownedText = String(owned[nextKey].quantity)
      else if (previousKey !== null) patch.ownedText = ''
    }
    onChange(patch)
  }

  function pick(suggestion: CardSuggestion) {
    const backToSaved = suggestion.key === row.originalKey
    onChange({ text: suggestion.displayName, ownedText: backToSaved ? null : String(suggestion.quantity) })
  }

  return (
    <div
      data-testid="card-row"
      data-row-id={row.id}
      data-status={valid ? 'valid' : 'invalid'}
      className="flex flex-col gap-space-2 pb-space-6 last:pb-0"
    >
      <div className={ROW_GRID_CLASS}>
        <RowState state={cellState} className="h-9">
          <Input
            ref={quantityInput}
            type="number"
            min={1}
            className={CELL_INPUT_CLASS}
            placeholder="#"
            aria-label={`Quantidade ${where}`}
            {...copiesRelated}
            value={quantityText}
            onChange={(event) => onChange({ quantityText: event.target.value })}
          />
        </RowState>
        <RowState state={cellState} className="h-9">
          <CardCombobox
            className={cn(CELL_INPUT_CLASS, 'text-left')}
            placeholder={TEXT_PLACEHOLDER[category]}
            aria-label={`Carta ${where}`}
            {...copiesRelated}
            value={text}
            suggestions={suggestCards(category, text, decks, owned)}
            onValueChange={changeText}
            onPick={pick}
          />
        </RowState>
        <RowState state={cellState} className="h-9">
          <Input
            type="number"
            min={0}
            className={CELL_INPUT_CLASS}
            placeholder="Adq."
            aria-label={`Adquirido ${where}`}
            {...fieldA11y(ownedInvalid || Boolean(error), Boolean(error))}
            value={ownedText}
            onChange={(event) => onChange({ ownedText: event.target.value })}
          />
        </RowState>
        <Button
          variant="ghost"
          size="icon-lg"
          title="Remover carta"
          className="text-ink-muted"
          aria-label={`Excluir linha ${position} de ${categoryTitle}`}
          onClick={onDelete}
        >
          <Trash2Icon />
        </Button>
      </div>
      {/* Plain template, not cn(): tailwind-merge does not know the text-caption token and would drop it next to a text color. */}
      <p
        className={`flex items-center gap-space-2 pl-0.5 text-caption ${valid ? 'text-secondary' : 'text-danger-soft'}`}
      >
        {valid ? (
          <CheckIcon className="size-3" aria-hidden="true" />
        ) : (
          <CircleAlertIcon className="size-3" aria-hidden="true" />
        )}
        {valid ? 'Linha válida' : 'Linha com pendências'}
      </p>
      {message && (
        <p id={messageId} role={error ? 'alert' : 'status'} className="pl-0.5 text-caption text-danger-soft">
          {message}
        </p>
      )}
    </div>
  )
}
