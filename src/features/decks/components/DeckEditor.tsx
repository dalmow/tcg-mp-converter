import { useEffect, useId, useRef, useState } from 'react'
import { Link, useBlocker, useNavigate } from 'react-router'
import { ChevronLeftIcon, SaveIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { ButtonGroup } from '@/shared/ui/ButtonGroup'
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { Input } from '@/shared/ui/Input'
import { PAGE_TITLE_CLASS } from '@/shared/layout/PageLayout'
import { ProgressBar } from '@/shared/ui/ProgressBar'
import { buttonVariants } from '@/shared/ui/buttonVariants'
import { useToast } from '@/shared/hooks/useToast'
import collections from '@/shared/data/collections.json'
import { getDeckStore, useDeckData } from '@/features/decks/lib/deckStore'
import { CARD_CATEGORIES, CATEGORY_TITLES, DECK_SIZE } from '@/features/decks/types/deck'
import { deckEditorMeta } from '@/shared/lib/pageMeta'
import { usePageMeta } from '@/shared/hooks/usePageMeta'
import type { CardCategory } from '@/features/decks/types/deck'
import { deckPath, ROUTES } from '@/shared/lib/routes'
import { CategoryPanel } from './CategoryPanel'
import { buildDeckSave, draftTotalQuantity, isDirty, newRow, rowsFromDeck } from '@/features/decks/lib/draft'
import type { DraftRow } from '@/features/decks/lib/draft'

const BACK_TO_DECKS_LABEL = 'Voltar para Meus decks'

/** Create and edit share this panel; `deckId` is absent on `/decks/new`. */
export function DeckEditor({ deckId }: { deckId?: string }) {
  const navigate = useNavigate()
  const nameErrorId = useId()
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
  const [rows, setRows] = useState<DraftRow[]>(() => (initial ? rowsFromDeck(initial) : CARD_CATEGORIES.map(newRow)))
  const [nameError, setNameError] = useState<string | null>(null)
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({})
  const [focusRowId, setFocusRowId] = useState<string | null>(null)

  const dirty = isDirty(name, rows, stored)
  usePageMeta(deckEditorMeta(deckId, initial && (stored?.name ?? initial.name)))
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

  function appendRow(category: CardCategory) {
    const row = newRow(category)
    setRows((current) => [...current, row])
    setFocusRowId(row.id)
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
        <h1 className="sr-only">Editar deck</h1>
        <p>Deck não encontrado</p>
        <Link to={ROUTES.decks} className="text-secondary underline">
          Voltar para os decks
        </Link>
      </div>
    )
  }

  return (
    <>
      {stored && (
        <div className="flex items-center gap-space-4">
          <Link
            to={ROUTES.decks}
            title={BACK_TO_DECKS_LABEL}
            aria-label={BACK_TO_DECKS_LABEL}
            className={buttonVariants({ variant: 'ghost', size: 'icon-sm', className: 'text-ink-muted' })}
          >
            <ChevronLeftIcon aria-hidden />
          </Link>
          <h1 className={PAGE_TITLE_CLASS}>Editando deck {stored.name}</h1>
        </div>
      )}
      <div className="flex flex-wrap items-start gap-space-6">
        <div className="flex min-w-55 flex-1 flex-col gap-space-2">
          <Input
            className="h-11 px-4 text-body-strong"
            placeholder="Nome do deck"
            aria-label="Nome do deck"
            aria-invalid={nameError ? true : undefined}
            aria-describedby={nameError ? nameErrorId : undefined}
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              setNameError(null)
            }}
          />
          {nameError && (
            <p id={nameErrorId} role="alert" className="text-caption text-danger-soft">
              {nameError}
            </p>
          )}
        </div>
        <ButtonGroup aria-label="Ações do deck" className="h-11 shrink-0">
          <Button size="icon" title="Salvar deck" aria-label="Salvar deck" className="w-11" onClick={saveDeck}>
            <SaveIcon className="size-4.5" />
          </Button>
          <ConfirmDialog
            trigger={
              <Button variant="danger" size="icon" title="Excluir deck" aria-label="Excluir deck" className="w-11">
                <Trash2Icon className="size-4.5" />
              </Button>
            }
            title="Excluir deck?"
            info="A quantidade adquirida das cartas é mantida."
            warning="Esta ação não pode ser desfeita."
            confirmLabel="Excluir"
            onConfirm={deleteDeck}
          />
        </ButtonGroup>
      </div>
      <ProgressBar
        label="Progresso do deck"
        value={draftTotalQuantity(rows, collections)}
        max={DECK_SIZE}
        suffix="cartas"
      />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] items-start gap-space-8">
        {CARD_CATEGORIES.map((category) => (
          <CategoryPanel
            key={category}
            title={CATEGORY_TITLES[category]}
            category={category}
            rows={rows}
            rowErrors={rowErrors}
            decks={decks}
            owned={owned}
            collections={collections}
            focusRowId={focusRowId}
            onAddRow={() => appendRow(category)}
            onChangeRow={changeRow}
            onDeleteRow={deleteRow}
          />
        ))}
      </div>
      <ConfirmDialog
        open={blocker.state === 'blocked'}
        onOpenChange={(open) => {
          if (!open) blocker.reset?.()
        }}
        title="Descartar alterações?"
        info="Há alterações não salvas neste deck."
        warning="Se sair agora, elas serão perdidas."
        cancelLabel="Continuar editando"
        confirmLabel="Descartar"
        onConfirm={() => blocker.proceed?.()}
      />
    </>
  )
}
