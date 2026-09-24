import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import type { Lookups } from '@/hooks/useLookups'
import type { SortOrder } from '@/types/common'
import type { ColumnConfig, FilterConfig } from './types'

dayjs.extend(isBetween)

/** Active filter values: select filters hold ids/values, date ranges hold [from, to]. */
export type FilterValues = Record<string, string[]>

export interface ListQuery {
  search: string
  filters: FilterValues
  sortField: string | null
  sortOrder: SortOrder | null
}

function matchesFilter<T>(record: T, filter: FilterConfig<T>, selected: string[]): boolean {
  if (selected.length === 0) return true
  const value = filter.getValue(record)

  if (filter.type === 'dateRange') {
    const [from, to] = selected
    if (!value || typeof value !== 'string') return false
    return dayjs(value).isBetween(from ?? '1900-01-01', to ?? '2999-12-31', 'day', '[]')
  }

  if (value === null || value === undefined) return selected.includes('__none__')
  const values = typeof value === 'string' ? [value] : value
  return values.some((item) => selected.includes(item))
}

function columnValue<T>(record: T, column: ColumnConfig<T>, lookups: Lookups): string | number | null | undefined {
  if (column.value) return column.value(record, lookups)
  const raw = (record as Record<string, unknown>)[column.key]
  return typeof raw === 'string' || typeof raw === 'number' ? raw : null
}

/** Applies search, filters and sorting to a collection (pagination is done by the table). */
export function applyListQuery<T>(
  records: T[],
  query: ListQuery,
  options: {
    searchText: (record: T, lookups: Lookups) => string
    filters: FilterConfig<T>[]
    columns: ColumnConfig<T>[]
    lookups: Lookups
  },
): T[] {
  const term = query.search.trim().toLowerCase()
  const activeFilters = options.filters.filter((filter) => (query.filters[filter.key]?.length ?? 0) > 0)

  let result = records.filter((record) => {
    if (term && !options.searchText(record, options.lookups).toLowerCase().includes(term)) return false
    return activeFilters.every((filter) => matchesFilter(record, filter, query.filters[filter.key]))
  })

  const sortColumn = options.columns.find((column) => column.key === query.sortField)
  if (sortColumn && query.sortOrder) {
    const direction = query.sortOrder === 'asc' ? 1 : -1
    result = [...result].sort((a, b) => {
      const left = columnValue(a, sortColumn, options.lookups)
      const right = columnValue(b, sortColumn, options.lookups)
      if (left === right) return 0
      if (left === null || left === undefined || left === '—') return 1
      if (right === null || right === undefined || right === '—') return -1
      if (typeof left === 'number' && typeof right === 'number') return (left - right) * direction
      return String(left).localeCompare(String(right), undefined, { numeric: true }) * direction
    })
  }

  return result
}

export function getColumnExportValue<T>(record: T, column: ColumnConfig<T>, lookups: Lookups): string | number | null | undefined {
  return columnValue(record, column, lookups)
}
