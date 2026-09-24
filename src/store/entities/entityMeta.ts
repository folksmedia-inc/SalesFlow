import type { RelatedEntityType } from '@/types/models'
import type { EntityKey, EntityOf } from './types'

export interface EntityMeta<K extends EntityKey> {
  singular: string
  plural: string
  idPrefix: string
  /** Human-readable name of a record (used in activity logs, search, lookups). */
  getName: (record: EntityOf<K>) => string
  /** Route of the record's detail view, if it has one. */
  getPath?: (id: string) => string
  relatedType?: RelatedEntityType
}

type EntityMetaMap = { [K in EntityKey]: EntityMeta<K> }

const personName = (record: { firstName: string; lastName: string }) => `${record.firstName} ${record.lastName}`

export const ENTITY_META: EntityMetaMap = {
  employees: { singular: 'Employee', plural: 'Employees', idPrefix: 'emp', getName: personName, getPath: (id) => `/employees/${id}`, relatedType: 'employee' },
  departments: { singular: 'Department', plural: 'Departments', idPrefix: 'dep', getName: (r) => r.name, getPath: (id) => `/departments/${id}`, relatedType: 'department' },
  teams: { singular: 'Team', plural: 'Teams', idPrefix: 'team', getName: (r) => r.name, getPath: (id) => `/teams/${id}`, relatedType: 'team' },
  customers: { singular: 'Customer', plural: 'Customers', idPrefix: 'cus', getName: (r) => r.name, getPath: (id) => `/customers/${id}`, relatedType: 'customer' },
  accounts: { singular: 'Account', plural: 'Accounts', idPrefix: 'acc', getName: (r) => r.name, getPath: (id) => `/accounts/${id}`, relatedType: 'account' },
  contacts: { singular: 'Contact', plural: 'Contacts', idPrefix: 'con', getName: personName, getPath: (id) => `/contacts/${id}`, relatedType: 'contact' },
  tasks: { singular: 'Task', plural: 'Tasks', idPrefix: 'tsk', getName: (r) => r.title, getPath: (id) => `/tasks?edit=${id}` },
  activities: { singular: 'Activity', plural: 'Activities', idPrefix: 'act', getName: (r) => r.subject },
  notes: { singular: 'Note', plural: 'Notes', idPrefix: 'not', getName: (r) => r.content.slice(0, 40) },
  documents: { singular: 'Document', plural: 'Documents', idPrefix: 'doc', getName: (r) => r.name, getPath: () => '/documents' },
  users: { singular: 'User', plural: 'Users', idPrefix: 'usr', getName: personName, getPath: () => '/users' },
  roles: { singular: 'Role', plural: 'Roles', idPrefix: 'rol', getName: (r) => r.name, getPath: () => '/settings?section=roles' },
  notifications: { singular: 'Notification', plural: 'Notifications', idPrefix: 'ntf', getName: (r) => r.title },
}

/** Entity collection for a `RelatedRef.type`. */
export const ENTITY_BY_RELATED_TYPE: Record<RelatedEntityType, EntityKey> = {
  employee: 'employees',
  customer: 'customers',
  account: 'accounts',
  contact: 'contacts',
  department: 'departments',
  team: 'teams',
}

export function getEntityMeta<K extends EntityKey>(key: K): EntityMeta<K> {
  return ENTITY_META[key] as EntityMeta<K>
}
