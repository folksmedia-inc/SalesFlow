import { Button, Empty } from 'antd'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: ReactNode
  actionLabel?: string
  onAction?: () => void
  secondaryLabel?: string
  onSecondary?: () => void
  compact?: boolean
}

export function EmptyState({ title, description, actionLabel, onAction, secondaryLabel, onSecondary, compact }: EmptyStateProps) {
  return (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      style={{ padding: compact ? '16px 0' : '32px 0' }}
      description={
        <div>
          <div style={{ fontWeight: 600, color: 'var(--app-text-heading)', marginBottom: 4 }}>{title}</div>
          {description && <div style={{ color: 'var(--app-text-secondary)' }}>{description}</div>}
        </div>
      }
    >
      {(actionLabel || secondaryLabel) && (
        <div style={{ display: 'inline-flex', gap: 8 }}>
          {secondaryLabel && <Button onClick={onSecondary}>{secondaryLabel}</Button>}
          {actionLabel && (
            <Button type="primary" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </Empty>
  )
}
