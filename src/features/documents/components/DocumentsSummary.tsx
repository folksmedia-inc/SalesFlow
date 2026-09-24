import dayjs from 'dayjs'
import type { LucideIcon } from 'lucide-react'
import { CalendarPlus, FileStack, FileType2, HardDrive } from 'lucide-react'
import { memo, useMemo } from 'react'
import type { DocumentFile } from '@/types/models'
import { formatFileSize, formatNumber, pluralize } from '@/utils/format'
import { getFileKind } from '../utils/documentFiles'
import styles from './DocumentLibrary.module.scss'

interface SummaryItem {
  key: string
  label: string
  value: string
  detail: string
  icon: LucideIcon
}

/** Headline numbers for the document library. */
export const DocumentsSummary = memo(function DocumentsSummary({ documents }: { documents: DocumentFile[] }) {
  const items = useMemo<SummaryItem[]>(() => {
    const now = dayjs()
    const lastMonth = now.subtract(1, 'month')
    let bytes = 0
    let linked = 0
    let thisMonth = 0
    let previousMonth = 0
    const kinds = new Map<string, number>()
    for (const document of documents) {
      bytes += document.size
      if (document.related) linked += 1
      const uploaded = dayjs(document.createdAt)
      if (uploaded.isSame(now, 'month')) thisMonth += 1
      else if (uploaded.isSame(lastMonth, 'month')) previousMonth += 1
      const kind = getFileKind(document.mimeType, document.name).label
      kinds.set(kind, (kinds.get(kind) ?? 0) + 1)
    }
    const [topKind, topCount] = [...kinds.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0] ?? ['—', 0]
    return [
      { key: 'total', label: 'Total documents', value: formatNumber(documents.length), detail: `${formatNumber(linked)} linked to records`, icon: FileStack },
      {
        key: 'storage',
        label: 'Storage used',
        value: formatFileSize(bytes),
        detail: documents.length ? `Avg. ${formatFileSize(Math.round(bytes / documents.length))} per file` : 'No files yet',
        icon: HardDrive,
      },
      { key: 'month', label: 'Uploaded this month', value: formatNumber(thisMonth), detail: `${pluralize(previousMonth, 'file')} last month`, icon: CalendarPlus },
      { key: 'type', label: 'Most common type', value: topKind, detail: topCount ? `${formatNumber(topCount)} of ${pluralize(documents.length, 'file')}` : 'No files yet', icon: FileType2 },
    ]
  }, [documents])

  return (
    <dl className={styles.summary} aria-label="Document summary">
      {items.map(({ key, label, value, detail, icon: Icon }) => (
        <div key={key} className={styles.summaryCard}>
          <div className={styles.summaryTop}>
            <dt className={styles.summaryLabel}>{label}</dt>
            <span className={styles.summaryIcon} aria-hidden="true">
              <Icon size={16} />
            </span>
          </div>
          <dd className={styles.summaryValue}>{value}</dd>
          <dd className={styles.summaryDetail}>{detail}</dd>
        </div>
      ))}
    </dl>
  )
})
