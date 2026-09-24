import type { BaseRecord, EntityId, ISODateString } from './common'

/* ------------------------------------------------------------------ */
/* Enumerations (as const arrays so they double as select options)     */
/* ------------------------------------------------------------------ */

export const EMPLOYEE_STATUSES = ['Active', 'Inactive', 'On Leave'] as const
export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number]

export const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Intern'] as const
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number]

export const GENDERS = ['Female', 'Male', 'Non-binary', 'Prefer not to say'] as const
export type Gender = (typeof GENDERS)[number]

export const RECORD_STATUSES = ['Active', 'Inactive'] as const
export type RecordStatus = (typeof RECORD_STATUSES)[number]

export const CUSTOMER_STATUSES = ['Lead', 'Prospect', 'Active', 'Churned'] as const
export type CustomerStatus = (typeof CUSTOMER_STATUSES)[number]

export const ACCOUNT_STATUSES = ['Prospect', 'Active', 'Inactive'] as const
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number]

export const INDUSTRIES = [
  'Technology',
  'Finance',
  'Healthcare',
  'Retail',
  'Manufacturing',
  'Education',
  'Energy',
  'Media',
  'Logistics',
  'Hospitality',
] as const
export type Industry = (typeof INDUSTRIES)[number]

export const TASK_STATUSES = ['Not Started', 'In Progress', 'Completed', 'Cancelled'] as const
export type TaskStatus = (typeof TASK_STATUSES)[number]

export const TASK_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'] as const
export type TaskPriority = (typeof TASK_PRIORITIES)[number]

export const ACTIVITY_TYPES = ['Call', 'Email', 'Meeting', 'Note', 'Task', 'Update'] as const
export type ActivityType = (typeof ACTIVITY_TYPES)[number]

export const USER_STATUSES = ['Active', 'Invited', 'Suspended'] as const
export type UserStatus = (typeof USER_STATUSES)[number]

export const PERMISSION_MODULES = [
  'Employees',
  'Customers',
  'Accounts',
  'Contacts',
  'Tasks',
  'Reports',
  'Settings',
] as const
export type PermissionModule = (typeof PERMISSION_MODULES)[number]

export const PERMISSION_ACTIONS = ['View', 'Create', 'Edit', 'Delete', 'Export'] as const
export type PermissionAction = (typeof PERMISSION_ACTIONS)[number]

export const LOCATIONS = [
  'San Francisco, CA',
  'New York, NY',
  'Austin, TX',
  'Chicago, IL',
  'Seattle, WA',
  'London, UK',
  'Toronto, CA',
  'Remote',
] as const

/* ------------------------------------------------------------------ */
/* Cross-entity references                                              */
/* ------------------------------------------------------------------ */

export const RELATED_ENTITY_TYPES = [
  'employee',
  'customer',
  'account',
  'contact',
  'department',
  'team',
] as const
export type RelatedEntityType = (typeof RELATED_ENTITY_TYPES)[number]

/** Polymorphic link from tasks, activities, notes and documents to a record. */
export interface RelatedRef {
  type: RelatedEntityType
  id: EntityId
}

/* ------------------------------------------------------------------ */
/* Entities                                                             */
/* ------------------------------------------------------------------ */

export interface Employee extends BaseRecord {
  employeeId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: ISODateString | null
  gender: Gender | null
  jobTitle: string
  departmentId: EntityId | null
  managerId: EntityId | null
  employmentType: EmploymentType
  joiningDate: ISODateString
  location: string
  status: EmployeeStatus
  roleId: EntityId | null
  address: string
  city: string
  state: string
  country: string
  postalCode: string
}

export interface Department extends BaseRecord {
  name: string
  code: string
  headId: EntityId | null
  location: string
  status: RecordStatus
  description: string
  budget: number
}

export interface Team extends BaseRecord {
  name: string
  leadId: EntityId | null
  departmentId: EntityId | null
  memberIds: EntityId[]
  status: RecordStatus
  description: string
}

export interface Customer extends BaseRecord {
  name: string
  company: string
  email: string
  phone: string
  industry: Industry
  ownerId: EntityId | null
  accountId: EntityId | null
  status: CustomerStatus
  website: string
  city: string
  country: string
  lifetimeValue: number
}

export interface Account extends BaseRecord {
  name: string
  industry: Industry
  website: string
  phone: string
  ownerId: EntityId | null
  employeeCount: number
  annualRevenue: number
  status: AccountStatus
  city: string
  country: string
}

export interface Contact extends BaseRecord {
  firstName: string
  lastName: string
  email: string
  phone: string
  accountId: EntityId | null
  customerId: EntityId | null
  jobTitle: string
  ownerId: EntityId | null
  status: RecordStatus
}

export interface Task extends BaseRecord {
  title: string
  description: string
  assigneeId: EntityId | null
  priority: TaskPriority
  dueDate: ISODateString | null
  status: TaskStatus
  related: RelatedRef | null
}

export interface Activity extends BaseRecord {
  type: ActivityType
  subject: string
  description: string
  /** Display name of whoever performed the activity. */
  performedBy: string
  related: RelatedRef | null
  occurredAt: ISODateString
}

export interface Note extends BaseRecord {
  content: string
  authorName: string
  related: RelatedRef
}

export interface DocumentFile extends BaseRecord {
  name: string
  mimeType: string
  size: number
  uploadedBy: string
  related: RelatedRef | null
  /** Data URL for files uploaded in the browser (enables preview/download). */
  dataUrl: string | null
}

export interface User extends BaseRecord {
  firstName: string
  lastName: string
  email: string
  roleId: EntityId
  status: UserStatus
  title: string
  employeeId: EntityId | null
  lastLoginAt: ISODateString | null
}

export type PermissionMatrix = Record<PermissionModule, PermissionAction[]>

export interface Role extends BaseRecord {
  name: string
  description: string
  isSystem: boolean
  permissions: PermissionMatrix
}

export interface AppNotification extends BaseRecord {
  title: string
  description: string
  type: 'info' | 'success' | 'warning' | 'task'
  read: boolean
  link: string | null
}

export interface Organization {
  name: string
  legalName: string
  industry: Industry
  timezone: string
  website: string
  phone: string
  email: string
  address: string
  city: string
  state: string
  country: string
  postalCode: string
  fiscalYearStart: string
}
