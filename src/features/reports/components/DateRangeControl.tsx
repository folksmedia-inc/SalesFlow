import { DatePicker, Select } from 'antd'
import dayjs from 'dayjs'
import { CalendarRange } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { customDateRangeSet, dateRangePresetSet, selectGlobalDateRange, type DateRangePreset } from '@/store/filterSlice'
import type { ResolvedDateRange } from '@/utils/dateRange'
import styles from './ReportLayout.module.scss'

const PRESET_OPTIONS: { value: DateRangePreset; label: string }[] = [
  { value: 'last7Days', label: 'Last 7 days' },
  { value: 'last30Days', label: 'Last 30 days' },
  { value: 'last90Days', label: 'Last 90 days' },
  { value: 'last12Months', label: 'Last 12 months' },
  { value: 'yearToDate', label: 'Year to date' },
  { value: 'next30Days', label: 'Next 30 days' },
  { value: 'next90Days', label: 'Next 90 days' },
  { value: 'custom', label: 'Custom range' },
]

interface DateRangeControlProps {
  range: ResolvedDateRange
}

/** Global reporting period: a preset list plus an editable custom range. */
export function DateRangeControl({ range }: DateRangeControlProps) {
  const dispatch = useAppDispatch()
  const { preset } = useAppSelector(selectGlobalDateRange)

  return (
    <div className={styles.dateRange}>
      <Select<DateRangePreset>
        aria-label="Date range"
        className={styles.presetSelect}
        value={preset}
        prefix={<CalendarRange size={14} aria-hidden="true" className={styles.selectIcon} />}
        options={PRESET_OPTIONS}
        popupMatchSelectWidth={false}
        onChange={(value) => {
          if (value === 'custom') dispatch(customDateRangeSet({ from: range.from, to: range.to }))
          else dispatch(dateRangePresetSet(value))
        }}
      />
      <DatePicker.RangePicker
        className={styles.rangePicker}
        value={[dayjs(range.from), dayjs(range.to)]}
        format="MMM D, YYYY"
        allowClear={false}
        onChange={(dates) => {
          const [from, to] = dates ?? []
          if (from && to) dispatch(customDateRangeSet({ from: from.format('YYYY-MM-DD'), to: to.format('YYYY-MM-DD') }))
        }}
      />
    </div>
  )
}
