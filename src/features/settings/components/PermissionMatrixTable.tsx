import { Checkbox, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Check, Minus } from 'lucide-react'
import { PERMISSION_ACTIONS, PERMISSION_MODULES, type PermissionAction, type PermissionMatrix, type PermissionModule } from '@/types/models'
import styles from './PermissionMatrixTable.module.scss'

interface PermissionMatrixTableProps {
  permissions: PermissionMatrix
  /** When provided, cells become checkboxes. */
  onToggle?: (module: PermissionModule, action: PermissionAction, granted: boolean) => void
  /** Toggle a whole row. */
  onToggleModule?: (module: PermissionModule, granted: boolean) => void
  /** Toggle a whole column (adds a checkbox to each action header). */
  onToggleAction?: (action: PermissionAction, granted: boolean) => void
  /** Cells with unsaved changes, as `"Module:Action"` keys — highlighted. */
  changedCells?: ReadonlySet<string>
  /** Show checkboxes but prevent changes. */
  disabled?: boolean
}

interface Row {
  module: PermissionModule
}

/** Modules × actions grid of permissions (read-only or editable). */
export function PermissionMatrixTable({ permissions, onToggle, onToggleModule, onToggleAction, changedCells, disabled }: PermissionMatrixTableProps) {
  const columns: ColumnsType<Row> = [
    {
      key: 'module',
      title: 'Module',
      fixed: 'left',
      render: (_, { module }) => {
        const granted = permissions[module] ?? []
        if (!onToggleModule) return <strong>{module}</strong>
        return (
          <Checkbox
            checked={granted.length === PERMISSION_ACTIONS.length}
            indeterminate={granted.length > 0 && granted.length < PERMISSION_ACTIONS.length}
            disabled={disabled}
            aria-label={`All ${module} permissions`}
            onChange={(event) => onToggleModule(module, event.target.checked)}
          >
            <strong>{module}</strong>
          </Checkbox>
        )
      },
    },
    ...PERMISSION_ACTIONS.map((action) => {
      const grantedCount = PERMISSION_MODULES.filter((module) => (permissions[module] ?? []).includes(action)).length
      return {
        key: action,
        title: onToggleAction ? (
          <Checkbox
            checked={grantedCount === PERMISSION_MODULES.length}
            indeterminate={grantedCount > 0 && grantedCount < PERMISSION_MODULES.length}
            disabled={disabled}
            aria-label={`${action} on all modules`}
            onChange={(event) => onToggleAction(action, event.target.checked)}
            className={styles.headerCheckbox}
          >
            {action}
          </Checkbox>
        ) : (
          action
        ),
        align: 'center' as const,
        onCell: ({ module }: Row) => ({ className: changedCells?.has(`${module}:${action}`) ? styles.changed : undefined }),
        render: (_: unknown, { module }: Row) => {
          const granted = (permissions[module] ?? []).includes(action)
          if (onToggle) {
            return (
              <Checkbox
                aria-label={`${action} ${module}`}
                checked={granted}
                disabled={disabled}
                onChange={(event) => onToggle(module, action, event.target.checked)}
              />
            )
          }
          return granted ? (
            <Check size={16} color="var(--app-color-success)" aria-label="Granted" />
          ) : (
            <Minus size={16} color="var(--app-text-tertiary)" aria-label="Not granted" />
          )
        },
      }
    }),
  ]

  return (
    <Table<Row>
      rowKey="module"
      size="middle"
      columns={columns}
      dataSource={PERMISSION_MODULES.map((module) => ({ module }))}
      pagination={false}
      scroll={{ x: 'max-content' }}
      bordered
    />
  )
}
