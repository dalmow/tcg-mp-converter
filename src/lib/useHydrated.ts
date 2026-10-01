import { useSyncExternalStore } from 'react'

const subscribeNever = () => () => {}

/** False in prerendered HTML and while hydrating, true afterwards (and always on a client-only render). */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribeNever, () => true, () => false)
}
