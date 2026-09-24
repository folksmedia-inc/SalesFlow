import { Tag, Tooltip } from 'antd'
import { CheckCircle2, ShieldCheck, UserCog, XCircle } from 'lucide-react'
import { Link } from 'react-router'
import { z } from 'zod'
import { PersonCell } from '@/components/common/PersonCell'
import { StatusTag } from '@/components/common/StatusTag'
import { defineEntityConfig } from '@/components/entity/types'
import { toOptions } from '@/components/entity/useOptions'
import { ROUTES } from '@/constants/routes'
import { USER_STATUSES, type UserStatus } from '@/types/models'
import { formatDate, formatDateTime, formatRelativeTime, getFullName } from '@/utils/format'

const STATUS_RANK: Record<UserStatus, number> = { Active: 1, Invited: 2, Suspended: 3 }

const userSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(50, 'Must be 50 characters or fewer'),
  lastName: z.string().trim().min(1, 'Last name is required').max(50, 'Must be 50 characters or fewer'),
  email: z.string().trim().min(1, 'Email is required').pipe(z.email('Enter a valid email address')),
  title: z.string().trim().max(80, 'Must be 80 characters or fewer'),
  roleId: z.string('Role is required').min(1, 'Role is required'),
  status: z.enum(USER_STATUSES, 'Select a status'),
  employeeId: z.string().nullable(),
  /** Not editable; carried through so saving a user keeps their last sign-in. */
  lastLoginAt: z.string().nullable(),
})

export type UserFormValues = z.infer<typeof userSchema>

/**
 * Application login accounts. Used by the Users page and embedded in
 * Settings → Users (see `UserManagement`, which adds the signed-in user
 * guards this static config can't know about).
 */
export const userConfig = defineEntityConfig({
  key: 'users',
  label: 'Users',
  singular: 'User',
  createLabel: 'Invite User',
  description: 'Invite people to the Admin Hub, assign their role and control who can sign in.',
  basePath: ROUTES.users,
  icon: UserCog,
  avatar: 'initials',
  formMode: 'drawer',
  getTitle: getFullName,
  getSubtitle: (user) => user.email,
  getStatus: (user) => user.status,
  searchText: (user, lookups) => [getFullName(user), user.email, user.title, lookups.roleName(user.roleId), lookups.employeeName(user.employeeId)].join(' '),
  defaultSort: { field: 'name', order: 'asc' },
  columns: [
    {
      key: 'name',
      title: 'User',
      sortable: true,
      alwaysVisible: true,
      value: getFullName,
      render: (user) => <PersonCell name={getFullName(user)} subtitle={user.email} />,
    },
    { key: 'title', title: 'Title', sortable: true, render: (user) => user.title || <span style={{ color: 'var(--app-text-tertiary)' }}>—</span> },
    {
      key: 'role',
      title: 'Role',
      sortable: true,
      value: (user, lookups) => lookups.roleName(user.roleId),
      render: (user, lookups) => (
        <Tag variant="filled" icon={<ShieldCheck size={12} aria-hidden="true" style={{ marginInlineEnd: 4, verticalAlign: -1 }} />} style={{ marginInlineEnd: 0 }}>
          {lookups.roleName(user.roleId)}
        </Tag>
      ),
    },
    { key: 'status', title: 'Status', sortable: true, value: (user) => STATUS_RANK[user.status], render: (user) => <StatusTag status={user.status} /> },
    {
      key: 'employee',
      title: 'Linked Employee',
      sortable: true,
      value: (user, lookups) => (user.employeeId ? lookups.employeeName(user.employeeId) : ''),
      render: (user, lookups) =>
        user.employeeId ? (
          <Link to={ROUTES.employeeDetails(user.employeeId)} onClick={(event) => event.stopPropagation()}>
            {lookups.employeeName(user.employeeId)}
          </Link>
        ) : (
          <span style={{ color: 'var(--app-text-tertiary)' }}>Not linked</span>
        ),
    },
    {
      key: 'lastLoginAt',
      title: 'Last Login',
      sortable: true,
      value: (user) => user.lastLoginAt ?? '',
      render: (user) =>
        user.lastLoginAt ? (
          <Tooltip title={formatDateTime(user.lastLoginAt)}>
            <span>{formatRelativeTime(user.lastLoginAt)}</span>
          </Tooltip>
        ) : (
          <span style={{ color: 'var(--app-text-tertiary)' }}>Never</span>
        ),
    },
    { key: 'createdAt', title: 'Created', sortable: true, render: (user) => formatDate(user.createdAt) },
  ],
  filters: [
    { key: 'role', label: 'Role', type: 'select', options: 'roles', getValue: (user) => user.roleId },
    { key: 'status', label: 'Status', type: 'select', options: toOptions(USER_STATUSES), getValue: (user) => user.status },
  ],
  bulkActions: [
    { key: 'activate', label: 'Activate', icon: CheckCircle2, kind: 'update', changes: { status: 'Active' } },
    { key: 'suspend', label: 'Suspend', icon: XCircle, kind: 'update', changes: { status: 'Suspended' } },
    { key: 'role', label: 'Change Role', icon: ShieldCheck, kind: 'assign', field: 'roleId', fieldLabel: 'Role', options: 'roles' },
    { key: 'delete', label: 'Delete', kind: 'delete' },
  ],
  statusToggle: { field: 'status', activeValue: 'Active', inactiveValue: 'Suspended', activateLabel: 'Activate', deactivateLabel: 'Suspend' },
  form: {
    schema: userSchema,
    defaultValues: { firstName: '', lastName: '', email: '', title: '', roleId: '', status: 'Invited', employeeId: null, lastLoginAt: null },
    toValues: (user) => ({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      title: user.title,
      roleId: user.roleId,
      status: user.status,
      employeeId: user.employeeId,
      lastLoginAt: user.lastLoginAt,
    }),
    toRecord: (values) => ({ ...values, email: values.email.toLowerCase() }),
    validate: (values, { records, currentId }) => {
      const others = records.filter((user) => user.id !== currentId)
      const email = values.email.trim().toLowerCase()
      return {
        email: others.some((user) => user.email.toLowerCase() === email) ? 'Another user already uses this email' : undefined,
        employeeId: values.employeeId && others.some((user) => user.employeeId === values.employeeId) ? 'This employee is already linked to another user' : undefined,
      }
    },
    sections: [
      {
        title: 'Profile',
        fields: [
          { name: 'firstName', label: 'First Name', type: 'text', required: true },
          { name: 'lastName', label: 'Last Name', type: 'text', required: true },
          { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'name@company.com', help: 'Used to sign in. Must be unique.' },
          { name: 'title', label: 'Title', type: 'text', placeholder: 'e.g. Account Executive' },
        ],
      },
      {
        title: 'Access',
        description: 'Invited users can sign in once they accept their invitation; suspended users are blocked.',
        fields: [
          { name: 'roleId', label: 'Role', type: 'select', required: true, options: 'roles', help: 'Determines what this user can see and do.' },
          { name: 'status', label: 'Status', type: 'select', required: true, options: toOptions(USER_STATUSES) },
          { name: 'employeeId', label: 'Linked Employee', type: 'select', options: 'employees', span: 'full', placeholder: 'Not linked', help: 'Optional — connect this login to an employee record.' },
        ],
      },
    ],
  },
})
