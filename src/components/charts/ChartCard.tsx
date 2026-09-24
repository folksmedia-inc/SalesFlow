import { Card, Segmented } from 'antd'
import { ChartColumn, Table2 } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import styles from './Charts.module.scss'

export interface ChartTableData {
  columns: string[]
  rows: (string | number)[][]
}

interface ChartCardProps {
  title: ReactNode
  description?: ReactNode
  /** Header content on the right (e.g. a "View all" link). */
  extra?: ReactNode
  /** Tabular twin of the chart; when provided, a chart/table toggle is shown. */
  table?: ChartTableData
  className?: string
  children: ReactNode
}

type View = 'chart' | 'table'

/** Card wrapper shared by every chart: title, description, optional table view. */
export function ChartCard({ title, description, extra, table, className, children }: ChartCardProps) {
  const [view, setView] = useState<View>('chart')
  const showTable = Boolean(table) && view === 'table'

  return (
    <Card className={[styles.card, className].filter(Boolean).join(' ')} styles={{ body: { padding: 0, height: '100%', display: 'flex', flexDirection: 'column' } }}>
      <div className={styles.cardHeader}>
        <div className={styles.cardHeading}>
          <h3 className={styles.cardTitle}>{title}</h3>
          {description && <p className={styles.cardDescription}>{description}</p>}
        </div>
        {(extra || table) && (
          <div className={styles.cardExtra}>
            {extra}
            {table && (
              <Segmented<View>
                size="small"
                value={view}
                onChange={setView}
                options={[
                  { value: 'chart', icon: <ChartColumn size={14} aria-hidden="true" />, title: 'Chart view' },
                  { value: 'table', icon: <Table2 size={14} aria-hidden="true" />, title: 'Table view' },
                ]}
                aria-label="Chart or table view"
              />
            )}
          </div>
        )}
      </div>
      <div className={styles.cardBody}>
        {showTable && table ? (
          <div className={styles.dataTableWrap}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  {table.columns.map((column, index) => (
                    <th key={column} className={index > 0 ? styles.numeric : undefined} scope="col">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row) => (
                  <tr key={String(row[0])}>
                    {row.map((cell, index) => (
                      <td key={table.columns[index] ?? index} className={index > 0 ? styles.numeric : undefined}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          children
        )}
      </div>
    </Card>
  )
}
