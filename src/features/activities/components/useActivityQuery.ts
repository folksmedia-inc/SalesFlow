import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import type { ActivityQuery } from './activityFeed'

/** URL keys: ?q=renewal&type=Call,Email&by=Priya%20Raman&rel=customer&from=2026-09-01&to=2026-09-24 */
const LIST_KEYS = { types: 'type', performers: 'by', relatedTypes: 'rel' } as const
type ListKey = keyof typeof LIST_KEYS

function readList(params: URLSearchParams, key: string): string[] {
  return params.get(key)?.split(',').filter(Boolean) ?? []
}

/** Activity feed filters stored in the URL so views can be bookmarked and shared. */
export function useActivityQuery() {
  const [params, setParams] = useSearchParams()

  const query = useMemo<ActivityQuery>(
    () => ({
      search: params.get('q') ?? '',
      types: readList(params, LIST_KEYS.types),
      performers: readList(params, LIST_KEYS.performers),
      relatedTypes: readList(params, LIST_KEYS.relatedTypes),
      from: params.get('from'),
      to: params.get('to'),
    }),
    [params],
  )

  const update = useCallback(
    (mutate: (next: URLSearchParams) => void) =>
      setParams(
        (current) => {
          const next = new URLSearchParams(current)
          mutate(next)
          return next
        },
        { replace: true },
      ),
    [setParams],
  )

  const setSearch = useCallback((search: string) => update((next) => (search ? next.set('q', search) : next.delete('q'))), [update])

  const setList = useCallback(
    (key: ListKey, values: string[]) => update((next) => (values.length > 0 ? next.set(LIST_KEYS[key], values.join(',')) : next.delete(LIST_KEYS[key]))),
    [update],
  )

  const setDateRange = useCallback(
    (range: [string, string] | null) =>
      update((next) => {
        if (range) {
          next.set('from', range[0])
          next.set('to', range[1])
        } else {
          next.delete('from')
          next.delete('to')
        }
      }),
    [update],
  )

  const clearAll = useCallback(
    () =>
      update((next) => {
        for (const key of ['q', 'from', 'to', ...Object.values(LIST_KEYS)]) next.delete(key)
      }),
    [update],
  )

  const activeCount =
    (query.search ? 1 : 0) + (query.types.length ? 1 : 0) + (query.performers.length ? 1 : 0) + (query.relatedTypes.length ? 1 : 0) + (query.from ? 1 : 0)

  return { query, setSearch, setList, setDateRange, clearAll, activeCount }
}
