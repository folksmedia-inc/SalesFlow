import { App, Button, Card, Select, Space, Tag, Tooltip } from 'antd'
import { Crown, UserMinus, UserPlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { PersonCell } from '@/components/common/PersonCell'
import { StatusTag } from '@/components/common/StatusTag'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useConfirmDelete } from '@/hooks/useConfirmDelete'
import { useEntityCrud, useEntityList } from '@/hooks/useEntityData'
import { useLookups } from '@/hooks/useLookups'
import type { Team } from '@/types/models'
import { getFullName } from '@/utils/format'
import styles from './TeamMembers.module.scss'

/** Add/remove team members and choose the team lead. */
export function TeamMembers({ team }: { team: Team }) {
  const { message, modal } = App.useApp()
  const employees = useEntityList('employees')
  const crud = useEntityCrud('teams')
  const lookups = useLookups()
  const confirmDelete = useConfirmDelete()
  const [toAdd, setToAdd] = useState<string[]>([])

  const members = useMemo(() => employees.filter((employee) => team.memberIds.includes(employee.id)), [employees, team.memberIds])
  const candidates = useMemo(
    () => employees.filter((employee) => !team.memberIds.includes(employee.id)).map((employee) => ({ value: employee.id, label: `${getFullName(employee)} · ${employee.jobTitle}` })),
    [employees, team.memberIds],
  )

  const addMembers = () => {
    crud.update(team.id, { memberIds: [...team.memberIds, ...toAdd] })
    message.success(`${toAdd.length} member${toAdd.length === 1 ? '' : 's'} added to ${team.name}.`)
    setToAdd([])
  }

  const removeMember = (employeeId: string) => {
    confirmDelete({
      entityLabel: 'team member',
      name: `${lookups.employeeName(employeeId)} from ${team.name}`,
      onConfirm: () => {
        crud.update(team.id, { memberIds: team.memberIds.filter((id) => id !== employeeId), leadId: team.leadId === employeeId ? null : team.leadId })
        message.success('Member removed.')
      },
    })
  }

  const makeLead = (employeeId: string) =>
    modal.confirm({
      title: 'Change team lead?',
      content: `${lookups.employeeName(employeeId)} will become the lead of ${team.name}.`,
      okText: 'Make Lead',
      onOk: () => {
        crud.update(team.id, { leadId: employeeId })
        message.success('Team lead updated.')
      },
    })

  return (
    <Card title={`Members (${members.length})`}>
      <div className={styles.addRow}>
        <Select
          aria-label="Employees to add"
          mode="multiple"
          placeholder="Add employees to this team"
          value={toAdd}
          onChange={setToAdd}
          options={candidates}
          showSearch={{ optionFilterProp: 'label' }}
          maxTagCount="responsive"
          className={styles.select}
        />
        <Button type="primary" icon={<UserPlus size={16} />} disabled={toAdd.length === 0} onClick={addMembers}>
          Add Members
        </Button>
      </div>

      {members.length === 0 ? (
        <EmptyState title="No members yet" description="Add employees to this team using the field above." compact />
      ) : (
        <ul className={styles.list}>
          {members.map((member) => (
            <li key={member.id} className={styles.member}>
              <PersonCell name={getFullName(member)} subtitle={`${member.jobTitle} · ${lookups.departmentName(member.departmentId)}`} to={`/employees/${member.id}`} size={36} />
              <Space size={8} className={styles.memberActions}>
                {team.leadId === member.id ? (
                  <Tag color="gold" variant="filled" icon={<Crown size={12} style={{ marginRight: 4 }} />}>
                    Team Lead
                  </Tag>
                ) : (
                  <Tooltip title="Make team lead">
                    <Button type="text" size="small" icon={<Crown size={16} />} aria-label={`Make ${getFullName(member)} team lead`} onClick={() => makeLead(member.id)} />
                  </Tooltip>
                )}
                <StatusTag status={member.status} />
                <Tooltip title="Remove from team">
                  <Button type="text" size="small" danger icon={<UserMinus size={16} />} aria-label={`Remove ${getFullName(member)}`} onClick={() => removeMember(member.id)} />
                </Tooltip>
              </Space>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
