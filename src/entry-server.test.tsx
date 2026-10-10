// @vitest-environment jsdom
import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { act } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { appRoutes } from '@/app/AppRoutes'
import { renderApp } from './entry-server'
import { ROUTE_LOADING_TEXT } from '@/app/RouteLoading'
import { PUBLIC_PAGES } from '@/shared/lib/pageMeta'

afterEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

describe('prerendered public pages', () => {
  it.each(PUBLIC_PAGES)('renders the h1 and main content of $path without JavaScript', async ({ path }) => {
    const html = await renderApp(path)
    const visibleTitles: Record<string, string> = {
      '/': 'Monte, converta e mantenha em ordem seus decks favoritos',
      '/converter': 'Conversor',
    }
    expect(html).toMatch(new RegExp(`<h1[^>]*>${visibleTitles[path]}</h1>`))
    expect(html).toContain('<main')
  })

  it.each(PUBLIC_PAGES)('prerenders the page of  instead of its loading fallback', async ({ path }) => {
    expect(await renderApp(path)).not.toContain(ROUTE_LOADING_TEXT)
  })

  it('prerenders the landing call to action as a link to the deck list', async () => {
    expect(await renderApp('/')).toMatch(/<a [^>]*href="\/decks"[^>]*>Abrir meus decks/)
  })

  it.each(PUBLIC_PAGES)('hydrates $path without errors', async ({ path }) => {
    const container = document.createElement('div')
    container.innerHTML = await renderApp(path)
    document.body.append(container)
    window.history.replaceState(null, '', path)
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
    const onRecoverableError = vi.fn()
    const router = createBrowserRouter(appRoutes)
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
