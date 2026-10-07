/** Public name of the site, shown in the UI and reused for SEO metadata. */
export const SITE_NAME = 'PTCG Tools'

/**
 * Canonical origin of the production site, without trailing slash. Can be
 * overridden at build time with the `SITE_URL` environment variable.
 */
export const DEFAULT_SITE_URL = 'https://ptcgtools.dalm.dev'

export const SITE_DESCRIPTION =
  'Converta decklists de Pokémon TCG para o formato de busca da Liga Pokemon e da MYPCards, monte decks e controle as cartas que você possui.'

/** Path (relative to the site origin) of the 1200x630 social share image. */
export const SHARE_IMAGE_PATH = '/og-image.png'
export const SHARE_IMAGE_WIDTH = 1200
export const SHARE_IMAGE_HEIGHT = 630

/** Matches the `surface-000` design token so mobile browser chrome blends in. */
export const THEME_COLOR = '#0a090e'
