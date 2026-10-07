import { ROUTES } from '../routes.ts'
import { SITE_DESCRIPTION, SITE_NAME } from './site.ts'

export interface PageMeta {
  title: string
  description: string
  /** Local deck editing screens are private, so crawlers must not index them. */
  noindex?: boolean
}

function titled(label: string): string {
  return `${label} | ${SITE_NAME}`
}

export const PAGE_META = {
  home: {
    title: `${SITE_NAME}: decks, conversor e manutenção de cartas`,
    description: SITE_DESCRIPTION,
  },
  decks: {
    title: titled('Meus decks'),
    description: 'Veja e organize os decks de Pokémon TCG que você montou, salvos no seu navegador.',
  },
  converter: {
    title: titled('Conversor'),
    description:
      'Converta uma decklist de Pokémon TCG para o formato de busca da Liga Pokemon e da MYPCards.',
  },
  maintenance: {
    title: titled('Manutenção'),
    description: 'Compare as cartas que seus decks pedem com as que você já possui e veja o que falta.',
  },
  newDeck: {
    title: titled('Novo deck'),
    description: 'Monte um novo deck de Pokémon TCG por categoria de carta.',
    noindex: true,
  },
  deckNotFound: {
    title: titled('Deck não encontrado'),
    description: 'O deck pedido não existe neste navegador.',
    noindex: true,
  },
} satisfies Record<string, PageMeta>

/** Metadata of the deck editor: `deckId` is absent on new decks, `deckName` on unknown ids. */
export function deckEditorMeta(deckId?: string, deckName?: string): PageMeta {
  if (!deckId) return PAGE_META.newDeck
  if (deckName === undefined) return PAGE_META.deckNotFound
  return {
    title: titled(`Editando deck ${deckName}`),
    description: `Edite as cartas do deck ${deckName}.`,
    noindex: true,
  }
}

export interface PublicPage {
  path: string
  meta: PageMeta
}

/** Pages prerendered at build time and listed in the sitemap. */
export const PUBLIC_PAGES: PublicPage[] = [
  { path: ROUTES.home, meta: PAGE_META.home },
  { path: ROUTES.converter, meta: PAGE_META.converter },
]
