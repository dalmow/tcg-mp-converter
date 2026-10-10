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
