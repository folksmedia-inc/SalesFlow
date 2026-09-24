import dayjs from 'dayjs'
import { AlertCircle } from 'lucide-react'
import type { TaskStatus } from '@/types/models'
import { formatDate } from '@/utils/format'
import { isTaskOverdue } from '../utils/taskUtils'

/** Due date that turns red with an icon when the task is overdue. */
export function DueDate({ dueDate, status }: { dueDate: string | null; status: TaskStatus }) {
  if (!dueDate) return <span style={{ color: 'var(--app-text-tertiary)' }}>No due date</span>
  const overdue = isTaskOverdue(dueDate, status)
  const today = dayjs(dueDate).isSame(dayjs(), 'day')
  return (
    <span style={{ color: overdue ? 'var(--app-color-error)' : undefined, display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
      {overdue && <AlertCircle size={14} aria-label="Overdue" />}
      {today ? 'Today' : formatDate(dueDate)}
    </span>
  )
}
