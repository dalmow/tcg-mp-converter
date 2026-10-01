import { Route, Routes } from 'react-router'
import { Navbar } from '@/components/Navbar'
import { ToastProvider } from '@/components/ui/toast'
import ConverterPage from '@/pages/ConverterPage'
import DeckEditorPage from '@/pages/DeckEditorPage'
import DeckListPage from '@/pages/DeckListPage'
import MaintenancePage from '@/pages/MaintenancePage'
import { ROUTES } from '@/routes'

export function AppRoutes() {
  return (
    <ToastProvider>
      <Navbar />
      <Routes>
        <Route path={ROUTES.decks} element={<DeckListPage />} />
        <Route path={ROUTES.newDeck} element={<DeckEditorPage />} />
        <Route path={ROUTES.deck} element={<DeckEditorPage />} />
        <Route path={ROUTES.converter} element={<ConverterPage />} />
        <Route path={ROUTES.maintenance} element={<MaintenancePage />} />
      </Routes>
    </ToastProvider>
  )
}
