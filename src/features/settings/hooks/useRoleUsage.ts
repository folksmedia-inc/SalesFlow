import { useMemo } from 'react'
import { useEntityList } from '@/hooks/useEntityData'
import type { Role } from '@/types/models'
import { pluralize } from '@/utils/format'

export interface RoleUsage {
  users: number
  employees: number
}

/** How many users and employees are assigned to each role, keyed by role id. */
export function useRoleUsage(): (roleId: string) => RoleUsage {
  const users = useEntityList('users')
  const employees = useEntityList('employees')

  return useMemo(() => {
    const usage = new Map<string, RoleUsage>()
    const entry = (roleId: string) => {
      let value = usage.get(roleId)
      if (!value) {
        value = { users: 0, employees: 0 }
        usage.set(roleId, value)
      }
      return value
    }
    for (const user of users) entry(user.roleId).users += 1
    for (const employee of employees) if (employee.roleId) entry(employee.roleId).employees += 1
    return (roleId: string) => usage.get(roleId) ?? { users: 0, employees: 0 }
  }, [users, employees])
}

/** Why a role can't be deleted, or null when it can. */
export function getRoleDeleteBlocker(role: Role, usage: RoleUsage): string | null {
  if (role.isSystem) return `${role.name} is a system role and can't be deleted.`
  const assigned = [usage.users > 0 ? pluralize(usage.users, 'user') : null, usage.employees > 0 ? pluralize(usage.employees, 'employee') : null].filter(Boolean)
  if (assigned.length > 0) return `${role.name} is assigned to ${assigned.join(' and ')}. Reassign them to another role first.`
  return null
}
