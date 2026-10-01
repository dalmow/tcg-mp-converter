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
import { getDeckStore } from '@/lib/deck/deckStore'
import type { MaintenanceRow as Row } from '@/lib/deck/maintenance'
import { cn } from '@/lib/utils'

function parseQuantity(text: string): number | null {
  if (!/^\d+$/.test(text.trim())) return null
  return Number(text)
}

export function MaintenanceRow({ row, owned }: { row: Row; owned: number }) {
  const [draft, setDraft] = useState(String(owned))
  const [error, setError] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const satisfied = owned >= row.needed
  const inputId = `owned-${row.key}`

  function save() {
    const quantity = parseQuantity(draft)
    if (quantity === null) {
      setError('Informe um número inteiro maior ou igual a 0')
      return
    }
    setError(null)
    getDeckStore().setOwned(row.key, { displayName: row.displayName, category: row.category, quantity })
  }

  function remove() {
    const result = getDeckStore().deleteOwned(row.key)
    if (result.ok) return
    setDeleteOpen(false)
    setError(result.error)
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
            {row.decks.length === 0 ? 'Decks: 0' : `Decks: ${row.decks.join(', ')}`}
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
        value={draft}
        aria-invalid={error !== null}
        onChange={(event) => setDraft(event.target.value)}
      />
      <SaveButton type="button" onClick={save}>
        Salvar
      </SaveButton>
      {row.decks.length === 0 && (
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
        <p role="alert" className="w-full text-sm text-danger">
          {error}
        </p>
      )}
    </li>
  )
}
