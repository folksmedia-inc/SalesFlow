import { Alert, App, Card, Select, Space, Typography } from 'antd'
import { Link } from 'react-router'
import { useEntityCrud, useEntityRecord } from '@/hooks/useEntityData'
import { useLookupOptions } from '@/hooks/useLookups'
import { PermissionMatrixTable } from '@/features/settings/components/PermissionMatrixTable'
import type { Employee } from '@/types/models'

/** Role assignment and the resulting permissions for an employee. */
export function EmployeePermissions({ employee }: { employee: Employee }) {
  const { message } = App.useApp()
  const crud = useEntityCrud('employees')
  const role = useEntityRecord('roles', employee.roleId)
  const roleOptions = useLookupOptions('roles')

  return (
    <Card title="Role & Permissions">
      <Space orientation="vertical" size={16} style={{ width: '100%' }}>
        <div>
          <Typography.Text strong style={{ display: 'block', marginBottom: 6 }}>
            Assigned role
          </Typography.Text>
          <Select
            aria-label="Assigned role"
            value={employee.roleId ?? undefined}
            placeholder="No role assigned"
            options={roleOptions}
            style={{ width: 280 }}
            onChange={(roleId: string) => {
              crud.update(employee.id, { roleId })
              message.success('Role updated.')
            }}
          />
          {role && (
            <Typography.Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
              {role.description} <Link to="/settings?section=roles">Manage roles</Link>
            </Typography.Paragraph>
          )}
        </div>
        {role ? (
          <PermissionMatrixTable permissions={role.permissions} />
        ) : (
          <Alert type="info" showIcon title="Assign a role to grant this employee access to modules." />
        )}
      </Space>
    </Card>
  )
}
