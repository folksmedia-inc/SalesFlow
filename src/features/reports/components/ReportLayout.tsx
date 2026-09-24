import { App, Button, Card, Col, Row, Select, Table, type TableColumnsType } from 'antd'
import { Download, RotateCcw } from 'lucide-react'
import type { ReactNode } from 'react'
import { useAppSelector } from '@/app/hooks'
import { EmptyState } from '@/components/feedback/EmptyState'
import { selectTableDensity } from '@/store/uiSlice'
import type { SelectOption } from '@/types/common'
import { downloadCsv } from '@/utils/csv'
import { formatDate, pluralize } from '@/utils/format'
import type { ResolvedDateRange } from '@/utils/dateRange'
import type { ReportMeta } from '../config/reportTypes'
import type { ReportFilterValues } from '../hooks/useReportParams'
import { DateRangeControl } from './DateRangeControl'
import styles from './ReportLayout.module.scss'

export interface ReportFilterSpec {
  key: string
  label: string
  options: SelectOption[]
}

export interface ReportSummaryItem {
  key: string
  label: string
  value: string
  caption?: string
}

export type CsvCell = string | number | null | undefined

/** What every report receives from the page. */
export interface ReportContext {
  meta: ReportMeta
  range: ResolvedDateRange
  filters: ReportFilterValues
  setFilter: (key: string, values: string[]) => void
  clearFilters: () => void
}

interface ReportLayoutProps<Row extends { id: string }> {
  context: ReportContext
  filterSpecs: ReportFilterSpec[]
  summary: ReportSummaryItem[]
  /** One or two ChartCards. */
  charts: ReactNode[]
  columns: TableColumnsType<Row>
  rows: Row[]
  /** Singular / plural noun for result counts (e.g. ["employee", "employees"]). */
  noun: [string, string]
  /** Short note on how the date range is applied (overrides the default). */
  dateNote?: string
  csv: { headers: string[]; toRow: (row: Row) => CsvCell[] }
}

/**
 * Shared report scaffolding: filter bar (date range first), summary tiles,
 * charts, results table and CSV export. Everything below the filter bar is
 * computed from the same filtered slice, so the numbers always agree.
 */
export function ReportLayout<Row extends { id: string }>({ context, filterSpecs, summary, charts, columns, rows, noun, dateNote, csv }: ReportLayoutProps<Row>) {
  const { message } = App.useApp()
  const density = useAppSelector(selectTableDensity)
  const { meta, range, filters, setFilter, clearFilters } = context
  const activeFilterCount = filterSpecs.filter((spec) => filters[spec.key]?.length).length
  const rangeText = `${formatDate(range.from)} – ${formatDate(range.to)}`

  const exportCsv = () => {
    downloadCsv(`${meta.key}-report_${range.from}_${range.to}`, csv.headers, rows.map(csv.toRow))
    message.success(`Exported ${pluralize(rows.length, noun[0], noun[1])}`)
  }

  return (
    <div className={styles.report}>
      <Card className={styles.toolbarCard} styles={{ body: { padding: 16 } }}>
        <div className={styles.toolbar}>
          <div className={styles.filters}>
            <DateRangeControl range={range} />
            {filterSpecs.length > 0 && <span className={styles.divider} aria-hidden="true" />}
            {filterSpecs.map((spec) => (
              <Select<string[]>
                key={spec.key}
                mode="multiple"
                aria-label={spec.label}
                className={styles.filterSelect}
                placeholder={spec.label}
                value={filters[spec.key] ?? []}
                options={spec.options}
                onChange={(values) => setFilter(spec.key, values)}
                maxTagCount="responsive"
                allowClear
                showSearch={{ optionFilterProp: 'label' }}
                popupMatchSelectWidth={false}
              />
            ))}
            {activeFilterCount > 0 && (
              <Button type="link" icon={<RotateCcw size={14} />} onClick={clearFilters} className={styles.reset}>
                Reset filters
              </Button>
            )}
          </div>
          <Button type="primary" icon={<Download size={16} />} onClick={exportCsv} disabled={rows.length === 0}>
            Export CSV
          </Button>
        </div>
        <div className={styles.scope}>
          <span>
            {meta.label} · by {meta.dateField} · {rangeText}
          </span>
          {dateNote && <span className={styles.scopeNote}>{dateNote}</span>}
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        {summary.map((item) => (
          <Col key={item.key} xs={12} md={6}>
            <div className={styles.tile}>
              <span className={styles.tileLabel}>{item.label}</span>
              <span className={styles.tileValue}>{item.value}</span>
              {item.caption && <span className={styles.tileCaption}>{item.caption}</span>}
            </div>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        {charts.map((chart, index) => (
          <Col key={index} xs={24} lg={charts.length > 1 ? 12 : 24} className={styles.chartCol}>
            {chart}
          </Col>
        ))}
      </Row>

      <Card
        title={
          <span className={styles.tableTitle}>
            Results <span className={styles.count}>{pluralize(rows.length, noun[0], noun[1])}</span>
          </span>
        }
        styles={{ body: { padding: 0 } }}
      >
        <Table<Row>
          rowKey="id"
          size={density}
          columns={columns}
          dataSource={rows}
          scroll={{ x: 'max-content' }}
          pagination={{ defaultPageSize: 10, showSizeChanger: true, hideOnSinglePage: false, showTotal: (total, [from, to]) => `${from}–${to} of ${total}` }}
          locale={{
            emptyText: (
              <EmptyState
                title={`No ${noun[1]} match this report`}
                description="Try a wider date range or remove some filters."
                secondaryLabel={activeFilterCount ? 'Reset filters' : undefined}
                onSecondary={clearFilters}
              />
            ),
          }}
        />
      </Card>
    </div>
  )
}
