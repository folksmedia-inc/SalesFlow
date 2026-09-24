import { App, Button, Card } from 'antd'
import { CheckCircle2, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { EntityFormDrawer } from '@/components/entity/EntityFormDrawer'
import { EntityTable } from '@/components/entity/EntityTable'
import { RowActions } from '@/components/entity/RowActions'
import { useEntityActions } from '@/components/entity/useEntityActions'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useEntityList } from '@/hooks/useEntityData'
import { useLookups } from '@/hooks/useLookups'
import { encodeRelated } from '@/hooks/useRelatedOptions'
import type { RelatedRef, Task } from '@/types/models'
import { taskConfig, type TaskFormValues } from '../config/taskConfig'

interface RelatedTasksProps {
  /** Tasks linked to this record… */
  related?: RelatedRef
  /** …or assigned to this employee (either match is included). */
  assigneeId?: string
  title?: string
}

/** Tasks tab for a record's details page, with inline create/edit. */
export function RelatedTasks({ related, assigneeId, title = 'Tasks' }: RelatedTasksProps) {
  const { message } = App.useApp()
  const tasks = useEntityList('tasks')
  const lookups = useLookups()
  const { requestDelete, crud } = useEntityActions(taskConfig)
  const [editing, setEditing] = useState<Task | null>(null)
  const [creating, setCreating] = useState(false)
  const [paging, setPaging] = useState({ page: 1, pageSize: 10 })

  const items = useMemo(
    () =>
      tasks.filter(
        (task) => (related && task.related?.type === related.type && task.related.id === related.id) || (assigneeId && task.assigneeId === assigneeId),
      ),
    [assigneeId, related, tasks],
  )

  const hidden = related && !assigneeId ? ['related'] : assigneeId && !related ? ['assigneeId'] : []
  const defaults: Partial<TaskFormValues> = { related: encodeRelated(related), assigneeId: assigneeId ?? null }

  return (
    <Card
      title={`${title} (${items.length})`}
      extra={
        <Button icon={<Plus size={16} />} onClick={() => setCreating(true)}>
          New Task
        </Button>
      }
      styles={{ body: { padding: items.length ? 0 : undefined } }}
    >
      <EntityTable
        config={taskConfig}
        records={items}
        lookups={lookups}
        hiddenColumns={[...hidden, 'createdAt']}
        onRowClick={setEditing}
        pagination={items.length > 10 ? { ...paging, onChange: (page, pageSize) => setPaging({ page, pageSize }) } : false}
        emptyState={<EmptyState title="No tasks yet" description="Create a task to track follow-ups and next steps." compact />}
        renderActions={(task) => (
          <RowActions
            label={task.title}
            onEdit={() => setEditing(task)}
            extraItems={
              task.status === 'Completed'
                ? []
                : [
                    {
                      key: 'complete',
                      icon: <CheckCircle2 size={14} />,
                      label: 'Mark completed',
                      onClick: () => {
                        crud.update(task.id, { status: 'Completed' })
                        message.success('Task completed.')
                      },
                    },
                  ]
            }
            onDelete={() => requestDelete(task)}
          />
        )}
      />
      <EntityFormDrawer config={taskConfig} open={creating || Boolean(editing)} record={editing ?? undefined} initialValues={defaults} onClose={() => { setCreating(false); setEditing(null) }} />
    </Card>
  )
}
