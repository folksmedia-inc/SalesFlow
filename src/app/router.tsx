import type { ComponentType } from 'react'
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router'
import { FullPageLoader } from '@/components/feedback/FullPageLoader'
import { RouteErrorBoundary } from '@/components/feedback/RouteErrorBoundary'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/routing/ProtectedRoute'
import { PublicOnlyRoute } from '@/components/routing/PublicOnlyRoute'
import { RootLayout } from '@/components/routing/RootLayout'
import { ROUTES } from '@/constants/routes'
import type { RouteHandle } from '@/types/router'

type PageLoader = () => Promise<{ default: ComponentType }>

/** Code-splits a page: the module is fetched when the route is first visited. */
function lazyPage(loader: PageLoader) {
  return async () => ({ Component: (await loader()).default })
}

function handle(meta: RouteHandle): RouteHandle {
  return meta
}

interface EntityRouteOptions {
  path: string
  plural: string
  singular: string
  description?: string
  list: PageLoader
  details?: PageLoader
  /** Create/edit page (entities whose forms are full pages rather than drawers). */
  form?: PageLoader
}

/** List, details and (optionally) create/edit routes for an entity. */
function entityRoutes({ path, plural, singular, description, list, details, form }: EntityRouteOptions): RouteObject {
  const children: RouteObject[] = [{ index: true, lazy: lazyPage(list) }]
  if (form) children.push({ path: 'new', handle: handle({ title: `New ${singular}`, crumb: 'New' }), lazy: lazyPage(form) })
  if (details) {
    children.push({
      path: ':id',
      handle: handle({ title: `${singular} Details`, crumb: 'Details' }),
      children: [
        { index: true, lazy: lazyPage(details) },
        ...(form ? [{ path: 'edit', handle: handle({ title: `Edit ${singular}`, crumb: 'Edit' }), lazy: lazyPage(form) }] : []),
      ],
    })
  }
  return { path, handle: handle({ title: plural, crumb: plural, description }), children }
}

function pageRoute(path: string, title: string, loader: PageLoader, description?: string): RouteObject {
  return { path, handle: handle({ title, crumb: title, description }), lazy: lazyPage(loader) }
}

const appRoutes: RouteObject[] = [
  { index: true, element: <Navigate to={ROUTES.dashboard} replace /> },
  pageRoute('dashboard', 'Dashboard', () => import('@/features/dashboard/pages/DashboardPage')),
  entityRoutes({
    path: 'employees',
    plural: 'Employees',
    singular: 'Employee',
    list: () => import('@/features/employees/pages/EmployeeListPage'),
    details: () => import('@/features/employees/pages/EmployeeDetailsPage'),
    form: () => import('@/features/employees/pages/EmployeeFormPage'),
  }),
  entityRoutes({
    path: 'customers',
    plural: 'Customers',
    singular: 'Customer',
    list: () => import('@/features/customers/pages/CustomerListPage'),
    details: () => import('@/features/customers/pages/CustomerDetailsPage'),
    form: () => import('@/features/customers/pages/CustomerFormPage'),
  }),
  entityRoutes({
    path: 'accounts',
    plural: 'Accounts',
    singular: 'Account',
    list: () => import('@/features/accounts/pages/AccountListPage'),
    details: () => import('@/features/accounts/pages/AccountDetailsPage'),
  }),
  entityRoutes({
    path: 'contacts',
    plural: 'Contacts',
    singular: 'Contact',
    list: () => import('@/features/contacts/pages/ContactListPage'),
    details: () => import('@/features/contacts/pages/ContactDetailsPage'),
  }),
  entityRoutes({
    path: 'departments',
    plural: 'Departments',
    singular: 'Department',
    list: () => import('@/features/departments/pages/DepartmentListPage'),
    details: () => import('@/features/departments/pages/DepartmentDetailsPage'),
  }),
  entityRoutes({
    path: 'teams',
    plural: 'Teams',
    singular: 'Team',
    list: () => import('@/features/teams/pages/TeamListPage'),
    details: () => import('@/features/teams/pages/TeamDetailsPage'),
  }),
  pageRoute('users', 'Users', () => import('@/features/users/pages/UsersPage')),
  pageRoute('tasks', 'Tasks', () => import('@/features/tasks/pages/TasksPage')),
  pageRoute('activities', 'Activities', () => import('@/features/activities/pages/ActivitiesPage')),
  pageRoute('reports', 'Reports', () => import('@/features/reports/pages/ReportsPage')),
  pageRoute('documents', 'Documents', () => import('@/features/documents/pages/DocumentsPage')),
  pageRoute('settings', 'Settings', () => import('@/features/settings/pages/SettingsPage')),
  { path: '*', handle: handle({ title: 'Page not found' }), lazy: lazyPage(() => import('@/pages/NotFoundPage')) },
]

export const router = createBrowserRouter([
  {
    Component: RootLayout,
    HydrateFallback: FullPageLoader,
    ErrorBoundary: RouteErrorBoundary,
    children: [
      {
        Component: PublicOnlyRoute,
        children: [{ path: ROUTES.login, handle: handle({ title: 'Sign in' }), lazy: lazyPage(() => import('@/features/auth/pages/LoginPage')) }],
      },
      {
        path: '/',
        Component: ProtectedRoute,
        children: [
          {
            Component: AppLayout,
            // Page-level errors render inside the shell so navigation stays usable.
            children: [{ ErrorBoundary: RouteErrorBoundary, children: appRoutes }],
          },
        ],
      },
    ],
  },
])
