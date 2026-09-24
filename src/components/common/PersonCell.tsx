import { Avatar } from 'antd'
import type { ReactNode } from 'react'
import { memo } from 'react'
import { Link } from 'react-router'
import { avatarColor } from '@/utils/avatar'
import { getInitials } from '@/utils/format'
import styles from './PersonCell.module.scss'

interface PersonCellProps {
  name: string
  subtitle?: ReactNode
  to?: string
  size?: number
  icon?: ReactNode
}

/** Avatar + name (+ optional subtitle) used in tables and lists. */
export const PersonCell = memo(function PersonCell({ name, subtitle, to, size = 32, icon }: PersonCellProps) {
  return (
    <span className={styles.cell}>
      <Avatar size={size} style={{ background: avatarColor(name), flexShrink: 0 }} icon={icon}>
        {icon ? undefined : getInitials(name)}
      </Avatar>
      <span className={styles.text}>
        {to ? (
          <Link to={to} className={styles.name} onClick={(event) => event.stopPropagation()}>
            {name}
          </Link>
        ) : (
          <span className={styles.name}>{name}</span>
        )}
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </span>
    </span>
  )
})
