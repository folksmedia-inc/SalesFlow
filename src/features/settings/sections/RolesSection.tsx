import { App, Button, Card, Table, Tag, Tooltip } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { KeyRound, Lock, Pencil, Plus, ShieldCheck, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { useAppSelector } from '@/app/hooks'
import { ROUTES } from '@/constants/routes'
import { useConfirmDelete } from '@/hooks/useConfirmDelete'
import { useEntityCrud, useEntityList } from '@/hooks/useEntityData'
import { selectTableDensity } from '@/store/uiSlice'
import type { Role } from '@/types/models'
import { RoleFormModal } from '../components/RoleFormModal'
import { SettingsSection } from '../components/SettingsSection'
import { getRoleDeleteBlocker, useRoleUsage } from '../hooks/useRoleUsage'
import { countGranted, TOTAL_PERMISSIONS } from '../utils/permissions'
import styles from './RolesSection.module.scss'

type Editing = { mode: 'create' } | { mode: 'edit'; role: Role } | null

interface RolesSectionProps {
  onOpenPermissions: (roleId: string) => void
}

export function RolesSection({ onOpenPermissions }: RolesSectionProps) {
  const { message, modal } = App.useApp()
  const roles = useEntityList('roles')
  const crud = useEntityCrud('roles')
  const usageOf = useRoleUsage()
  const confirmDelete = useConfirmDelete()
  const density = useAppSelector(selectTableDensity)
  const [editing, setEditing] = useState<Editing>(null)

  const requestDelete = (role: Role) => {
    const blocker = getRoleDeleteBlocker(role, usageOf(role.id))
    if (blocker) {
      modal.warning({ title: `Can't delete ${role.name}`, content: blocker, okText: 'Got it' })
      return
    }
    confirmDelete({
      entityLabel: 'Role',
      name: role.name,
      onConfirm: () => {
        crud.remove(role.id)
        message.success(`Role "${role.name}" deleted.`)
      },
    })
  }

  const columns: ColumnsType<Role> = [
    {
      key: 'name',
      title: 'Role',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (_, role) => (
        <span className={styles.roleCell}>
          <span className={styles.roleIcon} aria-hidden="true">
            <ShieldCheck size={16} />
          </span>
          <span className={styles.roleText}>
            <span className={styles.roleTitle}>
              <span className={styles.roleName}>{role.name}</span>
              {role.isSystem ? (
                <Tooltip title="Built-in role — can't be renamed or deleted">
                  <Tag variant="filled" icon={<Lock size={11} aria-hidden="true" style={{ marginInlineEnd: 4, verticalAlign: -1 }} />}>
                    System
                  </Tag>
                </Tooltip>
              ) : (
                <Tag variant="filled" color="purple">
                  Custom
                </Tag>
              )}
            </span>
            <span className={styles.description}>{role.description || 'No description'}</span>
          </span>
        </span>
      ),
    },
    {
      key: 'users',
      title: 'Users',
      align: 'right',
      width: 90,
      sorter: (a, b) => usageOf(a.id).users - usageOf(b.id).users,
      render: (_, role) => {
        const count = usageOf(role.id).users
        return count > 0 ? (
          <Tooltip title={`View users with the ${role.name} role`}>
            <Link to={`${ROUTES.users}?f.role=${role.id}`}>{count}</Link>
          </Tooltip>
        ) : (
          <span className={styles.muted}>0</span>
        )
      },
    },
    {
      key: 'employees',
      title: 'Employees',
      align: 'right',
      width: 110,
      sorter: (a, b) => usageOf(a.id).employees - usageOf(b.id).employees,
      render: (_, role) => {
        const count = usageOf(role.id).employees
        return count > 0 ? count : <span className={styles.muted}>0</span>
      },
    },
    {
      key: 'access',
      title: 'Access',
      width: 150,
      responsive: ['lg'],
      render: (_, role) => {
        const granted = countGranted(role.permissions)
        return (
          <span className={styles.access} title={`${granted} of ${TOTAL_PERMISSIONS} permissions granted`}>
            <span className={styles.meter} aria-hidden="true">
              <span style={{ width: `${(granted / TOTAL_PERMISSIONS) * 100}%` }} />
            </span>
            <span className={styles.accessText}>
              {granted}/{TOTAL_PERMISSIONS}
            </span>
          </span>
        )
      },
    },
    {
      key: 'actions',
      title: 'Actions',
      align: 'right',
      width: 116,
      fixed: 'right',
      render: (_, role) => {
        const blocker = getRoleDeleteBlocker(role, usageOf(role.id))
        return (
          <span className={styles.actions}>
            <Tooltip title="Edit role">
              <Button type="text" size="small" icon={<Pencil size={15} />} aria-label={`Edit ${role.name}`} onClick={() => setEditing({ mode: 'edit', role })} />
            </Tooltip>
            <Tooltip title="Edit permissions">
              <Button type="text" size="small" icon={<KeyRound size={15} />} aria-label={`Edit permissions for ${role.name}`} onClick={() => onOpenPermissions(role.id)} />
            </Tooltip>
            <Tooltip title={blocker ?? 'Delete role'}>
              <Button
                type="text"
                size="small"
                danger={!blocker}
                className={blocker ? styles.blocked : undefined}
                icon={<Trash2 size={15} />}
                aria-label={blocker ? `Delete ${role.name} (not available: ${blocker})` : `Delete ${role.name}`}
                onClick={() => requestDelete(role)}
              />
            </Tooltip>
          </span>
        )
      },
    },
  ]

  return (
    <SettingsSection
      title="Roles"
      description="Roles bundle permissions. Assign them to users and employees to control access."
      actions={
        <Button type="primary" icon={<Plus size={16} />} onClick={() => setEditing({ mode: 'create' })}>
          New Role
        </Button>
      }
    >
      <Card styles={{ body: { padding: 0 } }}>
        <Table<Role> rowKey="id" size={density} columns={columns} dataSource={roles} pagination={false} scroll={{ x: 'max-content' }} />
      </Card>

      {editing && <RoleFormModal role={editing.mode === 'edit' ? editing.role : undefined} onClose={() => setEditing(null)} />}
    </SettingsSection>
  )
}
