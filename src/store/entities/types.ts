import type {
  Account,
  Activity,
  AppNotification,
  Contact,
  Customer,
  Department,
  DocumentFile,
  Employee,
  Note,
  Role,
  Task,
  Team,
  User,
} from '@/types/models'

/** Maps each store collection to its record type. */
export interface EntityRecordMap {
  employees: Employee
  departments: Department
  teams: Team
  customers: Customer
  accounts: Account
  contacts: Contact
  tasks: Task
  activities: Activity
  notes: Note
  documents: DocumentFile
  users: User
  roles: Role
  notifications: AppNotification
}

export type EntityKey = keyof EntityRecordMap

export type EntityOf<K extends EntityKey> = EntityRecordMap[K]

/** Fields the store manages itself; callers never supply them on create. */
export type SystemFields = 'id' | 'createdAt' | 'updatedAt'

export type NewEntity<K extends EntityKey> = Omit<EntityOf<K>, SystemFields>

export const ENTITY_KEYS = [
  'employees',
  'departments',
  'teams',
  'customers',
  'accounts',
  'contacts',
  'tasks',
  'activities',
  'notes',
  'documents',
  'users',
  'roles',
  'notifications',
] as const satisfies readonly EntityKey[]
