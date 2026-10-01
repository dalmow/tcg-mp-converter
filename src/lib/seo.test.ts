import { describe, expect, it } from 'vitest'
import { buildHeadTags, buildJsonLd, buildRobotsTxt, buildSitemapXml } from './seo'

const SITE_URL = 'https://example.com'

describe('buildHeadTags', () => {
  const html = buildHeadTags(SITE_URL)

  it('declares description, canonical and theme-color', () => {
    expect(html).toContain('<meta name="description" content="')
    expect(html).toContain('<link rel="canonical" href="https://example.com/" />')
    expect(html).toContain('<meta name="theme-color" content="#0a0a0a" />')
  })

  it('declares Open Graph and Twitter Card with an absolute image', () => {
    expect(html).toContain('<meta property="og:title" content="PTCG Tools" />')
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
    expect(buildHeadTags('https://example.com/')).toContain('href="https://example.com/"')
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

  it('sitemap.xml lists the home page', () => {
    const xml = buildSitemapXml(SITE_URL)
    expect(xml).toContain('<loc>https://example.com/</loc>')
    expect(xml).toContain('http://www.sitemaps.org/schemas/sitemap/0.9')
  })
})
