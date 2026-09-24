import { Bar, BarChart, CartesianGrid, LabelList, Tooltip, XAxis, YAxis } from 'recharts'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ChartTooltip } from './ChartTooltip'
import { axisTick, CHART_COMPACT, CHART_NUMBER, useChartTheme } from './chartTheme'
import type { TrendPoint } from './types'
import styles from './Charts.module.scss'

interface ColumnChartProps {
  data: TrendPoint[]
  seriesName: string
  valueFormatter?: (value: number) => string
  color?: string
  height?: number
  /** Label each column cap with its value (only for a handful of columns). */
  showValues?: boolean
  emptyText?: string
}

/** Vertical columns — counts per period or per ordered category. */
export function ColumnChart({ data, seriesName, valueFormatter = (value) => CHART_NUMBER.format(value), color, height = 260, showValues = false, emptyText = 'No data for this selection' }: ColumnChartProps) {
  const theme = useChartTheme()
  if (data.length === 0 || data.every((point) => point.value === 0)) {
    return <EmptyState title={emptyText} compact />
  }

  const maxValue = data.reduce((max, point) => Math.max(max, point.value), 0)

  return (
    <div className={styles.chart}>
      <BarChart responsive style={{ width: '100%', height }} data={data} margin={{ top: showValues ? 20 : 8, right: 4, bottom: 0, left: 0 }} accessibilityLayer>
        <CartesianGrid vertical={false} stroke={theme.grid} />
        <XAxis dataKey="label" tick={axisTick(theme)} tickLine={false} axisLine={{ stroke: theme.axis }} interval="preserveStartEnd" minTickGap={8} />
        <YAxis
          allowDecimals={false}
          tickCount={Math.min(5, maxValue + 1)}
          tick={axisTick(theme)}
          tickLine={false}
          axisLine={false}
          width={44}
          tickFormatter={(value: number) => CHART_COMPACT.format(value)}
        />
        <Tooltip
          cursor={{ fill: theme.cursor }}
          content={(props) => (
            <ChartTooltip {...props} valueFormatter={valueFormatter} title={(label, datum) => (datum as TrendPoint | undefined)?.fullLabel ?? label} />
          )}
        />
        <Bar dataKey="value" name={seriesName} fill={color ?? theme.accent} maxBarSize={24} radius={[4, 4, 0, 0]} activeBar={{ fillOpacity: 0.8 }} animationDuration={600}>
          {showValues && (
            <LabelList
              dataKey="value"
              position="top"
              offset={6}
              formatter={(value) => (typeof value === 'number' ? valueFormatter(value) : value)}
              style={{ fill: theme.text, fontSize: 12, fontWeight: 500 }}
            />
          )}
        </Bar>
      </BarChart>
    </div>
  )
}
