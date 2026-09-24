import { App, Card, Switch, Table } from 'antd'
import { Moon, Sun } from 'lucide-react'
import type { ReactNode } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { StatusTag } from '@/components/common/StatusTag'
import {
  selectSidebarCollapsed,
  selectTableDensity,
  selectThemeMode,
  sidebarCollapsedSet,
  tableDensitySet,
  themeModeSet,
  type TableDensity,
  type ThemeMode,
} from '@/store/uiSlice'
import { SettingsSection } from '../components/SettingsSection'
import styles from './PreferencesSection.module.scss'

interface Choice<V extends string> {
  value: V
  label: string
  description: string
  preview: ReactNode
}

const THEME_CHOICES: Choice<ThemeMode>[] = [
  {
    value: 'light',
    label: 'Light',
    description: 'Bright surfaces for well-lit rooms.',
    preview: (
      <span className={`${styles.themePreview} ${styles.previewLight}`} aria-hidden="true">
        <span className={styles.previewSider} />
        <span className={styles.previewBody}>
          <span className={styles.previewBar} />
          <span className={styles.previewLine} />
          <span className={styles.previewLineShort} />
        </span>
        <Sun size={14} className={styles.previewIcon} />
      </span>
    ),
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Easier on the eyes in low light.',
    preview: (
      <span className={`${styles.themePreview} ${styles.previewDark}`} aria-hidden="true">
        <span className={styles.previewSider} />
        <span className={styles.previewBody}>
          <span className={styles.previewBar} />
          <span className={styles.previewLine} />
          <span className={styles.previewLineShort} />
        </span>
        <Moon size={14} className={styles.previewIcon} />
      </span>
    ),
  },
]

const DENSITY_CHOICES: Omit<Choice<TableDensity>, 'preview'>[] = [
  { value: 'large', label: 'Comfortable', description: 'Roomy rows, easiest to scan.' },
  { value: 'middle', label: 'Default', description: 'Balanced spacing for most lists.' },
  { value: 'small', label: 'Compact', description: 'Fit more rows on screen.' },
]

const PREVIEW_ROWS = [
  { key: '1', name: 'Northwind Traders', owner: 'Sarah Thompson', status: 'Active' },
  { key: '2', name: 'Globex Corporation', owner: 'Marcus Chen', status: 'Prospect' },
  { key: '3', name: 'Initech', owner: 'Daniel Kim', status: 'Inactive' },
]

function ChoiceGroup<V extends string>({
  label,
  value,
  choices,
  onChange,
}: {
  label: string
  value: V
  choices: { value: V; label: string; description: string; preview?: ReactNode }[]
  onChange: (value: V) => void
}) {
  return (
    <div role="group" aria-label={label} className={styles.choices}>
      {choices.map((choice) => {
        const selected = choice.value === value
        return (
          <button
            key={choice.value}
            type="button"
            aria-pressed={selected}
            className={`${styles.choice} ${selected ? styles.selected : ''}`}
            onClick={() => onChange(choice.value)}
          >
            {choice.preview}
            <span className={styles.choiceText}>
              <span className={styles.choiceLabel}>
                <span className={styles.radio} aria-hidden="true" />
                {choice.label}
              </span>
              <span className={styles.choiceDescription}>{choice.description}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

export function PreferencesSection() {
  const dispatch = useAppDispatch()
  const { message } = App.useApp()
  const themeMode = useAppSelector(selectThemeMode)
  const density = useAppSelector(selectTableDensity)
  const sidebarCollapsed = useAppSelector(selectSidebarCollapsed)

  const saved = (text: string) => message.success({ content: text, key: 'preferences' })

  return (
    <SettingsSection title="Preferences" description="Personalize how the Admin Hub looks on this device. Changes are saved automatically.">
      <Card title="Theme">
        <ChoiceGroup
          label="Theme"
          value={themeMode}
          choices={THEME_CHOICES}
          onChange={(mode) => {
            dispatch(themeModeSet(mode))
            saved(`${mode === 'dark' ? 'Dark' : 'Light'} theme applied.`)
          }}
        />
      </Card>

      <Card title="Table Density">
        <ChoiceGroup
          label="Table density"
          value={density}
          choices={DENSITY_CHOICES}
          onChange={(next) => {
            dispatch(tableDensitySet(next))
            saved(`Table density set to ${DENSITY_CHOICES.find((choice) => choice.value === next)?.label.toLowerCase()}.`)
          }}
        />
        <div className={styles.previewTable}>
          <div className={styles.previewLabel}>Preview</div>
          <Table
            size={density}
            pagination={false}
            dataSource={PREVIEW_ROWS}
            columns={[
              { key: 'name', dataIndex: 'name', title: 'Account' },
              { key: 'owner', dataIndex: 'owner', title: 'Owner' },
              { key: 'status', dataIndex: 'status', title: 'Status', render: (status: string) => <StatusTag status={status} /> },
            ]}
          />
        </div>
      </Card>

      <Card title="Navigation">
        <div className={styles.toggleRow}>
          <div>
            <label htmlFor="pref-sidebar" className={styles.toggleLabel}>
              Collapse sidebar
            </label>
            <div className={styles.choiceDescription}>Show only icons in the main navigation to give pages more room. The sidebar collapses automatically on tablets.</div>
          </div>
          <Switch
            id="pref-sidebar"
            checked={sidebarCollapsed}
            onChange={(checked) => {
              dispatch(sidebarCollapsedSet(checked))
              saved(checked ? 'Sidebar collapsed.' : 'Sidebar expanded.')
            }}
          />
        </div>
      </Card>
    </SettingsSection>
  )
}
