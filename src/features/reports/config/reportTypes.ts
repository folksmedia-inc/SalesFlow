import type { LucideIcon } from 'lucide-react'
import { Activity, Building2, ListTodo, Users, UsersRound } from 'lucide-react'

export const REPORT_KEYS = ['employees', 'departments', 'customers', 'tasks', 'activities'] as const
export type ReportKey = (typeof REPORT_KEYS)[number]

export const DEFAULT_REPORT: ReportKey = 'employees'

export interface ReportMeta {
  key: ReportKey
  label: string
  description: string
  icon: LucideIcon
  /** Which date the global date range is applied to. */
  dateField: string
}

export const REPORTS: Record<ReportKey, ReportMeta> = {
  employees: { key: 'employees', label: 'Employee Report', description: 'Hires, status and tenure', icon: Users, dateField: 'joining date' },
  departments: { key: 'departments', label: 'Department Report', description: 'Headcount and budget', icon: Building2, dateField: 'joining date (new hires)' },
  customers: { key: 'customers', label: 'Customer Report', description: 'Acquisition and value', icon: UsersRound, dateField: 'created date' },
  tasks: { key: 'tasks', label: 'Task Report', description: 'Workload and progress', icon: ListTodo, dateField: 'due date' },
  activities: { key: 'activities', label: 'Activity Report', description: 'Calls, emails, meetings', icon: Activity, dateField: 'activity date' },
}

export function isReportKey(value: string | null): value is ReportKey {
  return value !== null && (REPORT_KEYS as readonly string[]).includes(value)
}
