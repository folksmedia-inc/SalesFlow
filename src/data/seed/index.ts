/**
 * Seed data for the Redux store. Only store slices import this module —
 * UI code reads data through selectors and hooks, never directly.
 */
import { createSeedAccounts } from './mockAccounts'
import { createSeedActivities } from './mockActivities'
import { createSeedContacts } from './mockContacts'
import { createSeedCustomers } from './mockCustomers'
import { createSeedDepartments } from './mockDepartments'
import { createSeedDocuments } from './mockDocuments'
import { createSeedEmployees, EMPLOYEE_IDS } from './mockEmployees'
import { createSeedNotes } from './mockNotes'
import { createSeedNotifications } from './mockNotifications'
import { createSeedOrganization } from './mockOrganization'
import { createSeedRoles } from './mockRoles'
import { createSeedTasks } from './mockTasks'
import { createSeedTeams } from './mockTeams'
import { createSeedUsers } from './mockUsers'

export { DEMO_PASSWORD } from './mockUsers'

export const seed = {
  employees: createSeedEmployees,
  departments: () => createSeedDepartments(EMPLOYEE_IDS),
  teams: createSeedTeams,
  customers: createSeedCustomers,
  accounts: createSeedAccounts,
  contacts: createSeedContacts,
  tasks: createSeedTasks,
  activities: createSeedActivities,
  notes: createSeedNotes,
  documents: createSeedDocuments,
  users: createSeedUsers,
  roles: createSeedRoles,
  notifications: createSeedNotifications,
  organization: createSeedOrganization,
}
