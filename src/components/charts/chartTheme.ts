import { useAppSelector } from '@/app/hooks'
import { selectThemeMode, type ThemeMode } from '@/store/uiSlice'

/**
 * Chart colors for both themes. Recharts draws SVG, so colors are resolved
 * in JS from the active theme mode rather than read from CSS variables.
 *
 * The categorical palette is a validated, colorblind-safe order (adjacent
 * CVD ΔE ≥ 8 in both modes against the card surfaces #ffffff / #151b23).
 * Assign slots in this fixed order and never cycle past the eighth — fold
 * the tail into "Other" instead. Light slots 3–5 sit below 3:1 contrast on
 * white, so charts using them must also show values (legend or table).
 */

export interface ChartTheme {
  mode: ThemeMode
  /** Card surface the chart renders on (used for gaps and marker rings). */
  surface: string
  /** Primary ink for values and emphasized labels. */
  text: string
  /** Axis tick labels and secondary chart text. */
  textSecondary: string
  /** Hairline gridlines. */
  grid: string
  /** Baseline / axis rule. */
  axis: string
  /** Hover band behind the active category. */
  cursor: string
  /** Fixed-order categorical slots. */
  categorical: readonly string[]
  /** Single-series accent (categorical slot 1). */
  accent: string
  /** De-emphasis / "Other". */
  muted: string
  /** Reserved state colors — pair with a label, never color alone. */
  status: {
    good: string
    warning: string
    critical: string
    neutral: string
  }
}

const LIGHT: ChartTheme = {
  mode: 'light',
  surface: '#ffffff',
  text: '#181b20',
  textSecondary: '#5c6470',
  grid: '#eceef2',
  axis: '#d8dde6',
  cursor: 'rgba(24, 27, 32, 0.04)',
  categorical: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948'],
  accent: '#2a78d6',
  muted: '#a3a9b3',
  status: { good: '#0ca30c', warning: '#fab219', critical: '#d03b3b', neutral: '#a3a9b3' },
}

const DARK: ChartTheme = {
  mode: 'dark',
  surface: '#151b23',
  text: '#f2f4f7',
  textSecondary: '#a4adba',
  grid: '#232b36',
  axis: '#2d3643',
  cursor: 'rgba(255, 255, 255, 0.05)',
  categorical: ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767'],
  accent: '#3987e5',
  muted: '#5c6675',
  status: { good: '#0ca30c', warning: '#fab219', critical: '#d03b3b', neutral: '#5c6675' },
}

export function getChartTheme(mode: ThemeMode): ChartTheme {
  return mode === 'dark' ? DARK : LIGHT
}

/** Chart colors for the active theme. */
export function useChartTheme(): ChartTheme {
  return getChartTheme(useAppSelector(selectThemeMode))
}

/** Shared tick styling for category / value axes. */
export function axisTick(theme: ChartTheme) {
  return { fill: theme.textSecondary, fontSize: 12 }
}

/** Fixed color for each value of a known, ordered domain (color follows the entity, not its rank). */
export function colorByKey<K extends string>(keys: readonly K[], theme: ChartTheme): Record<K, string> {
  const result = {} as Record<K, string>
  keys.forEach((key, index) => {
    result[key] = theme.categorical[index] ?? theme.muted
  })
  return result
}

/** Keeps the top `limit - 1` items and folds the rest into a single "Other" row. */
export function foldIntoOther<T extends { label: string; value: number }>(items: T[], limit: number, makeOther: (value: number, count: number) => T): T[] {
  if (items.length <= limit) return items
  const head = items.slice(0, limit - 1)
  const tail = items.slice(limit - 1)
  return [...head, makeOther(tail.reduce((sum, item) => sum + item.value, 0), tail.length)]
}

export const CHART_NUMBER = new Intl.NumberFormat('en-US')
export const CHART_COMPACT = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })
