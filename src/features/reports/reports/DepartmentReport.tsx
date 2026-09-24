import type { TableColumnsType } from 'antd'
import { useMemo } from 'react'
import { BarBreakdownChart } from '@/components/charts/BarBreakdownChart'
import { ChartCard } from '@/components/charts/ChartCard'
import { StatusTag } from '@/components/common/StatusTag'
import { useEntityList } from '@/hooks/useEntityData'
import { useLookups } from '@/hooks/useLookups'
import { LOCATIONS, RECORD_STATUSES, type Department } from '@/types/models'
import { formatCurrency, formatNumber } from '@/utils/format'
import { ReportLayout, type ReportContext } from '../components/ReportLayout'
import { enumOptions, matches } from '../utils/filters'
import { inRange } from '../utils/reportUtils'

interface DepartmentRow extends Department {
  head: string
  headcount: number
  activeCount: number
  newHires: number
  budgetPerHead: number | null
}

/** Every department with headcount and budget; the period scopes the "new hires" figures. */
export function DepartmentReport({ context }: { context: ReportContext }) {
  const departments = useEntityList('departments')
  const employees = useEntityList('employees')
  const lookups = useLookups()
  const { range, filters } = context

  const rows = useMemo<DepartmentRow[]>(() => {
    const stats = new Map<string, { headcount: number; active: number; newHires: number }>()
    for (const employee of employees) {
      if (!employee.departmentId) continue
      const entry = stats.get(employee.departmentId) ?? { headcount: 0, active: 0, newHires: 0 }
      entry.headcount += 1
      if (employee.status === 'Active') entry.active += 1
      if (inRange(employee.joiningDate, range)) entry.newHires += 1
      stats.set(employee.departmentId, entry)
    }
    return departments
      .filter((department) => matches(filters.status, department.status) && matches(filters.location, department.location))
      .map((department) => {
        const entry = stats.get(department.id) ?? { headcount: 0, active: 0, newHires: 0 }
        return {
          ...department,
          head: lookups.employeeName(department.headId),
          headcount: entry.headcount,
          activeCount: entry.active,
          newHires: entry.newHires,
          budgetPerHead: entry.headcount ? department.budget / entry.headcount : null,
        }
      })
      .sort((a, b) => b.headcount - a.headcount || a.name.localeCompare(b.name))
  }, [departments, employees, range, filters, lookups])

  const headcount = rows.reduce((sum, row) => sum + row.headcount, 0)
  const newHires = rows.reduce((sum, row) => sum + row.newHires, 0)
  const budget = rows.reduce((sum, row) => sum + row.budget, 0)
  const activeDepartments = rows.filter((row) => row.status === 'Active').length

  const headcountData = rows.map((row) => ({ key: row.id, label: row.name, value: row.headcount }))
  const budgetData = [...rows].sort((a, b) => b.budget - a.budget).map((row) => ({ key: row.id, label: row.name, value: row.budget }))

  const columns: TableColumnsType<DepartmentRow> = [
    { key: 'name', title: 'Department', dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name), render: (name: string, row) => <span><strong>{name}</strong> <span style={{ color: 'var(--app-text-tertiary)' }}>{row.code}</span></span> },
    { key: 'head', title: 'Head', dataIndex: 'head', sorter: (a, b) => a.head.localeCompare(b.head) },
    { key: 'location', title: 'Location', dataIndex: 'location' },
    { key: 'status', title: 'Status', dataIndex: 'status', render: (status: string) => <StatusTag status={status} /> },
    { key: 'headcount', title: 'Headcount', dataIndex: 'headcount', align: 'right', defaultSortOrder: 'descend', sorter: (a, b) => a.headcount - b.headcount },
    { key: 'active', title: 'Active', dataIndex: 'activeCount', align: 'right', sorter: (a, b) => a.activeCount - b.activeCount },
    { key: 'newHires', title: 'New Hires', dataIndex: 'newHires', align: 'right', sorter: (a, b) => a.newHires - b.newHires },
    { key: 'budget', title: 'Budget', dataIndex: 'budget', align: 'right', sorter: (a, b) => a.budget - b.budget, render: (value: number) => formatCurrency(value) },
    { key: 'perHead', title: 'Budget / Head', dataIndex: 'budgetPerHead', align: 'right', sorter: (a, b) => (a.budgetPerHead ?? 0) - (b.budgetPerHead ?? 0), render: (value: number | null) => formatCurrency(value) },
  ]

  return (
    <ReportLayout
      context={context}
      noun={['department', 'departments']}
      dateNote="Departments are not date-bound; the period sets which employees count as new hires."
      filterSpecs={[
        { key: 'status', label: 'Status', options: enumOptions(RECORD_STATUSES) },
        { key: 'location', label: 'Location', options: enumOptions(LOCATIONS) },
      ]}
      summary={[
        { key: 'departments', label: 'Departments', value: formatNumber(rows.length), caption: `${activeDepartments} active` },
        { key: 'headcount', label: 'Headcount', value: formatNumber(headcount), caption: rows.length ? `avg ${(headcount / rows.length).toFixed(1)} per department` : undefined },
        { key: 'hires', label: 'New hires in period', value: formatNumber(newHires), caption: headcount ? `${Math.round((newHires / headcount) * 100)}% of headcount` : undefined },
        { key: 'budget', label: 'Total budget', value: formatCurrency(budget, true), caption: headcount ? `${formatCurrency(budget / headcount, true)} per head` : undefined },
      ]}
      charts={[
        <ChartCard key="headcount" title="Headcount by department" description="All employees assigned to each department" table={{ columns: ['Department', 'Employees'], rows: headcountData.map((row) => [row.label, row.value]) }}>
          <BarBreakdownChart data={headcountData} seriesName="Employees" />
        </ChartCard>,
        <ChartCard key="budget" title="Budget by department" description="Annual budget (USD)" table={{ columns: ['Department', 'Budget'], rows: budgetData.map((row) => [row.label, formatCurrency(row.value)]) }}>
          <BarBreakdownChart data={budgetData} seriesName="Budget" valueFormatter={(value) => formatCurrency(value, true)} />
        </ChartCard>,
      ]}
      columns={columns}
      rows={rows}
      csv={{
        headers: ['Department', 'Code', 'Head', 'Location', 'Status', 'Headcount', 'Active', 'New Hires', 'Budget', 'Budget per Head'],
        toRow: (row) => [row.name, row.code, row.head, row.location, row.status, row.headcount, row.activeCount, row.newHires, row.budget, row.budgetPerHead === null ? '' : Math.round(row.budgetPerHead)],
      }}
    />
  )
}
