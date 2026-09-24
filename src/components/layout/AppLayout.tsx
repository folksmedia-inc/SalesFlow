import { Layout } from 'antd'
import { Outlet, useNavigation } from 'react-router'
import { AppHeader } from './AppHeader'
import { Sidebar } from './Sidebar'
import styles from './AppLayout.module.scss'

/** Authenticated application shell: sidebar, header and routed page content. */
export function AppLayout() {
  const navigation = useNavigation()
  const isNavigating = navigation.state === 'loading'

  return (
    <Layout className={styles.shell}>
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>
      <Sidebar />
      <Layout className={styles.main}>
        <AppHeader />
        {isNavigating && <div className={styles.progress} role="progressbar" aria-label="Loading page" />}
        <Layout.Content id="main-content" tabIndex={-1} className={styles.content}>
          <div className={styles.inner}>
            <Outlet />
          </div>
        </Layout.Content>
      </Layout>
    </Layout>
  )
}
