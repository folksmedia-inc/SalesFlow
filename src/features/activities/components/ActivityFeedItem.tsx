import { Avatar, Button, Tooltip } from 'antd'
import dayjs from 'dayjs'
import { Trash2 } from 'lucide-react'
import { memo } from 'react'
import { RelatedLink } from '@/components/common/RelatedLink'
import type { Activity } from '@/types/models'
import { avatarColor } from '@/utils/avatar'
import { formatDateTime, getInitials } from '@/utils/format'
import { ACTIVITY_TYPE_STYLE } from '../activityTypes'
import styles from './ActivityFeed.module.scss'

interface ActivityFeedItemProps {
  activity: Activity
  onDelete: (activity: Activity) => void
}

/** One entry of the activity feed: type icon, subject, details, who/when/what. */
export const ActivityFeedItem = memo(function ActivityFeedItem({ activity, onDelete }: ActivityFeedItemProps) {
  const { icon: Icon, color } = ACTIVITY_TYPE_STYLE[activity.type]

  return (
    <li className={styles.item}>
      <span className={styles.icon} style={{ color, background: `color-mix(in srgb, ${color} 14%, transparent)` }} aria-hidden="true">
        <Icon size={15} />
      </span>
      <div className={styles.body}>
        <div className={styles.header}>
          <span className={styles.subject}>{activity.subject}</span>
          <time className={styles.time} dateTime={activity.occurredAt} title={formatDateTime(activity.occurredAt)}>
            {dayjs(activity.occurredAt).format('h:mm A')}
          </time>
          <Tooltip title="Delete activity">
            <Button
              type="text"
              size="small"
              className={styles.delete}
              icon={<Trash2 size={15} />}
              aria-label={`Delete activity: ${activity.subject}`}
              onClick={() => onDelete(activity)}
            />
          </Tooltip>
        </div>
        {activity.description && <p className={styles.description}>{activity.description}</p>}
        <div className={styles.meta}>
          <span className={styles.type}>{activity.type}</span>
          <span className={styles.person}>
            <Avatar size={18} style={{ background: avatarColor(activity.performedBy), fontSize: 9, flexShrink: 0 }}>
              {getInitials(activity.performedBy)}
            </Avatar>
            {activity.performedBy}
          </span>
          {activity.related && (
            <span className={styles.related}>
              <RelatedLink related={activity.related} />
            </span>
          )}
        </div>
      </div>
    </li>
  )
})
