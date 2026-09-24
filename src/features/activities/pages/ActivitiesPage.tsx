import { App, Button, Card, DatePicker, Select } from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { Plus } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useConfirmDelete } from '@/hooks/useConfirmDelete'
import { useEntityCrud, useEntityList } from '@/hooks/useEntityData'
import { useLookups } from '@/hooks/useLookups'
import { relatedTypeLabel } from '@/hooks/useRelatedOptions'
import { RELATED_ENTITY_TYPES, type Activity } from '@/types/models'
import { formatNumber, pluralize } from '@/utils/format'
import { filterActivities, groupByDay, NO_RELATED } from '../components/activityFeed'
import feedStyles from '../components/ActivityFeed.module.scss'
import { ActivityFeedItem } from '../components/ActivityFeedItem'
import { ActivityOverview } from '../components/ActivityOverview'
import { SearchInput } from '@/components/common/SearchInput'
import { ActivityTypeChips } from '../components/ActivityTypeChips'
import { LogActivityModal } from '../components/LogActivityModal'
import { useActivityQuery } from '../components/useActivityQuery'
import styles from './ActivitiesPage.module.scss'

const PAGE_SIZE = 20

const RELATED_OPTIONS = [
  ...RELATED_ENTITY_TYPES.map((type) => ({ value: type, label: relatedTypeLabel(type) })),
  { value: NO_RELATED, label: 'No related record' },
]

const DATE_PRESETS: { label: string; value: [Dayjs, Dayjs] }[] = [
  { label: 'Today', value: [dayjs().startOf('day'), dayjs().endOf('day')] },
  { label: 'Last 7 days', value: [dayjs().subtract(6, 'day'), dayjs()] },
  { label: 'Last 30 days', value: [dayjs().subtract(29, 'day'), dayjs()] },
  { label: 'This month', value: [dayjs().startOf('month'), dayjs()] },
]

