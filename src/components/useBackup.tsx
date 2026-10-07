import { useRef, useState, type ReactNode } from 'react'
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
import { useToast } from '@/components/ui/toast'
import { downloadBackup, parseBackup, type BackupSummary } from '@/lib/deck/backup'
import { getDeckStore } from '@/lib/deck/deckStore'
import type { PersistedData } from '@/lib/deck/storage'

type PendingImport = { data: PersistedData; summary: BackupSummary }

export type Backup = {
  exportBackup: () => void
  chooseFile: () => void
  /** Hidden file input and import confirmation; render it once, wherever the actions live. */
  dialog: ReactNode
}

/** Export/import behavior shared by the desktop "Dados" dropdown and the mobile sheet. */
export function useBackup(): Backup {
  const fileInput = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<PendingImport | null>(null)
  const toast = useToast()

  async function handleFile(file: File) {
    const result = parseBackup(await file.text())
    if (result.ok) setPending({ data: result.data, summary: result.summary })
    else toast.error(result.error)
  }

  const dialog = (
    <>
      <input
        ref={fileInput}
        type="file"
        aria-label="Arquivo de backup"
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
          {pending && (
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
                <AlertDialogAction
                  onClick={() => {
                    getDeckStore().replaceAll(pending.data)
                    setPending(null)
                    toast.success('Backup importado com sucesso')
                  }}
                >
                  Substituir tudo
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </>
  )

  return {
    exportBackup() {
      downloadBackup(getDeckStore().getSnapshot())
      toast.success('Backup exportado')
    },
    chooseFile: () => fileInput.current?.click(),
    dialog,
  }
}
