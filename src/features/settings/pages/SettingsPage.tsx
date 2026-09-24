import { Card, Grid, Menu, type MenuProps } from 'antd'
import { Building2, Database, KeyRound, Lock, ShieldCheck, SlidersHorizontal, UserRound, Users, type LucideIcon } from 'lucide-react'
import { useCallback, type ReactNode } from 'react'
import { useSearchParams } from 'react-router'
import { PageHeader } from '@/components/common/PageHeader'
import { AccountSection } from '../sections/AccountSection'
import { DataSection } from '../sections/DataSection'
import { OrganizationSection } from '../sections/OrganizationSection'
import { PermissionsSection } from '../sections/PermissionsSection'
import { PreferencesSection } from '../sections/PreferencesSection'
import { ProfileSection } from '../sections/ProfileSection'
import { RolesSection } from '../sections/RolesSection'
import { UsersSection } from '../sections/UsersSection'
import styles from './SettingsPage.module.scss'

const SECTION_KEYS = ['profile', 'account', 'preferences', 'organization', 'users', 'roles', 'permissions', 'data'] as const
type SectionKey = (typeof SECTION_KEYS)[number]

interface SectionMeta {
  key: SectionKey
  label: string
  /** Label for the compact horizontal nav on tablets. */
  shortLabel?: string
  icon: LucideIcon
  group: 'Personal' | 'Administration'
}

const SECTIONS: SectionMeta[] = [
  { key: 'profile', label: 'My Profile', icon: UserRound, group: 'Personal' },
  { key: 'account', label: 'Account Settings', shortLabel: 'Account', icon: Lock, group: 'Personal' },
  { key: 'preferences', label: 'Preferences', icon: SlidersHorizontal, group: 'Personal' },
  { key: 'organization', label: 'Organization', icon: Building2, group: 'Administration' },
  { key: 'users', label: 'Users', icon: Users, group: 'Administration' },
  { key: 'roles', label: 'Roles', icon: ShieldCheck, group: 'Administration' },
  { key: 'permissions', label: 'Permissions', icon: KeyRound, group: 'Administration' },
  { key: 'data', label: 'Data', icon: Database, group: 'Administration' },
]

const isSectionKey = (value: string | null): value is SectionKey => SECTION_KEYS.includes(value as SectionKey)

function menuItems(grouped: boolean): MenuProps['items'] {
  const item = ({ key, label, icon: Icon }: SectionMeta) => ({ key, label, icon: <Icon size={16} aria-hidden="true" /> })
  // Compact strip: text only, so every section fits without an overflow menu.
  if (!grouped) return SECTIONS.map(({ key, label, shortLabel }) => ({ key, label: shortLabel ?? label }))
  return (['Personal', 'Administration'] as const).map((group) => ({
    type: 'group' as const,
    key: group,
    label: group,
    children: SECTIONS.filter((section) => section.group === group).map(item),
  }))
}

const VERTICAL_ITEMS = menuItems(true)
const HORIZONTAL_ITEMS = menuItems(false)

/**
 * Settings hub. The active section lives in `?section=` so the header's
 * profile menu and other pages can deep-link (e.g. `?section=roles`).
 */
export default function SettingsPage() {
  const [params, setParams] = useSearchParams()
  const screens = Grid.useBreakpoint()
  const requested = params.get('section')
  const section: SectionKey = isSectionKey(requested) ? requested : 'profile'

  // Switching sections drops section-specific params (list filters, drawers…).
  const goTo = useCallback((key: SectionKey, extra?: Record<string, string>) => setParams({ section: key, ...extra }), [setParams])

  const content: Record<SectionKey, () => ReactNode> = {
    profile: () => <ProfileSection />,
    account: () => <AccountSection />,
    preferences: () => <PreferencesSection />,
    organization: () => <OrganizationSection />,
    users: () => <UsersSection />,
    roles: () => <RolesSection onOpenPermissions={(roleId) => goTo('permissions', { role: roleId })} />,
    permissions: () => <PermissionsSection roleId={params.get('role')} onRoleChange={(roleId) => goTo('permissions', { role: roleId })} />,
    data: () => <DataSection />,
  }

  // Wide screens get a vertical nav; tablets get a horizontal strip above the content.
  const vertical = screens.lg !== false

  return (
    <>
      <PageHeader title="Settings" subtitle="Manage your profile, preferences and how your organization uses the Admin Hub." />
      <div className={vertical ? styles.layout : styles.stacked}>
        <nav aria-label="Settings sections" className={vertical ? styles.nav : styles.navHorizontal}>
          <Card styles={{ body: { padding: vertical ? 8 : '0 8px' } }}>
            <Menu
              mode={vertical ? 'inline' : 'horizontal'}
              items={vertical ? VERTICAL_ITEMS : HORIZONTAL_ITEMS}
              selectedKeys={[section]}
              onClick={({ key }) => goTo(key as SectionKey)}
              disabledOverflow={!vertical}
              className={styles.menu}
            />
          </Card>
        </nav>
        <div className={styles.content}>{content[section]()}</div>
      </div>
    </>
  )
}
