/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { contrastRatio, parseColor, parseOklch } from './contrast'

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf-8')
const css = read('../index.css')
const converterSource = read('../pages/ConverterPage.tsx')
const tailwindTheme = read('../../node_modules/tailwindcss/theme.css')

const resolve = (value: string): string => {
  const ref = value.match(/^var\(--([a-z0-9-]+)\)$/)
  if (!ref) return value
  const m = css.match(new RegExp(String.raw`(?:^|[\s{;])--${ref[1]}:\s*([^;]+);`))
  if (!m) throw new Error(`var --${ref[1]} not found`)
  return resolve(m[1].trim())
}
const token = (name: string, over = '#0a090e') => {
  const m = css.match(new RegExp(String.raw`(?:^|[\s{;])--color-${name}:\s*([^;]+);`))
  if (!m) throw new Error(`token --color-${name} not found`)
  return parseColor(resolve(m[1].trim()), parseColor(over))
}
const palette = (name: string) => {
  const m = tailwindTheme.match(new RegExp(String.raw`--color-${name}:\s*(oklch\([^)]*\))`))
  if (!m) throw new Error(`palette ${name} not found`)
  return parseOklch(m[1])
}

describe('contrast helper', () => {
  it('matches known WCAG values', () => {
    expect(contrastRatio(parseOklch('oklch(1 0 0)'), parseOklch('oklch(0 0 0)'))).toBeCloseTo(21, 0)
    expect(contrastRatio(parseColor('#ffffff'), parseColor('#000000'))).toBeCloseTo(21, 0)
    // Audited values from docs/accessibility-audit.md (A-03 / A-04 before the fix)
    const white = parseOklch('oklch(0.985 0 0)')
    expect(contrastRatio(white, parseOklch('oklch(0.62 0.19 255)'))).toBeCloseTo(3.54, 1)
    expect(contrastRatio(white, parseOklch('oklch(0.65 0.22 25)'))).toBeCloseTo(3.44, 1)
  })

  it('parses hex, short hex and rgba over a background', () => {
    expect(parseColor('#fff')).toEqual(parseColor('#ffffff'))
    expect(parseColor('rgba(255,255,255,1)')).toEqual(parseColor('#ffffff'))
    expect(parseColor('rgba(255,255,255,0)', parseColor('#000000'))).toEqual(parseColor('#000000'))
    expect(contrastRatio(parseColor('rgba(255,255,255,0.5)', parseColor('#000000')), parseColor('#000000'))).toBeCloseTo(
      contrastRatio(parseColor('#808080'), parseColor('#000000')),
      1,
    )
  })

  it('rejects unsupported colors', () => {
    expect(() => parseColor('currentColor')).toThrow()
  })
})

describe('design token contrast (WCAG 2.2 AA)', () => {
  const text = 4.5
  const surfaces = ['surface-000', 'surface-100', 'surface-200']

  it.each([['primary'], ['primary-hover']])('button fill --color-%s with --color-ink text is >= 4.5:1', (bg) => {
    expect(contrastRatio(token('ink'), token(bg))).toBeGreaterThanOrEqual(text)
  })

  it.each(surfaces)('--color-secondary and --color-danger text read on --color-%s', (surface) => {
    expect(contrastRatio(token('secondary'), token(surface))).toBeGreaterThanOrEqual(text)
    expect(contrastRatio(token('danger'), token(surface))).toBeGreaterThanOrEqual(text)
  })

  it.each(['ink', 'ink-muted', 'ink-faint', 'ink-subtle'])('--color-%s text reads on every surface', (ink) => {
    for (const surface of surfaces) {
      expect(contrastRatio(token(ink), token(surface))).toBeGreaterThanOrEqual(text)
    }
  })

  it('dark text on the secondary fill is >= 4.5:1', () => {
    expect(contrastRatio(token('surface-000'), token('secondary'))).toBeGreaterThanOrEqual(text)
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
