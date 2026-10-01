import { useEffect, useRef, useState } from 'react'
import { Link, useBlocker, useNavigate } from 'react-router'
import { SaveIcon, Trash2Icon } from 'lucide-react'
import { DeleteButton, SaveButton } from '@/components/ActionButtons'
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
import type { CardCategory } from '@/lib/deck/types'
import { deckPath, ROUTES } from '@/routes'
import { CategoryPanel } from './CategoryPanel'
import { buildDeckSave, isDirty, newRow, rowsFromDeck } from './draft'
import type { DraftRow } from './draft'

const PANEL_TITLE: Record<CardCategory, string> = {
  pokemon: 'Pokémon',
  trainer: 'Treinadores',
  energy: 'Energias',
}

/** Create and edit share this panel; `deckId` is absent on `/decks/new`. */
export function DeckEditor({ deckId }: { deckId?: string }) {
  const navigate = useNavigate()
  const toast = useToast()
  const { decks, owned } = useDeckData()
  // A new deck gets its id up front but only reaches storage on its first Save.
  const [newDeckId] = useState(() => crypto.randomUUID())
  const id = deckId ?? newDeckId
  const stored = decks.find((deck) => deck.id === id)
  // The deck as it was when the editor opened: seeds the draft and tells "not found" from "deleted elsewhere".
  const [initial] = useState(stored)

  // The draft: everything edited here stays in memory until Save deck commits it in one go.
  const [name, setName] = useState(initial?.name ?? '')
  const [rows, setRows] = useState<DraftRow[]>(() => (initial ? rowsFromDeck(initial) : []))
  const [nameError, setNameError] = useState<string | null>(null)
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({})

  const dirty = isDirty(name, rows, stored)
  // Set right before an intentional navigation (after saving or deleting), which must not prompt.
  const leavingRef = useRef(false)
  const blocker = useBlocker(() => dirty && !leavingRef.current)

  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  function changeRow(rowId: string, patch: Partial<DraftRow>) {
    setRows((current) => current.map((row) => (row.id === rowId ? { ...row, ...patch } : row)))
    setRowErrors(({ [rowId]: _cleared, ...rest }) => rest)
  }

  function deleteRow(rowId: string) {
    setRows((current) => current.filter((row) => row.id !== rowId))
  }

  function saveDeck() {
    const result = buildDeckSave({ id, name, rows }, owned, collections)
    if (!result.ok) {
      setNameError(result.nameError)
      setRowErrors(result.rowErrors)
      return
    }
    getDeckStore().saveDeck(result.deck, result.owned)
    setNameError(null)
    setRowErrors({})
    setName(result.deck.name)
    setRows(rowsFromDeck(result.deck))
    toast.success('Deck salvo')
    if (!deckId) {
      leavingRef.current = true
      navigate(deckPath(id), { replace: true })
    }
  }

  function deleteDeck() {
    leavingRef.current = true
    if (stored) {
      getDeckStore().deleteDeck(id)
      toast.success('Deck excluído')
    }
    navigate(ROUTES.decks)
  }

  // `/decks/:id` for an id that is not in storage must not create a deck under that id.
  if (deckId && !initial) {
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
          />
          {nameError && (
            <p role="alert" className="text-xs text-danger">
              {nameError}
            </p>
          )}
        </div>
        <div role="group" aria-label="Ações do deck" className="flex">
          <SaveButton className="rounded-r-none" onClick={saveDeck}>
            <SaveIcon />
            Salvar deck
          </SaveButton>
          <AlertDialog>
            <AlertDialogTrigger render={<DeleteButton className="rounded-l-none border-l border-l-background/40" />}>
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
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {CARD_CATEGORIES.map((category) => (
          <CategoryPanel
            key={category}
            title={PANEL_TITLE[category]}
            category={category}
            rows={rows}
            rowErrors={rowErrors}
            decks={decks}
            owned={owned}
            collections={collections}
            onAddRow={() => setRows((current) => [...current, newRow(category)])}
            onChangeRow={changeRow}
            onDeleteRow={deleteRow}
          />
        ))}
      </div>
      <AlertDialog open={blocker.state === 'blocked'}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Descartar alterações?</AlertDialogTitle>
            <AlertDialogDescription>
              Há alterações não salvas neste deck. Se sair agora, elas serão perdidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => blocker.reset?.()}>Continuar editando</AlertDialogCancel>
            <AlertDialogAction onClick={() => blocker.proceed?.()}>Descartar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
