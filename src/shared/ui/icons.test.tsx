// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { Trash2Icon } from 'lucide-react'
import { afterEach, describe, expect, it } from 'vitest'
import { ICON_STROKE_WIDTH, IconDefaults } from './icons'

afterEach(cleanup)

describe('lucide icon stroke', () => {
  it('is inside the design system range (1.4 to 1.8)', () => {
    expect(ICON_STROKE_WIDTH).toBeGreaterThanOrEqual(1.4)
    expect(ICON_STROKE_WIDTH).toBeLessThanOrEqual(1.8)
  })

  it('is set once by IconDefaults for every icon below it', () => {
    const { container } = render(
      <IconDefaults>
        <Trash2Icon />
      </IconDefaults>,
    )

    expect(container.querySelector('svg')?.getAttribute('stroke-width')).toBe(String(ICON_STROKE_WIDTH))
  })
})
