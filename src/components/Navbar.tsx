import { NavLink } from 'react-router'
import { BackupMenu } from '@/components/BackupMenu'
import { navLinkClass } from '@/components/navLinkClass'
import { ROUTES } from '@/routes'

const links = [
  { to: ROUTES.decks, label: 'Decks', end: true },
  { to: ROUTES.converter, label: 'Conversor', end: false },
  { to: ROUTES.maintenance, label: 'Manutenção', end: false },
]

export function Navbar() {
  return (
    <nav aria-label="Principal" className="border-b border-panel-border bg-panel">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-panel focus:px-3 focus:py-1.5"
      >
        Pular para o conteúdo
      </a>
      <div className="mx-auto flex max-w-[96rem] items-center gap-1 px-2 py-1.5">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => navLinkClass(isActive)}
          >
            {link.label}
          </NavLink>
        ))}
        <BackupMenu />
      </div>
    </nav>
  )
}
