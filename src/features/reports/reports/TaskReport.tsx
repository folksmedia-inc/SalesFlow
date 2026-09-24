import type { TableColumnsType } from 'antd'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { Link } from 'react-router'
import { BarBreakdownChart } from '@/components/charts/BarBreakdownChart'
import { ChartCard } from '@/components/charts/ChartCard'
import { ColumnChart } from '@/components/charts/ColumnChart'
import { StatusTag } from '@/components/common/StatusTag'
import { useEntityList } from '@/hooks/useEntityData'
import { useLookupOptions, useLookups } from '@/hooks/useLookups'
import { TASK_PRIORITIES, TASK_STATUSES, type Task } from '@/types/models'
import { formatDate, formatNumber } from '@/utils/format'
import { ReportLayout, type ReportContext } from '../components/ReportLayout'
import { enumOptions, matches, NONE_VALUE } from '../utils/filters'
import { inRange, percentOf } from '../utils/reportUtils'
import styles from './reports.module.scss'

interface TaskRow extends Task {
  assignee: string
  relatedName: string
  relatedPath: string | undefined
  overdue: boolean
}

const OPEN_STATUSES: readonly string[] = ['Not Started', 'In Progress']

/** Tasks due within the period (tasks without a due date are excluded). */
export function TaskReport({ context }: { context: ReportContext }) {
  const tasks = useEntityList('tasks')
  const lookups = useLookups()
  const employeeOptions = useLookupOptions('employees')
  const { range, filters } = context

  const rows = useMemo<TaskRow[]>(() => {
    const today = dayjs().startOf('day')
    return tasks
      .filter(
        (task) =>
          inRange(task.dueDate, range) &&
          matches(filters.status, task.status) &&
          matches(filters.priority, task.priority) &&
          matches(filters.assignee, task.assigneeId ?? NONE_VALUE),
      )
      .map((task) => ({
        ...task,
        assignee: task.assigneeId ? lookups.employeeName(task.assigneeId) : 'Unassigned',
        relatedName: task.related ? lookups.relatedName(task.related) : '—',
        relatedPath: lookups.relatedPath(task.related),
        overdue: OPEN_STATUSES.includes(task.status) && Boolean(task.dueDate) && dayjs(task.dueDate).isBefore(today),
      }))
      .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))
  }, [tasks, range, filters, lookups])

  const completed = rows.filter((row) => row.status === 'Completed').length
  const cancelled = rows.filter((row) => row.status === 'Cancelled').length
  const open = rows.filter((row) => OPEN_STATUSES.includes(row.status)).length
  const overdue = rows.filter((row) => row.overdue).length
  const closable = rows.length - cancelled

  const byStatus = TASK_STATUSES.map((status) => ({ label: status, fullLabel: status, value: rows.filter((row) => row.status === status).length }))
  const openByAssignee = useMemo(() => {
    const counts = new Map<string, number>()
    for (const row of rows) if (OPEN_STATUSES.includes(row.status)) counts.set(row.assignee, (counts.get(row.assignee) ?? 0) + 1)
    return [...counts.entries()].map(([label, value]) => ({ key: label, label, value })).sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
  }, [rows])

  const columns: TableColumnsType<TaskRow> = [
    { key: 'title', title: 'Task', dataIndex: 'title', sorter: (a, b) => a.title.localeCompare(b.title), render: (title: string) => <span className={styles.strong}>{title}</span> },
    { key: 'assignee', title: 'Assignee', dataIndex: 'assignee', sorter: (a, b) => a.assignee.localeCompare(b.assignee) },
    { key: 'priority', title: 'Priority', dataIndex: 'priority', sorter: (a, b) => TASK_PRIORITIES.indexOf(a.priority) - TASK_PRIORITIES.indexOf(b.priority), render: (priority: string) => <StatusTag status={priority} /> },
    { key: 'status', title: 'Status', dataIndex: 'status', sorter: (a, b) => TASK_STATUSES.indexOf(a.status) - TASK_STATUSES.indexOf(b.status), render: (status: string) => <StatusTag status={status} /> },
    {
      key: 'dueDate',
      title: 'Due Date',
      dataIndex: 'dueDate',
      defaultSortOrder: 'ascend',
      sorter: (a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''),
      render: (value: string | null, row) => (
        <span className={row.overdue ? styles.overdue : undefined}>
          {formatDate(value)}
          {row.overdue && ' · Overdue'}
        </span>
      ),
    },
    { key: 'related', title: 'Related To', dataIndex: 'relatedName', render: (name: string, row) => (row.relatedPath ? <Link to={row.relatedPath}>{name}</Link> : name) },
  ]

  return (
    <ReportLayout
      context={context}
      noun={['task', 'tasks']}
      dateNote="Tasks with no due date, or due outside the range, are excluded — choose “Next 30 days” to see upcoming work."
      filterSpecs={[
        { key: 'status', label: 'Status', options: enumOptions(TASK_STATUSES) },
        { key: 'priority', label: 'Priority', options: enumOptions(TASK_PRIORITIES) },
        { key: 'assignee', label: 'Assignee', options: [{ value: NONE_VALUE, label: 'Unassigned' }, ...employeeOptions] },
      ]}
      summary={[
        { key: 'total', label: 'Tasks due', value: formatNumber(rows.length), caption: `${cancelled} cancelled` },
        { key: 'completed', label: 'Completed', value: formatNumber(completed), caption: `${percentOf(completed, closable)} completion rate` },
        { key: 'open', label: 'Open', value: formatNumber(open), caption: 'not started or in progress' },
        { key: 'overdue', label: 'Overdue', value: formatNumber(overdue), caption: `${percentOf(overdue, open)} of open tasks` },
      ]}
      charts={[
        <ChartCard key="status" title="Tasks by status" description="Tasks due in the period" table={{ columns: ['Status', 'Tasks'], rows: byStatus.map((row) => [row.label, row.value]) }}>
          <ColumnChart data={byStatus} seriesName="Tasks" showValues />
        </ChartCard>,
        <ChartCard key="assignee" title="Open tasks by assignee" description="Not started or in progress" table={{ columns: ['Assignee', 'Open tasks'], rows: openByAssignee.map((row) => [row.label, row.value]) }}>
          <BarBreakdownChart data={openByAssignee} seriesName="Open tasks" emptyText="No open tasks in this selection" />
        </ChartCard>,
      ]}
      columns={columns}
      rows={rows}
      csv={{
        headers: ['Title', 'Assignee', 'Priority', 'Status', 'Due Date', 'Overdue', 'Related To', 'Description'],
        toRow: (row) => [row.title, row.assignee, row.priority, row.status, row.dueDate, row.overdue ? 'Yes' : 'No', row.relatedName, row.description],
      }}
    />
  )
}
