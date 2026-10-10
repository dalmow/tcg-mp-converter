import { lazy } from 'react'

// One chunk per page: each route downloads only its own screen code.
export const LandingPage = lazy(() => import('@/features/landing/components/LandingPage'))
export const DeckListPage = lazy(() => import('@/features/decks/components/DeckListPage'))
export const DeckEditorPage = lazy(() => import('@/features/decks/components/DeckEditorPage'))
export const ConverterPage = lazy(() => import('@/features/converter/components/ConverterPage'))
export const MaintenancePage = lazy(() => import('@/features/maintenance/components/MaintenancePage'))
