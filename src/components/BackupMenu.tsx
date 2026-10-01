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
import { navLinkClass } from '@/components/navLinkClass'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/toast'
import { downloadBackup, parseBackup, type BackupSummary } from '@/lib/deck/backup'
import { getDeckStore } from '@/lib/deck/deckStore'
import type { PersistedData } from '@/lib/deck/storage'

type PendingImport = { data: PersistedData; summary: BackupSummary }

export function BackupMenu() {
  const fileInput = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<PendingImport | null>(null)
  const toast = useToast()

  async function handleFile(file: File) {
    const result = parseBackup(await file.text())
    if (result.ok) setPending({ data: result.data, summary: result.summary })
    else toast.error(result.error)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className={navLinkClass(false)}>
          Dados
          <ChevronDownIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-auto">
          <DropdownMenuItem
            onClick={() => {
              downloadBackup(getDeckStore().getSnapshot())
              toast.success('Backup exportado')
            }}
          >
            Exportar backup
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => fileInput.current?.click()}>
            Importar backup
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
}
