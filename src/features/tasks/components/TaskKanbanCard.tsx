import { Avatar, Button, Dropdown, type MenuProps } from 'antd'
import { ArrowRight, GripVertical, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { memo, type DragEvent, type MouseEvent } from 'react'
import { RelatedLink } from '@/components/common/RelatedLink'
import { StatusTag } from '@/components/common/StatusTag'
import { useLookups } from '@/hooks/useLookups'
import { TASK_STATUSES, type Task, type TaskStatus } from '@/types/models'
import { avatarColor } from '@/utils/avatar'
import { getInitials } from '@/utils/format'
import { DueDate } from './DueDate'
import styles from './TaskKanbanBoard.module.scss'

interface TaskKanbanCardProps {
  task: Task
  dragging: boolean
  onOpen: (task: Task) => void
  onMove: (task: Task, status: TaskStatus) => void
  onDelete: (task: Task) => void
  onDragStart: (event: DragEvent<HTMLElement>) => void
  onDragEnd: () => void
}

/** A draggable task card. The whole card opens the task; the title is the keyboard target. */
export const TaskKanbanCard = memo(function TaskKanbanCard({ task, dragging, onOpen, onMove, onDelete, onDragStart, onDragEnd }: TaskKanbanCardProps) {
  const lookups = useLookups()
  const assigneeName = task.assigneeId ? lookups.employeeName(task.assigneeId) : null
  const inactive = task.status === 'Completed' || task.status === 'Cancelled'

  const menuItems: MenuProps['items'] = [
    {
      type: 'group',
      key: 'move',
      label: 'Move to',
      children: TASK_STATUSES.filter((status) => status !== task.status).map((status) => ({
        key: `move:${status}`,
        icon: <ArrowRight size={14} />,
        label: status,
      })),
    },
    { type: 'divider' },
    { key: 'edit', icon: <Pencil size={14} />, label: 'Edit task' },
    { key: 'delete', icon: <Trash2 size={14} />, label: 'Delete task', danger: true },
  ]

  const onMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'edit') onOpen(task)
    else if (key === 'delete') onDelete(task)
    else if (key.startsWith('move:')) onMove(task, key.slice('move:'.length) as TaskStatus)
  }

  const stop = (event: MouseEvent) => event.stopPropagation()

  return (
    <article
      className={`${styles.card} ${dragging ? styles.cardDragging : ''} ${inactive ? styles.cardInactive : ''}`}
      draggable
      data-task-id={task.id}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={() => onOpen(task)}
    >
      <div className={styles.cardTop}>
        <GripVertical size={14} className={styles.grip} aria-hidden="true" />
        <StatusTag status={task.priority} />
        <span className={styles.spacer} />
        {/* Menu clicks bubble through the portal in React's tree — keep them off the card. */}
        <span className={styles.menuWrap} onClick={stop}>
          <Dropdown menu={{ items: menuItems, onClick: onMenuClick }} trigger={['click']} placement="bottomRight">
            <Button type="text" size="small" className={styles.menuButton} icon={<MoreHorizontal size={16} />} aria-label={`Actions for ${task.title}`} />
          </Dropdown>
        </span>
      </div>

      <button
        type="button"
        className={styles.cardTitle}
        onClick={(event) => {
          event.stopPropagation()
          onOpen(task)
        }}
      >
        {task.title}
      </button>

      {task.related && (
        <div className={styles.cardRelated}>
          <RelatedLink related={task.related} />
        </div>
      )}

      <div className={styles.cardFooter}>
        {assigneeName ? (
          <span className={styles.assignee}>
            <Avatar size={22} style={{ background: avatarColor(assigneeName), fontSize: 10, flexShrink: 0 }}>
              {getInitials(assigneeName)}
            </Avatar>
            <span className={styles.assigneeName}>{assigneeName}</span>
          </span>
        ) : (
          <span className={styles.unassigned}>Unassigned</span>
        )}
        <span className={styles.due}>
          <DueDate dueDate={task.dueDate} status={task.status} />
        </span>
      </div>
    </article>
  )
})
