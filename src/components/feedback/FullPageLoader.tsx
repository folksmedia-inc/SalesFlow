import { Spin } from 'antd'
import styles from './FullPageLoader.module.scss'

/** Shown while the router loads the first route module. */
export function FullPageLoader() {
  return (
    <div className={styles.container} role="status" aria-live="polite">
      <Spin size="large" />
      <span className="sr-only">Loading application…</span>
    </div>
  )
}
