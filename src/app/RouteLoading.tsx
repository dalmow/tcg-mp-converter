import { PageLayout } from '@/shared/layout/PageLayout'

export const ROUTE_LOADING_TEXT = 'Carregando…'

/** Suspense fallback while a page chunk loads. Keeps the `main` landmark so the skip link still has a target. */
export function RouteLoading() {
  return (
    <PageLayout>
      <p role="status" className="text-body text-ink-muted">
        {ROUTE_LOADING_TEXT}
      </p>
    </PageLayout>
  )
}
