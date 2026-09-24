import { Layout, Menu, type MenuProps } from 'antd'
import { memo, useMemo, useRef } from 'react'
import { Link, useLocation } from 'react-router'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { BrandLogo } from '@/components/common/BrandLogo'
import { getActiveNavPath, NAV_SECTIONS } from '@/constants/navigation'
import { ROUTES } from '@/constants/routes'
import { selectSidebarCollapsed, sidebarCollapsedSet } from '@/store/uiSlice'
import styles from './Sidebar.module.scss'

export const SIDEBAR_WIDTH = 248
export const SIDEBAR_COLLAPSED_WIDTH = 72

type MenuItem = Required<MenuProps>['items'][number]

function buildMenuItems(collapsed: boolean): MenuItem[] {
  return NAV_SECTIONS.flatMap((section, sectionIndex): MenuItem[] => {
    const items: MenuItem[] = section.items.map(({ path, label, icon: Icon }) => ({
      key: path,
      icon: <Icon size={18} aria-hidden="true" />,
      label: <Link to={path}>{label}</Link>,
      title: label,
    }))

    // Collapsed: headings can't be shown, so separate sections with dividers instead.
    if (collapsed || !section.title) {
      return sectionIndex > 0 && collapsed
        ? [{ type: 'divider', key: `divider-${sectionIndex}` }, ...items]
        : items
    }
    return [{ type: 'group', key: `group-${section.title}`, label: section.title, children: items }]
  })
}

/**
 * Primary navigation. Collapses to icons (with tooltips) on demand and
 * automatically below the `lg` breakpoint (tablets).
 */
export const Sidebar = memo(function Sidebar() {
  const dispatch = useAppDispatch()
  const collapsed = useAppSelector(selectSidebarCollapsed)
  const { pathname } = useLocation()
  const lastBreakpointState = useRef<boolean | null>(null)

  const menuItems = useMemo(() => buildMenuItems(collapsed), [collapsed])
  const activeKey = getActiveNavPath(pathname)

  // antd reports the breakpoint on mount too; only react to real crossings so
  // a persisted desktop preference isn't overridden on load.
  const handleBreakpoint = (isBelowBreakpoint: boolean) => {
    const previous = lastBreakpointState.current
    lastBreakpointState.current = isBelowBreakpoint
    if (previous === null && !isBelowBreakpoint) return
    if (previous !== isBelowBreakpoint) dispatch(sidebarCollapsedSet(isBelowBreakpoint))
  }

  return (
    <Layout.Sider
      className={styles.sider}
      width={SIDEBAR_WIDTH}
      collapsedWidth={SIDEBAR_COLLAPSED_WIDTH}
      collapsible
      collapsed={collapsed}
      trigger={null}
      breakpoint="lg"
      onBreakpoint={handleBreakpoint}
    >
      <div className={styles.brand}>
        <Link to={ROUTES.dashboard} className={styles.brandLink}>
          <BrandLogo compact={collapsed} />
        </Link>
      </div>
      <nav aria-label="Main navigation" className={styles.nav}>
        <Menu
          theme="dark"
          mode="inline"
          items={menuItems}
          selectedKeys={activeKey ? [activeKey] : []}
          inlineIndent={16}
        />
      </nav>
    </Layout.Sider>
  )
})
