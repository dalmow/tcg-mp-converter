// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Switch } from './Switch'

afterEach(cleanup)

// WCAG 2.5.8: jsdom has no layout, so assert the sizing utilities (Tailwind: 5.5 = 22px, 10 = 40px).
describe('Switch target size', () => {
  // The 22px track grows to a 38px hit area (22px + 8px on each side), above the 24px minimum.
  it('extends its 22px track with a hit area', () => {
    render(<Switch aria-label="x" />)

    const classes = screen.getByRole('switch').className
    expect(classes).toContain('h-5.5')
    expect(classes).toContain('after:-inset-y-2')
  })

  // The knob slot (20px) sits in the 40px track and travels 18px (translate-x-4.5) when checked.
  it('sizes the track to fit the knob slot and its travel', () => {
    render(<Switch aria-label="x" />)

    const root = screen.getByRole('switch')
    expect(root.className).toContain('w-10')
    expect(root.firstElementChild?.className).toContain('size-5')
    expect(root.firstElementChild?.className).toContain('group-data-checked/switch:translate-x-4.5')
  })
})
