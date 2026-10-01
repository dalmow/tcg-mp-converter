import {
  SHARE_IMAGE_HEIGHT,
  SHARE_IMAGE_PATH,
  SHARE_IMAGE_WIDTH,
  SITE_DESCRIPTION,
  SITE_NAME,
  THEME_COLOR,
} from './site.ts'

/** Public routes listed in the sitemap. Add per-route entries here later. */
const SITEMAP_PATHS = ['/']

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function absoluteUrl(siteUrl: string, path: string): string {
  return `${siteUrl.replace(/\/+$/, '')}${path}`
}

export function buildJsonLd(siteUrl: string): string {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_NAME,
    url: absoluteUrl(siteUrl, '/'),
    description: SITE_DESCRIPTION,
    inLanguage: 'pt-BR',
    applicationCategory: 'GameApplication',
    operatingSystem: 'Any',
    image: absoluteUrl(siteUrl, SHARE_IMAGE_PATH),
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
  }
  // Escape "<" so the payload can never close the surrounding script tag.
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

/** Head tags injected into index.html (favicons stay in index.html). */
export function buildHeadTags(siteUrl: string): string {
  const url = absoluteUrl(siteUrl, '/')
  const image = absoluteUrl(siteUrl, SHARE_IMAGE_PATH)
  const description = escapeAttr(SITE_DESCRIPTION)
  const name = escapeAttr(SITE_NAME)
  return [
    `<meta name="description" content="${description}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta name="theme-color" content="${THEME_COLOR}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${name}" />`,
    `<meta property="og:title" content="${name}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:locale" content="pt_BR" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="${SHARE_IMAGE_WIDTH}" />`,
    `<meta property="og:image:height" content="${SHARE_IMAGE_HEIGHT}" />`,
    `<meta property="og:image:alt" content="${name}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${name}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    `<meta name="twitter:image:alt" content="${name}" />`,
    `<script type="application/ld+json">${buildJsonLd(siteUrl)}</script>`,
  ].join('\n    ')
}

export function buildRobotsTxt(siteUrl: string): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl(siteUrl, '/sitemap.xml')}\n`
}

export function buildSitemapXml(siteUrl: string): string {
  const urls = SITEMAP_PATHS.map((path) => `  <url><loc>${absoluteUrl(siteUrl, path)}</loc></url>`).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}
