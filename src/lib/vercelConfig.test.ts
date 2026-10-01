import { describe, expect, it } from 'vitest'
import vercelConfig from '../../vercel.json'
import { ROUTES } from '../routes'
import { PUBLIC_PAGES } from './pageMeta'

const { rewrites } = vercelConfig
const prerendered = new Set(PUBLIC_PAGES.map((page) => page.path))

describe('vercel.json rewrites', () => {
  it('serve the app shell for every route that is not prerendered', () => {
    const shellRoutes = Object.values(ROUTES).filter((route) => !prerendered.has(route))
    expect(rewrites.map((rewrite) => rewrite.source).sort()).toEqual(shellRoutes.sort())
    expect(rewrites.every((rewrite) => rewrite.destination === '/spa.html')).toBe(true)
  })

  it('leave unknown paths to answer 404 instead of a soft 404', () => {
    expect(rewrites.some((rewrite) => rewrite.source.includes('(.*)'))).toBe(false)
  })
})
