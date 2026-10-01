import { useState } from 'react'
import { SaveIcon, Trash2Icon } from 'lucide-react'
import { DeleteButton, SaveButton } from '@/components/ActionButtons'
import { Input } from '@/components/ui/input'
import { parseCard } from '@/lib/deck/cardParser'
import { validateQuantity } from '@/lib/deck/deckRules'
import type { CardCategory, Deck, DeckCard, OwnedEntry, OwnedMap, Result } from '@/lib/deck/types'
import type { CollectionConfig } from '@/lib/types'
import { cn } from '@/lib/utils'
import { CardCombobox } from './CardCombobox'
import {
  copiesAfterEdit,
  copiesWarning,
  parseIntegerText,
  parseOwnedText,
  suggestCards,
} from './cardRows'
import type { CardSuggestion } from './cardRows'

const TEXT_PLACEHOLDER: Record<CardCategory, string> = {
  pokemon: 'Nome COLEÇÃO número',
  trainer: 'Nome do treinador',
  energy: 'Energia básica ou Nome COLEÇÃO número',
}

interface CardRowProps {
  category: CardCategory
  /** The persisted row, or null for a new row that was not saved yet. */
  card: DeckCard | null
  deck: Deck
  decks: Deck[]
  owned: OwnedMap
  collections: CollectionConfig
  onSave: (originalKey: string | null, card: DeckCard, ownedEntry: OwnedEntry) => Result
  onDelete: () => void
}

function initialOwnedText(card: DeckCard | null, owned: OwnedMap): string {
  return card ? String(owned[card.key]?.quantity ?? 0) : ''
}

export function CardRow({ category, card, deck, decks, owned, collections, onSave, onDelete }: CardRowProps) {
  const [quantityText, setQuantityText] = useState(card ? String(card.quantity) : '')
  const [text, setText] = useState(card?.displayName ?? '')
  const [ownedInput, setOwnedInput] = useState(initialOwnedText(card, owned))
  const [error, setError] = useState<string | null>(null)

  const originalKey = card?.key ?? null
  const parsed = parseCard(category, text, collections)
  const quantity = parseIntegerText(quantityText)
  const ownedQuantity = parseOwnedText(ownedInput)

  const quantityError = validateQuantity(deck, originalKey ?? '', quantity)
  const warning =
    parsed.ok && Number.isInteger(quantity)
      ? copiesWarning(parsed.card, copiesAfterEdit(deck, originalKey, { parsed: parsed.card, quantity }, collections))
      : null
  const valid =
    parsed.ok && !quantityError && Number.isInteger(ownedQuantity) && ownedQuantity >= quantity && !warning
  const fieldClass = valid ? 'border-success' : 'border-danger'

  function edit(update: () => void) {
    update()
    setError(null)
  }

  function changeText(next: string) {
    edit(() => {
      setText(next)
      const nextParsed = parseCard(category, next, collections)
      const nextKey = nextParsed.ok ? nextParsed.card.key : null
      const previousKey = parsed.ok ? parsed.card.key : null
      if (nextKey === previousKey) return
      // A text that resolves to a known key takes its owned quantity from the map.
      if (nextKey !== null && owned[nextKey]) setOwnedInput(String(owned[nextKey].quantity))
      else if (previousKey !== null) setOwnedInput('')
    })
  }

  function pick(suggestion: CardSuggestion) {
    edit(() => {
      setText(suggestion.displayName)
      setOwnedInput(String(suggestion.quantity))
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
    const result = onSave(originalKey, next, {
      displayName: next.displayName,
      category,
      quantity: ownedQuantity,
    })
    if (!result.ok) setError(result.error)
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
          onChange={(event) => edit(() => setQuantityText(event.target.value))}
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
          value={ownedInput}
          onChange={(event) => edit(() => setOwnedInput(event.target.value))}
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
