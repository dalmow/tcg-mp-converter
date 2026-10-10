import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'
import { MAIN_CONTENT_ID } from './mainContent'

/** The page h1: 24px on desktop, scaling down to 20px on narrow pages. Shared by every page with a title block. */
export const PAGE_TITLE_CLASS = 'font-display text-h1 text-[length:clamp(20px,2.4vw,24px)]'

type PageLayoutProps = {
  title?: string
  /** Supporting sentence under the title. Setting it turns the title into the visible DS title block. */
  subtitle?: string
  /** Page actions aligned to the end of the title block. Rendered only with a subtitle, as the title block is. */
  actions?: ReactNode
  /** Tighter 28px gap between blocks, as in the Manutenção and DeckEditor artboards (default 40px). */
  compact?: boolean
  children?: ReactNode
}

export function PageLayout({ title, subtitle, actions, compact, children }: PageLayoutProps) {
  return (
    <main
      id={MAIN_CONTENT_ID}
      tabIndex={-1}
      className={cn(
        'mx-auto flex max-w-page flex-col px-page-gutter pt-[clamp(32px,5vw,48px)] pb-[clamp(56px,7vw,88px)] outline-none',
        compact ? 'gap-space-10' : 'gap-space-12',
      )}
    >
      {title && !subtitle && <h1 className="sr-only">{title}</h1>}
      {title && subtitle && (
        <div className="flex flex-wrap items-end justify-between gap-space-7">
          <div className="flex flex-col gap-space-2">
            <h1 className={PAGE_TITLE_CLASS}>{title}</h1>
            <p className="max-w-140 text-body text-ink-muted">{subtitle}</p>
          </div>
          {actions}
        </div>
      )}
      {children}
    </main>
  )
}
