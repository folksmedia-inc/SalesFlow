import { Typography } from 'antd'
import { memo } from 'react'
import { Link } from 'react-router'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useLookups } from '@/hooks/useLookups'
import { relatedTypeLabel } from '@/hooks/useRelatedOptions'
import type { Activity } from '@/types/models'
import { formatDateTime, formatRelativeTime } from '@/utils/format'
import { ACTIVITY_TYPE_STYLE } from '../activityTypes'
import styles from './ActivityTimeline.module.scss'

interface ActivityTimelineProps {
  activities: Activity[]
  /** Hide the "related record" link (e.g. when shown on that record's page). */
  hideRelated?: boolean
  compact?: boolean
  emptyText?: string
}

/** Chronological activity feed (newest first). */
export const ActivityTimeline = memo(function ActivityTimeline({ activities, hideRelated, compact, emptyText = 'No activity yet' }: ActivityTimelineProps) {
  const lookups = useLookups()

  if (activities.length === 0) {
    return <EmptyState title={emptyText} description="Calls, emails, meetings and record changes will appear here." compact />
  }

  return (
    <ol className={styles.timeline}>
      {activities.map((activity) => {
        const { icon: Icon, color } = ACTIVITY_TYPE_STYLE[activity.type]
        const relatedPath = lookups.relatedPath(activity.related)
        return (
          <li key={activity.id} className={styles.entry}>
            <span className={styles.dot} style={{ background: `color-mix(in srgb, ${color} 14%, transparent)`, color }} aria-hidden="true">
              <Icon size={14} />
            </span>
            <div className={styles.item}>
              <div className={styles.header}>
                <span className={styles.subject}>{activity.subject}</span>
                <time className={styles.time} dateTime={activity.occurredAt} title={formatDateTime(activity.occurredAt)}>
                  {formatRelativeTime(activity.occurredAt)}
                </time>
              </div>
              {!compact && activity.description && (
                <Typography.Paragraph type="secondary" className={styles.description}>
                  {activity.description}
                </Typography.Paragraph>
              )}
              <div className={styles.meta}>
                <span>{activity.type}</span>
                <span>by {activity.performedBy}</span>
                {!hideRelated && activity.related && (
                  <span>
                    {relatedTypeLabel(activity.related.type)}:{' '}
                    {relatedPath ? <Link to={relatedPath}>{lookups.relatedName(activity.related)}</Link> : lookups.relatedName(activity.related)}
                  </span>
                )}
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
})