/** Organization-wide activity timeline, grouped by day, with URL-synced filters. */
export default function ActivitiesPage() {
  const { message } = App.useApp()
  const activities = useEntityList('activities')
  const crud = useEntityCrud('activities')
  const lookups = useLookups()
  const confirmDelete = useConfirmDelete()
  const { query, setSearch, setList, setDateRange, clearAll, activeCount } = useActivityQuery()
  const [logging, setLogging] = useState(false)

  const { results, typeCounts, countAll } = useMemo(() => filterActivities(activities, query, lookups), [activities, query, lookups])

  // "Load more" resets whenever the query changes.
  const queryKey = JSON.stringify(query)
  const [limit, setLimit] = useState({ key: queryKey, count: PAGE_SIZE })
  const visibleCount = limit.key === queryKey ? limit.count : PAGE_SIZE
  const visible = useMemo(() => results.slice(0, visibleCount), [results, visibleCount])
  const groups = useMemo(() => groupByDay(visible), [visible])
  const remaining = results.length - visible.length

  const performerOptions = useMemo(
    () => [...new Set(activities.map((activity) => activity.performedBy))].sort((a, b) => a.localeCompare(b)).map((name) => ({ value: name, label: name })),
    [activities],
  )

  const requestDelete = useCallback(
    (activity: Activity) =>
      confirmDelete({
        entityLabel: 'Activity',
        name: `“${activity.subject}”`,
        onConfirm: () => {
          crud.remove(activity.id)
          message.success('Activity deleted.')
        },
      }),
    [confirmDelete, crud, message],
  )

  const togglePerformer = useCallback(
    (name: string) => setList('performers', query.performers.includes(name) ? query.performers.filter((item) => item !== name) : [name]),
    [query.performers, setList],
  )

  const setTypes = useCallback((types: string[]) => setList('types', types), [setList])

  return (
    <>
      <PageHeader
        subtitle="A chronological record of calls, emails, meetings and changes across your organization."
        actions={
          <Button type="primary" icon={<Plus size={16} />} onClick={() => setLogging(true)}>
            Log Activity
          </Button>
        }
      />

      <div className={styles.layout}>
        <Card className={styles.main} styles={{ body: { padding: 0 } }}>
          <div className={styles.controls}>
            <ActivityTypeChips selected={query.types} counts={typeCounts} total={countAll} onChange={setTypes} />
            <div className={styles.toolbar}>
              <SearchInput value={query.search} onChange={setSearch} placeholder="Search activities…" className={styles.search} />
              <Select
                aria-label="Performed by"
                mode="multiple"
                placeholder="Performed by"
                value={query.performers}
                onChange={(values: string[]) => setList('performers', values)}
                options={performerOptions}
                maxTagCount={1}
                maxTagTextLength={14}
                allowClear
                showSearch={{ optionFilterProp: 'label' }}
                className={styles.select}
                popupMatchSelectWidth={false}
              />
              <Select
                aria-label="Related to"
                mode="multiple"
                placeholder="Related to"
                value={query.relatedTypes}
                onChange={(values: string[]) => setList('relatedTypes', values)}
                options={RELATED_OPTIONS}
                maxTagCount={1}
                allowClear
                showSearch={{ optionFilterProp: 'label' }}
                className={styles.select}
                popupMatchSelectWidth={false}
              />
              <DatePicker.RangePicker
                aria-label="Date range"
                placeholder={['From date', 'To date']}
                value={query.from && query.to ? [dayjs(query.from), dayjs(query.to)] : null}
                onChange={(range) => setDateRange(range?.[0] && range[1] ? [range[0].format('YYYY-MM-DD'), range[1].format('YYYY-MM-DD')] : null)}
                presets={DATE_PRESETS}
                allowClear
                className={styles.range}
              />
            </div>
          </div>

          <div className={styles.resultBar}>
            <span aria-live="polite">
              {results.length === 0
                ? 'No matching activities'
                : `Showing ${formatNumber(visible.length)} of ${pluralize(results.length, 'activity', 'activities')}`}
            </span>
            {activeCount > 0 && (
              <Button type="link" size="small" onClick={clearAll} className={styles.clearAll}>
                Clear all filters
              </Button>
            )}
          </div>

          <div className={styles.feed}>
            {results.length === 0 ? (
              activities.length === 0 ? (
                <EmptyState
                  title="No activity yet"
                  description="Calls, emails, meetings and record changes will appear here."
                  actionLabel="Log Activity"
                  onAction={() => setLogging(true)}
                />
              ) : (
                <EmptyState
                  title="No activities found"
                  description="Try a different search or adjust the filters."
                  secondaryLabel={activeCount > 0 ? 'Clear filters' : undefined}
                  onSecondary={clearAll}
                  actionLabel="Log Activity"
                  onAction={() => setLogging(true)}
                />
              )
            ) : (
              groups.map((group) => (
                <section key={group.key} className={feedStyles.group} aria-labelledby={`day-${group.key}`}>
                  <h2 id={`day-${group.key}`} className={feedStyles.groupHeader}>
                    {group.label}
                    {group.date && <span className={feedStyles.groupDate}>{group.date}</span>}
                    <span className={feedStyles.groupCount}>{pluralize(group.items.length, 'activity', 'activities')}</span>
                  </h2>
                  <ol className={feedStyles.list}>
                    {group.items.map((activity) => (
                      <ActivityFeedItem key={activity.id} activity={activity} onDelete={requestDelete} />
                    ))}
                  </ol>
                </section>
              ))
            )}

            {remaining > 0 && (
              <div className={styles.loadMore}>
                <Button onClick={() => setLimit({ key: queryKey, count: visibleCount + PAGE_SIZE })}>
                  Load {Math.min(PAGE_SIZE, remaining)} more
                </Button>
                <span className={styles.loadMoreHint}>{pluralize(remaining, 'older activity', 'older activities')}</span>
              </div>
            )}
          </div>
        </Card>

        <aside className={styles.aside} aria-label="Activity overview">
          <ActivityOverview activities={activities} selectedPerformers={query.performers} onSelectPerformer={togglePerformer} />
        </aside>
      </div>

      <LogActivityModal open={logging} onClose={() => setLogging(false)} />
    </>
  )
}
