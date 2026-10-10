import { Link } from 'react-router'
import { PageLayout } from '@/shared/layout/PageLayout'
import { ROUTES } from '@/shared/lib/routes'
import { buttonVariants } from '@/shared/ui/buttonVariants'

/**
 * Error element of every route: a failed render or chunk load lands here instead of a blank page.
 * The error itself stays out of the UI; the user only gets a way back to the home page.
 */
export function RouteError() {
  return (
    <PageLayout title="Algo deu errado" subtitle="Não foi possível mostrar esta página.">
      <Link to={ROUTES.home} className={buttonVariants({ variant: 'primary' })}>
        Voltar ao início
      </Link>
    </PageLayout>
  )
}
