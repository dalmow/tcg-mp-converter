import { useId, useState } from 'react'
import { MenuIcon, XIcon } from 'lucide-react'
import { Link, NavLink } from 'react-router'
import { BackupImportDialog, BackupList, BackupMenu, useBackup } from '@/features/backup'
import { Logomark } from '@/shared/ui/Logomark'
import { MAIN_CONTENT_ID } from '@/shared/layout/mainContent'
import { navLinkClass, sheetRowClass } from './navLinkClass'
import { useMobileSheet } from './useMobileSheet'
import { ConverterIcon, DecksIcon, MaintenanceIcon } from '@/shared/ui/NavIcons'
import { ROUTES } from '@/shared/lib/routes'

const links = [
  { to: ROUTES.decks, label: 'Decks', end: true, Icon: DecksIcon },
  { to: ROUTES.maintenance, label: 'Manutenção', end: false, Icon: MaintenanceIcon },
  { to: ROUTES.converter, label: 'Conversor', end: false, Icon: ConverterIcon },
]

export function Navbar() {
  const [nav, setNav] = useState<HTMLElement | null>(null)
  const { sheetOpen, setSheetOpen, toggle } = useMobileSheet()
  const sheetId = useId()
  const backup = useBackup()
  const menuLabel = sheetOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'

  // The header blur is a 10px one-off: no blur token, and the surface-header token carries the tint.
  return (
    <header className="sticky top-0 z-20 border-b border-border-faint bg-surface-header backdrop-blur-[10px]">
      <nav ref={setNav} aria-label="Principal" className="relative">
        <a
          href={`#${MAIN_CONTENT_ID}`}
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-surface-200 focus:px-3 focus:py-1.5"
        >
          Pular para o conteúdo
        </a>
        <div className="mx-auto flex max-w-page items-center justify-between gap-space-9 px-page-gutter py-space-7">
          <Link
            to={ROUTES.home}
            className="flex items-center gap-space-4 rounded-sm font-display text-wordmark outline-none focus-visible:ring-1 focus-visible:ring-ink-faint"
          >
            <Logomark />
            PTCG Tools
          </Link>
          <div className="hidden items-center gap-space-10 nav:flex">
            {links.map(({ to, label, end, Icon }) => (
              <NavLink key={to} to={to} end={end} className={navLinkClass}>
                <Icon />
                {label}
              </NavLink>
            ))}
          </div>
          <div className="hidden items-center gap-space-5 nav:flex">
            <BackupMenu menuContainer={nav} backup={backup} />
          </div>
          <button
            ref={toggle}
            type="button"
            aria-label={menuLabel}
            title={menuLabel}
            aria-expanded={sheetOpen}
            aria-controls={sheetOpen ? sheetId : undefined}
            onClick={() => setSheetOpen(!sheetOpen)}
            className="inline-flex size-10 cursor-pointer items-center justify-center rounded-md border border-border text-ink outline-none transition-colors hover:border-divider-accent hover:bg-secondary-tint-strong focus-visible:ring-1 focus-visible:ring-ink-faint nav:hidden"
          >
            {sheetOpen ? <XIcon className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
        </div>
        {sheetOpen && (
          <div
            id={sheetId}
            className="absolute inset-x-space-5 top-full mt-space-3 flex flex-col overflow-hidden rounded-4xl border border-border-faint bg-surface-200 shadow-mobile-nav nav:hidden"
          >
            {links.map(({ to, label, end, Icon }) => (
              <NavLink key={to} to={to} end={end} className={sheetRowClass} onClick={() => setSheetOpen(false)}>
                <Icon size={17} />
                {label}
              </NavLink>
            ))}
            <BackupList backup={backup} onAction={() => setSheetOpen(false)} />
          </div>
        )}
        <BackupImportDialog backup={backup} />
      </nav>
    </header>
  )
}
