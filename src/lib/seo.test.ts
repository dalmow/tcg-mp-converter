import { describe, expect, it } from 'vitest'
import { PAGE_META, PUBLIC_PAGES } from './pageMeta'
import { applyPageToShell, buildHeadTags, buildJsonLd, buildRobotsTxt, buildSitemapXml, SHELL_PAGE } from './seo'

const SITE_URL = 'https://example.com'
const CONVERTER = { path: '/converter', meta: PAGE_META.converter }

describe('buildHeadTags', () => {
  const html = buildHeadTags(SITE_URL, PUBLIC_PAGES[0])

  it('declares description, canonical and theme-color', () => {
    expect(html).toContain('<meta name="description" content="')
    expect(html).toContain('<link rel="canonical" href="https://example.com/" />')
    expect(html).toContain('<meta name="theme-color" content="#0a090e" />')
  })

  it('declares Open Graph and Twitter Card with an absolute image', () => {
    expect(html).toContain('<meta property="og:site_name" content="PTCG Tools" />')
    expect(html).toContain('<meta property="og:image" content="https://example.com/og-image.png" />')
    expect(html).toContain('<meta property="og:url" content="https://example.com/" />')
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image" />')
    expect(html).toContain('<meta name="twitter:image" content="https://example.com/og-image.png" />')
  })

  it('embeds JSON-LD that parses', () => {
    const match = html.match(/<script type="application\/ld\+json">(.*)<\/script>/s)
    expect(match).not.toBeNull()
    expect(() => JSON.parse(match![1])).not.toThrow()
  })

  it('does not repeat favicon links', () => {
    expect(html).not.toContain('rel="icon"')
  })

  it('tolerates a trailing slash in the site URL', () => {
    expect(buildHeadTags('https://example.com/', PUBLIC_PAGES[0])).toContain('href="https://example.com/"')
  })

  it('describes each public page with its own title, description, canonical and social tags', () => {
    const converter = buildHeadTags(SITE_URL, CONVERTER)
    expect(converter).toContain('<title>Conversor | PTCG Tools</title>')
    expect(converter).toContain(`<meta name="description" content="${PAGE_META.converter.description}" />`)
    expect(converter).toContain('<link rel="canonical" href="https://example.com/converter" />')
    expect(converter).toContain('<meta property="og:url" content="https://example.com/converter" />')
    expect(converter).toContain('<meta property="og:title" content="Conversor | PTCG Tools" />')
    expect(converter).toContain('<meta name="twitter:title" content="Conversor | PTCG Tools" />')
    expect(converter).not.toContain('noindex')
  })

  it('marks non-indexable pages noindex and gives them no canonical', () => {
    const shell = buildHeadTags(SITE_URL, SHELL_PAGE)
    expect(shell).toContain('<meta name="robots" content="noindex" />')
    expect(shell).not.toContain('rel="canonical"')
    expect(shell).not.toContain('og:url')
  })
})

describe('applyPageToShell', () => {
  const shell = `<head>${buildHeadTags(SITE_URL, SHELL_PAGE)}</head><body><div id="root"></div></body>`

  it('swaps in the page head and the rendered app', () => {
    const html = applyPageToShell(shell, SITE_URL, CONVERTER, '<h1>Conversor</h1>')
    expect(html).toContain('<title>Conversor | PTCG Tools</title>')
    expect(html).toContain('<div id="root"><h1>Conversor</h1></div>')
    expect(html).not.toContain('noindex')
    expect(html.match(/<title>/g)).toHaveLength(1)
  })
})

describe('buildJsonLd', () => {
  it('is a valid WebApplication', () => {
    const parsed = JSON.parse(buildJsonLd(SITE_URL))
    expect(parsed['@context']).toBe('https://schema.org')
    expect(parsed['@type']).toBe('WebApplication')
    expect(parsed.name).toBe('PTCG Tools')
    expect(parsed.url).toBe('https://example.com/')
    expect(parsed.applicationCategory).toBe('GameApplication')
    expect(parsed.offers).toMatchObject({ '@type': 'Offer', price: '0' })
  })

  it('cannot break out of the script tag', () => {
    expect(buildJsonLd(SITE_URL)).not.toContain('</')
  })
})

describe('robots and sitemap', () => {
  it('robots.txt allows everything and points to the sitemap', () => {
    expect(buildRobotsTxt(SITE_URL)).toBe('User-agent: *\nAllow: /\n\nSitemap: https://example.com/sitemap.xml\n')
  })

  it('sitemap.xml lists only the prerendered public pages', () => {
    const xml = buildSitemapXml(SITE_URL)
    expect(xml).toContain('<loc>https://example.com/</loc>')
    expect(xml).toContain('<loc>https://example.com/converter</loc>')
    expect(xml).not.toContain('/decks')
    expect(xml).not.toContain('/maintenance')
    expect(xml).toContain('http://www.sitemaps.org/schemas/sitemap/0.9')
  })
})
