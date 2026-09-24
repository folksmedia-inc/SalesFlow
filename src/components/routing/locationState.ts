import type { Location } from 'react-router'

/** State passed to /login so the user returns to the page they requested. */
export interface RedirectLocationState {
  from?: Pick<Location, 'pathname' | 'search' | 'hash'>
}

export function getRedirectPath(state: unknown, fallback: string): string {
  const from = (state as RedirectLocationState | null)?.from
  if (!from?.pathname || from.pathname === '/login') return fallback
  return `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`
}
