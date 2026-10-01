import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createHashRouter, RouterProvider } from 'react-router'
import './index.css'
import { AppRoutes } from './AppRoutes.tsx'

// A data router, because the deck editor blocks navigation while it has unsaved changes.
const router = createHashRouter([{ path: '*', element: <AppRoutes /> }])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
