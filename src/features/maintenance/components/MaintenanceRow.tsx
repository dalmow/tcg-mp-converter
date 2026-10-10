import { useState } from 'react'
import { SaveIcon, Trash2Icon } from 'lucide-react'
import { SaveButton } from './ActionButtons'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/ui/AlertDialog'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { ButtonGroup } from '@/shared/ui/ButtonGroup'
import { Input } from '@/shared/ui/Input'
import { RowState, type RowStateName } from '@/shared/ui/RowState'
import { isSatisfied, parseOwnedQuantity } from '@/features/maintenance/lib/maintenance'
import type { MaintenanceEntry } from '@/features/maintenance/lib/maintenance'
import type { Result } from '@/features/decks'

interface MaintenanceRowProps {
  row: MaintenanceEntry
  owned: number
  onSave: (row: MaintenanceEntry, quantity: number) => void
  onDelete: (row: MaintenanceEntry) => Result
}

export function MaintenanceRow({ row, owned, onSave, onDelete }: MaintenanceRowProps) {
  // Unsaved text typed by the user; null means the input follows the stored quantity.
  const [unsavedDraft, setUnsavedDraft] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const satisfied = isSatisfied(row, owned)
  const isUnused = row.decks.length === 0
  const inputId = `owned-${row.key}`

  function save() {
    const quantity = parseOwnedQuantity(unsavedDraft ?? String(owned))
    if (quantity === null) {
      setError('Informe um número inteiro maior ou igual a 0')
      return
    }
    setError(null)
    setUnsavedDraft(null)
    onSave(row, quantity)
  }

  function remove() {
    const result = onDelete(row)
    setDeleteOpen(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setError(null)
  }

  // Unused cards need nothing from the decks, so they are no-op whatever the owned quantity.
  const state: RowStateName = isUnused ? 'noop' : satisfied ? 'complete' : 'pendency'

  return (
    <li data-satisfied={satisfied} className="flex flex-col gap-space-2">
      <RowState state={state} className="flex flex-wrap items-center justify-between gap-space-7 px-4 py-3.5">
        <div className="flex min-w-40 flex-col gap-space-2">
          <span className="text-body-strong">{row.displayName}</span>
          <div className="flex flex-wrap items-center gap-space-2">
            <span className="text-caption text-ink-subtle">Decks:</span>
            {isUnused ? (
              <span className="text-caption text-ink-subtle">nenhum</span>
            ) : (
              row.decks.map((deck) => <Badge key={deck}>{deck}</Badge>)
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-space-5">
          <span className="text-ui whitespace-nowrap text-ink-muted">Precisa: {row.needed}</span>
          <label htmlFor={inputId} className="sr-only">
            Adquirido de {row.displayName}
          </label>
          <Input
            id={inputId}
            type="number"
            min={0}
            inputMode="numeric"
            className="h-9 w-14 px-2 text-center text-ui [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            value={unsavedDraft ?? String(owned)}
            readOnly={isUnused}
            aria-invalid={error !== null}
            onChange={(event) => setUnsavedDraft(event.target.value)}
          />
          <ButtonGroup aria-label={`Ações de ${row.displayName}`}>
            {!isUnused && (
              <SaveButton
                type="button"
                size="icon-lg"
                title="Salvar"
                aria-label={`Salvar ${row.displayName}`}
                onClick={save}
              >
                <SaveIcon />
              </SaveButton>
            )}
            {isUnused && (
              <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogTrigger
                  render={
                    <Button
                      variant="danger"
                      type="button"
                      size="icon-lg"
                      title="Excluir"
                      aria-label={`Excluir ${row.displayName}`}
                    />
                  }
                >
                  <Trash2Icon />
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir carta?</AlertDialogTitle>
                    <AlertDialogDescription className="font-semibold text-danger-soft">
                      {row.displayName} será removida da manutenção.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <Button variant="danger" type="button" onClick={remove}>
                      Confirmar exclusão
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </ButtonGroup>
        </div>
      </RowState>
      {error && (
        <p role="alert" className="text-caption text-danger-soft">
          {error}
        </p>
      )}
    </li>
  )
}
