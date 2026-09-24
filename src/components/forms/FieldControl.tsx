import { DatePicker, Input, InputNumber, Select } from 'antd'
import dayjs from 'dayjs'
import type { ControllerRenderProps, FieldValues } from 'react-hook-form'
import { useOptions } from '@/components/entity/useOptions'
import type { FieldConfig } from '@/components/entity/types'

interface FieldControlProps {
  config: FieldConfig
  field: ControllerRenderProps<FieldValues, string>
  id: string
  status: 'error' | undefined
}

/** Renders the right antd input for a field config, adapting values for RHF. */
export function FieldControl({ config, field, id, status }: FieldControlProps) {
  const options = useOptions(config.options)
  const { value, onChange, onBlur, name, ref, disabled } = field
  const common = { id, status, disabled, onBlur, placeholder: config.placeholder }

  switch (config.type) {
    case 'textarea':
      return <Input.TextArea {...common} ref={ref} name={name} value={value ?? ''} onChange={onChange} autoSize={{ minRows: 3, maxRows: 8 }} />
    case 'number':
    case 'currency':
      return (
        <InputNumber
          {...common}
          ref={ref}
          value={value ?? null}
          onChange={(next) => onChange(next ?? null)}
          min={config.min}
          max={config.max}
          style={{ width: '100%' }}
          prefix={config.type === 'currency' ? '$' : undefined}
          formatter={(input) => `${input ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(input) => Number((input ?? '').replace(/[^\d.-]/g, ''))}
        />
      )
    case 'select':
      return (
        <Select
          {...common}
          ref={ref}
          value={value ?? undefined}
          onChange={(next) => onChange(next ?? null)}
          options={options as { label: string; value: string }[]}
          allowClear={!config.required}
          showSearch={{ optionFilterProp: 'label' }}
          placeholder={config.placeholder ?? `Select ${config.label.toLowerCase()}`}
        />
      )
    case 'multiselect':
      return (
        <Select
          {...common}
          ref={ref}
          mode="multiple"
          value={value ?? []}
          onChange={onChange}
          options={options as { label: string; value: string }[]}
          showSearch={{ optionFilterProp: 'label' }}
          maxTagCount="responsive"
          placeholder={config.placeholder ?? `Select ${config.label.toLowerCase()}`}
        />
      )
    case 'date':
      return (
        <DatePicker
          {...common}
          ref={ref}
          value={value ? dayjs(value) : null}
          onChange={(next) => onChange(next ? next.format('YYYY-MM-DD') : null)}
          style={{ width: '100%' }}
          format="MMM D, YYYY"
        />
      )
    default:
      return (
        <Input
          {...common}
          ref={ref}
          name={name}
          value={value ?? ''}
          onChange={onChange}
          type={config.type === 'email' ? 'email' : config.type === 'url' ? 'url' : config.type === 'phone' ? 'tel' : 'text'}
          autoComplete={config.type === 'email' ? 'email' : config.type === 'phone' ? 'tel' : 'off'}
        />
      )
  }
}
