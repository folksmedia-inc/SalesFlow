import { Layers } from 'lucide-react'
import { Link } from 'react-router'
import { z } from 'zod'
import { PersonCell } from '@/components/common/PersonCell'
import { StatusTag } from '@/components/common/StatusTag'
import { defineEntityConfig } from '@/components/entity/types'
import { toOptions } from '@/components/entity/useOptions'
import { nonNegativeNumber, optionalSelect, optionalText, requiredSelect, requiredText } from '@/components/forms/schemaHelpers'
import { ROUTES } from '@/constants/routes'
import { RelatedDocuments } from '@/features/documents/components/RelatedDocuments'
import { RelatedTasks } from '@/features/tasks/components/RelatedTasks'
import { LOCATIONS, RECORD_STATUSES } from '@/types/models'
import { formatCurrency, formatDate } from '@/utils/format'
import { DepartmentEmployees, DepartmentManagers, DepartmentTeams } from '../components/DepartmentPeople'

const departmentSchema = z.object({
  name: requiredText('Department name', 60),
  code: requiredText('Code', 6).regex(/^[A-Z]{2,6}$/, 'Use 2–6 uppercase letters'),
  headId: optionalSelect(),
  location: requiredSelect('Location'),
  status: z.enum(RECORD_STATUSES, 'Select a status'),
  budget: nonNegativeNumber('Budget'),
  description: optionalText(300),
})

export type DepartmentFormValues = z.infer<typeof departmentSchema>

export const departmentConfig = defineEntityConfig({
  key: 'departments',
  label: 'Departments',
  singular: 'Department',
  description: 'Organizational units, their leadership and headcount.',
  basePath: ROUTES.departments,
  icon: Layers,
  formMode: 'drawer',
  getTitle: (department) => department.name,
  getSubtitle: (department) => department.description,
  getStatus: (department) => department.status,
  getMeta: (department, lookups) => [
    <span key="code">Code: {department.code}</span>,
    <span key="head">Head: {lookups.employeeName(department.headId)}</span>,
    <span key="loc">{department.location}</span>,
  ],
  searchText: (department, lookups) => [department.name, department.code, department.location, lookups.employeeName(department.headId)].join(' '),
  defaultSort: { field: 'name', order: 'asc' },
  columns: [
    {
      key: 'name',
      title: 'Department Name',
      sortable: true,
      alwaysVisible: true,
      render: (department) => (
        <span>
          <Link to={`${ROUTES.departments}/${department.id}`} style={{ fontWeight: 500 }} onClick={(event) => event.stopPropagation()}>
            {department.name}
          </Link>
          <span style={{ marginLeft: 8, color: 'var(--app-text-tertiary)', fontSize: 12 }}>{department.code}</span>
        </span>
      ),
    },
    {
      key: 'head',
      title: 'Department Head',
      sortable: true,
      value: (department, lookups) => lookups.employeeName(department.headId),
      render: (department, lookups) => (department.headId ? <PersonCell name={lookups.employeeName(department.headId)} to={`/employees/${department.headId}`} size={24} /> : '—'),
    },
    { key: 'headcount', title: 'Number of Employees', sortable: true, align: 'right', value: (department, lookups) => lookups.departmentHeadcount(department.id), render: (department, lookups) => lookups.departmentHeadcount(department.id) },
    { key: 'location', title: 'Location', sortable: true },
    { key: 'status', title: 'Status', sortable: true, render: (department) => <StatusTag status={department.status} /> },
    { key: 'budget', title: 'Budget', sortable: true, align: 'right', defaultHidden: true, render: (department) => formatCurrency(department.budget, true) },
    { key: 'createdAt', title: 'Created Date', sortable: true, render: (department) => formatDate(department.createdAt) },
  ],
  filters: [
    { key: 'status', label: 'Status', type: 'select', options: toOptions(RECORD_STATUSES), getValue: (department) => department.status },
    { key: 'location', label: 'Location', type: 'select', options: toOptions(LOCATIONS), getValue: (department) => department.location },
  ],
  statusToggle: { field: 'status', activeValue: 'Active', inactiveValue: 'Inactive', activateLabel: 'Activate', deactivateLabel: 'Deactivate' },
  form: {
    schema: departmentSchema,
    defaultValues: { name: '', code: '', headId: null, location: '', status: 'Active', budget: 0, description: '' },
    toValues: (department) => ({
      name: department.name,
      code: department.code,
      headId: department.headId,
      location: department.location,
      status: department.status,
      budget: department.budget,
      description: department.description,
    }),
    toRecord: (values) => values,
    validate: (values, { records, currentId }) => {
      const others = records.filter((department) => department.id !== currentId)
      return {
        name: others.some((department) => department.name.toLowerCase() === values.name.toLowerCase()) ? 'A department with this name already exists' : undefined,
        code: others.some((department) => department.code === values.code) ? 'This code is already in use' : undefined,
      }
    },
    sections: [
      {
        title: 'Department Information',
        fields: [
          { name: 'name', label: 'Department Name', type: 'text', required: true },
          { name: 'code', label: 'Code', type: 'text', required: true, placeholder: 'e.g. ENG', help: '2–6 uppercase letters' },
          { name: 'headId', label: 'Department Head', type: 'select', options: 'employees' },
          { name: 'location', label: 'Location', type: 'select', options: toOptions(LOCATIONS), required: true },
          { name: 'status', label: 'Status', type: 'select', options: toOptions(RECORD_STATUSES), required: true },
          { name: 'budget', label: 'Annual Budget', type: 'currency', min: 0 },
          { name: 'description', label: 'Description', type: 'textarea', span: 'full' },
        ],
      },
    ],
  },
  detailSections: [
    {
      title: 'Department Information',
      fields: [
        { label: 'Name', render: (department) => department.name },
        { label: 'Code', render: (department) => department.code },
        { label: 'Department Head', render: (department, lookups) => (department.headId ? <Link to={`/employees/${department.headId}`}>{lookups.employeeName(department.headId)}</Link> : '—') },
        { label: 'Location', render: (department) => department.location },
        { label: 'Status', render: (department) => <StatusTag status={department.status} /> },
        { label: 'Created', render: (department) => formatDate(department.createdAt) },
        { label: 'Description', span: 'filled', render: (department) => department.description || '—' },
      ],
    },
  ],
  detailTabs: (department) => [
    { key: 'employees', label: 'Employees', children: <DepartmentEmployees departmentId={department.id} /> },
    { key: 'managers', label: 'Managers', children: <DepartmentManagers departmentId={department.id} /> },
    { key: 'teams', label: 'Teams', children: <DepartmentTeams departmentId={department.id} /> },
    { key: 'tasks', label: 'Tasks', children: <RelatedTasks related={{ type: 'department', id: department.id }} /> },
    { key: 'documents', label: 'Documents', children: <RelatedDocuments related={{ type: 'department', id: department.id }} /> },
  ],
})
