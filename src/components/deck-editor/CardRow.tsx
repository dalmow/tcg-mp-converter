import { useEffect, useId, useRef } from 'react'
import { CheckIcon, CircleAlertIcon, Trash2Icon } from 'lucide-react'
import { DeleteButton } from '@/components/ActionButtons'
import { Input } from '@/components/ui/input'
import { parseCard } from '@/lib/deck/cardParser'
import type { CardCategory } from '@/lib/deck/types'
import { cn } from '@/lib/utils'
import { CardCombobox } from './CardCombobox'
import { deriveRowState, suggestCards } from './rowLogic'
import type { DraftRow } from './draft'
import type { CardSuggestion, RowContext } from './rowLogic'

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

export function CardRow({ context, position, categoryTitle, row, error, focusOnMount, onChange, onDelete }: CardRowProps) {
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
  const { parsed, warning, valid } = deriveRowState(context, { text, quantityText, ownedText })
  const fieldClass = valid ? 'border-success' : 'border-danger'
  const message = error ?? warning
  const where = `da linha ${position} de ${categoryTitle}`
  const fieldA11y = {
    'aria-invalid': message ? true : undefined,
    'aria-describedby': message ? messageId : undefined,
  } as const

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
      className="flex flex-col gap-1"
    >
      <div className="flex items-center gap-2">
        <Input
          ref={quantityInput}
          type="number"
          min={1}
          className={cn('w-16 shrink-0', fieldClass)}
          placeholder="#"
          aria-label={`Quantidade ${where}`}
          {...fieldA11y}
          value={quantityText}
          onChange={(event) => onChange({ quantityText: event.target.value })}
        />
        <div className="min-w-0 flex-1">
          <CardCombobox
            className={fieldClass}
            placeholder={TEXT_PLACEHOLDER[category]}
            aria-label={`Carta ${where}`}
            {...fieldA11y}
            value={text}
            suggestions={suggestCards(category, text, decks, owned)}
            onValueChange={changeText}
            onPick={pick}
          />
        </div>
        <Input
          type="number"
          min={0}
          className={cn('w-16 shrink-0', fieldClass)}
          placeholder="Adq."
          aria-label={`Adquirido ${where}`}
          {...fieldA11y}
          value={ownedText}
          onChange={(event) => onChange({ ownedText: event.target.value })}
        />
        <DeleteButton size="icon" aria-label={`Excluir linha ${position} de ${categoryTitle}`} onClick={onDelete}>
          <Trash2Icon />
        </DeleteButton>
      </div>
      <p className={cn('flex items-center gap-1 text-xs', valid ? 'text-success' : 'text-danger')}>
        {valid ? <CheckIcon className="size-3" aria-hidden="true" /> : <CircleAlertIcon className="size-3" aria-hidden="true" />}
        {valid ? 'Linha válida' : 'Linha com pendências'}
      </p>
      {message && (
        <p id={messageId} role={error ? 'alert' : 'status'} className="text-xs text-danger">
          {message}
        </p>
      )}
    </div>
  )
}
