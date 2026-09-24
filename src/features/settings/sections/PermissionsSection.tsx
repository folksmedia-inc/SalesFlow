import { Alert, App, Button, Card, Dropdown, Select, Tag } from 'antd'
import { ChevronDown, Lock, RotateCcw, Save } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useBlocker } from 'react-router'
import { useAppSelector } from '@/app/hooks'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useEntityCrud, useEntityList } from '@/hooks/useEntityData'
import { selectCurrentUser } from '@/store/authSlice'
import { PERMISSION_ACTIONS, PERMISSION_MODULES, type PermissionMatrix } from '@/types/models'
import { pluralize } from '@/utils/format'
import { PermissionMatrixTable } from '../components/PermissionMatrixTable'
import { RoleComparisonTable } from '../components/RoleComparisonTable'
import { FormFooter, SettingsSection } from '../components/SettingsSection'
import { useRoleUsage } from '../hooks/useRoleUsage'
import { countGranted, diffPermissions, emptyPermissionMatrix, toggleAction, toggleModule, togglePermission, TOTAL_PERMISSIONS } from '../utils/permissions'
import styles from './PermissionsSection.module.scss'

const PRESETS: { key: string; label: string; build: () => PermissionMatrix }[] = [
  { key: 'view', label: 'View only (all modules)', build: () => Object.fromEntries(PERMISSION_MODULES.map((module) => [module, ['View']])) as unknown as PermissionMatrix },
  { key: 'full', label: 'Full access (all modules)', build: () => Object.fromEntries(PERMISSION_MODULES.map((module) => [module, [...PERMISSION_ACTIONS]])) as unknown as PermissionMatrix },
  { key: 'none', label: 'No access', build: emptyPermissionMatrix },
]

interface PermissionsSectionProps {
  roleId: string | null
  onRoleChange: (roleId: string) => void
}

/**
 * Permission matrix editor. Edits are staged locally and saved together;
 * leaving the section (or switching roles) with unsaved edits asks first.
 */
export function PermissionsSection({ roleId, onRoleChange }: PermissionsSectionProps) {
  const { message, modal } = App.useApp()
  const roles = useEntityList('roles')
  const crud = useEntityCrud('roles')
  const usageOf = useRoleUsage()
  const currentUser = useAppSelector(selectCurrentUser)
  const role = roles.find((candidate) => candidate.id === roleId) ?? roles[0]

  const [draft, setDraft] = useState<{ roleId: string; matrix: PermissionMatrix } | null>(null)
  const matrix = role && draft?.roleId === role.id ? draft.matrix : role?.permissions
  const changed = useMemo(() => (role && matrix ? diffPermissions(role.permissions, matrix) : new Set<string>()), [role, matrix])
  const dirty = changed.size > 0

  // Guard navigation (other sections, other roles, other pages) while edits are unsaved.
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => dirty && (currentLocation.pathname !== nextLocation.pathname || currentLocation.search !== nextLocation.search),
  )
  const promptOpen = useRef(false)
  useEffect(() => {
    if (blocker.state !== 'blocked' || promptOpen.current) return
    promptOpen.current = true
    modal.confirm({
      title: 'Discard unsaved permission changes?',
      content: `You have ${pluralize(changed.size, 'unsaved change')} to ${role?.name ?? 'this role'}.`,
      okText: 'Discard changes',
      okButtonProps: { danger: true },
      cancelText: 'Keep editing',
      focusable: { autoFocusButton: 'cancel' },
      onOk: () => {
        promptOpen.current = false
        setDraft(null)
        blocker.proceed()
      },
      onCancel: () => {
        promptOpen.current = false
        blocker.reset()
      },
    })
  }, [blocker, modal, changed.size, role?.name])

  if (!role || !matrix) {
    return (
      <SettingsSection title="Permissions" description="Control what each role can do in every module.">
        <Card>
          <EmptyState title="No roles yet" description="Create a role first, then configure its permissions." />
        </Card>
      </SettingsSection>
    )
  }

  const edit = (next: PermissionMatrix) => setDraft({ roleId: role.id, matrix: next })
  const save = () => {
    crud.update(role.id, { permissions: matrix })
    setDraft(null)
    message.success(`Permissions for ${role.name} saved.`)
  }
  const discard = () => {
    setDraft(null)
    message.info('Changes discarded.')
  }

  const usage = usageOf(role.id)
  const granted = countGranted(matrix)
  const isOwnRole = currentUser?.roleId === role.id

  return (
    <SettingsSection title="Permissions" description="Control what each role can do in every module. Create, Edit, Delete and Export always include View.">
      <Card>
        <div className={styles.toolbar}>
          <div className={styles.rolePicker}>
            <label htmlFor="permissions-role" className={styles.pickerLabel}>
              Role
            </label>
            <Select
              id="permissions-role"
              value={role.id}
              onChange={onRoleChange}
              options={roles.map((option) => ({ value: option.id, label: option.name }))}
              showSearch={{ optionFilterProp: 'label' }}
              className={styles.select}
            />
          </div>
          <div className={styles.meta}>
            {role.isSystem ? (
              <Tag variant="filled" icon={<Lock size={11} aria-hidden="true" style={{ marginInlineEnd: 4, verticalAlign: -1 }} />}>
                System role
              </Tag>
            ) : (
              <Tag variant="filled" color="purple">
                Custom role
              </Tag>
            )}
            <span>{pluralize(usage.users, 'user')}</span>
            <span className={styles.sep} aria-hidden="true">
              ·
            </span>
            <span>{pluralize(usage.employees, 'employee')}</span>
            <span className={styles.sep} aria-hidden="true">
              ·
            </span>
            <span>
              {granted} of {TOTAL_PERMISSIONS} permissions
            </span>
          </div>
          <Dropdown
            trigger={['click']}
            menu={{ items: PRESETS.map((preset) => ({ key: preset.key, label: preset.label })), onClick: ({ key }) => edit(PRESETS.find((preset) => preset.key === key)?.build() ?? matrix) }}
          >
            <Button className={styles.presets}>
              Quick set <ChevronDown size={14} aria-hidden="true" />
            </Button>
          </Dropdown>
        </div>

        {role.description && <p className={styles.description}>{role.description}</p>}

        {isOwnRole && (
          <Alert
            type="warning"
            showIcon
            title="This is your own role"
            description="Removing access here also affects your account, including access to Settings."
            className={styles.alert}
          />
        )}

        <PermissionMatrixTable
          permissions={matrix}
          changedCells={changed}
          onToggle={(module, action, isGranted) => edit(togglePermission(matrix, module, action, isGranted))}
          onToggleModule={(module, isGranted) => edit(toggleModule(matrix, module, isGranted))}
          onToggleAction={(action, isGranted) => edit(toggleAction(matrix, action, isGranted))}
        />

        <FormFooter dirty={dirty} dirtyLabel={`${pluralize(changed.size, 'unsaved change')}`}>
          <Button icon={<RotateCcw size={15} />} onClick={discard} disabled={!dirty}>
            Discard
          </Button>
          <Button type="primary" icon={<Save size={15} />} onClick={save} disabled={!dirty}>
            Save Permissions
          </Button>
        </FormFooter>
      </Card>

      <Card title="Compare Roles" extra={<span className={styles.hint}>Saved permissions</span>} styles={{ body: { padding: '0 0 16px' } }}>
        <RoleComparisonTable roles={roles} activeRoleId={role.id} />
      </Card>
    </SettingsSection>
  )
}
