import { CircleAlert, CircleCheck, Plus } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { PAGE_META } from '@/shared/lib/pageMeta'
import { useHydrated } from '@/shared/hooks/useHydrated'
import { usePageMeta } from '@/shared/hooks/usePageMeta'
import { PageLayout } from '@/shared/layout/PageLayout'
import { Panel } from '@/shared/ui/Panel'
import { ProgressBar } from '@/shared/ui/ProgressBar'
import collections from '@/shared/data/collections.json'
import { validateDeck } from '@/features/decks/lib/deckRules'
import { useDeckData } from '@/features/decks/lib/deckStore'
import { DECK_SIZE, type Deck, type OwnedMap } from '@/features/decks/types/deck'
import { cn } from '@/shared/lib/utils'
import { deckPath, ROUTES } from '@/shared/lib/routes'

const DECKS_SUBTITLE =
  'Organize suas 60 cartas por Pokémon, Treinador e Energia — e veja de cara o que ainda falta fechar.'

const DECK_TILE_CLASS =
  'min-h-32 gap-space-10 px-(--card-spacing) [--card-spacing:22px] transition-all duration-200 hover:-translate-y-0.5 hover:border-secondary'

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
    <Link to={to} aria-label={label} className="block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-secondary">
      <Panel className={cn('h-full', DECK_TILE_CLASS, className)}>{children}</Panel>
    </Link>
  )
}

function DeckBlock({ deck, owned }: { deck: Deck; owned: OwnedMap }) {
  const validation = validateDeck(deck, owned, collections)

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
        <ProgressBar compact label="Cartas no deck" value={validation.total} max={DECK_SIZE} />
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
