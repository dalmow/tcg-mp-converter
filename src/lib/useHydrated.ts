import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}

/** False in prerendered HTML and while hydrating, true afterwards (and always on a client-only render). */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false)
}
