import { Button, Checkbox, Divider, Popover, Tooltip } from 'antd'
import { Columns3 } from 'lucide-react'
import type { ColumnConfig } from './types'

interface ColumnPickerProps<T> {
  columns: ColumnConfig<T>[]
  hidden: string[]
  onChange: (hidden: string[]) => void
  onReset: () => void
}

export function ColumnPicker<T>({ columns, hidden, onChange, onReset }: ColumnPickerProps<T>) {
  const toggle = (key: string, visible: boolean) =>
    onChange(visible ? hidden.filter((item) => item !== key) : [...hidden, key])

  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 200 }}>
      {columns.map((column) => (
        <Checkbox
          key={column.key}
          checked={!hidden.includes(column.key)}
          disabled={column.alwaysVisible}
          onChange={(event) => toggle(column.key, event.target.checked)}
        >
          {column.title}
        </Checkbox>
      ))}
      <Divider style={{ margin: '6px 0' }} />
      <Button size="small" type="link" onClick={onReset} style={{ alignSelf: 'flex-start', paddingInline: 0 }}>
        Reset to default
      </Button>
    </div>
  )

  return (
    <Popover content={content} title="Visible columns" trigger="click" placement="bottomRight">
      <Tooltip title="Columns">
        <Button icon={<Columns3 size={16} />} aria-label="Choose visible columns" />
      </Tooltip>
    </Popover>
  )
}
