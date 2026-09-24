import { useMatches } from 'react-router'
import { isRouteHandle, type RouteHandle } from '@/types/router'

/** Returns the `handle` metadata of the deepest matched route that defines one. */
export function useRouteHandle(): RouteHandle | undefined {
  const matches = useMatches()
  for (let index = matches.length - 1; index >= 0; index -= 1) {
    const { handle } = matches[index]
    if (isRouteHandle(handle)) return handle
  }
  return undefined
}
