import { Card, Col, Row } from 'antd'
import dayjs from 'dayjs'
import { Activity, Building2, ListTodo, UserCheck, Users, UsersRound } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router'
import { useAppSelector } from '@/app/hooks'
import { BarBreakdownChart } from '@/components/charts/BarBreakdownChart'
import { ChartCard } from '@/components/charts/ChartCard'
import { useChartTheme } from '@/components/charts/chartTheme'
import { DonutChart } from '@/components/charts/DonutChart'
import { TrendAreaChart } from '@/components/charts/TrendAreaChart'
import type { ChartDatum } from '@/components/charts/types'
import { PageHeader } from '@/components/common/PageHeader'
import { ROUTES } from '@/constants/routes'
import { ActivityTimeline } from '@/features/activities/components/ActivityTimeline'
import { useEntityList } from '@/hooks/useEntityData'
import { selectCurrentUser } from '@/store/authSlice'
import { EMPLOYEE_STATUSES, type EmployeeStatus } from '@/types/models'
import { formatNumber, pluralize } from '@/utils/format'
import { QuickActions } from '../components/QuickActions'
import { StatCard } from '../components/StatCard'
import {
  activeEmployeesMetric,
  customersMetric,
  engagementMetric,
  greeting,
  headcountTrend,
  openTasksMetric,
  totalEmployeesMetric,
  type StatMetric,
} from '../utils/dashboardMetrics'
import styles from './DashboardPage.module.scss'

const RECENT_ACTIVITY_COUNT = 8

