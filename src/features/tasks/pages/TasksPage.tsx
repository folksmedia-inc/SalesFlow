import { Segmented } from 'antd'
import { Columns3, Rows3 } from 'lucide-react'
import { useCallback, type ReactNode } from 'react'
import { useSearchParams } from 'react-router'
import { EntityListPage } from '@/components/entity/EntityListPage'
import { TaskKanbanBoard } from '../components/TaskKanbanBoard'
import { TaskKanbanSummary } from '../components/TaskKanbanSummary'
import { taskConfig } from '../config/taskConfig'

type TaskView = 'table' | 'kanban'

const VIEW_OPTIONS: { value: TaskView; label: ReactNode }[] = [
  {
    value: 'table',
    label: (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <Rows3 size={15} aria-hidden="true" />
        Table
      </span>
    ),
  },
  {
    value: 'kanban',
    label: (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <Columns3 size={15} aria-hidden="true" />
        Kanban
      </span>
    ),
  },
]

/** Tasks list with a bookmarkable Table / Kanban view toggle (`?view=kanban`). */
export default function TasksPage() {
  const [params, setParams] = useSearchParams()
  const view: TaskView = params.get('view') === 'kanban' ? 'kanban' : 'table'

  const setView = useCallback(
    (next: TaskView) =>
      setParams(
        (current) => {
          const updated = new URLSearchParams(current)
          if (next === 'kanban') updated.set('view', 'kanban')
          else updated.delete('view')
          updated.delete('page')
          return updated
        },
        { replace: true },
      ),
    [setParams],
  )

  return (
    <EntityListPage
      config={taskConfig}
      headerActions={<Segmented<TaskView> aria-label="Task view" value={view} onChange={setView} options={VIEW_OPTIONS} />}
      renderSummary={(records) => (
        <div style={{ marginBottom: 16 }}>
          <TaskKanbanSummary tasks={records} />
        </div>
      )}
      renderView={
        view === 'kanban'
          ? (records, helpers) => <TaskKanbanBoard tasks={records} onOpen={helpers.openEdit} onCreate={(status) => helpers.openCreate({ status })} onDelete={helpers.requestDelete} />
          : undefined
      }
    />
  )
}
