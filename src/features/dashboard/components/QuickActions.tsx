import { Card } from 'antd'
import type { LucideIcon } from 'lucide-react'
import { Building2, FileChartColumn, ListPlus, UserPlus, UsersRound } from 'lucide-react'
import { Link } from 'react-router'
import { ROUTES } from '@/constants/routes'
import styles from './QuickActions.module.scss'

interface QuickAction {
  key: string
  label: string
  description: string
  to: string
  icon: LucideIcon
}

const ACTIONS: QuickAction[] = [
  { key: 'employee', label: 'Add Employee', description: 'Create an employee profile', to: ROUTES.employeeNew, icon: UserPlus },
  { key: 'customer', label: 'Add Customer', description: 'Register a new lead or customer', to: ROUTES.customerNew, icon: UsersRound },
  { key: 'task', label: 'Create Task', description: 'Assign work with a due date', to: `${ROUTES.tasks}?create=1`, icon: ListPlus },
  { key: 'department', label: 'Add Department', description: 'Set up a new department', to: `${ROUTES.departments}?create=1`, icon: Building2 },
  { key: 'report', label: 'Generate Report', description: 'Analyze and export your data', to: ROUTES.reports, icon: FileChartColumn },
]

/** Shortcuts to the most common create flows. */
export function QuickActions() {
  return (
    <Card styles={{ body: { padding: 12 } }}>
      <nav aria-label="Quick actions" className={styles.nav}>
        <h2 className={styles.heading}>Quick Actions</h2>
        <ul className={styles.list}>
          {ACTIONS.map(({ key, label, description, to, icon: Icon }) => (
            <li key={key}>
              <Link to={to} className={styles.action} title={description}>
                <span className={styles.icon} aria-hidden="true">
                  <Icon size={16} />
                </span>
                <span className={styles.label}>{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </Card>
  )
}
