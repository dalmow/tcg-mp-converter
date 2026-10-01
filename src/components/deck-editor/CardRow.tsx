import { Trash2Icon } from 'lucide-react'
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
  row: DraftRow
  /** Blocking error reported by the last failed save of the deck, shown on this row. */
  error: string | null
  onChange: (patch: Partial<DraftRow>) => void
  onDelete: () => void
}

export function CardRow({ context, row, error, onChange, onDelete }: CardRowProps) {
  const { category, decks, owned, collections } = context
  const { quantityText, text } = row
  // A null owned edit follows the stored owned map; a string is an unsaved edit of this draft.
  const ownedText = row.ownedText ?? (row.originalKey ? String(owned[row.originalKey]?.quantity ?? 0) : '')
  const { parsed, warning, valid } = deriveRowState(context, { text, quantityText, ownedText })
  const fieldClass = valid ? 'border-success' : 'border-danger'

  function changeText(next: string) {
    const nextParsed = parseCard(category, next, collections)
    const nextKey = nextParsed.ok ? nextParsed.card.key : null
    const previousKey = parsed.ok ? parsed.card.key : null
    const patch: Partial<DraftRow> = { text: next }
    if (nextKey !== previousKey) {
      // A text that resolves to a known key takes its owned quantity from the map.
      if (nextKey !== null && owned[nextKey]) patch.ownedText = String(owned[nextKey].quantity)
      else if (previousKey !== null) patch.ownedText = ''
    }
    onChange(patch)
  }

  function pick(suggestion: CardSuggestion) {
    onChange({ text: suggestion.displayName, ownedText: String(suggestion.quantity) })
  }

  return (
    <div data-testid="card-row" data-status={valid ? 'valid' : 'invalid'} className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={1}
          className={cn('w-16 shrink-0', fieldClass)}
          placeholder="Qtd"
          aria-label="Quantidade"
          value={quantityText}
          onChange={(event) => onChange({ quantityText: event.target.value })}
        />
        <div className="min-w-0 flex-1">
          <CardCombobox
            className={fieldClass}
            placeholder={TEXT_PLACEHOLDER[category]}
            aria-label="Carta"
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
          aria-label="Adquirido"
          value={ownedText}
          onChange={(event) => onChange({ ownedText: event.target.value })}
        />
        <DeleteButton size="icon" aria-label="Excluir linha" onClick={onDelete}>
          <Trash2Icon />
        </DeleteButton>
      </div>
      {(error ?? warning) && (
        <p role={error ? 'alert' : undefined} className="text-xs text-danger">
          {error ?? warning}
        </p>
      )}
    </div>
  )
}
