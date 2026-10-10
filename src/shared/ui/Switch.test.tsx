// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Switch } from './Switch'

afterEach(cleanup)

// WCAG 2.5.8: jsdom has no layout, so assert the sizing utilities (Tailwind: 6 = 24px).
describe('Switch target size', () => {
  it.each(['default', 'sm'] as const)('keeps the %s track at least 24px tall', (size) => {
    render(<Switch size={size} aria-label="x" />)

    const classes = screen.getByRole('switch').className
    expect(classes).toContain(`data-[size=${size}]:h-6`)
  })

  // Thumb travels (100% - 2px) of its own width; the track must be thumb + travel + 2px border wide.
  it.each([
    ['default', 'w-10', 'size-5'],
    ['sm', 'w-8', 'size-4'],
  ])('sizes the %s track (%s) to fit its thumb (%s)', (size, track, thumb) => {
    render(<Switch size={size as 'default' | 'sm'} aria-label="x" />)

    const root = screen.getByRole('switch')
    expect(root.className).toContain(`data-[size=${size}]:${track}`)
    expect(root.firstElementChild?.className).toContain(`group-data-[size=${size}]/switch:${thumb}`)
  })
})
