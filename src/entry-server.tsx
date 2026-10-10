import { renderToString } from 'react-dom/server'
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router'
import { appRoutes } from '@/app/AppRoutes'
import { ROUTE_LOADING_TEXT } from '@/app/RouteLoading'

const handler = createStaticHandler(appRoutes)

const LOAD_POLL_MS = 10
const LOAD_POLL_ATTEMPTS = 500

/**
 * Renders the app for one path; used by the build to prerender the public pages.
 * It uses the data-router pair so the markup (and React ids) match the browser router.
 *
 * Pages load through `React.lazy`, and `renderToString` emits the loading fallback while a page chunk is pending.
 * Streaming renders wait for the chunk, but they leave React's context state dirty for later renders in the same
 * JS realm (the jsdom hydration test), so this renders again, each time after a timer tick, until the fallback is gone.
 */
export async function renderApp(path: string): Promise<string> {
  const context = await handler.query(new Request(new URL(path, 'http://localhost')))
  if (context instanceof Response) throw new Error(`Cannot prerender ${path}: redirected`)
  const router = createStaticRouter(handler.dataRoutes, context)
  const render = () => renderToString(<StaticRouterProvider router={router} context={context} hydrate={false} />)
  let html = render()
  for (let attempt = 0; html.includes(ROUTE_LOADING_TEXT); attempt++) {
    if (attempt === LOAD_POLL_ATTEMPTS) throw new Error(`Cannot prerender ${path}: page chunk did not load`)
    await new Promise((resolve) => setTimeout(resolve, LOAD_POLL_MS))
    html = render()
  }
  return html
}
