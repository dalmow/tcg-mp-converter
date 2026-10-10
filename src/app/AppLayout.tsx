import { Suspense } from 'react'
import { Outlet } from 'react-router'
import { Navbar } from './Navbar'
import { RouteLoading } from './RouteLoading'
import { ToastProvider } from '@/shared/ui/Toast'
import { IconDefaults } from '@/shared/ui/icons'

/** Shell shared by every route. Pages render into the `Outlet`, behind the fallback shown while their chunk loads. */
export function AppLayout() {
  return (
    <IconDefaults>
      <ToastProvider>
        <Navbar />
        <Suspense fallback={<RouteLoading />}>
          <Outlet />
        </Suspense>
      </ToastProvider>
    </IconDefaults>
  )
}
