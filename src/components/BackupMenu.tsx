import { useEffect, useRef, useState } from 'react'
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
import { downloadBackup, parseBackup, type BackupSummary } from '@/lib/deck/backup'
import { getDeckStore } from '@/lib/deck/deckStore'
import type { PersistedData } from '@/lib/deck/storage'

type ImportDialogState =
  | { kind: 'confirm'; data: PersistedData; summary: BackupSummary }
  | { kind: 'error'; message: string }

export function BackupMenu() {
  const fileInput = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<ImportDialogState | null>(null)

  const [imported, setImported] = useState(false)

  useEffect(() => {
    if (!imported) return
    const timer = setTimeout(() => setImported(false), 5000)
    return () => clearTimeout(timer)
  }, [imported])

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
        <DropdownMenuTrigger className={navLinkClass(false)}>
          Dados
          <ChevronDownIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-auto">
          <DropdownMenuItem onClick={() => downloadBackup(getDeckStore().getSnapshot())}>
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
      {imported && (
        <span role="status" className="text-sm text-success">
          Backup importado com sucesso
        </span>
      )}
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
                <AlertDialogAction
                  onClick={() => {
                    getDeckStore().replaceAll(pending.data)
                    setImported(true)
                  }}
                >
                  Substituir tudo
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
          {pending?.kind === 'error' && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-danger">
                  Não foi possível importar
                </AlertDialogTitle>
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
