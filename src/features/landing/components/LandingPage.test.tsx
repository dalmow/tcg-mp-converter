// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import LandingPage from './LandingPage'

describe('LandingPage footer', () => {
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('derives the copyright year from the current date', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2031-03-15T12:00:00Z'))
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    )
    expect(screen.getByText('© 2031 dalm.dev')).toBeTruthy()
  })
})
