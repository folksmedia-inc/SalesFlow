import { Table, Tooltip } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { PERMISSION_ACTIONS, PERMISSION_MODULES, type PermissionAction, type PermissionModule, type Role } from '@/types/models'
import styles from './RoleComparisonTable.module.scss'

interface RoleComparisonTableProps {
  roles: Role[]
  /** Highlights the column of the role being edited. */
  activeRoleId?: string
}

/** Distinct one-letter codes (Edit and Export would otherwise both be "E"). */
const CODES: Record<PermissionAction, string> = { View: 'V', Create: 'C', Edit: 'E', Delete: 'D', Export: 'X' }

interface Row {
  module: PermissionModule
}

/** Read-only modules × roles overview; each cell lists the granted actions as compact chips. */
export function RoleComparisonTable({ roles, activeRoleId }: RoleComparisonTableProps) {
  const columns: ColumnsType<Row> = [
    { key: 'module', title: 'Module', fixed: 'left', render: (_, { module }) => <strong>{module}</strong> },
    ...roles.map((role) => ({
      key: role.id,
      title: role.name,
      className: role.id === activeRoleId ? styles.active : undefined,
      render: (_: unknown, { module }: Row) => {
        const granted = role.permissions[module] ?? []
        const label = granted.length > 0 ? `${role.name} — ${module}: ${granted.join(', ')}` : `${role.name} — ${module}: no access`
        return (
          <Tooltip title={granted.length > 0 ? granted.join(', ') : 'No access'}>
            <span className={styles.chips} role="img" aria-label={label}>
              {PERMISSION_ACTIONS.map((action) => (
                <span key={action} className={granted.includes(action) ? styles.on : styles.off}>
                  {CODES[action]}
                </span>
              ))}
            </span>
          </Tooltip>
        )
      },
    })),
  ]

  return (
    <>
      <Table<Row>
        rowKey="module"
        size="small"
        columns={columns}
        dataSource={PERMISSION_MODULES.map((module) => ({ module }))}
        pagination={false}
        scroll={{ x: 'max-content' }}
      />
      <div className={styles.legend} aria-hidden="true">
        {PERMISSION_ACTIONS.map((action) => (
          <span key={action}>
            <span className={styles.on}>{CODES[action]}</span> {action}
          </span>
        ))}
      </div>
    </>
  )
}
