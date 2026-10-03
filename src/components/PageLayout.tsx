import type { ReactNode } from 'react'

export function PageLayout({ title, children }: { title?: string; children?: ReactNode }) {
  return (
    <main id="conteudo" className="mx-auto flex max-w-[96rem] flex-col gap-4 p-2">
      {title && <h1 className="sr-only">{title}</h1>}
      {children}
    </main>
  )
}
