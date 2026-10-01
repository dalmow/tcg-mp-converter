import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import './index.css'
import { AppRoutes } from './AppRoutes.tsx'

// A data router, because the deck editor blocks navigation while it has unsaved changes.
const router = createBrowserRouter([{ path: '*', element: <AppRoutes /> }])

const app = (
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
const root = document.getElementById('root')!

// Public pages are prerendered and hydrated; every other route starts from the empty shell.
if (root.hasChildNodes()) hydrateRoot(root, app)
else createRoot(root).render(app)
