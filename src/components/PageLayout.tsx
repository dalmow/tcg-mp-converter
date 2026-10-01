import type { ReactNode } from 'react'

export function PageLayout({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      <h1 className="text-xl font-semibold">{title}</h1>
      {children}
    </main>
  )
}
