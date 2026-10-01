import { NavLink } from 'react-router'
import { ChevronDownIcon } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const links = [
  { to: '/', label: 'Decks', end: true },
  { to: '/converter', label: 'Conversor', end: false },
  { to: '/maintenance', label: 'Manutenção', end: false },
]

export function Navbar() {
  return (
    <nav className="border-b border-panel-border bg-panel">
      <div className="mx-auto flex max-w-6xl items-center gap-1 px-6 py-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              cn(
                buttonVariants({ variant: isActive ? 'secondary' : 'ghost' }),
                'cursor-pointer',
              )
            }
          >
            {link.label}
          </NavLink>
        ))}
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(buttonVariants({ variant: 'ghost' }), 'cursor-pointer')}
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
