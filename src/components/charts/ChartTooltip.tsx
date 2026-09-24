import type { ReactNode } from 'react'
import type { TooltipPayload } from 'recharts'
import { CHART_NUMBER } from './chartTheme'
import styles from './Charts.module.scss'

export interface ChartTooltipProps {
  active?: boolean
  payload?: TooltipPayload
  label?: string | number
  /** Formats each series value (defaults to thousands-separated numbers). */
  valueFormatter?: (value: number) => string
  /** Overrides the heading (defaults to the category / x label). */
  title?: (label: string, datum: unknown) => ReactNode
  /** Series display names by dataKey. */
  seriesNames?: Record<string, string>
}

/**
 * Themed tooltip body for every chart: value first (strong), series name
 * second, keyed with a short line in the series color.
 */
export function ChartTooltip({ active, payload, label, valueFormatter = (value) => CHART_NUMBER.format(value), title, seriesNames }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  const datum: unknown = payload[0]?.payload
  const heading = title ? title(String(label ?? ''), datum) : (label ?? payload[0]?.name)

  return (
    <div className={styles.tooltip}>
      {heading !== undefined && heading !== '' && <div className={styles.tooltipTitle}>{heading}</div>}
      {payload.map((entry) => {
        const key = String(entry.dataKey ?? entry.name ?? '')
        const color = entry.color ?? entry.stroke ?? entry.fill
        const value = typeof entry.value === 'number' ? valueFormatter(entry.value) : String(entry.value ?? '—')
        const rawName = seriesNames?.[key] ?? String(entry.name ?? '')
        const name = rawName === String(heading) ? '' : rawName
        return (
          <div key={key} className={styles.tooltipRow}>
            <span className={styles.tooltipKey} style={{ background: color }} aria-hidden="true" />
            <span className={styles.tooltipValue}>{value}</span>
            {name && <span className={styles.tooltipName}>{name}</span>}
          </div>
        )
      })}
    </div>
  )
}
