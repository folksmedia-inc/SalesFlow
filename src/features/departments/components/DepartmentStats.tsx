import { Card, Col, Row, Statistic } from 'antd'
import { useMemo } from 'react'
import { useParams } from 'react-router'
import { useEntityList } from '@/hooks/useEntityData'
import { formatCurrency } from '@/utils/format'

/** Headline statistics for the department in the current route. */
export function DepartmentStats() {
  const { id } = useParams()
  const employees = useEntityList('employees')
  const teams = useEntityList('teams')
  const tasks = useEntityList('tasks')
  const departments = useEntityList('departments')

  const stats = useMemo(() => {
    const members = employees.filter((employee) => employee.departmentId === id)
    const memberIds = new Set(members.map((employee) => employee.id))
    return {
      headcount: members.length,
      active: members.filter((employee) => employee.status === 'Active').length,
      onLeave: members.filter((employee) => employee.status === 'On Leave').length,
      teams: teams.filter((team) => team.departmentId === id).length,
      openTasks: tasks.filter(
        (task) =>
          (task.status === 'Not Started' || task.status === 'In Progress') &&
          ((task.related?.type === 'department' && task.related.id === id) || (task.assigneeId !== null && memberIds.has(task.assigneeId))),
      ).length,
      budget: departments.find((department) => department.id === id)?.budget ?? 0,
    }
  }, [departments, employees, id, tasks, teams])

  const items = [
    { title: 'Headcount', value: stats.headcount },
    { title: 'Active', value: stats.active },
    { title: 'On Leave', value: stats.onLeave },
    { title: 'Teams', value: stats.teams },
    { title: 'Open Tasks', value: stats.openTasks },
    { title: 'Annual Budget', value: formatCurrency(stats.budget, true) },
  ]

  return (
    <Row gutter={[16, 16]}>
      {items.map((item) => (
        <Col key={item.title} xs={12} md={8} xl={4}>
          <Card size="small">
            <Statistic title={item.title} value={item.value} />
          </Card>
        </Col>
      ))}
    </Row>
  )
}
