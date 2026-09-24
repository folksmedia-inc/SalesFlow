import type { TableColumnsType } from 'antd'
import { useMemo } from 'react'
import { BarBreakdownChart } from '@/components/charts/BarBreakdownChart'
import { ChartCard } from '@/components/charts/ChartCard'
import { ColumnChart } from '@/components/charts/ColumnChart'
import { PersonCell } from '@/components/common/PersonCell'
import { StatusTag } from '@/components/common/StatusTag'
import { ROUTES } from '@/constants/routes'
import { useEntityList } from '@/hooks/useEntityData'
import { useLookupOptions, useLookups } from '@/hooks/useLookups'
import { CUSTOMER_STATUSES, INDUSTRIES, type Customer } from '@/types/models'
import { formatCurrency, formatDate, formatNumber } from '@/utils/format'
import { ReportLayout, type ReportContext } from '../components/ReportLayout'
import { enumOptions, matches } from '../utils/filters'
import { BUCKET_TITLE, countBy, countByPeriod, inRange, percentOf } from '../utils/reportUtils'

interface CustomerRow extends Customer {
  owner: string
}

/** Customers created within the period, by industry / status / owner. */
export function CustomerReport({ context }: { context: ReportContext }) {
  const customers = useEntityList('customers')
  const lookups = useLookups()
  const ownerOptions = useLookupOptions('employees')
  const { range, filters } = context

  const rows = useMemo<CustomerRow[]>(
    () =>
      customers
        .filter(
          (customer) =>
            inRange(customer.createdAt, range) &&
            matches(filters.industry, customer.industry) &&
            matches(filters.status, customer.status) &&
            matches(filters.owner, customer.ownerId),
        )
        .map((customer) => ({ ...customer, owner: lookups.employeeName(customer.ownerId) }))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [customers, range, filters, lookups],
  )

  const active = rows.filter((row) => row.status === 'Active').length
  const churned = rows.filter((row) => row.status === 'Churned').length
  const pipeline = rows.filter((row) => row.status === 'Lead' || row.status === 'Prospect').length
  const lifetimeValue = rows.reduce((sum, row) => sum + row.lifetimeValue, 0)

  const created = useMemo(() => countByPeriod(rows.map((row) => row.createdAt), range), [rows, range])
  const byIndustry = useMemo(() => countBy(rows, (row) => row.industry), [rows])

  const columns: TableColumnsType<CustomerRow> = [
    { key: 'name', title: 'Customer', dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name), render: (_, row) => <PersonCell name={row.name} subtitle={row.email} to={ROUTES.customerDetails(row.id)} size={28} /> },
    { key: 'company', title: 'Company', dataIndex: 'company', sorter: (a, b) => a.company.localeCompare(b.company) },
    { key: 'industry', title: 'Industry', dataIndex: 'industry', sorter: (a, b) => a.industry.localeCompare(b.industry) },
    { key: 'status', title: 'Status', dataIndex: 'status', sorter: (a, b) => a.status.localeCompare(b.status), render: (status: string) => <StatusTag status={status} /> },
    { key: 'owner', title: 'Owner', dataIndex: 'owner', sorter: (a, b) => a.owner.localeCompare(b.owner) },
    { key: 'ltv', title: 'Lifetime Value', dataIndex: 'lifetimeValue', align: 'right', sorter: (a, b) => a.lifetimeValue - b.lifetimeValue, render: (value: number) => formatCurrency(value) },
    { key: 'createdAt', title: 'Created', dataIndex: 'createdAt', defaultSortOrder: 'descend', sorter: (a, b) => a.createdAt.localeCompare(b.createdAt), render: (value: string) => formatDate(value) },
  ]

  return (
    <ReportLayout
      context={context}
      noun={['customer', 'customers']}
      filterSpecs={[
        { key: 'industry', label: 'Industry', options: enumOptions(INDUSTRIES) },
        { key: 'status', label: 'Status', options: enumOptions(CUSTOMER_STATUSES) },
        { key: 'owner', label: 'Owner', options: ownerOptions },
      ]}
      summary={[
        { key: 'total', label: 'New customers', value: formatNumber(rows.length), caption: `${pipeline} in pipeline (lead / prospect)` },
        { key: 'active', label: 'Active', value: formatNumber(active), caption: `${percentOf(active, rows.length)} of results` },
        { key: 'churned', label: 'Churned', value: formatNumber(churned), caption: `${percentOf(churned, rows.length)} of results` },
        { key: 'ltv', label: 'Lifetime value', value: formatCurrency(lifetimeValue, true), caption: rows.length ? `avg ${formatCurrency(lifetimeValue / rows.length, true)} per customer` : undefined },
      ]}
      charts={[
        <ChartCard
          key="created"
          title="New customers over time"
          description={`Customers created ${BUCKET_TITLE[created.unit]}`}
          table={{ columns: ['Period', 'Customers'], rows: created.points.map((point) => [point.fullLabel, point.value]) }}
        >
          <ColumnChart data={created.points} seriesName="Customers" />
        </ChartCard>,
        <ChartCard key="industry" title="By industry" description="Customers in this report per industry" table={{ columns: ['Industry', 'Customers'], rows: byIndustry.map((row) => [row.label, row.value]) }}>
          <BarBreakdownChart data={byIndustry} seriesName="Customers" />
        </ChartCard>,
      ]}
      columns={columns}
      rows={rows}
      csv={{
        headers: ['Name', 'Company', 'Email', 'Phone', 'Industry', 'Status', 'Owner', 'City', 'Country', 'Lifetime Value', 'Created'],
        toRow: (row) => [row.name, row.company, row.email, row.phone, row.industry, row.status, row.owner, row.city, row.country, row.lifetimeValue, row.createdAt.slice(0, 10)],
      }}
    />
  )
}
