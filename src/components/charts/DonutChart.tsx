import { Pie, PieChart, Tooltip } from 'recharts'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ChartTooltip } from './ChartTooltip'
import { CHART_NUMBER, useChartTheme } from './chartTheme'
import type { ChartDatum } from './types'
import styles from './Charts.module.scss'

interface DonutChartProps {
  /** Each slice must carry its own fixed `color`. Keep to ≤ 6 slices. */
  data: ChartDatum[]
  /** Caption under the center total (e.g. "employees"). */
  totalLabel: string
  valueFormatter?: (value: number) => string
  size?: number
  /** Legend beside the ring (default) or below it. */
  layout?: 'side' | 'stacked'
  emptyText?: string
}

function formatShare(value: number, total: number): string {
  if (total === 0) return '0%'
  const share = (value / total) * 100
  return `${share < 10 && share > 0 ? share.toFixed(1) : Math.round(share)}%`
}

/**
 * Part-to-whole at a glance. The legend lists every value and share, so
 * identity and magnitude never depend on color alone.
 */
export function DonutChart({ data, totalLabel, valueFormatter = (value) => CHART_NUMBER.format(value), size = 180, layout = 'side', emptyText = 'No data for this selection' }: DonutChartProps) {
  const theme = useChartTheme()
  const total = data.reduce((sum, datum) => sum + datum.value, 0)
  if (total === 0) return <EmptyState title={emptyText} compact />

  const slices = data.map((datum) => ({ name: datum.label, value: datum.value, fill: datum.color ?? theme.accent }))

  return (
    <div className={[styles.donut, layout === 'stacked' ? styles.stacked : ''].join(' ')}>
      <div className={styles.donutPlot} style={{ width: size, height: size }}>
        <PieChart width={size} height={size} accessibilityLayer>
          <Pie
            data={slices}
            dataKey="value"
            nameKey="name"
            innerRadius={size / 2 - 26}
            outerRadius={size / 2 - 4}
            startAngle={90}
            endAngle={-270}
            stroke={theme.surface}
            strokeWidth={2}
            isAnimationActive={false}
          />
          <Tooltip content={(props) => <ChartTooltip {...props} valueFormatter={(value) => `${valueFormatter(value)} · ${formatShare(value, total)}`} />} />
        </PieChart>
        <div className={styles.donutCenter}>
          <span className={styles.donutTotal}>{valueFormatter(total)}</span>
          <span className={styles.donutCaption}>{totalLabel}</span>
        </div>
      </div>
      <ul className={styles.legend}>
        {data.map((datum) => (
          <li key={datum.key} className={styles.legendItem}>
            <span className={styles.legendSwatch} style={{ background: datum.color ?? theme.accent }} aria-hidden="true" />
            <span className={styles.legendLabel}>{datum.label}</span>
            <span className={styles.legendValue}>{valueFormatter(datum.value)}</span>
            <span className={styles.legendShare}>{formatShare(datum.value, total)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
