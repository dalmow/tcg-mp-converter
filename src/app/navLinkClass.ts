const focusRing =
  'rounded-sm outline-none focus-visible:ring-1 focus-visible:ring-ink-faint focus-visible:ring-offset-2 focus-visible:ring-offset-surface-000'

/** Inline header link: resting `ink-soft`, `secondary` on hover and when current. */
export const navLinkClass = `inline-flex items-center gap-space-2 text-nav-link text-ink-soft transition-colors hover:text-secondary aria-[current=page]:text-secondary ${focusRing}`

/** Stacked row inside the mobile sheet. */
export const sheetRowClass =
  'flex w-full items-center gap-space-4 border-b border-border-faint px-space-8 py-space-7 text-left text-body-strong text-ink-soft transition-colors hover:text-secondary aria-[current=page]:text-secondary focus-visible:bg-secondary-tint-strong focus-visible:outline-none'
