import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { DEFAULT_PAGE_SIZE } from '@/constants/app'
import type { SortOrder } from '@/types/common'
import type { FilterValues, ListQuery } from './listQuery'

const FILTER_PREFIX = 'f.'

export interface ListUrlState extends ListQuery {
  page: number
  pageSize: number
  activeFilterCount: number
  setSearch: (search: string) => void
  setFilter: (key: string, values: string[]) => void
  clearFilters: () => void
  setSort: (field: string | null, order: SortOrder | null) => void
  setPage: (page: number, pageSize: number) => void
}

/**
 * List state (search, filters, sort, pagination) stored in the URL so any
 * list view can be bookmarked or shared.
 *   ?q=smith&f.status=Active,On%20Leave&sort=name&order=asc&page=2&size=20
 */
export function useListUrlState(defaultSort?: { field: string; order: SortOrder }): ListUrlState {
  const [params, setParams] = useSearchParams()

  const state = useMemo(() => {
    const filters: FilterValues = {}
    params.forEach((value, key) => {
      if (key.startsWith(FILTER_PREFIX) && value) filters[key.slice(FILTER_PREFIX.length)] = value.split(',')
    })
    const order = params.get('order')
    return {
      search: params.get('q') ?? '',
      filters,
      sortField: params.get('sort') ?? defaultSort?.field ?? null,
      sortOrder: order === 'asc' || order === 'desc' ? order : params.has('sort') ? null : (defaultSort?.order ?? null),
      page: Math.max(1, Number(params.get('page')) || 1),
      pageSize: Number(params.get('size')) || DEFAULT_PAGE_SIZE,
      activeFilterCount: Object.keys(filters).length,
    }
  }, [params, defaultSort?.field, defaultSort?.order])

  const update = useCallback(
    (mutate: (next: URLSearchParams) => void, resetPage = true) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current)
          mutate(next)
          if (resetPage) next.delete('page')
          return next
        },
        { replace: true },
      )
    },
    [setParams],
  )

  const setSearch = useCallback(
    (search: string) => update((next) => (search ? next.set('q', search) : next.delete('q'))),
    [update],
  )

  const setFilter = useCallback(
    (key: string, values: string[]) =>
      update((next) => (values.length > 0 ? next.set(`${FILTER_PREFIX}${key}`, values.join(',')) : next.delete(`${FILTER_PREFIX}${key}`))),
    [update],
  )

  const clearFilters = useCallback(
    () =>
      update((next) => {
        ;[...next.keys()].filter((key) => key.startsWith(FILTER_PREFIX)).forEach((key) => next.delete(key))
        next.delete('q')
      }),
    [update],
  )

  const setSort = useCallback(
    (field: string | null, order: SortOrder | null) =>
      update((next) => {
        if (field) {
          next.set('sort', field)
          if (order) next.set('order', order)
          else next.delete('order')
        } else {
          next.delete('sort')
          next.delete('order')
        }
      }, false),
    [update],
  )

  const setPage = useCallback(
    (page: number, pageSize: number) =>
      update((next) => {
        if (page > 1) next.set('page', String(page))
        else next.delete('page')
        if (pageSize !== DEFAULT_PAGE_SIZE) next.set('size', String(pageSize))
        else next.delete('size')
      }, false),
    [update],
  )

  return { ...state, setSearch, setFilter, clearFilters, setSort, setPage }
}
