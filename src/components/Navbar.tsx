import { NavLink } from 'react-router'
import { ChevronDownIcon } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
        <DropdownMenu>
          <DropdownMenuTrigger
            className={navLinkClass(false)}
          >
            Dados
            <ChevronDownIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-auto">
            {/* Wired in a later issue (backup export/import). */}
            <DropdownMenuItem>Exportar backup</DropdownMenuItem>
            <DropdownMenuItem>Importar backup</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}
