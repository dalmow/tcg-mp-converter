import { useState } from 'react'
import { SaveIcon, Trash2Icon } from 'lucide-react'
import { DeleteButton, SaveButton } from '@/components/ActionButtons'
import { Input } from '@/components/ui/input'
import { parseCard } from '@/lib/deck/cardParser'
import type { CardCategory, DeckCard, Result } from '@/lib/deck/types'
import { cn } from '@/lib/utils'
import { CardCombobox } from './CardCombobox'
import { deriveRowState, suggestCards } from './rowLogic'
import type { CardSuggestion, RowContext, RowSave } from './rowLogic'

const TEXT_PLACEHOLDER: Record<CardCategory, string> = {
  pokemon: 'Nome COLEÇÃO número',
  trainer: 'Nome do treinador',
  energy: 'Energia básica ou Nome COLEÇÃO número',
}

interface CardRowProps {
  context: RowContext
  /** The persisted row, or null for a new row that was not saved yet. */
  card: DeckCard | null
  onSave: (save: RowSave) => Result
  onDelete: () => void
}

export function CardRow({ context, card, onSave, onDelete }: CardRowProps) {
  const { category, decks, owned, collections } = context
  const [quantityText, setQuantityText] = useState(card ? String(card.quantity) : '')
  const [text, setText] = useState(card?.displayName ?? '')
  // null = the user has no unsaved edit of the owned field, so it follows the stored owned map
  // (kept in sync with other tabs and Maintenance). A string is an unsaved edit and is never overwritten.
  const [editedOwnedText, setEditedOwnedText] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const ownedText = editedOwnedText ?? (card ? String(owned[card.key]?.quantity ?? 0) : '')
  const originalKey = card?.key ?? null
  const { parsed, quantity, ownedQuantity, quantityError, warning, valid } = deriveRowState(context, {
    card,
    text,
    quantityText,
    ownedText,
  })
  const fieldClass = valid ? 'border-success' : 'border-danger'

  /** Applies a user edit and clears any stale inline error. */
  function applyEdit(update: () => void) {
    update()
    setError(null)
  }

  function changeText(next: string) {
    applyEdit(() => {
      setText(next)
      const nextParsed = parseCard(category, next, collections)
      const nextKey = nextParsed.ok ? nextParsed.card.key : null
      const previousKey = parsed.ok ? parsed.card.key : null
      if (nextKey === previousKey) return
      // A text that resolves to a known key takes its owned quantity from the map.
      if (nextKey !== null && owned[nextKey]) setEditedOwnedText(String(owned[nextKey].quantity))
      else if (previousKey !== null) setEditedOwnedText('')
    })
  }

  function pick(suggestion: CardSuggestion) {
    applyEdit(() => {
      setText(suggestion.displayName)
      setEditedOwnedText(String(suggestion.quantity))
    })
  }

  function save() {
    if (!parsed.ok) return setError(parsed.error)
    if (quantityError) return setError(quantityError)
    if (!Number.isInteger(ownedQuantity)) {
      return setError('Adquirido deve ser um número inteiro maior ou igual a zero')
    }
    const next: DeckCard = {
      category,
      key: parsed.card.key,
      displayName: parsed.card.displayName,
      quantity,
    }
    const result = onSave({
      originalKey,
      card: next,
      ownedEntry: { displayName: next.displayName, category, quantity: ownedQuantity },
    })
    if (result.ok) setEditedOwnedText(null)
    else setError(result.error)
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
          onChange={(event) => applyEdit(() => setQuantityText(event.target.value))}
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
          onChange={(event) => applyEdit(() => setEditedOwnedText(event.target.value))}
        />
        <SaveButton size="icon" aria-label="Salvar linha" onClick={save}>
          <SaveIcon />
        </SaveButton>
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
