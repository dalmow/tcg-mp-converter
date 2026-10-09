import { PUBLIC_PAGES } from './pageMeta.ts'
import type { PublicPage } from './pageMeta.ts'
import {
  SHARE_IMAGE_HEIGHT,
  SHARE_IMAGE_PATH,
  SHARE_IMAGE_WIDTH,
  SITE_DESCRIPTION,
  SITE_NAME,
  THEME_COLOR,
} from './site.ts'

const HEAD_START = '<!--seo-head-->'
const HEAD_END = '<!--/seo-head-->'

/** Head of the app shell, served for every route that is not prerendered (deck editing, unknown paths). */
export const SHELL_PAGE: PublicPage = {
  path: '/',
  meta: { title: SITE_NAME, description: SITE_DESCRIPTION, noindex: true },
}

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

/** Title, description, canonical and social tags of one page, between markers so a prerender can swap them. */
export function buildHeadTags(siteUrl: string, { path, meta }: PublicPage): string {
  const image = absoluteUrl(siteUrl, SHARE_IMAGE_PATH)
  const title = escapeAttr(meta.title)
  const description = escapeAttr(meta.description)
  const name = escapeAttr(SITE_NAME)
  const url = absoluteUrl(siteUrl, path)
  return [
    HEAD_START,
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    ...(meta.noindex
      ? [`<meta name="robots" content="noindex" />`]
      : [`<link rel="canonical" href="${url}" />`, `<meta property="og:url" content="${url}" />`]),
    `<meta name="theme-color" content="${THEME_COLOR}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${name}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:locale" content="pt_BR" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="${SHARE_IMAGE_WIDTH}" />`,
    `<meta property="og:image:height" content="${SHARE_IMAGE_HEIGHT}" />`,
    `<meta property="og:image:alt" content="${name}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    `<meta name="twitter:image:alt" content="${name}" />`,
    `<script type="application/ld+json">${buildJsonLd(siteUrl)}</script>`,
    HEAD_END,
  ].join('\n    ')
}

/** Turns the built app shell into the static HTML of one page. */
export function applyPageToShell(shell: string, siteUrl: string, page: PublicPage, appHtml: string): string {
  const start = shell.indexOf(HEAD_START)
  const endMarker = shell.indexOf(HEAD_END)
  if (start === -1 || endMarker === -1) throw new Error('App shell has no SEO head markers')
  const end = endMarker + HEAD_END.length
  return (shell.slice(0, start) + buildHeadTags(siteUrl, page) + shell.slice(end)).replace(
    '<div id="root"></div>',
    () => `<div id="root">${appHtml}</div>`,
  )
}

export function buildRobotsTxt(siteUrl: string): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl(siteUrl, '/sitemap.xml')}\n`
}

export function buildSitemapXml(siteUrl: string): string {
  const urls = PUBLIC_PAGES.map(({ path }) => `  <url><loc>${absoluteUrl(siteUrl, path)}</loc></url>`).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}
