import { App, Button, Card, Col, Modal, Row, Select, Tag } from 'antd'
import { UserPlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { PersonCell } from '@/components/common/PersonCell'
import { EntityTable } from '@/components/entity/EntityTable'
import { EmptyState } from '@/components/feedback/EmptyState'
import { employeeConfig } from '@/features/employees/config/employeeConfig'
import { useEntityCrud, useEntityList, useEntityRecord } from '@/hooks/useEntityData'
import { useLookups } from '@/hooks/useLookups'
import { getFullName } from '@/utils/format'

/** Employees tab: members of the department, plus bulk-assigning more. */
export function DepartmentEmployees({ departmentId }: { departmentId: string }) {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const lookups = useLookups()
  const employees = useEntityList('employees')
  const crud = useEntityCrud('employees')
  const [assigning, setAssigning] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [paging, setPaging] = useState({ page: 1, pageSize: 10 })

  const members = useMemo(() => employees.filter((employee) => employee.departmentId === departmentId), [departmentId, employees])
  const candidates = useMemo(
    () => employees.filter((employee) => employee.departmentId !== departmentId).map((employee) => ({ value: employee.id, label: `${getFullName(employee)} — ${lookups.departmentName(employee.departmentId)}` })),
    [departmentId, employees, lookups],
  )

  return (
    <Card
      title={`Employees (${members.length})`}
      extra={
        <Button icon={<UserPlus size={16} />} onClick={() => setAssigning(true)}>
          Assign Employees
        </Button>
      }
      styles={{ body: { padding: members.length ? 0 : undefined } }}
    >
      <EntityTable
        config={employeeConfig}
        records={members}
        lookups={lookups}
        hiddenColumns={['department', 'phone', 'employmentType', 'email']}
        onRowClick={(employee) => navigate(`/employees/${employee.id}`)}
        pagination={members.length > 10 ? { ...paging, onChange: (page, pageSize) => setPaging({ page, pageSize }) } : false}
        emptyState={<EmptyState title="No employees in this department" description="Assign employees to build out this department." compact />}
      />
      <Modal
        open={assigning}
        title="Assign employees to department"
        okText="Assign"
        okButtonProps={{ disabled: selected.length === 0 }}
        onCancel={() => setAssigning(false)}
        onOk={() => {
          crud.updateMany(selected, { departmentId })
          message.success(`${selected.length} employee${selected.length === 1 ? '' : 's'} assigned.`)
          setSelected([])
          setAssigning(false)
        }}
        destroyOnHidden
      >
        <Select
          aria-label="Employees to assign"
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="Search employees"
          value={selected}
          onChange={setSelected}
          options={candidates}
          showSearch={{ optionFilterProp: 'label' }}
        />
      </Modal>
    </Card>
  )
}

/** Managers tab: the department head and every employee who manages people. */
export function DepartmentManagers({ departmentId }: { departmentId: string }) {
  const department = useEntityRecord('departments', departmentId)
  const employees = useEntityList('employees')
  const lookups = useLookups()

  const managers = useMemo(() => {
    const inDepartment = employees.filter((employee) => employee.departmentId === departmentId)
    return inDepartment
      .filter((employee) => employee.id === department?.headId || lookups.directReportCount(employee.id) > 0)
      .sort((a, b) => (a.id === department?.headId ? -1 : b.id === department?.headId ? 1 : lookups.directReportCount(b.id) - lookups.directReportCount(a.id)))
  }, [department?.headId, departmentId, employees, lookups])

  if (managers.length === 0) {
    return (
      <Card title="Managers">
        <EmptyState title="No managers yet" description="Set a department head or assign direct reports to employees in this department." compact />
      </Card>
    )
  }

  return (
    <Row gutter={[16, 16]}>
      {managers.map((manager) => (
        <Col key={manager.id} xs={24} md={12} xl={8}>
          <Card size="small">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <PersonCell name={getFullName(manager)} subtitle={manager.jobTitle} to={`/employees/${manager.id}`} size={40} />
              {manager.id === department?.headId && (
                <Tag color="blue" variant="filled">
                  Head
                </Tag>
              )}
            </div>
            <div style={{ marginTop: 12, color: 'var(--app-text-secondary)', fontSize: 13 }}>
              {lookups.directReportCount(manager.id)} direct report{lookups.directReportCount(manager.id) === 1 ? '' : 's'} · {manager.location}
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  )
}

/** Teams tab: teams that belong to the department. */
export function DepartmentTeams({ departmentId }: { departmentId: string }) {
  const teams = useEntityList('teams')
  const lookups = useLookups()
  const navigate = useNavigate()
  const items = useMemo(() => teams.filter((team) => team.departmentId === departmentId), [departmentId, teams])

  return (
    <Card title={`Teams (${items.length})`}>
      {items.length === 0 ? (
        <EmptyState title="No teams in this department" compact actionLabel="Create Team" onAction={() => navigate('/teams?create=1')} />
      ) : (
        <Row gutter={[16, 16]}>
          {items.map((team) => (
            <Col key={team.id} xs={24} md={12}>
              <Card size="small" hoverable onClick={() => navigate(`/teams/${team.id}`)}>
                <div style={{ fontWeight: 600, color: 'var(--app-text-heading)' }}>{team.name}</div>
                <div style={{ color: 'var(--app-text-secondary)', fontSize: 13, margin: '4px 0 8px' }}>{team.description}</div>
                <div style={{ fontSize: 13 }}>
                  Lead: {lookups.employeeName(team.leadId)} · {team.memberIds.length} members
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Card>
  )
}
