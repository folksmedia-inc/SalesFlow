import { Typography } from 'antd'
import type { ReactNode } from 'react'
import { useRouteHandle } from '@/hooks/useRouteHandle'
import { Breadcrumbs } from './Breadcrumbs'
import styles from './PageHeader.module.scss'

interface PageHeaderProps {
  /** Defaults to the current route's `handle.title`. */
  title?: ReactNode
  /** Defaults to the current route's `handle.description`. */
  subtitle?: ReactNode
  /** Primary page actions, rendered on the right. */
  actions?: ReactNode
  /** Content between the title and the actions (e.g. status badge). */
  tags?: ReactNode
  showBreadcrumbs?: boolean
  /** Breadcrumb label overrides by pathname (e.g. record names). */
  crumbLabels?: Record<string, string>
}

/** Standard page heading: breadcrumbs, title, subtitle and actions. */
export function PageHeader({ title, subtitle, actions, tags, showBreadcrumbs = true, crumbLabels }: PageHeaderProps) {
  const handle = useRouteHandle()
  const resolvedTitle = title ?? handle?.title
  const resolvedSubtitle = subtitle ?? handle?.description

  return (
    <header className={styles.header}>
      {showBreadcrumbs && <Breadcrumbs labels={crumbLabels} />}
      <div className={styles.row}>
        <div className={styles.heading}>
          <div className={styles.titleRow}>
            <Typography.Title level={3} className={styles.title}>
              {resolvedTitle}
            </Typography.Title>
            {tags}
          </div>
          {resolvedSubtitle && (
            <Typography.Text type="secondary" className={styles.subtitle}>
              {resolvedSubtitle}
            </Typography.Text>
          )}
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </header>
  )
}
