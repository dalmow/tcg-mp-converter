// @vitest-environment jsdom
import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { act } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppRoutes } from '@/AppRoutes'
import { renderApp } from '@/entry-server'
import { PUBLIC_PAGES } from '@/lib/pageMeta'

afterEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

describe('prerendered public pages', () => {
  it.each(PUBLIC_PAGES)('renders the h1 and main content of $path without JavaScript', async ({ path }) => {
    const html = await renderApp(path)
    // the decks and converter pages show a visible title block instead of an sr-only title
    const visibleTitles: Record<string, string> = { '/': 'Meus decks', '/converter': 'Conversor' }
    const title = visibleTitles[path]
    expect(html).toMatch(title ? new RegExp(`<h1[^>]*>${title}</h1>`) : /<h1 class="sr-only">/)
    expect(html).toContain('<main')
  })

  it('leaves the stored-decks grid out of the prerendered home so it cannot shift layout', async () => {
    expect(await renderApp('/')).not.toContain('Novo deck')
  })

  it.each(PUBLIC_PAGES)('hydrates $path without errors', async ({ path }) => {
    const container = document.createElement('div')
    container.innerHTML = await renderApp(path)
    document.body.append(container)
    window.history.replaceState(null, '', path)
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
    const onRecoverableError = vi.fn()
    const router = createBrowserRouter([{ path: '*', element: <AppRoutes /> }])
    await act(async () => {
      hydrateRoot(
        container,
        <StrictMode>
          <RouterProvider router={router} />
        </StrictMode>,
        { onRecoverableError },
      )
    })
    expect(onRecoverableError).not.toHaveBeenCalled()
    expect(errors).not.toHaveBeenCalled()
  })
})
