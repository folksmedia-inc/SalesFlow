import { REPORT_KEYS, REPORTS, type ReportKey } from '../config/reportTypes'
import styles from './ReportPicker.module.scss'

interface ReportPickerProps {
  value: ReportKey
  onChange: (report: ReportKey) => void
}

/** Report catalog — one selectable card per report type. */
export function ReportPicker({ value, onChange }: ReportPickerProps) {
  return (
    <div className={styles.picker} role="radiogroup" aria-label="Report type">
      {REPORT_KEYS.map((key) => {
        const { label, description, icon: Icon } = REPORTS[key]
        const selected = key === value
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={selected}
            className={`${styles.option} ${selected ? styles.selected : ''}`}
            onClick={() => onChange(key)}
          >
            <span className={styles.icon} aria-hidden="true">
              <Icon size={18} />
            </span>
            <span className={styles.text}>
              <span className={styles.label}>{label}</span>
              <span className={styles.description}>{description}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
