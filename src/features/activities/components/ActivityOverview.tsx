import { Avatar, Card } from 'antd'
import dayjs from 'dayjs'
import { memo, useMemo } from 'react'
import type { Activity } from '@/types/models'
import { avatarColor } from '@/utils/avatar'
import { formatNumber, getInitials } from '@/utils/format'
import styles from './ActivityOverview.module.scss'

interface ActivityOverviewProps {
  activities: Activity[]
  selectedPerformers: string[]
  onSelectPerformer: (name: string) => void
}

/** Side panel: recent volume and the most active people over the last 30 days. */
export const ActivityOverview = memo(function ActivityOverview({ activities, selectedPerformers, onSelectPerformer }: ActivityOverviewProps) {
  const { today, week, month, contributors } = useMemo(() => {
    const now = dayjs()
    const weekStart = now.subtract(6, 'day').startOf('day')
    const monthStart = now.subtract(29, 'day').startOf('day')
    const counts = new Map<string, number>()
    let todayCount = 0
    let weekCount = 0
    let monthCount = 0
    for (const activity of activities) {
      const at = dayjs(activity.occurredAt)
      if (at.isBefore(monthStart)) continue
      monthCount += 1
      counts.set(activity.performedBy, (counts.get(activity.performedBy) ?? 0) + 1)
      if (!at.isBefore(weekStart)) weekCount += 1
      if (at.isSame(now, 'day')) todayCount += 1
    }
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 5)
    return { today: todayCount, week: weekCount, month: monthCount, contributors: top }
  }, [activities])

  const max = contributors[0]?.[1] ?? 1

  return (
    <Card title="Overview" size="small" className={styles.overview}>
      <dl className={styles.kpis}>
        <div>
          <dt>Today</dt>
          <dd>{formatNumber(today)}</dd>
        </div>
        <div>
          <dt>7 days</dt>
          <dd>{formatNumber(week)}</dd>
        </div>
        <div>
          <dt>30 days</dt>
          <dd>{formatNumber(month)}</dd>
        </div>
      </dl>

      <h3 className={styles.sideTitle}>Most active · last 30 days</h3>
      {contributors.length === 0 ? (
        <p className={styles.sideEmpty}>No recent activity.</p>
      ) : (
        <ul className={styles.contributors}>
          {contributors.map(([name, count]) => (
            <li key={name}>
              <button
                type="button"
                className={styles.contributor}
                aria-pressed={selectedPerformers.includes(name)}
                onClick={() => onSelectPerformer(name)}
                title={`Show activities by ${name}`}
              >
                <Avatar size={24} style={{ background: avatarColor(name), fontSize: 10, flexShrink: 0 }}>
                  {getInitials(name)}
                </Avatar>
                <span className={styles.contributorText}>
                  <span className={styles.contributorName}>{name}</span>
                  <span className={styles.bar} aria-hidden="true">
                    <span style={{ width: `${Math.max(6, (count / max) * 100)}%` }} />
                  </span>
                </span>
                <span className={styles.contributorCount}>{formatNumber(count)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
})
