import { Tag } from 'antd'
import { memo } from 'react'

type TagColor = 'success' | 'default' | 'warning' | 'error' | 'processing' | 'blue' | 'purple' | 'orange' | 'red' | 'gold' | 'cyan'

/** Semantic color for every status/priority value used in the app. */
const STATUS_COLORS: Record<string, TagColor> = {
  Active: 'success',
  Inactive: 'default',
  'On Leave': 'warning',
  Lead: 'purple',
  Prospect: 'blue',
  Churned: 'error',
  'Not Started': 'default',
  'In Progress': 'processing',
  Completed: 'success',
  Cancelled: 'error',
  Low: 'default',
  Medium: 'blue',
  High: 'orange',
  Critical: 'red',
  Invited: 'gold',
  Suspended: 'error',
}

interface StatusTagProps {
  status: string | null | undefined
}

export const StatusTag = memo(function StatusTag({ status }: StatusTagProps) {
  if (!status) return null
  return (
    <Tag color={STATUS_COLORS[status] ?? 'default'} variant="filled" style={{ marginInlineEnd: 0 }}>
      {status}
    </Tag>
  )
})
