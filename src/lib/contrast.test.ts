/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { contrastRatio, parseOklch } from './contrast'

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf-8')
const css = read('../index.css')
const converterSource = read('../pages/ConverterPage.tsx')
const tailwindTheme = read('../../node_modules/tailwindcss/theme.css')

const token = (name: string) => {
  const m = css.match(new RegExp(String.raw`--${name}:\s*(oklch\([^)]*\))`))
  if (!m) throw new Error(`token --${name} not found`)
  return parseOklch(m[1])
}
const palette = (name: string) => {
  const m = tailwindTheme.match(new RegExp(String.raw`--color-${name}:\s*(oklch\([^)]*\))`))
  if (!m) throw new Error(`palette ${name} not found`)
  return parseOklch(m[1])
}

describe('contrast helper', () => {
  it('matches known WCAG values', () => {
    expect(contrastRatio(parseOklch('oklch(1 0 0)'), parseOklch('oklch(0 0 0)'))).toBeCloseTo(21, 0)
    // Audited values from docs/accessibility-audit.md (A-03 / A-04 before the fix)
    expect(contrastRatio(token('foreground'), parseOklch('oklch(0.62 0.19 255)'))).toBeCloseTo(3.54, 1)
    expect(contrastRatio(token('foreground'), parseOklch('oklch(0.65 0.22 25)'))).toBeCloseTo(3.44, 1)
  })
})

describe('design token contrast (WCAG 2.2 AA)', () => {
  const text = 4.5
  const nonText = 3

  it.each([
    ['primary', 'primary-foreground'],
    ['primary-hover', 'primary-foreground'],
    ['danger', 'danger-foreground'],
    ['danger-hover', 'danger-foreground'],
  ])('button fill --%s with --%s text is >= 4.5:1', (bg, fg) => {
    expect(contrastRatio(token(bg), token(fg))).toBeGreaterThanOrEqual(text)
  })

  it.each(['background', 'card', 'panel'])('--primary-text and --danger-text read on --%s', (surface) => {
    expect(contrastRatio(token('primary-text'), token(surface))).toBeGreaterThanOrEqual(text)
    expect(contrastRatio(token('danger-text'), token(surface))).toBeGreaterThanOrEqual(text)
  })

  it.each(['background', 'card', 'panel'])('--control-border is >= 3:1 on --%s', (surface) => {
    expect(contrastRatio(token('control-border'), token(surface))).toBeGreaterThanOrEqual(nonText)
  })

  it.each(['M', 'NM', 'SP', 'MP', 'HP', 'D'])('condition badge %s text is >= 4.5:1', (condition) => {
    const m = converterSource.match(new RegExp(String.raw`\s${condition}: 'bg-([a-z]+-\d+) text-white'`))
    if (!m) throw new Error(`badge class for ${condition} not found`)
    expect(contrastRatio(parseOklch('oklch(1 0 0)'), palette(m[1]))).toBeGreaterThanOrEqual(text)
  })

  it('unselected badges do not rely on opacity', () => {
    expect(converterSource).not.toMatch(/opacity-\d+/)
  })
})
