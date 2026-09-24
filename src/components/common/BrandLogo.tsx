import { Cloud } from 'lucide-react'
import { APP_SHORT_NAME } from '@/constants/app'
import styles from './BrandLogo.module.scss'

interface BrandLogoProps {
  /** Show only the mark (collapsed sidebar). */
  compact?: boolean
  /** Color scheme of the wordmark. */
  tone?: 'light' | 'dark'
}

export function BrandLogo({ compact = false, tone = 'light' }: BrandLogoProps) {
  return (
    <span className={`${styles.logo} ${tone === 'dark' ? styles.dark : ''}`}>
      <span className={styles.mark} aria-hidden="true">
        <Cloud size={20} strokeWidth={2.25} />
      </span>
      {compact ? (
        <span className="sr-only">{APP_SHORT_NAME}</span>
      ) : (
        <span className={styles.wordmark}>
          <span className={styles.caption}>Salesforce</span>
          <span className={styles.name}>{APP_SHORT_NAME}</span>
        </span>
      )}
    </span>
  )
}
