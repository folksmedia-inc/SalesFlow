import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import type { Lookups } from '@/hooks/useLookups'
import type { Activity, ActivityType } from '@/types/models'

dayjs.extend(isBetween)

/** Value used in the "Related to" filter for activities without a linked record. */
export const NO_RELATED = 'none'

export interface ActivityQuery {
  search: string
  types: string[]
  performers: string[]
  relatedTypes: string[]
  from: string | null
  to: string | null
}

export interface ActivityDayGroup {
  key: string
  label: string
  /** Full date shown next to "Today"/"Yesterday". */
  date: string
  items: Activity[]
}

function matchesQuery(activity: Activity, query: ActivityQuery, lookups: Lookups, ignoreType: boolean): boolean {
  if (!ignoreType && query.types.length > 0 && !query.types.includes(activity.type)) return false
  if (query.performers.length > 0 && !query.performers.includes(activity.performedBy)) return false
  if (query.relatedTypes.length > 0 && !query.relatedTypes.includes(activity.related?.type ?? NO_RELATED)) return false
  if (query.from && query.to && !dayjs(activity.occurredAt).isBetween(query.from, query.to, 'day', '[]')) return false
  const term = query.search.trim().toLowerCase()
  if (term) {
    const text = [activity.subject, activity.description, activity.performedBy, activity.type, activity.related ? lookups.relatedName(activity.related) : ''].join(' ')
    if (!text.toLowerCase().includes(term)) return false
  }
  return true
}

/**
 * Filters activities (newest first) and counts matches per type. Counts
 * ignore the type filter so the chips show what selecting each would give.
 */
export function filterActivities(activities: Activity[], query: ActivityQuery, lookups: Lookups) {
  const typeCounts = {} as Record<ActivityType, number>
  let countAll = 0
  const results: Activity[] = []
  for (const activity of activities) {
    if (!matchesQuery(activity, query, lookups, true)) continue
    countAll += 1
    typeCounts[activity.type] = (typeCounts[activity.type] ?? 0) + 1
    if (query.types.length === 0 || query.types.includes(activity.type)) results.push(activity)
  }
  results.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
  return { results, typeCounts, countAll }
}

export function dayLabel(value: string, now = dayjs()): { label: string; date: string } {
  const day = dayjs(value)
  const date = day.format(day.isSame(now, 'year') ? 'ddd, MMM D' : 'ddd, MMM D, YYYY')
  if (day.isSame(now, 'day')) return { label: 'Today', date }
  if (day.isSame(now.subtract(1, 'day'), 'day')) return { label: 'Yesterday', date }
  return { label: date, date: '' }
}

/** Groups already-sorted activities by calendar day. */
export function groupByDay(activities: Activity[]): ActivityDayGroup[] {
  const groups: ActivityDayGroup[] = []
  const now = dayjs()
  for (const activity of activities) {
    const key = dayjs(activity.occurredAt).format('YYYY-MM-DD')
    const last = groups[groups.length - 1]
    if (last?.key === key) last.items.push(activity)
    else groups.push({ key, ...dayLabel(activity.occurredAt, now), items: [activity] })
  }
  return groups
}
