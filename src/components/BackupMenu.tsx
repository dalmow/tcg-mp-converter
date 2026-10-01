import { useRef, useState } from 'react'
import { ChevronDownIcon } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { buildBackup, parseBackup, type BackupSummary } from '@/lib/deck/backup'
import { getDeckStore } from '@/lib/deck/deckStore'
import type { PersistedData } from '@/lib/deck/storage'

type Pending =
  | { kind: 'confirm'; data: PersistedData; summary: BackupSummary }
  | { kind: 'error'; message: string }

function downloadBackup() {
  const backup = buildBackup(getDeckStore().getSnapshot())
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `ptcg-backup-${backup.exportedAt.slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
}

export function BackupMenu() {
  const fileInput = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<Pending | null>(null)

  async function handleFile(file: File) {
    const result = parseBackup(await file.text())
    setPending(
      result.ok
        ? { kind: 'confirm', data: result.data, summary: result.summary }
        : { kind: 'error', message: result.error },
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className={buttonVariants({ variant: 'ghost' })}>
          Dados
          <ChevronDownIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-auto">
          <DropdownMenuItem onClick={downloadBackup}>Exportar backup</DropdownMenuItem>
          <DropdownMenuItem onClick={() => fileInput.current?.click()}>
            Importar backup
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <input
        ref={fileInput}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          if (file) void handleFile(file)
        }}
      />
      <AlertDialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent>
          {pending?.kind === 'confirm' && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>Importar backup</AlertDialogTitle>
                <AlertDialogDescription>
                  O backup contém {pending.summary.deckCount} deck(s) e {pending.summary.ownedCount}{' '}
                  carta(s) adquirida(s). Todos os dados atuais serão substituídos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => getDeckStore().replaceAll(pending.data)}>
                  Substituir tudo
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
          {pending?.kind === 'error' && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>Não foi possível importar</AlertDialogTitle>
                <AlertDialogDescription>{pending.message}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Fechar</AlertDialogCancel>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
