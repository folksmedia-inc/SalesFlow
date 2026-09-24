import type { LucideIcon } from 'lucide-react'
import { ArrowDownRight, ArrowUpRight, CircleAlert, Minus } from 'lucide-react'
import { Link } from 'react-router'
import { formatNumber } from '@/utils/format'
import type { StatDelta } from '../utils/dashboardMetrics'
import styles from './StatCard.module.scss'

interface StatCardProps {
  label: string
  value: number
  icon: LucideIcon
  delta: StatDelta
  /** Where the card links to (the underlying list). */
  to: string
  /** Extra context shown as a native tooltip (metric definition). */
  hint?: string
}

const TONE_CLASS: Record<StatDelta['tone'], string> = {
  positive: styles.positive,
  negative: styles.negative,
  neutral: styles.neutral,
  warning: styles.warning,
}

/** KPI tile: label, value, and a derived comparison line. */
export function StatCard({ label, value, icon: Icon, delta, to, hint }: StatCardProps) {
  const DeltaIcon = delta.tone === 'warning' ? CircleAlert : delta.direction === 'up' ? ArrowUpRight : delta.direction === 'down' ? ArrowDownRight : delta.direction === 'flat' ? Minus : null

  return (
    <Link to={to} className={styles.card} title={hint}>
      <div className={styles.top}>
        <span className={styles.label}>{label}</span>
        <span className={styles.icon} aria-hidden="true">
          <Icon size={16} />
        </span>
      </div>
      <div className={styles.value}>{formatNumber(value)}</div>
      <div className={styles.delta}>
        {delta.change && (
          <span className={`${styles.change} ${TONE_CLASS[delta.tone]}`}>
            {DeltaIcon && <DeltaIcon size={14} aria-hidden="true" />}
            {delta.change}
          </span>
        )}
        {!delta.change && DeltaIcon && <DeltaIcon size={14} aria-hidden="true" className={TONE_CLASS[delta.tone]} />}
        <span className={`${styles.caption} ${delta.change ? '' : TONE_CLASS[delta.tone]}`}>{delta.caption}</span>
      </div>
    </Link>
  )
}
