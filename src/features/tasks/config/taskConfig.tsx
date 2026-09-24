import { CheckCircle2, ListChecks, PlayCircle, UserRoundPlus, Flag } from 'lucide-react'
import { z } from 'zod'
import { PersonCell } from '@/components/common/PersonCell'
import { RelatedLink } from '@/components/common/RelatedLink'
import { StatusTag } from '@/components/common/StatusTag'
import { defineEntityConfig } from '@/components/entity/types'
import { toOptions } from '@/components/entity/useOptions'
import { ROUTES } from '@/constants/routes'
import { decodeRelated, encodeRelated } from '@/hooks/useRelatedOptions'
import { RELATED_ENTITY_TYPES, TASK_PRIORITIES, TASK_STATUSES, type TaskPriority } from '@/types/models'
import { formatDate } from '@/utils/format'
import { DueDate } from '../components/DueDate'

const PRIORITY_RANK: Record<TaskPriority, number> = { Low: 1, Medium: 2, High: 3, Critical: 4 }

const taskSchema = z.object({
  title: z.string().trim().min(1, 'Task name is required').max(120, 'Keep the task name under 120 characters'),
  description: z.string().max(2000, 'Keep the description under 2000 characters'),
  assigneeId: z.string().nullable(),
  priority: z.enum(TASK_PRIORITIES, 'Select a priority'),
  status: z.enum(TASK_STATUSES, 'Select a status'),
  dueDate: z.string().nullable(),
  related: z.string().nullable(),
})

export type TaskFormValues = z.infer<typeof taskSchema>

export const taskConfig = defineEntityConfig({
  key: 'tasks',
  label: 'Tasks',
  singular: 'Task',
  description: 'Plan, assign and track work across your organization.',
  basePath: ROUTES.tasks,
  icon: ListChecks,
  formMode: 'drawer',
  getTitle: (task) => task.title,
  getStatus: (task) => task.status,
  searchText: (task, lookups) => [task.title, task.description, lookups.employeeName(task.assigneeId), lookups.relatedName(task.related)].join(' '),
  defaultSort: { field: 'dueDate', order: 'asc' },
  columns: [
    {
      key: 'title',
      title: 'Task Name',
      sortable: true,
      alwaysVisible: true,
      width: 280,
      render: (task) => (
        <div style={{ maxWidth: 320 }}>
          <div style={{ fontWeight: 500, color: 'var(--app-text-heading)' }}>{task.title}</div>
          {task.description && (
            <div style={{ fontSize: 12, color: 'var(--app-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.description}</div>
          )}
        </div>
      ),
    },
    {
      key: 'assigneeId',
      title: 'Assigned To',
      sortable: true,
      value: (task, lookups) => lookups.employeeName(task.assigneeId),
      render: (task, lookups) =>
        task.assigneeId ? <PersonCell name={lookups.employeeName(task.assigneeId)} to={`/employees/${task.assigneeId}`} size={24} /> : <span style={{ color: 'var(--app-text-tertiary)' }}>Unassigned</span>,
    },
    { key: 'priority', title: 'Priority', sortable: true, value: (task) => PRIORITY_RANK[task.priority], render: (task) => <StatusTag status={task.priority} /> },
    { key: 'status', title: 'Status', sortable: true, render: (task) => <StatusTag status={task.status} /> },
    { key: 'dueDate', title: 'Due Date', sortable: true, render: (task) => <DueDate dueDate={task.dueDate} status={task.status} /> },
    { key: 'related', title: 'Related To', value: (task, lookups) => lookups.relatedName(task.related), render: (task) => <RelatedLink related={task.related} /> },
    { key: 'createdAt', title: 'Created', sortable: true, defaultHidden: true, render: (task) => formatDate(task.createdAt) },
  ],
  filters: [
    { key: 'status', label: 'Status', type: 'select', options: toOptions(TASK_STATUSES), getValue: (task) => task.status },
    { key: 'priority', label: 'Priority', type: 'select', options: toOptions(TASK_PRIORITIES), getValue: (task) => task.priority },
    { key: 'assignee', label: 'Assignee', type: 'select', options: 'employees', getValue: (task) => task.assigneeId },
    {
      key: 'relatedType',
      label: 'Related to',
      type: 'select',
      options: RELATED_ENTITY_TYPES.map((type) => ({ value: type, label: type[0].toUpperCase() + type.slice(1) })),
      getValue: (task) => task.related?.type,
    },
    { key: 'dueDate', label: 'Due date', type: 'dateRange', getValue: (task) => task.dueDate },
  ],
  bulkActions: [
    { key: 'complete', label: 'Mark Completed', icon: CheckCircle2, kind: 'update', changes: { status: 'Completed' } },
    { key: 'start', label: 'Mark In Progress', icon: PlayCircle, kind: 'update', changes: { status: 'In Progress' } },
    { key: 'assign', label: 'Assign To', icon: UserRoundPlus, kind: 'assign', field: 'assigneeId', fieldLabel: 'Assignee', options: 'employees' },
    { key: 'priority', label: 'Change Priority', icon: Flag, kind: 'assign', field: 'priority', fieldLabel: 'Priority', options: toOptions(TASK_PRIORITIES) },
    { key: 'delete', label: 'Delete', kind: 'delete' },
  ],
  form: {
    schema: taskSchema,
    defaultValues: { title: '', description: '', assigneeId: null, priority: 'Medium', status: 'Not Started', dueDate: null, related: null },
    toValues: (task) => ({
      title: task.title,
      description: task.description,
      assigneeId: task.assigneeId,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
      related: encodeRelated(task.related),
    }),
    toRecord: (values) => ({
      title: values.title,
      description: values.description,
      assigneeId: values.assigneeId,
      priority: values.priority,
      status: values.status,
      dueDate: values.dueDate,
      related: decodeRelated(values.related),
    }),
    sections: [
      {
        title: 'Task Details',
        fields: [
          { name: 'title', label: 'Task Name', type: 'text', required: true, span: 'full', placeholder: 'e.g. Prepare renewal proposal' },
          { name: 'description', label: 'Description', type: 'textarea', span: 'full', placeholder: 'What needs to be done?' },
          { name: 'assigneeId', label: 'Assigned To', type: 'select', options: 'employees', placeholder: 'Unassigned' },
          { name: 'dueDate', label: 'Due Date', type: 'date' },
          { name: 'priority', label: 'Priority', type: 'select', options: toOptions(TASK_PRIORITIES), required: true },
          { name: 'status', label: 'Status', type: 'select', options: toOptions(TASK_STATUSES), required: true },
          { name: 'related', label: 'Related Entity', type: 'select', options: 'related', span: 'full', placeholder: 'Link to a customer, account, employee…' },
        ],
      },
    ],
  },
})
