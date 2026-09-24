import { useMemo } from 'react'
import { useMatches } from 'react-router'
import { isRouteHandle } from '@/types/router'

export interface BreadcrumbEntry {
  label: string
  path: string
}

/** Builds breadcrumbs from the `crumb` of every matched route. */
export function useBreadcrumbs(): BreadcrumbEntry[] {
  const matches = useMatches()
  return useMemo(
    () =>
      matches.flatMap((match) =>
        isRouteHandle(match.handle) && match.handle.crumb
          ? [{ label: match.handle.crumb, path: match.pathname }]
          : [],
      ),
    [matches],
  )
}
