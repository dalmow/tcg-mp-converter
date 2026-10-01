import { NavLink } from 'react-router'
import { BackupMenu } from '@/components/BackupMenu'
import { buttonVariants } from '@/components/ui/button'
import { ROUTES } from '@/routes'

const links = [
  { to: ROUTES.decks, label: 'Decks', end: true },
  { to: ROUTES.converter, label: 'Conversor', end: false },
  { to: ROUTES.maintenance, label: 'Manutenção', end: false },
]

const navLinkClass = (isActive: boolean) =>
  buttonVariants({ variant: isActive ? 'secondary' : 'ghost' })

export function Navbar() {
  return (
    <nav className="border-b border-panel-border bg-panel">
      <div className="mx-auto flex max-w-6xl items-center gap-1 px-6 py-2">
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
