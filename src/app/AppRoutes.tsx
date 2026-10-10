import type { RouteObject } from 'react-router'
import { AppLayout } from './AppLayout'
import { RouteError } from './RouteError'
import { ConverterPage, DeckEditorPage, DeckListPage, LandingPage, MaintenancePage } from './lazyPages'
import { ROUTES } from '@/shared/lib/routes'

// Error elements need a data router, so the table is handed to `createBrowserRouter` or `createStaticHandler`.
// A failed render or chunk load shows the route's error state inside the shell, not a blank page.
const errorElement = <RouteError />

export const appRoutes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      { path: ROUTES.home, element: <LandingPage />, errorElement },
      { path: ROUTES.decks, element: <DeckListPage />, errorElement },
      { path: ROUTES.newDeck, element: <DeckEditorPage />, errorElement },
      { path: ROUTES.deck, element: <DeckEditorPage />, errorElement },
      { path: ROUTES.converter, element: <ConverterPage />, errorElement },
      { path: ROUTES.maintenance, element: <MaintenancePage />, errorElement },
      // Unknown paths keep the empty shell, as they did before the route table was a data router.
      { path: '*' },
    ],
  },
]
