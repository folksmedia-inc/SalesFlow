/** Central route path definitions. Use these instead of string literals. */
export const ROUTES = {
  login: '/login',
  dashboard: '/dashboard',

  employees: '/employees',
  employeeNew: '/employees/new',
  employeeDetails: (id: string) => `/employees/${id}`,
  employeeEdit: (id: string) => `/employees/${id}/edit`,

  customers: '/customers',
  customerNew: '/customers/new',
  customerDetails: (id: string) => `/customers/${id}`,
  customerEdit: (id: string) => `/customers/${id}/edit`,

  users: '/users',
  accounts: '/accounts',
  contacts: '/contacts',
  departments: '/departments',
  teams: '/teams',
  tasks: '/tasks',
  activities: '/activities',
  reports: '/reports',
  documents: '/documents',
  settings: '/settings',
} as const
