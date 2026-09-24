import { useMemo, type ComponentType } from 'react'
import { useAppSelector } from '@/app/hooks'
import { PageHeader } from '@/components/common/PageHeader'
import { selectGlobalDateRange } from '@/store/filterSlice'
import { resolveDateRange } from '@/utils/dateRange'
import type { ReportContext } from '../components/ReportLayout'
import { ReportPicker } from '../components/ReportPicker'
import { REPORTS, type ReportKey } from '../config/reportTypes'
import { useReportParams } from '../hooks/useReportParams'
import { ActivityReport } from '../reports/ActivityReport'
import { CustomerReport } from '../reports/CustomerReport'
import { DepartmentReport } from '../reports/DepartmentReport'
import { EmployeeReport } from '../reports/EmployeeReport'
import { TaskReport } from '../reports/TaskReport'
import styles from './ReportsPage.module.scss'

const REPORT_COMPONENTS: Record<ReportKey, ComponentType<{ context: ReportContext }>> = {
  employees: EmployeeReport,
  departments: DepartmentReport,
  customers: CustomerReport,
  tasks: TaskReport,
  activities: ActivityReport,
}

export default function ReportsPage() {
  const { report, filters, setReport, setFilter, clearFilters } = useReportParams()
  const dateRange = useAppSelector(selectGlobalDateRange)
  const range = useMemo(() => resolveDateRange(dateRange), [dateRange])

  const context = useMemo<ReportContext>(
    () => ({ meta: REPORTS[report], range, filters, setFilter, clearFilters }),
    [report, range, filters, setFilter, clearFilters],
  )
  const Report = REPORT_COMPONENTS[report]

  return (
    <div className={styles.page}>
      <PageHeader subtitle="Analyze your workforce, customers and operations — filter by period and export the results." />
      <ReportPicker value={report} onChange={setReport} />
      <Report key={report} context={context} />
    </div>
  )
}
