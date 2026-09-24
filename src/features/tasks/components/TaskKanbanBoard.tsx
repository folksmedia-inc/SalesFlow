import { App, Button } from 'antd'
import { Plus } from 'lucide-react'
import { useCallback, useMemo, useState, type DragEvent } from 'react'
import { useEntityCrud } from '@/hooks/useEntityData'
import { TASK_STATUSES, type Task, type TaskStatus } from '@/types/models'
import { TaskKanbanCard } from './TaskKanbanCard'
import styles from './TaskKanbanBoard.module.scss'

/** Accent color per column (CSS variables so both themes work). */
const COLUMN_ACCENT: Record<TaskStatus, string> = {
  'Not Started': 'var(--app-text-tertiary)',
  'In Progress': 'var(--app-color-primary)',
  Completed: 'var(--app-color-success)',
  Cancelled: 'var(--app-color-error)',
}

const DRAG_MIME = 'application/x-task-id'

interface TaskKanbanBoardProps {
  /** Already searched, filtered and sorted tasks. */
  tasks: Task[]
  onOpen: (task: Task) => void
  onCreate: (status: TaskStatus) => void
  onDelete: (task: Task) => void
}

/**
 * Kanban board of tasks grouped by status. Cards can be dragged between
 * columns, or moved with the keyboard-accessible "Move to" menu on each card.
 */
export function TaskKanbanBoard({ tasks, onOpen, onCreate, onDelete }: TaskKanbanBoardProps) {
  const { message } = App.useApp()
  const crud = useEntityCrud('tasks')
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<TaskStatus | null>(null)

  const columns = useMemo(() => {
    const grouped = Object.fromEntries(TASK_STATUSES.map((status) => [status, [] as Task[]])) as Record<TaskStatus, Task[]>
    for (const task of tasks) grouped[task.status].push(task)
    return grouped
  }, [tasks])

  const moveTask = useCallback(
    (task: Task, status: TaskStatus) => {
      if (task.status === status) return
      crud.update(task.id, { status })
      message.success(`Moved “${task.title}” to ${status}.`)
    },
    [crud, message],
  )

  const endDrag = () => {
    setDraggingId(null)
    setDropTarget(null)
  }

  const handleDragOver = (event: DragEvent<HTMLElement>, status: TaskStatus) => {
    if (!event.dataTransfer.types.includes(DRAG_MIME)) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    if (dropTarget !== status) setDropTarget(status)
  }

  const handleDragLeave = (event: DragEvent<HTMLElement>, status: TaskStatus) => {
    // Ignore leave events fired when moving between children of the column.
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
    if (dropTarget === status) setDropTarget(null)
  }

  const handleDrop = (event: DragEvent<HTMLElement>, status: TaskStatus) => {
    event.preventDefault()
    const id = event.dataTransfer.getData(DRAG_MIME)
    const task = tasks.find((item) => item.id === id)
    endDrag()
    if (task) moveTask(task, status)
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.board}>
        {TASK_STATUSES.map((status) => {
          const items = columns[status]
          const isTarget = dropTarget === status && draggingId !== null && tasks.find((task) => task.id === draggingId)?.status !== status
          return (
            <section
              key={status}
              aria-label={`${status}, ${items.length} ${items.length === 1 ? 'task' : 'tasks'}`}
              className={`${styles.column} ${isTarget ? styles.columnDropTarget : ''}`}
              data-status={status}
              onDragOver={(event) => handleDragOver(event, status)}
              onDragLeave={(event) => handleDragLeave(event, status)}
              onDrop={(event) => handleDrop(event, status)}
            >
              <header className={styles.columnHeader}>
                <span className={styles.accent} style={{ background: COLUMN_ACCENT[status] }} aria-hidden="true" />
                <h2 className={styles.columnTitle}>{status}</h2>
                <span className={styles.count}>{items.length}</span>
              </header>

              <div className={styles.cards}>
                {items.map((task) => (
                  <TaskKanbanCard
                    key={task.id}
                    task={task}
                    dragging={draggingId === task.id}
                    onOpen={onOpen}
                    onMove={moveTask}
                    onDelete={onDelete}
                    onDragStart={(event) => {
                      event.dataTransfer.setData(DRAG_MIME, task.id)
                      event.dataTransfer.setData('text/plain', task.title)
                      event.dataTransfer.effectAllowed = 'move'
                      setDraggingId(task.id)
                    }}
                    onDragEnd={endDrag}
                  />
                ))}
                {items.length === 0 && <div className={styles.emptyColumn}>{draggingId ? 'Drop here' : 'No tasks'}</div>}
              </div>

              <Button type="text" block className={styles.addButton} icon={<Plus size={16} />} onClick={() => onCreate(status)} aria-label={`Add task to ${status}`}>
                Add task
              </Button>
            </section>
          )
        })}
      </div>
    </div>
  )
}
