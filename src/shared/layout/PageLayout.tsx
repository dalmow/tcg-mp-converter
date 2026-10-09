import type { ReactNode } from 'react'
import { MAIN_CONTENT_ID } from './mainContent'

type PageLayoutProps = {
  title?: string
  /** Supporting sentence under the title. Setting it turns the title into the visible DS title block. */
  subtitle?: string
  children?: ReactNode
}

export function PageLayout({ title, subtitle, children }: PageLayoutProps) {
  return (
    <main
      id={MAIN_CONTENT_ID}
      tabIndex={-1}
      className="mx-auto flex max-w-[1240px] flex-col gap-space-12 px-[clamp(20px,4vw,40px)] pt-[clamp(32px,5vw,48px)] pb-[clamp(56px,7vw,88px)] outline-none"
    >
      {title && !subtitle && <h1 className="sr-only">{title}</h1>}
      {title && subtitle && (
        <div className="flex flex-col gap-space-2">
          <h1 className="font-display text-h1 text-[length:clamp(20px,2.4vw,24px)]">{title}</h1>
          <p className="max-w-[560px] text-body text-ink-muted">{subtitle}</p>
        </div>
      )}
      {children}
    </main>
  )
}
