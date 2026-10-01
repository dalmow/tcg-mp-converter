import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Trash2Icon } from 'lucide-react'
import { DeleteButton } from '@/components/ActionButtons'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import collections from '@/data/collections.json'
import { getDeckStore, useDeckData } from '@/lib/deck/deckStore'
import { CARD_CATEGORIES } from '@/lib/deck/types'
import type { CardCategory, Deck, Result } from '@/lib/deck/types'
import { ROUTES } from '@/routes'
import { CategoryPanel } from './CategoryPanel'
import { applyRowSave } from './rowLogic'
import type { RowSave } from './rowLogic'

const PANEL_TITLE: Record<CardCategory, string> = {
  pokemon: 'Pokémon',
  trainer: 'Treinadores',
  energy: 'Energias',
}

const NAME_REQUIRED = 'Informe o nome do deck'

interface Draft {
  id: string
  category: CardCategory
}

/** Create and edit share this panel; `deckId` is absent on `/decks/new`. */
export function DeckEditor({ deckId }: { deckId?: string }) {
  const navigate = useNavigate()
  const toast = useToast()
  const { decks, owned } = useDeckData()
  // A new deck gets its id up front but only reaches storage when its first row is saved.
  const [newDeckId] = useState(() => crypto.randomUUID())
  const id = deckId ?? newDeckId
  const stored = decks.find((deck) => deck.id === id)
  const deck: Deck = stored ?? { id, name: '', cards: [] }

  const [name, setName] = useState(stored?.name ?? '')
  const [nameError, setNameError] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Draft[]>([])

  function commitName() {
    if (!stored || name.trim() === stored.name) return
    if (!name.trim()) {
      // The stored name stays; show the error and put it back in the input.
      setName(stored.name)
      return setNameError(NAME_REQUIRED)
    }
    getDeckStore().saveDeck({ ...stored, name: name.trim() })
    toast.success('Nome do deck salvo')
  }

  function removeDraft(draftId: string) {
    setDrafts((current) => current.filter((draft) => draft.id !== draftId))
  }

  function saveRow({ originalKey, card, ownedEntry, draftId }: RowSave): Result {
    const trimmedName = name.trim()
    if (!trimmedName) {
      setNameError(NAME_REQUIRED)
      return { ok: false, error: NAME_REQUIRED }
    }
    const result = applyRowSave({ ...deck, name: trimmedName }, originalKey, card)
    if (!result.ok) return result
    getDeckStore().saveDeck(result.deck, { [card.key]: ownedEntry })
    toast.success('Carta salva')
    setNameError(null)
    if (draftId) removeDraft(draftId)
    return { ok: true }
  }

  function deleteRow(key: string) {
    getDeckStore().saveDeck({ ...deck, cards: deck.cards.filter((card) => card.key !== key) })
    toast.success('Carta removida do deck')
  }

  function deleteDeck() {
    if (stored) {
      getDeckStore().deleteDeck(id)
      toast.success('Deck excluído')
    }
    navigate(ROUTES.decks)
  }

  // `/decks/:id` for an id that is not in storage must not create a deck under that id.
  if (deckId && !stored) {
    return (
      <div className="flex flex-col items-start gap-2">
        <p>Deck não encontrado</p>
        <Link to={ROUTES.decks} className="text-primary underline">
          Voltar para os decks
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-start gap-2">
        <div className="flex flex-1 flex-col gap-1">
          <Input
            placeholder="Nome do deck"
            aria-label="Nome do deck"
            aria-invalid={nameError ? true : undefined}
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              setNameError(null)
            }}
            onBlur={commitName}
            onKeyDown={(event) => {
              if (event.key === 'Enter') commitName()
            }}
          />
          {nameError && (
            <p role="alert" className="text-xs text-danger">
              {nameError}
            </p>
          )}
        </div>
        <AlertDialog>
          <AlertDialogTrigger render={<DeleteButton />}>
            <Trash2Icon />
            Excluir deck
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir deck?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. A quantidade adquirida das cartas é mantida.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={deleteDeck}>Excluir</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {CARD_CATEGORIES.map((category) => (
          <CategoryPanel
            key={category}
            title={PANEL_TITLE[category]}
            context={{ category, deck, decks, owned, collections }}
            draftIds={drafts.filter((draft) => draft.category === category).map((draft) => draft.id)}
            onAddDraft={() => setDrafts((current) => [...current, { id: crypto.randomUUID(), category }])}
            onDiscardDraft={removeDraft}
            onSaveRow={saveRow}
            onDeleteRow={deleteRow}
          />
        ))}
      </div>
    </>
  )
}
