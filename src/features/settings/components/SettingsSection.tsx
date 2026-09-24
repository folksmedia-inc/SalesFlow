import { Typography } from 'antd'
import { useId, type ReactNode } from 'react'
import styles from './SettingsSection.module.scss'

interface SettingsSectionProps {
  title: string
  description?: ReactNode
  actions?: ReactNode
  children: ReactNode
}

/** Heading + stacked content for one settings section. */
export function SettingsSection({ title, description, actions, children }: SettingsSectionProps) {
  const headingId = useId()
  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <div className={styles.header}>
        <div className={styles.heading}>
          <Typography.Title level={4} id={headingId} className={styles.title}>
            {title}
          </Typography.Title>
          {description && <Typography.Text type="secondary">{description}</Typography.Text>}
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      <div className={styles.body}>{children}</div>
    </section>
  )
}

interface FormFooterProps {
  dirty: boolean
  children: ReactNode
  /** Message shown while there are unsaved edits. */
  dirtyLabel?: string
  /** Floating bar that stays visible at the bottom while scrolling long forms. */
  sticky?: boolean
}

/** Right-aligned form actions with an unsaved-changes hint. */
export function FormFooter({ dirty, children, dirtyLabel = 'You have unsaved changes', sticky = false }: FormFooterProps) {
  return (
    <div className={sticky ? `${styles.footer} ${styles.stickyFooter}` : styles.footer}>
      <span className={styles.dirty} aria-live="polite">
        {dirty && (
          <>
            <span className={styles.dot} aria-hidden="true" />
            {dirtyLabel}
          </>
        )}
      </span>
      <div className={styles.footerActions}>{children}</div>
    </div>
  )
}
