import { useState } from 'react'
import { DeleteButton, SaveButton } from '@/components/ActionButtons'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { isSatisfied, parseOwnedQuantity } from '@/lib/deck/maintenance'
import type { MaintenanceEntry } from '@/lib/deck/maintenance'
import type { Result } from '@/lib/deck/types'
import { cn } from '@/lib/utils'

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

  return (
    <li
      data-satisfied={satisfied}
      className={cn(
        'flex flex-wrap items-center gap-3 rounded-lg border border-panel-border px-3 py-2',
        satisfied && 'border-success bg-success/10',
      )}
    >
      <div className="flex min-w-48 flex-1 flex-col gap-1">
        <span className="font-medium">{row.displayName}</span>
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary">
            {isUnused ? 'Decks: 0' : `Decks: ${row.decks.join(', ')}`}
          </Badge>
        </div>
      </div>
      <span className="text-sm">Precisa: {row.needed}</span>
      <label htmlFor={inputId} className="sr-only">
        Adquirido
      </label>
      <Input
        id={inputId}
        type="number"
        min={0}
        inputMode="numeric"
        className="w-20"
        value={unsavedDraft ?? String(owned)}
        aria-invalid={error !== null}
        onChange={(event) => setUnsavedDraft(event.target.value)}
      />
      <SaveButton type="button" onClick={save}>
        Salvar
      </SaveButton>
      {isUnused && (
        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogTrigger render={<DeleteButton type="button" />}>Excluir</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir carta?</AlertDialogTitle>
              <AlertDialogDescription>
                {row.displayName} será removida da manutenção.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <DeleteButton type="button" onClick={remove}>
                Confirmar exclusão
              </DeleteButton>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      {error && (
        <p role="alert" className="w-full text-sm text-danger-text">
          {error}
        </p>
      )}
    </li>
  )
}
