import { useRef, useState } from 'react'
import type { RefObject } from 'react'
import { useToast } from '@/shared/hooks/useToast'
import { downloadBackup, parseBackup, type BackupSummary } from '@/features/backup/lib/backup'
import { getDeckStore } from '@/features/decks'
import type { PersistedData } from '@/features/decks'

type PendingImport = { data: PersistedData; summary: BackupSummary }

export type Backup = {
  exportBackup: () => void
  chooseFile: () => void
  /** The hidden file input that `chooseFile` clicks. Rendered by `BackupImportDialog`. */
  fileInput: RefObject<HTMLInputElement | null>
  /** Parsed file waiting for the user to confirm the replacement. */
  pendingImport: PendingImport | null
  readFile: (file: File) => Promise<void>
  confirmImport: () => void
  cancelImport: () => void
}

/** Export/import state and actions shared by the desktop "Dados" dropdown and the mobile sheet. */
export function useBackup(): Backup {
  const fileInput = useRef<HTMLInputElement>(null)
  const [pendingImport, setPendingImport] = useState<PendingImport | null>(null)
  const toast = useToast()

  async function readFile(file: File) {
    const result = parseBackup(await file.text())
    if (result.ok) setPendingImport({ data: result.data, summary: result.summary })
    else toast.error(result.error)
  }

  function confirmImport() {
    if (!pendingImport) return
    getDeckStore().replaceAll(pendingImport.data)
    setPendingImport(null)
    toast.success('Backup importado com sucesso')
  }

  return {
    exportBackup() {
      downloadBackup(getDeckStore().getSnapshot())
      toast.success('Backup exportado')
    },
    chooseFile: () => fileInput.current?.click(),
    fileInput,
    pendingImport,
    readFile,
    confirmImport,
    cancelImport: () => setPendingImport(null),
  }
}
