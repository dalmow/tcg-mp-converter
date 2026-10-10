import { CircleAlert, CircleCheck, Plus } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { PAGE_META } from '@/shared/lib/pageMeta'
import { useHydrated } from '@/shared/hooks/useHydrated'
import { usePageMeta } from '@/shared/hooks/usePageMeta'
import { PageLayout } from '@/shared/layout/PageLayout'
import { ButtonGroup } from '@/shared/ui/ButtonGroup'
import { Panel } from '@/shared/ui/Panel'
import { ProgressBar } from '@/shared/ui/ProgressBar'
import { buttonVariants } from '@/shared/ui/buttonVariants'
import collections from '@/shared/data/collections.json'
import { validateDeck } from '@/features/decks/lib/deckRules'
import { useDeckData } from '@/features/decks/lib/deckStore'
import { DECK_SIZE, type Deck, type OwnedMap } from '@/features/decks/types/deck'
import { cn } from '@/shared/lib/utils'
import { deckPath, ROUTES } from '@/shared/lib/routes'

const DECKS_SUBTITLE =
  'Organize suas 60 cartas por Pokémon, Treinador e Energia — e veja de cara o que ainda falta fechar.'

// Artboard values without a spacing or breakpoint token: the 22px card padding sits between space-8 and space-9,
// the 280px tile column and 18px gap are the artboard's fixed grid. Three tiles need 876px of content width, which
// the page padding leaves from about 952px up; the artboard breakpoint (760px) overflows from 761px to about 952px.
const DECK_TILE_CLASS =
  'min-h-32 gap-space-10 px-(--card-spacing) [--card-spacing:22px] transition-all duration-200 hover:-translate-y-0.5 hover:border-secondary'

function DeckTile({ to, className, children }: { to: string; className?: string; children: ReactNode }) {
  return (
    <Link to={to} className="block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-secondary">
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
      <ProgressBar compact label="Cartas no deck" value={validation.total} max={DECK_SIZE} />
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
    <PageLayout
      title="Meus decks"
      subtitle={DECKS_SUBTITLE}
      actions={
        <ButtonGroup aria-label="Ações dos decks" className="h-11 shrink-0 border-[1.5px] border-secondary">
          <Link
            to={ROUTES.newDeck}
            aria-label="Novo deck"
            title="Novo deck"
            className={buttonVariants({ size: 'icon', className: 'w-11' })}
          >
            <Plus aria-hidden className="size-4.5" />
          </Link>
        </ButtonGroup>
      }
    >
      {hydrated &&
        (decks.length === 0 ? (
          <Panel className="items-start px-(--card-spacing)">
            <p className="text-body text-ink-muted">Nenhum deck salvo ainda.</p>
            <Link to={ROUTES.newDeck} className={buttonVariants()}>
              Novo deck
            </Link>
          </Panel>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-[18px] min-[960px]:grid-cols-[repeat(3,280px)] min-[960px]:justify-start">
            {decks.map((deck) => (
              <DeckBlock key={deck.id} deck={deck} owned={owned} />
            ))}
          </div>
        ))}
    </PageLayout>
  )
}
