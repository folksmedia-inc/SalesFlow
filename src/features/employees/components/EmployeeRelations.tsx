import { Space, Tag } from 'antd'
import { useMemo, type ReactNode } from 'react'
import { Link } from 'react-router'
import { useEntityList } from '@/hooks/useEntityData'

/** Teams the employee belongs to, as links. */
export function EmployeeTeams({ employeeId }: { employeeId: string }) {
  const teams = useEntityList('teams')
  const memberOf = useMemo(() => teams.filter((team) => team.memberIds.includes(employeeId) || team.leadId === employeeId), [employeeId, teams])
  if (memberOf.length === 0) return <span style={{ color: 'var(--app-text-tertiary)' }}>Not on a team</span>
  return (
    <Space size={[4, 4]} wrap>
      {memberOf.map((team) => (
        <Tag key={team.id} variant="filled" color="blue">
          <Link to={`/teams/${team.id}`}>{team.name}</Link>
        </Tag>
      ))}
    </Space>
  )
}

/** Employees who report to this employee. */
export function EmployeeDirectReports({ employeeId }: { employeeId: string }) {
  const employees = useEntityList('employees')
  const reports = useMemo(() => employees.filter((employee) => employee.managerId === employeeId), [employeeId, employees])
  if (reports.length === 0) return <span style={{ color: 'var(--app-text-tertiary)' }}>None</span>
  return (
    <Space size={[4, 4]} wrap>
      {reports.map((employee) => (
        <Link key={employee.id} to={`/employees/${employee.id}`}>
          {employee.firstName} {employee.lastName}
        </Link>
      )).reduce<ReactNode[]>((acc, link, index) => (index === 0 ? [link] : [...acc, ', ', link]), [])}
    </Space>
  )
}
