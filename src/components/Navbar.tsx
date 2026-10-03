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
    <nav className="border-b border-panel-border bg-panel">
      <div className="mx-auto flex max-w-[96rem] flex-wrap items-center gap-1 px-2 py-1.5">
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
