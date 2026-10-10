import type { ReactNode } from 'react'
import { LucideProvider } from 'lucide-react'

/** Stroke of every lucide icon: the design system asks for 1.4 to 1.8, with round caps (lucide's default). */
export const ICON_STROKE_WIDTH = 1.6

/** Sets the stroke once for every lucide icon below it. Mounted by the app shell. */
export function IconDefaults({ children }: { children: ReactNode }) {
  return <LucideProvider strokeWidth={ICON_STROKE_WIDTH}>{children}</LucideProvider>
}
