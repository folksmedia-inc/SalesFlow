import dayjs from 'dayjs'
import type { LucideIcon } from 'lucide-react'
import { AlertCircle, CalendarClock, CheckCircle2, CircleDot } from 'lucide-react'
import { memo, useMemo } from 'react'
import type { Task } from '@/types/models'
import { formatNumber } from '@/utils/format'
import { isTaskOverdue } from '../utils/taskUtils'
import styles from './TaskKanbanBoard.module.scss'

interface Stat {
  key: string
  label: string
  value: number
  icon: LucideIcon
  /** Icon color; the number itself always uses text tokens. */
  tone: string
}

/** Compact counts for the tasks currently shown (after search and filters). */
export const TaskKanbanSummary = memo(function TaskKanbanSummary({ tasks }: { tasks: Task[] }) {
  const stats = useMemo<Stat[]>(() => {
    const today = dayjs().startOf('day')
    const weekEnd = today.add(6, 'day')
    let open = 0
    let overdue = 0
    let dueSoon = 0
    let completed = 0
    for (const task of tasks) {
      if (task.status === 'Completed') completed += 1
      if (task.status !== 'Not Started' && task.status !== 'In Progress') continue
      open += 1
      if (isTaskOverdue(task.dueDate, task.status)) overdue += 1
      else if (task.dueDate && !dayjs(task.dueDate).isAfter(weekEnd, 'day')) dueSoon += 1
    }
    return [
      { key: 'open', label: 'Open', value: open, icon: CircleDot, tone: 'var(--app-color-primary)' },
      { key: 'overdue', label: 'Overdue', value: overdue, icon: AlertCircle, tone: 'var(--app-color-error)' },
      { key: 'week', label: 'Due in 7 days', value: dueSoon, icon: CalendarClock, tone: 'var(--app-color-warning)' },
      { key: 'completed', label: 'Completed', value: completed, icon: CheckCircle2, tone: 'var(--app-color-success)' },
    ]
  }, [tasks])

  return (
    <dl className={styles.summary} aria-label="Task summary">
      {stats.map(({ key, label, value, icon: Icon, tone }) => (
        <div key={key} className={styles.stat}>
          <span className={styles.statIcon} style={{ color: tone }} aria-hidden="true">
            <Icon size={16} />
          </span>
          <dt className={styles.statLabel}>{label}</dt>
          <dd className={styles.statValue}>{formatNumber(value)}</dd>
        </div>
      ))}
    </dl>
  )
})
