/** One category and its value, as consumed by the shared chart components. */
export interface ChartDatum {
  key: string
  label: string
  value: number
  /** Fixed color for this category (categorical / status); omit for single-series charts. */
  color?: string
}

/** One point on a time axis. */
export interface TrendPoint {
  /** Axis label (e.g. "Sep"). */
  label: string
  /** Longer label for the tooltip (e.g. "September 2026"). */
  fullLabel: string
  value: number
}
