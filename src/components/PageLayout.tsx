import type { ReactNode } from 'react'
import { MAIN_CONTENT_ID } from '@/components/mainContent'

export function PageLayout({ title, children }: { title?: string; children?: ReactNode }) {
  return (
    <main
      id={MAIN_CONTENT_ID}
      tabIndex={-1}
      className="mx-auto flex max-w-[96rem] flex-col gap-4 p-2 outline-none"
    >
      {title && <h1 className="sr-only">{title}</h1>}
      {children}
    </main>
  )
}
