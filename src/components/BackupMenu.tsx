import { ChevronDownIcon } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useBackup, type Backup } from '@/components/useBackup'

type BackupMenuProps = {
  menuContainer?: HTMLElement | null
  /** Shared controller from the host. Without it the menu owns its own import dialog. */
  backup?: Backup
}

/** Desktop "Dados" dropdown. */
export function BackupMenu({ menuContainer, backup }: BackupMenuProps) {
  const own = useBackup()
  const { exportBackup, chooseFile, dialog } = backup ?? own

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={buttonVariants({
            variant: 'ghost',
            className:
              'h-auto gap-space-2 px-space-6 py-space-3 text-nav-link [&[aria-expanded=true]_svg]:rotate-180',
          })}
        >
          Dados
          <ChevronDownIcon className="size-[13px] transition-transform" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-auto min-w-47 p-space-3" align="end" container={menuContainer}>
          <DropdownMenuItem className="px-space-4 py-space-4 text-nav-link" onClick={exportBackup}>
            Exportar backup
          </DropdownMenuItem>
          <DropdownMenuItem className="px-space-4 py-space-4 text-nav-link" onClick={chooseFile}>
            Importar backup
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {!backup && dialog}
    </>
  )
}

const listActionClass =
  'cursor-pointer text-left text-body text-[#cfc9de] transition-colors hover:text-secondary focus-visible:text-secondary focus-visible:outline-none'

/** Mobile sheet section: the same actions as the dropdown, stacked. */
export function BackupList({ backup, onAction }: { backup: Backup; onAction?: () => void }) {
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
        Exportar backup
      </button>
      <button
        type="button"
        className={listActionClass}
        onClick={() => {
          backup.chooseFile()
          onAction?.()
        }}
      >
        Importar backup
      </button>
    </div>
  )
}
