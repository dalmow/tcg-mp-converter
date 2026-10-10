import { ChevronDownIcon } from 'lucide-react'
import { buttonVariants } from '@/shared/ui/buttonVariants'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/ui/DropdownMenu'
import type { Backup } from '@/features/backup/hooks/useBackup'
import { EXPORT_BACKUP_LABEL, IMPORT_BACKUP_LABEL } from '@/features/backup/labels'

type BackupActions = Pick<Backup, 'exportBackup' | 'chooseFile'>

type BackupMenuProps = {
  menuContainer?: HTMLElement | null
  backup: BackupActions
}

/** Desktop "Dados" dropdown. */
export function BackupMenu({ menuContainer, backup }: BackupMenuProps) {
  const { exportBackup, chooseFile } = backup

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={buttonVariants({
            variant: 'ghost',
            className: 'h-auto gap-space-2 px-space-6 py-space-3 text-nav-link [&[aria-expanded=true]_svg]:rotate-180',
          })}
        >
          Dados
          <ChevronDownIcon className="size-3.25 transition-transform" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-auto min-w-47 p-space-3" align="end" container={menuContainer}>
          <DropdownMenuItem className="px-space-4 py-space-4 text-nav-link" onClick={exportBackup}>
            {EXPORT_BACKUP_LABEL}
          </DropdownMenuItem>
          <DropdownMenuItem className="px-space-4 py-space-4 text-nav-link" onClick={chooseFile}>
            {IMPORT_BACKUP_LABEL}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

const listActionClass =
  'cursor-pointer text-left text-body text-ink-soft transition-colors hover:text-secondary focus-visible:text-secondary focus-visible:outline-none'

/** Mobile sheet section: the same actions as the dropdown, stacked. */
export function BackupList({ backup, onAction }: { backup: BackupActions; onAction?: () => void }) {
  return (
    <div className="flex flex-col gap-space-4 px-space-8 py-space-7">
      <span className="text-eyebrow uppercase text-ink-faint">Dados</span>
      <button
        type="button"
        className={listActionClass}
        onClick={() => {
          backup.exportBackup()
          onAction?.()
        }}
      >
        {EXPORT_BACKUP_LABEL}
      </button>
      <button
        type="button"
        className={listActionClass}
        onClick={() => {
          backup.chooseFile()
          onAction?.()
        }}
      >
        {IMPORT_BACKUP_LABEL}
      </button>
    </div>
  )
}
