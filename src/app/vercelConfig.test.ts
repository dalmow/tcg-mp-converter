import { describe, expect, it } from 'vitest'
// oxlint-disable-next-line import/no-relative-parent-imports -- vercel.json lives at the repo root, outside src/
import vercelConfig from '../../vercel.json'
import { ROUTES } from '@/shared/lib/routes'
import { PUBLIC_PAGES } from '@/shared/lib/pageMeta'

const { rewrites } = vercelConfig
const prerendered = new Set(PUBLIC_PAGES.map((page) => page.path))

describe('vercel.json rewrites', () => {
  it('keeps / and /converter public and prerendered, and /decks an app route', () => {
    expect([...prerendered].sort()).toEqual([ROUTES.home, ROUTES.converter].sort())
    expect(rewrites.map((rewrite) => rewrite.source)).toContain(ROUTES.decks)
  })

  it('serve the app shell only for the routes that are not prerendered, so unknown paths answer 404', () => {
    const shellRoutes = Object.values(ROUTES).filter((route) => !prerendered.has(route))
    expect(rewrites.map((rewrite) => rewrite.source).sort()).toEqual(shellRoutes.sort())
    expect(rewrites.every((rewrite) => rewrite.destination === '/spa.html')).toBe(true)
  })
})
