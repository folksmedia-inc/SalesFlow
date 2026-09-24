import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'
import type { DotItemDotProps } from 'recharts'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ChartTooltip } from './ChartTooltip'
import { axisTick, CHART_COMPACT, CHART_NUMBER, useChartTheme } from './chartTheme'
import type { TrendPoint } from './types'
import styles from './Charts.module.scss'

interface TrendAreaChartProps {
  data: TrendPoint[]
  seriesName: string
  valueFormatter?: (value: number) => string
  height?: number
  color?: string
  emptyText?: string
}

/**
 * Single-series trend: 2px line over a 10% wash, crosshair tooltip, and a
 * labeled end-point so the current value reads without hovering.
 */
export function TrendAreaChart({ data, seriesName, valueFormatter = (value) => CHART_NUMBER.format(value), height = 280, color, emptyText = 'No data for this period' }: TrendAreaChartProps) {
  const theme = useChartTheme()
  const stroke = color ?? theme.accent
  if (data.length === 0) return <EmptyState title={emptyText} compact />

  const lastIndex = data.length - 1
  const renderEndDot = ({ cx, cy, index }: DotItemDotProps) => {
    if (index !== lastIndex || cx === undefined || cy === undefined) return null
    const value = data[index]?.value ?? 0
    return (
      <g key="end">
        <circle cx={cx} cy={cy} r={5} fill={stroke} stroke={theme.surface} strokeWidth={2} />
        <text x={cx - 10} y={cy - 12} textAnchor="end" fill={theme.text} fontSize={12} fontWeight={600}>
          {valueFormatter(value)}
        </text>
      </g>
    )
  }

  return (
    <div className={styles.chart}>
      <AreaChart responsive style={{ width: '100%', height }} data={data} margin={{ top: 24, right: 12, bottom: 0, left: 0 }} accessibilityLayer>
        <CartesianGrid vertical={false} stroke={theme.grid} />
        <XAxis dataKey="label" tick={axisTick(theme)} tickLine={false} axisLine={{ stroke: theme.axis }} interval="preserveStartEnd" minTickGap={12} />
        <YAxis
          allowDecimals={false}
          tick={axisTick(theme)}
          tickLine={false}
          axisLine={false}
          width={44}
          domain={[0, 'auto']}
          tickFormatter={(value: number) => CHART_COMPACT.format(value)}
        />
        <Tooltip
          cursor={{ stroke: theme.axis, strokeWidth: 1 }}
          content={(props) => (
            <ChartTooltip {...props} valueFormatter={valueFormatter} title={(label, datum) => (datum as TrendPoint | undefined)?.fullLabel ?? label} />
          )}
        />
        <Area
          type="monotone"
          dataKey="value"
          name={seriesName}
          stroke={stroke}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={stroke}
          fillOpacity={0.1}
          dot={renderEndDot}
          animationDuration={600}
          activeDot={{ r: 5, fill: stroke, stroke: theme.surface, strokeWidth: 2 }}
        />
      </AreaChart>
    </div>
  )
}
