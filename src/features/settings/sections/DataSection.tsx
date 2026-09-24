import { App, Button, Card } from 'antd'
import dayjs from 'dayjs'
import { Database, Download, RotateCcw } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { useEntityList } from '@/hooks/useEntityData'
import { demoDataReset } from '@/store/entities/actions'
import { selectOrganization } from '@/store/organizationSlice'
import { downloadBlob } from '@/utils/csv'
import { formatNumber, pluralize } from '@/utils/format'
import { SettingsSection } from '../components/SettingsSection'
import styles from './DataSection.module.scss'

/** Every collection in the store, read through the data hooks. */
function useAllCollections() {
  return {
    employees: useEntityList('employees'),
    departments: useEntityList('departments'),
    teams: useEntityList('teams'),
    customers: useEntityList('customers'),
    accounts: useEntityList('accounts'),
    contacts: useEntityList('contacts'),
    tasks: useEntityList('tasks'),
    activities: useEntityList('activities'),
    notes: useEntityList('notes'),
    documents: useEntityList('documents'),
    users: useEntityList('users'),
    roles: useEntityList('roles'),
    notifications: useEntityList('notifications'),
  }
}

const LABELS: Record<keyof ReturnType<typeof useAllCollections>, string> = {
  employees: 'Employees',
  departments: 'Departments',
  teams: 'Teams',
  customers: 'Customers',
  accounts: 'Accounts',
  contacts: 'Contacts',
  tasks: 'Tasks',
  activities: 'Activities',
  notes: 'Notes',
  documents: 'Documents',
  users: 'Users',
  roles: 'Roles',
  notifications: 'Notifications',
}

export function DataSection() {
  const dispatch = useAppDispatch()
  const { message, modal } = App.useApp()
  const collections = useAllCollections()
  const organization = useAppSelector(selectOrganization)
  const entries = Object.entries(collections) as [keyof typeof collections, unknown[]][]
  const totalRecords = entries.reduce((sum, [, records]) => sum + records.length, 0)

  const exportJson = () => {
    const snapshot = { exportedAt: new Date().toISOString(), organization, collections }
    downloadBlob(new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' }), `admin-hub-export-${dayjs().format('YYYY-MM-DD')}.json`)
    message.success(`Exported ${pluralize(totalRecords, 'record')} from ${entries.length} collections.`)
  }

  const resetDemoData = () =>
    modal.confirm({
      title: 'Reset all demo data?',
      content:
        'Every collection and the organization profile will be restored to the original sample data. Records you created, edited or deleted will be lost. Your theme and layout preferences are kept.',
      okText: 'Reset demo data',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      focusable: { autoFocusButton: 'cancel' },
      onOk: () => {
        dispatch(demoDataReset())
        message.success('Demo data has been reset.')
      },
    })

  return (
    <SettingsSection title="Data" description="Back up your workspace or start over with fresh sample data.">
      <Card
        title="Export Data"
        extra={
          <Button type="primary" icon={<Download size={16} />} onClick={exportJson}>
            Export all data (JSON)
          </Button>
        }
      >
        <p className={styles.lead}>
          Download a JSON snapshot of the organization profile and all {entries.length} collections ({formatNumber(totalRecords)} records). Useful for backups or migrating to
          another system.
        </p>
        <ul className={styles.stats} aria-label="Records per collection">
          {entries.map(([key, records]) => (
            <li key={key}>
              <span className={styles.statValue}>{formatNumber(records.length)}</span>
              <span className={styles.statLabel}>{LABELS[key]}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Danger Zone" className={styles.danger}>
        <div className={styles.dangerRow}>
          <span className={styles.dangerIcon} aria-hidden="true">
            <Database size={20} />
          </span>
          <div className={styles.dangerText}>
            <span className={styles.dangerTitle}>Reset demo data</span>
            <span className={styles.dangerDescription}>Restore every collection to the original sample data. This can't be undone — export first if you want a copy.</span>
          </div>
          <Button danger icon={<RotateCcw size={16} />} onClick={resetDemoData}>
            Reset demo data
          </Button>
        </div>
      </Card>
    </SettingsSection>
  )
}
