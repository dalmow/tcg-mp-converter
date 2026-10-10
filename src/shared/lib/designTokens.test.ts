/// <reference types="node" />
import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf-8')
const css = read('../../index.css')
const indexHtml = read('../../../index.html')
const packageJson = JSON.parse(read('../../../package.json')) as { dependencies: Record<string, string> }
const tokens = JSON.parse(read('../../../docs/design-system/tokens.json')) as {
  color: { tokens: { name: string; value: string }[] }
  type: {
    families: Record<string, string>
    groups: { styles: Record<string, string | number>[] }[]
  }
  spacing: { tokens: { name: string; value: string }[] }
  radius: { tokens: { name: string; value: string }[] }
  shadow: { tokens: { name: string; value: string }[] }
}

const declaration = (name: string) => {
  const m = css.match(new RegExp(String.raw`(?:^|[\s{;])--${name}:\s*([^;]+);`))
  return m ? m[1].trim().replace(/\s+/g, ' ') : undefined
}
const asCss = (value: string) => value.replace(/^\{(.+)\}$/, 'var(--color-$1)')
const normalize = (value: string) => value.replace(/\s+/g, '').replace(/"/g, "'")
// Prettier writes spaces inside CSS function arguments (`rgba(1, 2)`); the token value has none.
const canonicalCss = (value: string) => value.replace(/\s*([(),])\s*/g, '$1')

describe('design tokens in src/index.css match docs/design-system/tokens.json', () => {
  it.each(tokens.color.tokens.map((t) => [t.name, t.value]))('color %s', (name, value) => {
    expect(canonicalCss(declaration(`color-${name}`) ?? '')).toBe(canonicalCss(asCss(value)))
  })

  it.each(tokens.radius.tokens.map((t) => [t.name, t.value]))('%s', (name, value) => {
    expect(declaration(name)).toBe(value)
  })

  it.each(tokens.shadow.tokens.map((t) => [t.name, t.value]))('%s', (name, value) => {
    expect(canonicalCss(declaration(name) ?? '')).toBe(canonicalCss(value))
  })

  it.each(tokens.spacing.tokens.map((t) => [t.name, t.value]))('%s', (name, value) => {
    expect(declaration(`spacing-${name}`)).toBe(value)
  })

  it('type styles', () => {
    for (const { styles } of tokens.type.groups) {
      for (const style of styles) {
        const name = style.name as string
        expect(declaration(`text-${name}`), name).toBe(style.fontSize)
        expect(declaration(`text-${name}--line-height`), name).toBe(String(style.lineHeight))
        expect(declaration(`text-${name}--font-weight`), name).toBe(String(style.fontWeight))
        if (style.letterSpacing) expect(declaration(`text-${name}--letter-spacing`), name).toBe(style.letterSpacing)
      }
    }
  })

  it('font families', () => {
    expect(normalize(declaration('font-display') ?? '')).toBe(
      normalize("'Space Grotesk Variable', ui-sans-serif, system-ui, sans-serif"),
    )
    expect(normalize(declaration('font-body') ?? '')).toBe(
      normalize("'Manrope Variable', ui-sans-serif, system-ui, sans-serif"),
    )
  })

  it('nav breakpoint', () => {
    expect(declaration('breakpoint-nav')).toBe('860px')
  })
})

describe('fonts', () => {
  it('are self-hosted and Geist is gone', () => {
    expect(packageJson.dependencies).toHaveProperty('@fontsource-variable/space-grotesk')
    expect(packageJson.dependencies).toHaveProperty('@fontsource-variable/manrope')
    expect(packageJson.dependencies).not.toHaveProperty('@fontsource-variable/geist')
    expect(css).toContain('@fontsource-variable/space-grotesk')
    expect(css).toContain('@fontsource-variable/manrope')
    expect(css).not.toMatch(/geist/i)
  })

  it('make no Google Fonts request', () => {
    expect(indexHtml).not.toMatch(/fonts\.(googleapis|gstatic)\.com/)
    expect(css).not.toMatch(/fonts\.(googleapis|gstatic)\.com/)
  })
})

describe('shadcn token aliases are gone', () => {
  it.each([
    'background',
    'foreground',
    'card',
    'card-foreground',
    'popover',
    'popover-foreground',
    'primary-foreground',
    'secondary-foreground',
    'muted',
    'muted-foreground',
    'accent',
    'accent-foreground',
    'destructive',
    'input',
    'ring',
    'success',
    'success-foreground',
    'danger-text',
    'danger-foreground',
    'primary-text',
    'control',
    'panel',
    'panel-foreground',
    'panel-border',
    'chart-1',
    'sidebar',
    'sidebar-primary',
    'radius',
  ])('--%s and --color-%s are not declared', (name) => {
    expect(declaration(name)).toBeUndefined()
    expect(declaration(`color-${name}`)).toBeUndefined()
  })

  it('--primary, --secondary and --border are not shadowed by an alias', () => {
    for (const name of ['primary', 'secondary', 'border']) expect(declaration(name)).toBeUndefined()
  })

  it('no source file uses an alias-only color utility', () => {
    const aliasUtility =
      /(?:bg|text|border|ring|fill|stroke|outline|divide)-(?:background|foreground|card|popover|muted|accent|destructive|input|ring|success|panel|control|sidebar|chart)(?:-[a-z]+)?/
    const dir = new URL('../..', import.meta.url)
    const offenders = readdirSync(dir, { recursive: true, encoding: 'utf-8' })
      .filter((f) => /\.(tsx?|css)$/.test(f) && !f.endsWith('.test.ts') && !f.endsWith('.test.tsx'))
      .filter((f) => aliasUtility.test(readFileSync(new URL(f, dir), 'utf-8')))
    expect(offenders).toEqual([])
  })
})
