import type { ReactNode } from 'react'

export function PageLayout({ children }: { children?: ReactNode }) {
  return (
    <main className="mx-auto flex max-w-[96rem] flex-col gap-4 p-2">
      {children}
    </main>
  )
}
