import dayjs, { type Dayjs } from 'dayjs'
import type { TrendPoint } from '@/components/charts/types'
import type { ResolvedDateRange } from '@/utils/dateRange'

/** True when an ISO date / date-time falls inside the (inclusive, whole-day) range. */
export function inRange(value: string | null | undefined, range: ResolvedDateRange): boolean {
  if (!value) return false
  const date = dayjs(value)
  return !date.isBefore(dayjs(range.from).startOf('day')) && !date.isAfter(dayjs(range.to).endOf('day'))
}

export type BucketUnit = 'day' | 'week' | 'month'

/** Picks a readable bucket size for the range length. */
export function bucketUnitFor(range: ResolvedDateRange): BucketUnit {
  const days = dayjs(range.to).diff(dayjs(range.from), 'day') + 1
  if (days <= 31) return 'day'
  if (days <= 120) return 'week'
  return 'month'
}

function bucketStart(date: Dayjs, unit: BucketUnit): Dayjs {
  // Weeks start on Monday (dayjs' default week starts Sunday).
  if (unit === 'week') return date.startOf('day').subtract((date.day() + 6) % 7, 'day')
  return date.startOf(unit)
}

function bucketLabels(start: Dayjs, unit: BucketUnit, multiYear: boolean): { label: string; fullLabel: string } {
  if (unit === 'month') return { label: multiYear ? start.format("MMM 'YY") : start.format('MMM'), fullLabel: start.format('MMMM YYYY') }
  if (unit === 'week') return { label: start.format('MMM D'), fullLabel: `Week of ${start.format('MMM D, YYYY')}` }
  return { label: start.format('MMM D'), fullLabel: start.format('ddd, MMM D, YYYY') }
}

/**
 * Counts dates per day / week / month across the whole range, including
 * empty buckets so gaps are visible.
 */
export function countByPeriod(dates: string[], range: ResolvedDateRange): { unit: BucketUnit; points: TrendPoint[] } {
  const unit = bucketUnitFor(range)
  const from = dayjs(range.from)
  const to = dayjs(range.to)
  const multiYear = from.year() !== to.year()
  const counts = new Map<string, number>()
  for (const value of dates) {
    const key = bucketStart(dayjs(value), unit).format('YYYY-MM-DD')
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  const points: TrendPoint[] = []
  for (let cursor = bucketStart(from, unit); !cursor.isAfter(to); cursor = cursor.add(1, unit)) {
    const key = cursor.format('YYYY-MM-DD')
    points.push({ ...bucketLabels(cursor, unit, multiYear), value: counts.get(key) ?? 0 })
  }
  return { unit, points }
}

export const BUCKET_TITLE: Record<BucketUnit, string> = { day: 'per day', week: 'per week', month: 'per month' }

/** Counts records per key, sorted by count (desc) then label. */
export function countBy<T>(records: T[], getKey: (record: T) => string, getLabel: (key: string) => string = (key) => key) {
  const counts = new Map<string, number>()
  for (const record of records) {
    const key = getKey(record)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([key, value]) => ({ key, label: getLabel(key), value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
}

/** Share as a whole-number percentage string. */
export function percentOf(part: number, total: number): string {
  return total ? `${Math.round((part / total) * 100)}%` : '0%'
}
