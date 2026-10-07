import { CircleAlert, CircleCheck, Plus } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { PAGE_META } from '@/lib/pageMeta'
import { useHydrated } from '@/lib/useHydrated'
import { usePageMeta } from '@/lib/usePageMeta'
import { PageLayout } from '@/components/PageLayout'
import { Panel } from '@/components/Panel'
import collections from '@/data/collections.json'
import { validateDeck } from '@/lib/deck/deckRules'
import { useDeckData } from '@/lib/deck/deckStore'
import { DECK_SIZE, type Deck, type OwnedMap } from '@/lib/deck/types'
import { cn } from '@/lib/utils'
import { deckPath, ROUTES } from '@/routes'

const DECKS_SUBTITLE =
  'Organize suas 60 cartas por Pokémon, Treinador e Energia — e veja de cara o que ainda falta fechar.'

const DECK_TILE_CLASS =
  'min-h-32 gap-space-10 px-(--card-spacing) [--card-spacing:22px] transition-colors hover:border-secondary-border-soft'

function DeckTile({
  to,
  label,
  className,
  children,
}: {
  to: string
  label?: string
  className?: string
  children: ReactNode
}) {
  return (
    <Link to={to} aria-label={label} className="block rounded-2xl focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none">
      <Panel className={cn('h-full', DECK_TILE_CLASS, className)}>{children}</Panel>
    </Link>
  )
}

function DeckBlock({ deck, owned }: { deck: Deck; owned: OwnedMap }) {
  const validation = validateDeck(deck, owned, collections)
  const percent = Math.min(100, (validation.total / DECK_SIZE) * 100)

  return (
    <DeckTile to={deckPath(deck.id)} className="justify-between">
      <div className="flex items-start justify-between gap-space-5">
        <span className="text-h2 tracking-[0.01em] break-words uppercase">{deck.name}</span>
        {validation.valid ? (
          <CircleCheck role="img" aria-label="Deck válido" className="size-[18px] shrink-0 text-secondary" />
        ) : (
          <CircleAlert role="img" aria-label="Deck inválido" className="size-[18px] shrink-0 text-danger" />
        )}
      </div>
      <div className="flex flex-col gap-space-3">
        {validation.missingMessage && <span className="text-caption text-danger-soft">{validation.missingMessage}</span>}
        <div className="flex items-center gap-space-4">
          <div aria-hidden className="h-1.5 flex-1 overflow-hidden rounded-pill bg-border-faint">
            <div className="h-full rounded-pill bg-linear-to-r from-danger to-primary" style={{ width: `${percent}%` }} />
          </div>
          <span className="shrink-0 text-caption font-bold text-ink-muted">
            {validation.total}/{DECK_SIZE}
          </span>
        </div>
      </div>
    </DeckTile>
  )
}

export default function DeckListPage() {
  usePageMeta(PAGE_META.decks)
  const { decks, owned } = useDeckData()
  // Decks live in localStorage, so the prerendered page has none; rendering the grid only once
  // hydrated avoids pushing already painted tiles around (layout shift) when the stored decks appear.
  const hydrated = useHydrated()

  return (
    <PageLayout title="Meus decks" subtitle={DECKS_SUBTITLE}>
      {hydrated && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-[18px] min-[761px]:grid-cols-[repeat(3,280px)] min-[761px]:justify-start">
          {decks.map((deck) => (
            <DeckBlock key={deck.id} deck={deck} owned={owned} />
          ))}
          <DeckTile to={ROUTES.newDeck} label="Novo deck" className="items-center justify-center">
            <Plus aria-hidden className="size-8 text-ink-muted" />
          </DeckTile>
        </div>
      )}
    </PageLayout>
  )
}
