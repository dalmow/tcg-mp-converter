import { ConfirmDialog } from '@/shared/ui/ConfirmDialog'
import type { Backup } from '@/features/backup/hooks/useBackup'
import { IMPORT_BACKUP_LABEL } from '@/features/backup/labels'

/** Hidden file input and import confirmation. Render it once per page: it owns the input `chooseFile` clicks. */
export function BackupImportDialog({ backup }: { backup: Backup }) {
  const { fileInput, pendingImport, readFile, confirmImport, cancelImport } = backup
  const summary = pendingImport?.summary

  return (
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
          if (file) void readFile(file)
        }}
      />
      <ConfirmDialog
        open={pendingImport !== null}
        onOpenChange={(open) => !open && cancelImport()}
        title={IMPORT_BACKUP_LABEL}
        info={summary && `O backup contém ${summary.deckCount} deck(s) e ${summary.ownedCount} carta(s) adquirida(s).`}
        warning="Todos os dados atuais serão substituídos."
        confirmLabel="Substituir tudo"
        onConfirm={confirmImport}
      />
    </>
  )
}
