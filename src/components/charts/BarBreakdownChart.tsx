import { Bar, BarChart, LabelList, Tooltip, XAxis, YAxis } from 'recharts'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ChartTooltip } from './ChartTooltip'
import { axisTick, CHART_NUMBER, useChartTheme } from './chartTheme'
import type { ChartDatum } from './types'
import styles from './Charts.module.scss'

interface BarBreakdownChartProps {
  data: ChartDatum[]
  /** Series name shown in the tooltip (e.g. "Employees"). */
  seriesName: string
  valueFormatter?: (value: number) => string
  /** Single series color; defaults to the accent. */
  color?: string
  emptyText?: string
  /** Max label column width in px. */
  labelWidth?: number
}

const ROW_HEIGHT = 34
const CHAR_WIDTH = 7.4

/**
 * Horizontal bars for comparing magnitude across named categories.
 * One series → one color; values are labeled at the bar tip.
 */
export function BarBreakdownChart({ data, seriesName, valueFormatter = (value) => CHART_NUMBER.format(value), color, emptyText = 'No data for this selection', labelWidth = 170 }: BarBreakdownChartProps) {
  const theme = useChartTheme()
  if (data.length === 0 || data.every((datum) => datum.value === 0)) {
    return <EmptyState title={emptyText} compact />
  }

  const longest = data.reduce((max, datum) => Math.max(max, datum.label.length), 0)
  const yWidth = Math.min(labelWidth, Math.max(60, Math.ceil(longest * CHAR_WIDTH) + 12))
  const maxChars = Math.floor((yWidth - 12) / CHAR_WIDTH)
  const longestValue = data.reduce((max, datum) => Math.max(max, valueFormatter(datum.value).length), 0)
  const height = data.length * ROW_HEIGHT + 8

  return (
    <div className={styles.chart}>
      <BarChart
        responsive
        style={{ width: '100%', height }}
        data={data}
        layout="vertical"
        margin={{ top: 0, right: longestValue * CHAR_WIDTH + 16, bottom: 0, left: 0 }}
        barCategoryGap={8}
        accessibilityLayer
      >
        <XAxis type="number" hide domain={[0, 'dataMax']} />
        <YAxis
          type="category"
          dataKey="label"
          width={yWidth}
          tick={(props: unknown) => {
            // Single-line labels (the default tick wraps long names onto two lines).
            const { x, y, payload } = props as { x: number; y: number; payload: { value: string } }
            const text = payload.value.length > maxChars ? `${payload.value.slice(0, maxChars - 1)}…` : payload.value
            return (
              <text x={x - 8} y={y} dy={4} textAnchor="end" {...axisTick(theme)}>
                <title>{payload.value}</title>
                {text}
              </text>
            )
          }}
          tickLine={false}
          axisLine={{ stroke: theme.axis }}
          interval={0}
        />
        <Tooltip cursor={{ fill: theme.cursor }} content={(props) => <ChartTooltip {...props} valueFormatter={valueFormatter} />} />
        <Bar dataKey="value" name={seriesName} fill={color ?? theme.accent} barSize={14} radius={[0, 4, 4, 0]} activeBar={{ fillOpacity: 0.8 }} animationDuration={600}>
          <LabelList
            dataKey="value"
            position="right"
            offset={8}
            formatter={(value) => (typeof value === 'number' ? valueFormatter(value) : value)}
            style={{ fill: theme.text, fontSize: 12, fontWeight: 500 }}
          />
        </Bar>
      </BarChart>
    </div>
  )
}
