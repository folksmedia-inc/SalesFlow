import { Badge, Button, Popover, Typography } from 'antd'
import { Bell, CheckCheck, CheckSquare, Info, TriangleAlert, CircleCheck } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useEntityCrud, useEntityList } from '@/hooks/useEntityData'
import type { AppNotification } from '@/types/models'
import { formatRelativeTime } from '@/utils/format'
import styles from './NotificationsMenu.module.scss'

const TYPE_ICON: Record<AppNotification['type'], { icon: typeof Info; color: string }> = {
  info: { icon: Info, color: 'var(--app-color-primary)' },
  success: { icon: CircleCheck, color: 'var(--app-color-success)' },
  warning: { icon: TriangleAlert, color: 'var(--app-color-warning)' },
  task: { icon: CheckSquare, color: '#0b827c' },
}

export function NotificationsMenu() {
  const navigate = useNavigate()
  const notifications = useEntityList('notifications')
  const crud = useEntityCrud('notifications')
  const [open, setOpen] = useState(false)
  const unread = notifications.filter((notification) => !notification.read)

  const openNotification = (notification: AppNotification) => {
    if (!notification.read) crud.update(notification.id, { read: true })
    setOpen(false)
    if (notification.link) navigate(notification.link)
  }

  const content = (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <Typography.Text strong>Notifications</Typography.Text>
        <div className={styles.headerActions}>
          <Button type="link" size="small" icon={<CheckCheck size={14} />} disabled={unread.length === 0} onClick={() => crud.updateMany(unread.map((n) => n.id), { read: true })}>
            Mark all read
          </Button>
          <Button type="link" size="small" disabled={notifications.length === 0} onClick={() => crud.removeMany(notifications.map((n) => n.id))}>
            Clear
          </Button>
        </div>
      </div>
      {notifications.length === 0 ? (
        <EmptyState title="You're all caught up" description="New notifications will appear here." compact />
      ) : (
        <ul className={styles.list}>
          {notifications.slice(0, 20).map((notification) => {
            const { icon: Icon, color } = TYPE_ICON[notification.type]
            return (
              <li key={notification.id}>
                <button type="button" className={`${styles.item} ${notification.read ? '' : styles.unread}`} onClick={() => openNotification(notification)}>
                  <span className={styles.icon} style={{ color }} aria-hidden="true">
                    <Icon size={16} />
                  </span>
                  <span className={styles.text}>
                    <span className={styles.title}>{notification.title}</span>
                    <span className={styles.description}>{notification.description}</span>
                    <span className={styles.time}>{formatRelativeTime(notification.createdAt)}</span>
                  </span>
                  {!notification.read && <span className={styles.dot} aria-label="Unread" />}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )

  return (
    <Popover content={content} trigger="click" placement="bottomRight" open={open} onOpenChange={setOpen} arrow={false} styles={{ container: { padding: 0 } }}>
      <Button type="text" shape="circle" title="Notifications" aria-label={`Notifications${unread.length ? `, ${unread.length} unread` : ''}`}>
        <Badge count={unread.length} size="small" offset={[2, -2]}>
          <Bell size={18} />
        </Badge>
      </Button>
    </Popover>
  )
}
