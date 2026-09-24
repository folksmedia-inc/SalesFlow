import { DatePicker, Select } from 'antd'
import dayjs from 'dayjs'
import { memo, useMemo } from 'react'
import type { SelectOption } from '@/types/common'
import type { FilterValues } from './listQuery'
import type { FilterConfig } from './types'
import { useOptions } from './useOptions'

interface FilterControlProps<T> {
  filter: FilterConfig<T>
  records: T[]
  value: string[]
  onChange: (key: string, values: string[]) => void
}

function FilterControl<T>({ filter, records, value, onChange }: FilterControlProps<T>) {
  const sourceOptions = useOptions(filter.options === 'distinct' ? undefined : filter.options)
  const distinctOptions = useMemo<SelectOption[]>(() => {
    if (filter.options !== 'distinct') return []
    const values = new Set<string>()
    records.forEach((record) => {
      const recordValue = filter.getValue(record)
      ;(typeof recordValue === 'string' ? [recordValue] : (recordValue ?? [])).forEach((item) => values.add(item))
    })
    return [...values].sort().map((item) => ({ value: item, label: item }))
  }, [filter, records])
  const options = filter.options === 'distinct' ? distinctOptions : sourceOptions

  if (filter.type === 'dateRange') {
    const [from, to] = value
    return (
      <DatePicker.RangePicker
        aria-label={filter.label}
        placeholder={[`${filter.label} from`, 'to']}
        value={from && to ? [dayjs(from), dayjs(to)] : null}
        onChange={(range) =>
          onChange(filter.key, range?.[0] && range[1] ? [range[0].format('YYYY-MM-DD'), range[1].format('YYYY-MM-DD')] : [])
        }
        style={{ width: 260 }}
        allowClear
      />
    )
  }

  return (
    <Select
      aria-label={filter.label}
      mode="multiple"
      placeholder={filter.label}
      value={value}
      onChange={(next: string[]) => onChange(filter.key, next)}
      options={options as { label: string; value: string }[]}
      maxTagCount={1}
      maxTagTextLength={14}
      allowClear
      showSearch={{ optionFilterProp: 'label' }}
      style={{ minWidth: 170 }}
      popupMatchSelectWidth={false}
    />
  )
}

interface EntityFiltersProps<T> {
  filters: FilterConfig<T>[]
  records: T[]
  values: FilterValues
  onChange: (key: string, values: string[]) => void
}

/** Renders one control per filter config. */
function EntityFiltersInner<T>({ filters, records, values, onChange }: EntityFiltersProps<T>) {
  return (
    <>
      {filters.map((filter) => (
        <FilterControl key={filter.key} filter={filter} records={records} value={values[filter.key] ?? []} onChange={onChange} />
      ))}
    </>
  )
}

export const EntityFilters = memo(EntityFiltersInner) as typeof EntityFiltersInner
