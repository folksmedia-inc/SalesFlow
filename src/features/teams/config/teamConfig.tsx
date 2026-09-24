import { Avatar, Tooltip } from 'antd'
import { UsersRound } from 'lucide-react'
import { Link } from 'react-router'
import { z } from 'zod'
import { PersonCell } from '@/components/common/PersonCell'
import { StatusTag } from '@/components/common/StatusTag'
import { defineEntityConfig } from '@/components/entity/types'
import { toOptions } from '@/components/entity/useOptions'
import { optionalSelect, optionalText, requiredText } from '@/components/forms/schemaHelpers'
import { ROUTES } from '@/constants/routes'
import { RelatedActivities } from '@/features/activities/components/RelatedActivities'
import { RelatedTasks } from '@/features/tasks/components/RelatedTasks'
import { RECORD_STATUSES } from '@/types/models'
import { avatarColor } from '@/utils/avatar'
import { formatDate, getInitials } from '@/utils/format'
import { TeamMembers } from '../components/TeamMembers'

const teamSchema = z.object({
  name: requiredText('Team name', 60),
  departmentId: optionalSelect(),
  leadId: optionalSelect(),
  memberIds: z.array(z.string()),
  status: z.enum(RECORD_STATUSES, 'Select a status'),
  description: optionalText(300),
})

export type TeamFormValues = z.infer<typeof teamSchema>

export const teamConfig = defineEntityConfig({
  key: 'teams',
  label: 'Teams',
  singular: 'Team',
  description: 'Cross-functional groups, their leads and members.',
  basePath: ROUTES.teams,
  icon: UsersRound,
  formMode: 'drawer',
  getTitle: (team) => team.name,
  getSubtitle: (team) => team.description,
  getStatus: (team) => team.status,
  getMeta: (team, lookups) => [
    <span key="dept">{lookups.departmentName(team.departmentId)}</span>,
    <span key="lead">Lead: {lookups.employeeName(team.leadId)}</span>,
    <span key="members">{team.memberIds.length} members</span>,
  ],
  searchText: (team, lookups) => [team.name, team.description, lookups.departmentName(team.departmentId), lookups.employeeName(team.leadId)].join(' '),
  defaultSort: { field: 'name', order: 'asc' },
  columns: [
    {
      key: 'name',
      title: 'Team Name',
      sortable: true,
      alwaysVisible: true,
      render: (team) => (
        <Link to={`${ROUTES.teams}/${team.id}`} style={{ fontWeight: 500 }} onClick={(event) => event.stopPropagation()}>
          {team.name}
        </Link>
      ),
    },
    {
      key: 'lead',
      title: 'Team Lead',
      sortable: true,
      value: (team, lookups) => lookups.employeeName(team.leadId),
      render: (team, lookups) => (team.leadId ? <PersonCell name={lookups.employeeName(team.leadId)} to={`/employees/${team.leadId}`} size={24} /> : '—'),
    },
    { key: 'department', title: 'Department', sortable: true, value: (team, lookups) => lookups.departmentName(team.departmentId), render: (team, lookups) => lookups.departmentName(team.departmentId) },
    {
      key: 'members',
      title: 'Members',
      sortable: true,
      value: (team) => team.memberIds.length,
      render: (team, lookups) => (
        <Avatar.Group max={{ count: 4, style: { background: 'var(--app-color-primary-bg)', color: 'var(--app-color-primary)' } }} size={28}>
          {team.memberIds.map((memberId) => {
            const name = lookups.employeeName(memberId)
            return (
              <Tooltip key={memberId} title={name}>
                <Avatar style={{ background: avatarColor(name) }}>{getInitials(name)}</Avatar>
              </Tooltip>
            )
          })}
        </Avatar.Group>
      ),
    },
    { key: 'status', title: 'Status', sortable: true, render: (team) => <StatusTag status={team.status} /> },
    { key: 'createdAt', title: 'Created', sortable: true, defaultHidden: true, render: (team) => formatDate(team.createdAt) },
  ],
  filters: [
    { key: 'department', label: 'Department', type: 'select', options: 'departments', getValue: (team) => team.departmentId },
    { key: 'status', label: 'Status', type: 'select', options: toOptions(RECORD_STATUSES), getValue: (team) => team.status },
    { key: 'member', label: 'Member', type: 'select', options: 'employees', getValue: (team) => team.memberIds },
  ],
  statusToggle: { field: 'status', activeValue: 'Active', inactiveValue: 'Inactive', activateLabel: 'Activate', deactivateLabel: 'Deactivate' },
  form: {
    schema: teamSchema,
    defaultValues: { name: '', departmentId: null, leadId: null, memberIds: [], status: 'Active', description: '' },
    toValues: (team) => ({ name: team.name, departmentId: team.departmentId, leadId: team.leadId, memberIds: team.memberIds, status: team.status, description: team.description }),
    // The lead is always a member of the team.
    toRecord: (values) => ({ ...values, memberIds: values.leadId && !values.memberIds.includes(values.leadId) ? [values.leadId, ...values.memberIds] : values.memberIds }),
    validate: (values, { records, currentId }) => ({
      name: records.some((team) => team.id !== currentId && team.name.toLowerCase() === values.name.toLowerCase()) ? 'A team with this name already exists' : undefined,
    }),
    sections: [
      {
        title: 'Team Information',
        fields: [
          { name: 'name', label: 'Team Name', type: 'text', required: true },
          { name: 'departmentId', label: 'Department', type: 'select', options: 'departments' },
          { name: 'leadId', label: 'Team Lead', type: 'select', options: 'employees' },
          { name: 'status', label: 'Status', type: 'select', options: toOptions(RECORD_STATUSES), required: true },
          { name: 'memberIds', label: 'Members', type: 'multiselect', options: 'employees', span: 'full' },
          { name: 'description', label: 'Description', type: 'textarea', span: 'full' },
        ],
      },
    ],
  },
  detailSections: [
    {
      title: 'Team Information',
      fields: [
        { label: 'Department', render: (team, lookups) => (team.departmentId ? <Link to={`/departments/${team.departmentId}`}>{lookups.departmentName(team.departmentId)}</Link> : '—') },
        { label: 'Team Lead', render: (team, lookups) => (team.leadId ? <Link to={`/employees/${team.leadId}`}>{lookups.employeeName(team.leadId)}</Link> : '—') },
        { label: 'Members', render: (team) => team.memberIds.length },
        { label: 'Status', render: (team) => <StatusTag status={team.status} /> },
        { label: 'Created', render: (team) => formatDate(team.createdAt) },
        { label: 'Description', span: 'filled', render: (team) => team.description || '—' },
      ],
    },
  ],
  detailTabs: (team) => [
    { key: 'members', label: 'Members', children: <TeamMembers team={team} /> },
    { key: 'tasks', label: 'Tasks', children: <RelatedTasks related={{ type: 'team', id: team.id }} /> },
    { key: 'activity', label: 'Activity', children: <RelatedActivities related={{ type: 'team', id: team.id }} /> },
  ],
})
