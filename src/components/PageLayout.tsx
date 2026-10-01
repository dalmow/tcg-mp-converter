import type { ReactNode } from 'react'

export function PageLayout({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <main className="mx-auto flex max-w-[96rem] flex-col gap-4 p-2">
      <h1 className="text-xl font-semibold">{title}</h1>
      {children}
    </main>
  )
}
