/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf-8')
const css = read('../index.css')
const indexHtml = read('../../index.html')
const packageJson = JSON.parse(read('../../package.json')) as { dependencies: Record<string, string> }
const tokens = JSON.parse(read('../../docs/design-system/tokens.json')) as {
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
  const m = css.match(new RegExp(String.raw`--${name}:\s*([^;]+);`))
  return m ? m[1].trim().replace(/\s+/g, ' ') : undefined
}
const asCss = (value: string) => value.replace(/^\{(.+)\}$/, 'var(--color-$1)')
const normalize = (value: string) => value.replace(/\s+/g, '').replace(/"/g, "'")

describe('design tokens in src/index.css match docs/design-system/tokens.json', () => {
  it.each(tokens.color.tokens.map((t) => [t.name, t.value]))('color %s', (name, value) => {
    expect(declaration(`color-${name}`)).toBe(asCss(value))
  })

  it.each(tokens.radius.tokens.map((t) => [t.name, t.value]))('%s', (name, value) => {
    expect(declaration(name)).toBe(value)
  })

  it.each(tokens.shadow.tokens.map((t) => [t.name, t.value]))('%s', (name, value) => {
    expect(declaration(name)).toBe(value)
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
    expect(normalize(declaration('font-display') ?? '')).toBe(normalize("'Space Grotesk Variable', ui-sans-serif, system-ui, sans-serif"))
    expect(normalize(declaration('font-body') ?? '')).toBe(normalize("'Manrope Variable', ui-sans-serif, system-ui, sans-serif"))
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

describe('shadcn token aliases still resolve', () => {
  it.each([
    ['background', 'var(--color-surface-000)'],
    ['foreground', 'var(--color-ink)'],
    ['card', 'var(--color-surface-100)'],
    ['popover', 'var(--color-surface-200)'],
    ['primary', 'var(--color-primary)'],
    ['secondary', 'var(--color-secondary)'],
    ['muted-foreground', 'var(--color-ink-muted)'],
    ['destructive', 'var(--color-danger)'],
    ['border', 'var(--color-border)'],
  ])('--%s', (name, target) => {
    expect(declaration(name)).toBe(target)
  })

  it('every legacy utility color is still mapped', () => {
    for (const name of ['success', 'danger-text', 'primary-text', 'control', 'panel', 'panel-border', 'primary-hover', 'danger-hover', 'accent', 'ring', 'input', 'muted']) {
      expect(css, name).toMatch(new RegExp(`--color-${name}:`))
    }
  })
})
