import { App, Button, Dropdown, type MenuProps } from 'antd'
import { BookOpen, CircleHelp, Keyboard, LifeBuoy, Sparkles } from 'lucide-react'
import styles from './HelpMenu.module.scss'

const SHORTCUTS: [string, string][] = [
  ['⌘ K / Ctrl K', 'Focus global search'],
  ['/', 'Focus global search'],
  ['Esc', 'Close dialogs and drawers'],
  ['⌘ Enter', 'Add a note while typing'],
]

const GUIDE: [string, string][] = [
  ['Manage records', 'Use the sidebar to open a module. Every list supports search, filters, sorting, column selection and CSV export.'],
  ['Bulk actions', 'Select rows with the checkboxes to activate, reassign or delete several records at once.'],
  ['Record pages', 'Open a record to see its details, activity timeline, tasks, notes and documents.'],
  ['Share views', 'Filters and sorting are stored in the URL — copy the link to share exactly what you see.'],
  ['Your data', 'Changes are saved in this browser. Reset to the demo data anytime from Settings → Data.'],
]

export function HelpMenu() {
  const { modal } = App.useApp()

  const items: MenuProps['items'] = [
    {
      key: 'guide',
      icon: <BookOpen size={16} />,
      label: 'Getting started',
      onClick: () =>
        modal.info({
          title: 'Getting started with Admin Hub',
          width: 560,
          icon: null,
          content: (
            <dl className={styles.guide}>
              {GUIDE.map(([term, description]) => (
                <div key={term}>
                  <dt>{term}</dt>
                  <dd>{description}</dd>
                </div>
              ))}
            </dl>
          ),
        }),
    },
    {
      key: 'shortcuts',
      icon: <Keyboard size={16} />,
      label: 'Keyboard shortcuts',
      onClick: () =>
        modal.info({
          title: 'Keyboard shortcuts',
          icon: null,
          content: (
            <table className={styles.shortcuts}>
              <tbody>
                {SHORTCUTS.map(([keys, action]) => (
                  <tr key={keys}>
                    <td>
                      <kbd>{keys}</kbd>
                    </td>
                    <td>{action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ),
        }),
    },
    {
      key: 'whatsnew',
      icon: <Sparkles size={16} />,
      label: "What's new",
      onClick: () =>
        modal.info({
          title: "What's new",
          icon: null,
          content: 'Kanban view for tasks, bulk actions on every list, a permission matrix editor and CSV export for reports.',
        }),
    },
    { type: 'divider' },
    { key: 'support', icon: <LifeBuoy size={16} />, label: <a href="mailto:support@adminhub.dev">Contact support</a> },
  ]

  return (
    <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
      <Button type="text" shape="circle" title="Help" aria-label="Help" icon={<CircleHelp size={18} />} />
    </Dropdown>
  )
}