export default function DashboardPage() {
  const user = useAppSelector(selectCurrentUser)
  const employees = useEntityList('employees')
  const departments = useEntityList('departments')
  const customers = useEntityList('customers')
  const tasks = useEntityList('tasks')
  const activities = useEntityList('activities')
  const theme = useChartTheme()

  const stats = useMemo(() => {
    const now = dayjs()
    const activeDepartments = departments.filter((department) => department.status === 'Active').length
    const assigned = employees.filter((employee) => employee.departmentId).length
    const departmentsMetric: StatMetric = {
      value: departments.length,
      delta: {
        change: String(activeDepartments),
        caption: `active · avg ${departments.length ? Math.round((assigned / departments.length) * 10) / 10 : 0} people each`,
        tone: 'neutral',
      },
    }
    return {
      total: totalEmployeesMetric(employees, now),
      active: activeEmployeesMetric(employees),
      departments: departmentsMetric,
      customers: customersMetric(customers, now),
      openTasks: openTasksMetric(tasks, now),
      engagement: engagementMetric(activities, now),
    }
  }, [employees, departments, customers, tasks, activities])

  const growth = useMemo(() => headcountTrend(employees, 12), [employees])
  const growthDelta = growth.length > 1 ? (growth[growth.length - 1]?.value ?? 0) - (growth[0]?.value ?? 0) : 0

  const byDepartment = useMemo<ChartDatum[]>(() => {
    const counts = new Map<string, number>()
    let unassigned = 0
    for (const employee of employees) {
      if (employee.departmentId) counts.set(employee.departmentId, (counts.get(employee.departmentId) ?? 0) + 1)
      else unassigned += 1
    }
    const rows: ChartDatum[] = departments
      .map((department) => ({ key: department.id, label: department.name, value: counts.get(department.id) ?? 0 }))
      .filter((row) => row.value > 0)
      .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
    if (unassigned > 0) rows.push({ key: 'unassigned', label: 'Unassigned', value: unassigned })
    return rows
  }, [employees, departments])

  const byStatus = useMemo<ChartDatum[]>(() => {
    const colors: Record<EmployeeStatus, string> = { Active: theme.status.good, 'On Leave': theme.status.warning, Inactive: theme.status.neutral }
    return EMPLOYEE_STATUSES.map((status) => ({
      key: status,
      label: status,
      value: employees.filter((employee) => employee.status === status).length,
      color: colors[status],
    }))
  }, [employees, theme])

  const recentActivities = useMemo(
    () => [...activities].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)).slice(0, RECENT_ACTIVITY_COUNT),
    [activities],
  )

  const firstName = user?.firstName
  const today = dayjs().format('dddd, MMMM D')

  return (
    <div className={styles.page}>
      <PageHeader
        showBreadcrumbs={false}
        title={firstName ? `${greeting()}, ${firstName}` : 'Dashboard'}
        subtitle={`${today} · Here's what's happening across your organization.`}
      />

      <section aria-label="Key metrics">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8} xxl={4}>
            <StatCard label="Total Employees" value={stats.total.value} delta={stats.total.delta} icon={Users} to={ROUTES.employees} hint="All employee records. Change = employees who joined this month ÷ headcount at the start of the month." />
          </Col>
          <Col xs={24} sm={12} lg={8} xxl={4}>
            <StatCard label="Active Employees" value={stats.active.value} delta={stats.active.delta} icon={UserCheck} to={`${ROUTES.employees}?f.status=Active`} hint="Employees with status Active, as a share of all employees." />
          </Col>
          <Col xs={24} sm={12} lg={8} xxl={4}>
            <StatCard label="Departments" value={stats.departments.value} delta={stats.departments.delta} icon={Building2} to={ROUTES.departments} hint="All departments; average = employees with a department ÷ departments." />
          </Col>
          <Col xs={24} sm={12} lg={8} xxl={4}>
            <StatCard label="Customers" value={stats.customers.value} delta={stats.customers.delta} icon={UsersRound} to={ROUTES.customers} hint="All customers. Change = customers created in the last 30 days vs the 30 days before." />
          </Col>
          <Col xs={24} sm={12} lg={8} xxl={4}>
            <StatCard label="Open Tasks" value={stats.openTasks.value} delta={stats.openTasks.delta} icon={ListTodo} to={`${ROUTES.tasks}?f.status=Not%20Started,In%20Progress`} hint="Tasks that are Not Started or In Progress; overdue = due date before today." />
          </Col>
          <Col xs={24} sm={12} lg={8} xxl={4}>
            <StatCard label="Activities (7 Days)" value={stats.engagement.value} delta={stats.engagement.delta} icon={Activity} to={ROUTES.activities} hint="Calls, meetings, emails and tasks logged in the last 7 days, compared with the 7 days before." />
          </Col>
        </Row>
      </section>

      <div className={styles.section}>
        <QuickActions />
      </div>

      <Row gutter={[16, 16]} className={styles.section}>
        <Col xs={24} xl={16}>
          <div className={styles.stack}>
            <ChartCard
              title="Employee Growth"
              description={`Cumulative headcount by joining date · last 12 months${growthDelta > 0 ? ` · +${formatNumber(growthDelta)} employees` : ''}`}
              table={{ columns: ['Month', 'Headcount'], rows: growth.map((point) => [point.fullLabel, point.value]) }}
            >
              <TrendAreaChart data={growth} seriesName="Headcount" height={260} />
            </ChartCard>

            <Row gutter={[16, 16]} className={styles.equalRow}>
              <Col xs={24} md={12}>
                <ChartCard
                  title="Employees by Department"
                  description={pluralize(byDepartment.length, 'department')}
                  table={{ columns: ['Department', 'Employees'], rows: byDepartment.map((row) => [row.label, row.value]) }}
                >
                  <BarBreakdownChart data={byDepartment} seriesName="Employees" />
                </ChartCard>
              </Col>
              <Col xs={24} md={12}>
                <ChartCard title="Employee Status" description="Current status across all employees">
                  <DonutChart data={byStatus} totalLabel="employees" layout="stacked" size={168} />
                </ChartCard>
              </Col>
            </Row>
          </div>
        </Col>

        <Col xs={24} xl={8} className={styles.activityCol}>
          <Card
            className={styles.activityCard}
            title="Recent Activity"
            extra={
              <Link to={ROUTES.activities} className={styles.viewAll}>
                View all
              </Link>
            }
          >
            <ActivityTimeline activities={recentActivities} compact />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
