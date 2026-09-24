import dayjs from 'dayjs'
import type { GlobalDateRange } from '@/store/filterSlice'

export interface ResolvedDateRange {
  from: string
  to: string
}

/** Converts a global date-range preset into concrete ISO dates (YYYY-MM-DD). */
export function resolveDateRange(range: GlobalDateRange, now = dayjs()): ResolvedDateRange {
  const to = now.format('YYYY-MM-DD')
  switch (range.preset) {
    case 'last7Days':
      return { from: now.subtract(6, 'day').format('YYYY-MM-DD'), to }
    case 'last30Days':
      return { from: now.subtract(29, 'day').format('YYYY-MM-DD'), to }
    case 'last90Days':
      return { from: now.subtract(89, 'day').format('YYYY-MM-DD'), to }
    case 'last12Months':
      return { from: now.subtract(12, 'month').add(1, 'day').format('YYYY-MM-DD'), to }
    case 'next30Days':
      return { from: to, to: now.add(29, 'day').format('YYYY-MM-DD') }
    case 'next90Days':
      return { from: to, to: now.add(89, 'day').format('YYYY-MM-DD') }
    case 'yearToDate':
      return { from: now.startOf('year').format('YYYY-MM-DD'), to }
    case 'custom':
      return { from: range.from ?? to, to: range.to ?? to }
  }
}
