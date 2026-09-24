import type { PermissionAction, PermissionMatrix, Role } from '@/types/models'
import { timestampAgo } from './seedUtils'

const ALL: PermissionAction[] = ['View', 'Create', 'Edit', 'Delete', 'Export']
const VIEW: PermissionAction[] = ['View']
const EDIT: PermissionAction[] = ['View', 'Create', 'Edit']

export const ROLE_IDS = {
  admin: 'rol_admin',
  hrAdmin: 'rol_hr_admin',
  manager: 'rol_manager',
  employee: 'rol_employee',
  sales: 'rol_sales',
} as const

function role(id: string, name: string, description: string, permissions: PermissionMatrix): Role {
  const createdAt = timestampAgo({ days: 400 })
  return { id, name, description, isSystem: true, permissions, createdAt, updatedAt: createdAt }
}

export function createSeedRoles(): Role[] {
  return [
    role(ROLE_IDS.admin, 'Admin', 'Full access to every module and organization settings.', {
      Employees: ALL, Customers: ALL, Accounts: ALL, Contacts: ALL, Tasks: ALL, Reports: ALL, Settings: ALL,
    }),
    role(ROLE_IDS.hrAdmin, 'HR Admin', 'Manages employee records, departments and teams.', {
      Employees: ALL, Customers: VIEW, Accounts: VIEW, Contacts: VIEW, Tasks: EDIT, Reports: ['View', 'Export'], Settings: VIEW,
    }),
    role(ROLE_IDS.manager, 'Manager', 'Oversees a team and its work; read access to CRM data.', {
      Employees: ['View', 'Edit'], Customers: VIEW, Accounts: VIEW, Contacts: VIEW, Tasks: ALL, Reports: ['View', 'Export'], Settings: [],
    }),
    role(ROLE_IDS.employee, 'Employee', 'Standard access to their own tasks and the company directory.', {
      Employees: VIEW, Customers: [], Accounts: [], Contacts: [], Tasks: EDIT, Reports: [], Settings: [],
    }),
    role(ROLE_IDS.sales, 'Sales User', 'Works customers, accounts and contacts through the pipeline.', {
      Employees: VIEW, Customers: ALL, Accounts: EDIT, Contacts: ALL, Tasks: EDIT, Reports: ['View', 'Export'], Settings: [],
    }),
  ]
}
