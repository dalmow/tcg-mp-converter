import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

/** Fragment id of the page `main` landmark, targeted by the skip link. */
export const MAIN_CONTENT_ID = 'conteudo'

/** The page `main` landmark. The router focuses it on navigation, so it takes focus without a ring. */
export function MainContent({ className, children }: { className?: string; children?: ReactNode }) {
  return (
    <main id={MAIN_CONTENT_ID} tabIndex={-1} className={cn('outline-none', className)}>
      {children}
    </main>
  )
}
