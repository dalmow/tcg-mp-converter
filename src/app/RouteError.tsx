import { Link } from 'react-router'
import { usePageMeta } from '@/shared/hooks/usePageMeta'
import { PageLayout } from '@/shared/layout/PageLayout'
import { PAGE_META } from '@/shared/lib/pageMeta'
import { ROUTES } from '@/shared/lib/routes'
import { buttonVariants } from '@/shared/ui/buttonVariants'

/**
 * Error element of every route: a failed render or chunk load lands here instead of a blank page.
 * The error itself stays out of the UI; the user only gets a way back to the home page.
 */
export function RouteError() {
  // The failed page never mounted, so its own metadata is missing; this replaces the previous route's title and canonical.
  usePageMeta(PAGE_META.routeError)
  return (
    <PageLayout title="Algo deu errado" subtitle={PAGE_META.routeError.description}>
      <Link to={ROUTES.home} className={buttonVariants({ variant: 'primary' })}>
        Voltar ao início
      </Link>
    </PageLayout>
  )
}
