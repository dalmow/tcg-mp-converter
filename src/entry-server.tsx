import { renderToString } from 'react-dom/server'
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router'
import { AppRoutes } from '@/app/AppRoutes'

const handler = createStaticHandler([{ path: '*', element: <AppRoutes /> }])

/**
 * Renders the app for one path; used by the build to prerender the public pages.
 * It uses the data-router pair so the markup (and React ids) match the browser router.
 */
export async function renderApp(path: string): Promise<string> {
  const context = await handler.query(new Request(new URL(path, 'http://localhost')))
  if (context instanceof Response) throw new Error(`Cannot prerender ${path}: redirected`)
  const router = createStaticRouter(handler.dataRoutes, context)
  return renderToString(<StaticRouterProvider router={router} context={context} hydrate={false} />)
}
