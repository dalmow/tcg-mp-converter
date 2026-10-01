import { CircleAlert, CircleCheck, Plus } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { PageLayout } from '@/components/PageLayout'
import { Panel } from '@/components/Panel'
import collections from '@/data/collections.json'
import { validateDeck } from '@/lib/deck/deckRules'
import { useDeckData } from '@/lib/deck/deckStore'
import { DECK_SIZE, type Deck, type OwnedMap } from '@/lib/deck/types'
import { cn } from '@/lib/utils'
import { deckPath, ROUTES } from '@/routes'

const DECK_TILE_CLASS = 'h-36 transition-colors hover:border-primary'

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
    <Link to={to} aria-label={label} className="block">
      <Panel className={cn(DECK_TILE_CLASS, className)}>{children}</Panel>
    </Link>
  )
}

function DeckBlock({ deck, owned }: { deck: Deck; owned: OwnedMap }) {
  const validation = validateDeck(deck, owned, collections)

  return (
    <DeckTile to={deckPath(deck.id)} className="justify-between">
        <div className="flex items-start justify-between gap-2 px-4">
          <span className="font-semibold uppercase break-words">{deck.name}</span>
          {validation.valid ? (
            <CircleCheck role="img" aria-label="Deck válido" className="size-5 shrink-0 text-primary" />
          ) : (
            <CircleAlert role="img" aria-label="Deck inválido" className="size-5 shrink-0 text-danger" />
          )}
        </div>
        <div className="flex items-end justify-between gap-2 px-4 text-sm">
          <span className="text-danger">{validation.missingMessage}</span>
          <span className="text-muted-foreground">
            {validation.total}/{DECK_SIZE}
          </span>
        </div>
    </DeckTile>
  )
}

export default function DeckListPage() {
  const { decks, owned } = useDeckData()

  return (
    <PageLayout title="Decks">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-4">
        {decks.map((deck) => (
          <DeckBlock key={deck.id} deck={deck} owned={owned} />
        ))}
        <DeckTile to={ROUTES.newDeck} label="Novo deck" className="items-center justify-center">
          <Plus aria-hidden className="size-8 text-muted-foreground" />
        </DeckTile>
      </div>
    </PageLayout>
  )
}
