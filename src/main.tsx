import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import './index.css'
import { appRoutes } from '@/app/AppRoutes'

// Links from the hash-router days (`/#/converter`) become clean paths.
if (window.location.hash.startsWith('#/')) {
  window.history.replaceState(null, '', window.location.hash.slice(1))
}

// A data router, because the deck editor blocks navigation while it has unsaved changes.
const router = createBrowserRouter(appRoutes)

const app = (
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
const root = document.getElementById('root')
if (!root) throw new Error('index.html has no #root element')

// Public pages are prerendered and hydrated; every other route starts from the empty shell.
if (root.hasChildNodes()) hydrateRoot(root, app)
else createRoot(root).render(app)
