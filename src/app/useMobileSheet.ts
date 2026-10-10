import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router'

/**
 * Open state of the mobile navigation sheet, and the hamburger ref that Escape returns focus to.
 * The sheet is keyed to the path it was opened on, so navigating closes it without an effect.
 */
export function useMobileSheet() {
  const [openedAt, setOpenedAt] = useState<string | null>(null)
  const toggle = useRef<HTMLButtonElement>(null)
  const { pathname } = useLocation()
  const sheetOpen = openedAt === pathname

  useEffect(() => {
    if (!sheetOpen) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      setOpenedAt(null)
      toggle.current?.focus()
    }
    // The sheet is `nav:hidden`; drop the open state when the inline nav takes over.
    const wide = window.matchMedia?.('(min-width: 860px)')
    function onWide() {
      if (wide?.matches) setOpenedAt(null)
    }
    document.addEventListener('keydown', onKeyDown)
    wide?.addEventListener('change', onWide)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      wide?.removeEventListener('change', onWide)
    }
  }, [sheetOpen])

  return {
    sheetOpen,
    setSheetOpen: (open: boolean) => setOpenedAt(open ? pathname : null),
    toggle,
  }
}
