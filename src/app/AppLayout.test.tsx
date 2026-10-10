// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
import { appRoutes } from './AppRoutes'
import { ROUTE_LOADING_TEXT } from './RouteLoading'
import { ROUTES } from '@/shared/lib/routes'

afterEach(cleanup)

describe('AppLayout', () => {
  // Alone in its file, so the page chunk is still unloaded when the test renders it.
  it('shows the loading state while the page chunk loads', () => {
    const router = createMemoryRouter(appRoutes, { initialEntries: [ROUTES.decks] })
    render(<RouterProvider router={router} />)
    expect(screen.getByRole('status').textContent).toBe(ROUTE_LOADING_TEXT)
  })
})
