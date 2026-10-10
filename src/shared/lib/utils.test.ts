/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { cn } from './utils'

// The default cn treats unknown text-* classes as colors, so a text color
// dropped the project font size (text-ui, text-body) from Buttons and dialogs.
describe('cn', () => {
  it('keeps the font size next to a text color', () => {
    expect(cn('text-ui text-ink')).toBe('text-ui text-ink')
  })

  it('keeps the body size next to a muted text color', () => {
    expect(cn('text-body text-ink-muted')).toBe('text-body text-ink-muted')
  })

  it('replaces the base font size with a later one', () => {
    expect(cn('text-ui', 'text-body-strong')).toBe('text-body-strong')
  })

  it('skips falsy and null inputs', () => {
    const isActive = false
    expect(cn('text-ui', isActive && 'text-ink', null, undefined, false)).toBe('text-ui')
  })
})

describe('cn with the project spacing tokens', () => {
  it.each([
    ['gap-space-6', 'gap-space-7', 'gap-space-7'],
    ['px-space-2', 'px-space-5', 'px-space-5'],
    ['py-space-2', 'py-space-5', 'py-space-5'],
  ])('replaces %s with a later token of the same group', (base, override, expected) => {
    expect(cn(base, override)).toBe(expected)
  })
})

// Every font size declared in the @theme must survive cn, or a new size silently drops.
const css = readFileSync(new URL('../../index.css', import.meta.url), 'utf-8')
const fontSizes = [...css.matchAll(/--text-([a-z0-9-]+):/g)]
  .map((match) => match[1])
  .filter((name) => !name.includes('--'))

describe('cn with the project font sizes from index.css', () => {
  it('finds the font sizes in index.css', () => {
    expect(fontSizes.length).toBeGreaterThan(0)
  })

  it.each(fontSizes)('keeps text-%s next to a text color', (name) => {
    expect(cn(`text-${name} text-ink`)).toBe(`text-${name} text-ink`)
  })
})
