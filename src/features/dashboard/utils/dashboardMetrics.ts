import dayjs, { type Dayjs } from 'dayjs'
import type { TrendPoint } from '@/components/charts/types'
import type { Activity, Customer, Employee, Task } from '@/types/models'

/*
 * Pure metric calculations for the dashboard. Every number is derived from
 * the records passed in — nothing is estimated or hard-coded.
 */

export type DeltaTone = 'positive' | 'negative' | 'neutral' | 'warning'

export interface StatDelta {
  /** Short, signed headline (e.g. "+8.4%"). Omitted for purely descriptive lines. */
  change?: string
  /** What the change is measured against (e.g. "vs prior 30 days"). */
  caption: string
  tone: DeltaTone
  direction?: 'up' | 'down' | 'flat'
}

export interface StatMetric {
  value: number
  delta: StatDelta
}

export const OPEN_TASK_STATUSES = ['Not Started', 'In Progress'] as const
/** Activity types that represent customer/colleague engagement (excludes notes and system updates). */
export const ENGAGEMENT_ACTIVITY_TYPES = ['Call', 'Meeting', 'Email', 'Task'] as const

function formatPercent(value: number): string {
  const rounded = Math.abs(value) >= 100 ? Math.round(value) : Math.round(value * 10) / 10
  return `${rounded > 0 ? '+' : ''}${rounded}%`
}

function isBetween(value: Dayjs, from: Dayjs, to: Dayjs): boolean {
  return !value.isBefore(from) && !value.isAfter(to)
}

/** Current vs previous period, as a signed % change with sensible zero handling. */
function periodChange(current: number, previous: number, caption: string, emptyCaption: string, upIsGood = true): StatDelta {
  if (previous === 0 && current === 0) return { caption: emptyCaption, tone: 'neutral' }
  if (previous === 0) return { change: `+${current}`, caption: `${caption} (none before)`, tone: upIsGood ? 'positive' : 'negative', direction: 'up' }
  const pct = ((current - previous) / previous) * 100
  if (pct === 0) return { change: '0%', caption, tone: 'neutral', direction: 'flat' }
  const up = pct > 0
  return { change: formatPercent(pct), caption, tone: up === upIsGood ? 'positive' : 'negative', direction: up ? 'up' : 'down' }
}

/** Total employees; change = hires this month relative to headcount at the start of the month. */
export function totalEmployeesMetric(employees: Employee[], now = dayjs()): StatMetric {
  const monthStart = now.startOf('month')
  const joinedThisMonth = employees.filter((employee) => isBetween(dayjs(employee.joiningDate), monthStart, now.endOf('day'))).length
  const atMonthStart = employees.filter((employee) => dayjs(employee.joiningDate).isBefore(monthStart)).length
  if (joinedThisMonth === 0) return { value: employees.length, delta: { caption: 'No new hires this month', tone: 'neutral' } }
  const caption = `${joinedThisMonth} joined this month`
  if (atMonthStart === 0) return { value: employees.length, delta: { change: `+${joinedThisMonth}`, caption, tone: 'positive', direction: 'up' } }
  return { value: employees.length, delta: { change: formatPercent((joinedThisMonth / atMonthStart) * 100), caption, tone: 'positive', direction: 'up' } }
}

/** Active employees; the supporting line is their share of the workforce (no status history exists). */
export function activeEmployeesMetric(employees: Employee[]): StatMetric {
  const active = employees.filter((employee) => employee.status === 'Active').length
  const onLeave = employees.filter((employee) => employee.status === 'On Leave').length
  const share = employees.length ? Math.round((active / employees.length) * 100) : 0
  return {
    value: active,
    delta: { change: `${share}%`, caption: `of workforce${onLeave ? ` · ${onLeave} on leave` : ''}`, tone: 'neutral' },
  }
}

/** Customers; change = customers created in the last 30 days vs the 30 days before. */
export function customersMetric(customers: Customer[], now = dayjs()): StatMetric {
  const end = now.endOf('day')
  const currentStart = now.subtract(29, 'day').startOf('day')
  const previousStart = now.subtract(59, 'day').startOf('day')
  const previousEnd = currentStart.subtract(1, 'millisecond')
  const current = customers.filter((customer) => isBetween(dayjs(customer.createdAt), currentStart, end)).length
  const previous = customers.filter((customer) => isBetween(dayjs(customer.createdAt), previousStart, previousEnd)).length
  const delta = periodChange(current, previous, `${current} new vs prior 30 days`, 'No new customers in the last 60 days')
  return { value: customers.length, delta }
}

/** Open tasks (Not Started / In Progress); supporting line = how many are past due. */
export function openTasksMetric(tasks: Task[], now = dayjs()): StatMetric {
  const open = tasks.filter((task) => (OPEN_TASK_STATUSES as readonly string[]).includes(task.status))
  const today = now.startOf('day')
  const overdue = open.filter((task) => task.dueDate && dayjs(task.dueDate).isBefore(today)).length
  return {
    value: open.length,
    delta: overdue > 0 ? { change: String(overdue), caption: 'overdue', tone: 'warning' } : { caption: 'None overdue', tone: 'positive' },
  }
}

/** Calls, meetings, emails and tasks logged in the last 7 days vs the 7 days before. */
export function engagementMetric(activities: Activity[], now = dayjs()): StatMetric {
  const engagements = activities.filter((activity) => (ENGAGEMENT_ACTIVITY_TYPES as readonly string[]).includes(activity.type))
  const currentStart = now.subtract(7, 'day')
  const previousStart = now.subtract(14, 'day')
  const current = engagements.filter((activity) => isBetween(dayjs(activity.occurredAt), currentStart, now)).length
  const previous = engagements.filter((activity) => {
    const at = dayjs(activity.occurredAt)
    return !at.isBefore(previousStart) && at.isBefore(currentStart)
  }).length
  return { value: current, delta: periodChange(current, previous, 'vs prior 7 days', 'None in the last 14 days') }
}

/**
 * Cumulative headcount at the end of each of the last `months` months
 * (current month = up to today), based on joining dates.
 */
export function headcountTrend(employees: Employee[], months = 12, now = dayjs()): TrendPoint[] {
  const joinDates = employees.map((employee) => dayjs(employee.joiningDate))
  return Array.from({ length: months }, (_, index) => {
    const month = now.subtract(months - 1 - index, 'month')
    const cutoff = index === months - 1 ? now.endOf('day') : month.endOf('month')
    return {
      label: month.format('MMM'),
      fullLabel: month.format('MMMM YYYY'),
      value: joinDates.filter((date) => !date.isAfter(cutoff)).length,
    }
  })
}

export function greeting(now = dayjs()): string {
  const hour = now.hour()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}
