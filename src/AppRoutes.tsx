import { Route, Routes } from 'react-router'
import { Navbar } from '@/components/Navbar'
import ConverterPage from '@/pages/ConverterPage'
import DeckEditorPage from '@/pages/DeckEditorPage'
import DeckListPage from '@/pages/DeckListPage'
import MaintenancePage from '@/pages/MaintenancePage'

export function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<DeckListPage />} />
        <Route path="/decks/new" element={<DeckEditorPage />} />
        <Route path="/decks/:id" element={<DeckEditorPage />} />
        <Route path="/converter" element={<ConverterPage />} />
        <Route path="/maintenance" element={<MaintenancePage />} />
      </Routes>
    </>
  )
}
