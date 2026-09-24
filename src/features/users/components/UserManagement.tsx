import { useMemo, type ReactNode } from 'react'
import { EntityListPage } from '@/components/entity/EntityListPage'
import { useEntityList } from '@/hooks/useEntityData'
import type { UserFormValues } from '../config/userConfig'
import { useUserListConfig } from '../hooks/useUserListConfig'
import styles from './UserManagement.module.scss'

interface UserManagementProps {
  /** Compact heading for use inside another page (e.g. Settings → Users). */
  embedded?: boolean
  headerActions?: ReactNode
}

/**
 * Full user management (search, filters, bulk actions, invite/edit drawer)
 * with the signed-in user protected from deleting or suspending themselves
 * (via the config's delete / status-toggle / bulk-action blockers).
 * Rendered by the Users page and embedded in Settings.
 */
export function UserManagement({ embedded = false, headerActions }: UserManagementProps) {
  const config = useUserListConfig()
  const roles = useEntityList('roles')

  // New users start as invitations with the least-privileged standard role.
  const createDefaults = useMemo<Partial<UserFormValues>>(() => {
    const standardRole = roles.find((role) => role.name === 'Employee')
    return { status: 'Invited', roleId: standardRole?.id ?? '' }
  }, [roles])

  return (
    <div className={embedded ? styles.embedded : undefined}>
      <EntityListPage config={config} createDefaults={createDefaults} headerActions={headerActions} />
    </div>
  )
}
