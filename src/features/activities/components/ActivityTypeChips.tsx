import { memo } from 'react'
import { ACTIVITY_TYPES, type ActivityType } from '@/types/models'
import { formatNumber } from '@/utils/format'
import { ACTIVITY_TYPE_STYLE } from '../activityTypes'
import styles from './ActivityFeed.module.scss'

interface ActivityTypeChipsProps {
  selected: string[]
  counts: Partial<Record<ActivityType, number>>
  total: number
  onChange: (types: string[]) => void
}

/** Toggleable type filter chips with match counts. "All" clears the type filter. */
export const ActivityTypeChips = memo(function ActivityTypeChips({ selected, counts, total, onChange }: ActivityTypeChipsProps) {
  const toggle = (type: ActivityType) => onChange(selected.includes(type) ? selected.filter((item) => item !== type) : [...selected, type])

  return (
    <div className={styles.chips} role="group" aria-label="Filter by activity type">
      <button type="button" className={styles.chip} aria-pressed={selected.length === 0} onClick={() => onChange([])}>
        All types
        <span className={styles.chipCount}>{formatNumber(total)}</span>
      </button>
      {ACTIVITY_TYPES.map((type) => {
        const { icon: Icon, color } = ACTIVITY_TYPE_STYLE[type]
        return (
          <button key={type} type="button" className={styles.chip} aria-pressed={selected.includes(type)} onClick={() => toggle(type)}>
            <Icon size={14} style={{ color }} aria-hidden="true" />
            {type}
            <span className={styles.chipCount}>{formatNumber(counts[type] ?? 0)}</span>
          </button>
        )
      })}
    </div>
  )
})
