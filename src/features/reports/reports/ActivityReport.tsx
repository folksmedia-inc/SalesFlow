import type { TableColumnsType } from 'antd'
import { useMemo } from 'react'
import { Link } from 'react-router'
import { BarBreakdownChart } from '@/components/charts/BarBreakdownChart'
import { ChartCard } from '@/components/charts/ChartCard'
import { ColumnChart } from '@/components/charts/ColumnChart'
import { ACTIVITY_TYPE_STYLE } from '@/features/activities/activityTypes'
import { useEntityList } from '@/hooks/useEntityData'
import { useLookups } from '@/hooks/useLookups'
import { ACTIVITY_TYPES, type Activity } from '@/types/models'
import { formatDateTime, formatNumber } from '@/utils/format'
import { ReportLayout, type ReportContext } from '../components/ReportLayout'
import { enumOptions, matches } from '../utils/filters'
import { BUCKET_TITLE, countBy, countByPeriod, inRange } from '../utils/reportUtils'
import styles from './reports.module.scss'

interface ActivityRow extends Activity {
  relatedName: string
  relatedPath: string | undefined
}

/** Activities that occurred within the period, by type and performer. */
export function ActivityReport({ context }: { context: ReportContext }) {
  const activities = useEntityList('activities')
  const lookups = useLookups()
  const { range, filters } = context

  const performerOptions = useMemo(
    () => [...new Set(activities.map((activity) => activity.performedBy))].sort((a, b) => a.localeCompare(b)).map((name) => ({ value: name, label: name })),
    [activities],
  )

  const rows = useMemo<ActivityRow[]>(
    () =>
      activities
        .filter((activity) => inRange(activity.occurredAt, range) && matches(filters.type, activity.type) && matches(filters.performer, activity.performedBy))
        .map((activity) => ({ ...activity, relatedName: activity.related ? lookups.relatedName(activity.related) : '—', relatedPath: lookups.relatedPath(activity.related) }))
        .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)),
    [activities, range, filters, lookups],
  )

  const countOf = (type: Activity['type']) => rows.filter((row) => row.type === type).length
  const performers = new Set(rows.map((row) => row.performedBy)).size

  const volume = useMemo(() => countByPeriod(rows.map((row) => row.occurredAt), range), [rows, range])
  const byType = useMemo(() => countBy(rows, (row) => row.type), [rows])

  const columns: TableColumnsType<ActivityRow> = [
    { key: 'subject', title: 'Subject', dataIndex: 'subject', sorter: (a, b) => a.subject.localeCompare(b.subject), render: (subject: string) => <span className={styles.strong}>{subject}</span> },
    {
      key: 'type',
      title: 'Type',
      dataIndex: 'type',
      sorter: (a, b) => a.type.localeCompare(b.type),
      render: (type: Activity['type']) => {
        const { icon: Icon } = ACTIVITY_TYPE_STYLE[type]
        return (
          <span className={styles.subtle} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Icon size={14} aria-hidden="true" />
            {type}
          </span>
        )
      },
    },
    { key: 'performedBy', title: 'Performed By', dataIndex: 'performedBy', sorter: (a, b) => a.performedBy.localeCompare(b.performedBy) },
    { key: 'related', title: 'Related To', dataIndex: 'relatedName', render: (name: string, row) => (row.relatedPath ? <Link to={row.relatedPath}>{name}</Link> : name) },
    { key: 'occurredAt', title: 'Date', dataIndex: 'occurredAt', defaultSortOrder: 'descend', sorter: (a, b) => a.occurredAt.localeCompare(b.occurredAt), render: (value: string) => formatDateTime(value) },
  ]

  return (
    <ReportLayout
      context={context}
      noun={['activity', 'activities']}
      filterSpecs={[
        { key: 'type', label: 'Type', options: enumOptions(ACTIVITY_TYPES) },
        { key: 'performer', label: 'Performed by', options: performerOptions },
      ]}
      summary={[
        { key: 'total', label: 'Activities', value: formatNumber(rows.length), caption: `by ${performers} ${performers === 1 ? 'person' : 'people'}` },
        { key: 'calls', label: 'Calls', value: formatNumber(countOf('Call')) },
        { key: 'meetings', label: 'Meetings', value: formatNumber(countOf('Meeting')) },
        { key: 'emails', label: 'Emails', value: formatNumber(countOf('Email')) },
      ]}
      charts={[
        <ChartCard
          key="volume"
          title="Activity volume"
          description={`Activities logged ${BUCKET_TITLE[volume.unit]}`}
          table={{ columns: ['Period', 'Activities'], rows: volume.points.map((point) => [point.fullLabel, point.value]) }}
        >
          <ColumnChart data={volume.points} seriesName="Activities" />
        </ChartCard>,
        <ChartCard key="type" title="By type" description="Activities in this report per type" table={{ columns: ['Type', 'Activities'], rows: byType.map((row) => [row.label, row.value]) }}>
          <BarBreakdownChart data={byType} seriesName="Activities" />
        </ChartCard>,
      ]}
      columns={columns}
      rows={rows}
      csv={{
        headers: ['Date', 'Type', 'Subject', 'Description', 'Performed By', 'Related To'],
        toRow: (row) => [formatDateTime(row.occurredAt), row.type, row.subject, row.description, row.performedBy, row.relatedName],
      }}
    />
  )
}
