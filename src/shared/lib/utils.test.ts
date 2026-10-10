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
