import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  BarChart3,
  Building2,
  Contact,
  FileText,
  Layers,
  LayoutDashboard,
  ListChecks,
  Settings,
  UserCog,
  Users,
  UsersRound,
  Briefcase,
} from 'lucide-react'
import { ROUTES } from './routes'

export interface NavItem {
  path: string
  label: string
  icon: LucideIcon
}

export interface NavSection {
  /** Section heading; `null` renders the items without a heading. */
  title: string | null
  items: NavItem[]
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: null,
    items: [{ path: ROUTES.dashboard, label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    title: 'Workforce',
    items: [
      { path: ROUTES.employees, label: 'Employees', icon: Users },
      { path: ROUTES.users, label: 'Users', icon: UserCog },
      { path: ROUTES.teams, label: 'Teams', icon: UsersRound },
      { path: ROUTES.departments, label: 'Departments', icon: Layers },
    ],
  },
  {
    title: 'CRM',
    items: [
      { path: ROUTES.customers, label: 'Customers', icon: Briefcase },
      { path: ROUTES.accounts, label: 'Accounts', icon: Building2 },
      { path: ROUTES.contacts, label: 'Contacts', icon: Contact },
    ],
  },
  {
    title: 'Productivity',
    items: [
      { path: ROUTES.tasks, label: 'Tasks', icon: ListChecks },
      { path: ROUTES.activities, label: 'Activities', icon: Activity },
    ],
  },
  {
    title: 'Insights',
    items: [
      { path: ROUTES.reports, label: 'Reports', icon: BarChart3 },
      { path: ROUTES.documents, label: 'Documents', icon: FileText },
    ],
  },
  {
    title: 'Administration',
    items: [{ path: ROUTES.settings, label: 'Settings', icon: Settings }],
  },
]

/**
 * Resolves the navigation key that should be highlighted for a pathname,
 * e.g. `/employees/EMP-1/edit` → `/employees`.
 */
export function getActiveNavPath(pathname: string): string | undefined {
  const firstSegment = `/${pathname.split('/').filter(Boolean)[0] ?? ''}`
  return NAV_SECTIONS.flatMap((section) => section.items).find((item) => item.path === firstSegment)
    ?.path
}
