import type { TableColumnsType } from 'antd'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { BarBreakdownChart } from '@/components/charts/BarBreakdownChart'
import { ChartCard } from '@/components/charts/ChartCard'
import { ColumnChart } from '@/components/charts/ColumnChart'
import { PersonCell } from '@/components/common/PersonCell'
import { StatusTag } from '@/components/common/StatusTag'
import { ROUTES } from '@/constants/routes'
import { useEntityList } from '@/hooks/useEntityData'
import { useLookupOptions, useLookups } from '@/hooks/useLookups'
import { EMPLOYEE_STATUSES, EMPLOYMENT_TYPES, type Employee } from '@/types/models'
import { formatDate, formatNumber, getFullName } from '@/utils/format'
import { ReportLayout, type ReportContext } from '../components/ReportLayout'
import { enumOptions, matches } from '../utils/filters'
import { BUCKET_TITLE, countBy, countByPeriod, inRange, percentOf } from '../utils/reportUtils'

interface EmployeeRow extends Employee {
  name: string
  department: string
}

/** Employees who joined within the period, with department / status / type filters. */
export function EmployeeReport({ context }: { context: ReportContext }) {
  const employees = useEntityList('employees')
  const lookups = useLookups()
  const departmentOptions = useLookupOptions('departments')
  const { range, filters } = context

  const rows = useMemo<EmployeeRow[]>(
    () =>
      employees
        .filter(
          (employee) =>
            inRange(employee.joiningDate, range) &&
            matches(filters.department, employee.departmentId) &&
            matches(filters.status, employee.status) &&
            matches(filters.type, employee.employmentType),
        )
        .map((employee) => ({ ...employee, name: getFullName(employee), department: lookups.departmentName(employee.departmentId) }))
        .sort((a, b) => b.joiningDate.localeCompare(a.joiningDate)),
    [employees, range, filters, lookups],
  )

  const active = rows.filter((row) => row.status === 'Active').length
  const onLeave = rows.filter((row) => row.status === 'On Leave').length
  const departmentsCovered = new Set(rows.map((row) => row.departmentId).filter(Boolean)).size
  const avgTenureMonths = rows.length ? rows.reduce((sum, row) => sum + dayjs().diff(dayjs(row.joiningDate), 'month', true), 0) / rows.length : 0

  const hires = useMemo(() => countByPeriod(rows.map((row) => row.joiningDate), range), [rows, range])
  const byDepartment = useMemo(() => countBy(rows, (row) => row.department), [rows])

  const columns: TableColumnsType<EmployeeRow> = [
    { key: 'name', title: 'Name', dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name), render: (_, row) => <PersonCell name={row.name} subtitle={row.jobTitle} to={ROUTES.employeeDetails(row.id)} size={28} /> },
    { key: 'employeeId', title: 'Employee ID', dataIndex: 'employeeId', sorter: (a, b) => a.employeeId.localeCompare(b.employeeId) },
    { key: 'department', title: 'Department', dataIndex: 'department', sorter: (a, b) => a.department.localeCompare(b.department) },
    { key: 'type', title: 'Type', dataIndex: 'employmentType', sorter: (a, b) => a.employmentType.localeCompare(b.employmentType) },
    { key: 'location', title: 'Location', dataIndex: 'location' },
    { key: 'status', title: 'Status', dataIndex: 'status', sorter: (a, b) => a.status.localeCompare(b.status), render: (status: string) => <StatusTag status={status} /> },
    { key: 'joiningDate', title: 'Joining Date', dataIndex: 'joiningDate', defaultSortOrder: 'descend', sorter: (a, b) => a.joiningDate.localeCompare(b.joiningDate), render: (value: string) => formatDate(value) },
  ]

  return (
    <ReportLayout
      context={context}
      noun={['employee', 'employees']}
      filterSpecs={[
        { key: 'department', label: 'Department', options: departmentOptions },
        { key: 'status', label: 'Status', options: enumOptions(EMPLOYEE_STATUSES) },
        { key: 'type', label: 'Employment type', options: enumOptions(EMPLOYMENT_TYPES) },
      ]}
      summary={[
        { key: 'total', label: 'Employees joined', value: formatNumber(rows.length), caption: `across ${departmentsCovered} departments` },
        { key: 'active', label: 'Active', value: formatNumber(active), caption: `${percentOf(active, rows.length)} of results` },
        { key: 'leave', label: 'On leave', value: formatNumber(onLeave), caption: `${percentOf(onLeave, rows.length)} of results` },
        { key: 'tenure', label: 'Average tenure', value: `${avgTenureMonths.toFixed(1)} mo`, caption: 'since joining date' },
      ]}
      charts={[
        <ChartCard
          key="hires"
          title="Hires over time"
          description={`Employees joined ${BUCKET_TITLE[hires.unit]}`}
          table={{ columns: ['Period', 'Hires'], rows: hires.points.map((point) => [point.fullLabel, point.value]) }}
        >
          <ColumnChart data={hires.points} seriesName="Hires" />
        </ChartCard>,
        <ChartCard key="dept" title="By department" description="Employees in this report per department" table={{ columns: ['Department', 'Employees'], rows: byDepartment.map((row) => [row.label, row.value]) }}>
          <BarBreakdownChart data={byDepartment} seriesName="Employees" />
        </ChartCard>,
      ]}
      columns={columns}
      rows={rows}
      csv={{
        headers: ['Employee ID', 'Name', 'Email', 'Job Title', 'Department', 'Employment Type', 'Location', 'Status', 'Joining Date'],
        toRow: (row) => [row.employeeId, row.name, row.email, row.jobTitle, row.department, row.employmentType, row.location, row.status, row.joiningDate],
      }}
    />
  )
}
