import { Button, Divider, Layout, Tooltip } from 'antd'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { memo } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { selectSidebarCollapsed, sidebarToggled } from '@/store/uiSlice'
import { GlobalSearch } from './GlobalSearch'
import { HelpMenu } from './HelpMenu'
import { NotificationsMenu } from './NotificationsMenu'
import { ThemeToggle } from './ThemeToggle'
import { UserMenu } from './UserMenu'
import styles from './AppHeader.module.scss'

/** Top application bar: sidebar toggle, global search, notifications, help, theme and user menu. */
export const AppHeader = memo(function AppHeader() {
  const dispatch = useAppDispatch()
  const collapsed = useAppSelector(selectSidebarCollapsed)
  const toggleLabel = collapsed ? 'Expand sidebar' : 'Collapse sidebar'

  return (
    <Layout.Header className={styles.header}>
      <div className={styles.left}>
        <Tooltip title={toggleLabel} placement="bottomLeft">
          <Button
            type="text"
            aria-label={toggleLabel}
            aria-expanded={!collapsed}
            icon={collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            onClick={() => dispatch(sidebarToggled())}
          />
        </Tooltip>
      </div>

      <div className={styles.center}>
        <GlobalSearch />
      </div>

      <div className={styles.right}>
        <NotificationsMenu />
        <HelpMenu />
        <ThemeToggle />
        <Divider orientation="vertical" className={styles.divider} />
        <UserMenu />
      </div>
    </Layout.Header>
  )
})
