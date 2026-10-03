// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Switch } from './switch'

afterEach(cleanup)

// WCAG 2.5.8: jsdom has no layout, so assert the sizing utilities (Tailwind: 6 = 24px).
describe('Switch target size', () => {
  it.each(['default', 'sm'] as const)('keeps the %s track at least 24px tall', (size) => {
    render(<Switch size={size} aria-label="x" />)

    const classes = screen.getByRole('switch').className
    expect(classes).toContain(`data-[size=${size}]:h-6`)
  })
})
