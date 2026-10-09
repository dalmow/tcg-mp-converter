import { Route, Routes } from 'react-router'
import { Navbar } from './Navbar'
import { ToastProvider } from '@/shared/ui/Toast'
import { ConverterPage } from '@/features/converter'
import { DeckEditorPage, DeckListPage } from '@/features/decks'
import { LandingPage } from '@/features/landing'
import { MaintenancePage } from '@/features/maintenance'
import { ROUTES } from '@/shared/lib/routes'

export function AppRoutes() {
  return (
    <ToastProvider>
      <Navbar />
      <Routes>
        <Route path={ROUTES.home} element={<LandingPage />} />
        <Route path={ROUTES.decks} element={<DeckListPage />} />
        <Route path={ROUTES.newDeck} element={<DeckEditorPage />} />
        <Route path={ROUTES.deck} element={<DeckEditorPage />} />
        <Route path={ROUTES.converter} element={<ConverterPage />} />
        <Route path={ROUTES.maintenance} element={<MaintenancePage />} />
      </Routes>
    </ToastProvider>
  )
}
