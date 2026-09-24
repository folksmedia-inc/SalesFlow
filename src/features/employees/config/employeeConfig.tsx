import dayjs from 'dayjs'
import { Building2, CheckCircle2, UserRoundCheck, Users, XCircle } from 'lucide-react'
import { Link } from 'react-router'
import { z } from 'zod'
import { PersonCell } from '@/components/common/PersonCell'
import { StatusTag } from '@/components/common/StatusTag'
import { defineEntityConfig } from '@/components/entity/types'
import { toOptions } from '@/components/entity/useOptions'
import { ROUTES } from '@/constants/routes'
import { RelatedActivities } from '@/features/activities/components/RelatedActivities'
import { RelatedDocuments } from '@/features/documents/components/RelatedDocuments'
import { RelatedNotes } from '@/features/notes/components/RelatedNotes'
import { RelatedTasks } from '@/features/tasks/components/RelatedTasks'
import { EMPLOYEE_STATUSES, EMPLOYMENT_TYPES, GENDERS, LOCATIONS } from '@/types/models'
import { formatDate, getFullName } from '@/utils/format'
import { EmployeePermissions } from '../components/EmployeePermissions'
import { EmployeeDirectReports, EmployeeTeams } from '../components/EmployeeRelations'

const optionalText = (max: number) => z.string().trim().max(max, `Must be ${max} characters or fewer`)
const PHONE_PATTERN = /^\+?[\d\s().-]{7,20}$/

const employeeSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(50, 'Must be 50 characters or fewer'),
  lastName: z.string().trim().min(1, 'Last name is required').max(50, 'Must be 50 characters or fewer'),
  email: z.string().trim().min(1, 'Email is required').pipe(z.email('Enter a valid email address')),
  phone: z.string().trim().refine((value) => value === '' || PHONE_PATTERN.test(value), 'Enter a valid phone number'),
  dateOfBirth: z
    .string()
    .nullable()
    .refine((value) => !value || dayjs().diff(dayjs(value), 'year') >= 16, 'Employee must be at least 16 years old'),
  gender: z.enum(GENDERS).nullable(),
  employeeId: z.string().trim().min(1, 'Employee ID is required').regex(/^EMP-\d{4,6}$/, 'Use the format EMP-12345'),
  jobTitle: z.string().trim().min(1, 'Job title is required').max(80, 'Must be 80 characters or fewer'),
  departmentId: z.string('Department is required').min(1, 'Department is required'),
  managerId: z.string().nullable(),
  employmentType: z.enum(EMPLOYMENT_TYPES, 'Select an employment type'),
  joiningDate: z.string('Joining date is required').min(1, 'Joining date is required'),
  location: z.string('Location is required').min(1, 'Location is required'),
  status: z.enum(EMPLOYEE_STATUSES, 'Select a status'),
  roleId: z.string().nullable(),
  address: optionalText(120),
  city: optionalText(60),
  state: optionalText(60),
  country: optionalText(60),
  postalCode: optionalText(12),
})

export type EmployeeFormValues = z.infer<typeof employeeSchema>

export const employeeConfig = defineEntityConfig({
  key: 'employees',
  label: 'Employees',
  singular: 'Employee',
  description: 'Manage your workforce — profiles, reporting lines and employment details.',
  basePath: ROUTES.employees,
  icon: Users,
  avatar: 'initials',
  formMode: 'page',
  getTitle: getFullName,
  getSubtitle: (employee) => employee.jobTitle,
  getStatus: (employee) => employee.status,
  getMeta: (employee, lookups) => [
    <span key="id">Employee ID: {employee.employeeId}</span>,
    <span key="dept">{lookups.departmentName(employee.departmentId)}</span>,
    <span key="loc">{employee.location}</span>,
    <span key="joined">Joined {formatDate(employee.joiningDate)}</span>,
  ],
  searchText: (employee, lookups) =>
    [employee.employeeId, getFullName(employee), employee.email, employee.phone, employee.jobTitle, employee.location, lookups.departmentName(employee.departmentId)].join(' '),
  defaultSort: { field: 'name', order: 'asc' },
  columns: [
    { key: 'employeeId', title: 'Employee ID', sortable: true, width: 120 },
    {
      key: 'name',
      title: 'Name',
      sortable: true,
      alwaysVisible: true,
      value: getFullName,
      render: (employee) => <PersonCell name={getFullName(employee)} to={`${ROUTES.employees}/${employee.id}`} />,
    },
    { key: 'email', title: 'Email', sortable: true },
    { key: 'phone', title: 'Phone' },
    { key: 'department', title: 'Department', sortable: true, value: (employee, lookups) => lookups.departmentName(employee.departmentId), render: (employee, lookups) => lookups.departmentName(employee.departmentId) },
    { key: 'jobTitle', title: 'Job Title', sortable: true },
    { key: 'manager', title: 'Manager', sortable: true, value: (employee, lookups) => lookups.employeeName(employee.managerId), render: (employee, lookups) => lookups.employeeName(employee.managerId) },
    { key: 'location', title: 'Location', sortable: true },
    { key: 'status', title: 'Status', sortable: true, render: (employee) => <StatusTag status={employee.status} /> },
    { key: 'joiningDate', title: 'Joining Date', sortable: true, render: (employee) => formatDate(employee.joiningDate) },
    { key: 'employmentType', title: 'Employment Type', sortable: true, defaultHidden: true },
  ],
  filters: [
    { key: 'department', label: 'Department', type: 'select', options: 'departments', getValue: (employee) => employee.departmentId },
    { key: 'status', label: 'Status', type: 'select', options: toOptions(EMPLOYEE_STATUSES), getValue: (employee) => employee.status },
    { key: 'jobTitle', label: 'Job Title', type: 'select', options: 'distinct', getValue: (employee) => employee.jobTitle },
    { key: 'location', label: 'Location', type: 'select', options: toOptions(LOCATIONS), getValue: (employee) => employee.location },
    { key: 'joiningDate', label: 'Joined', type: 'dateRange', getValue: (employee) => employee.joiningDate },
  ],
  bulkActions: [
    { key: 'activate', label: 'Activate', icon: CheckCircle2, kind: 'update', changes: { status: 'Active' } },
    { key: 'deactivate', label: 'Deactivate', icon: XCircle, kind: 'update', changes: { status: 'Inactive' } },
    { key: 'department', label: 'Change Department', icon: Building2, kind: 'assign', field: 'departmentId', fieldLabel: 'Department', options: 'departments' },
    { key: 'manager', label: 'Assign Manager', icon: UserRoundCheck, kind: 'assign', field: 'managerId', fieldLabel: 'Manager', options: 'employees' },
    { key: 'delete', label: 'Delete', kind: 'delete' },
  ],
  statusToggle: { field: 'status', activeValue: 'Active', inactiveValue: 'Inactive', activateLabel: 'Activate', deactivateLabel: 'Deactivate' },
  form: {
    schema: employeeSchema,
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: null,
      gender: null,
      employeeId: '',
      jobTitle: '',
      departmentId: '',
      managerId: null,
      employmentType: 'Full-time',
      joiningDate: dayjs().format('YYYY-MM-DD'),
      location: '',
      status: 'Active',
      roleId: 'rol_employee',
      address: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
    },
    getDefaults: ({ records }) => {
      const highest = records.reduce((max, employee) => Math.max(max, Number(employee.employeeId.replace(/\D/g, '')) || 0), 10200)
      return { employeeId: `EMP-${highest + 1}` }
    },
    toValues: (employee) => ({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone,
      dateOfBirth: employee.dateOfBirth,
      gender: employee.gender,
      employeeId: employee.employeeId,
      jobTitle: employee.jobTitle,
      departmentId: employee.departmentId ?? '',
      managerId: employee.managerId,
      employmentType: employee.employmentType,
      joiningDate: employee.joiningDate,
      location: employee.location,
      status: employee.status,
      roleId: employee.roleId,
      address: employee.address,
      city: employee.city,
      state: employee.state,
      country: employee.country,
      postalCode: employee.postalCode,
    }),
    toRecord: (values) => ({ ...values, departmentId: values.departmentId || null }),
    validate: (values, { records, currentId }) => {
      const others = records.filter((employee) => employee.id !== currentId)
      return {
        email: others.some((employee) => employee.email.toLowerCase() === values.email.toLowerCase()) ? 'Another employee already uses this email' : undefined,
        employeeId: others.some((employee) => employee.employeeId === values.employeeId) ? 'This employee ID is already taken' : undefined,
        managerId: currentId && values.managerId === currentId ? 'An employee cannot be their own manager' : undefined,
      }
    },
    sections: [
      {
        title: 'Personal Information',
        fields: [
          { name: 'firstName', label: 'First Name', type: 'text', required: true },
          { name: 'lastName', label: 'Last Name', type: 'text', required: true },
          { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'name@company.com' },
          { name: 'phone', label: 'Phone', type: 'phone', placeholder: '+1 (555) 123-4567' },
          { name: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
          { name: 'gender', label: 'Gender', type: 'select', options: toOptions(GENDERS) },
        ],
      },
      {
        title: 'Employment',
        fields: [
          { name: 'employeeId', label: 'Employee ID', type: 'text', required: true, span: 'third', help: 'Format: EMP-12345' },
          { name: 'jobTitle', label: 'Job Title', type: 'text', required: true, span: 'third' },
          { name: 'employmentType', label: 'Employment Type', type: 'select', required: true, options: toOptions(EMPLOYMENT_TYPES), span: 'third' },
          { name: 'departmentId', label: 'Department', type: 'select', required: true, options: 'departments', span: 'third' },
          { name: 'managerId', label: 'Manager', type: 'select', options: 'employees', span: 'third' },
          { name: 'roleId', label: 'System Role', type: 'select', options: 'roles', span: 'third' },
          { name: 'joiningDate', label: 'Joining Date', type: 'date', required: true, span: 'third' },
          { name: 'location', label: 'Location', type: 'select', required: true, options: toOptions(LOCATIONS), span: 'third' },
          { name: 'status', label: 'Status', type: 'select', required: true, options: toOptions(EMPLOYEE_STATUSES), span: 'third' },
        ],
      },
      {
        title: 'Address',
        fields: [
          { name: 'address', label: 'Address', type: 'text', span: 'full' },
          { name: 'city', label: 'City', type: 'text', span: 'third' },
          { name: 'state', label: 'State / Province', type: 'text', span: 'third' },
          { name: 'postalCode', label: 'Postal Code', type: 'text', span: 'third' },
          { name: 'country', label: 'Country', type: 'text' },
        ],
      },
    ],
  },
  detailSections: [
    {
      title: 'Personal Information',
      fields: [
        { label: 'First Name', render: (employee) => employee.firstName },
        { label: 'Last Name', render: (employee) => employee.lastName },
        { label: 'Date of Birth', render: (employee) => formatDate(employee.dateOfBirth) },
        { label: 'Gender', render: (employee) => employee.gender ?? '—' },
      ],
    },
    {
      title: 'Contact Information',
      fields: [
        { label: 'Email', render: (employee) => <a href={`mailto:${employee.email}`}>{employee.email}</a> },
        { label: 'Phone', render: (employee) => (employee.phone ? <a href={`tel:${employee.phone}`}>{employee.phone}</a> : '—') },
        {
          label: 'Address',
          render: (employee) => [employee.address, employee.city, [employee.state, employee.postalCode].filter(Boolean).join(' '), employee.country].filter(Boolean).join(', ') || '—',
        },
      ],
    },
    {
      title: 'Employment Information',
      fields: [
        { label: 'Employee ID', render: (employee) => employee.employeeId },
        { label: 'Job Title', render: (employee) => employee.jobTitle },
        { label: 'Employment Type', render: (employee) => employee.employmentType },
        { label: 'Joining Date', render: (employee) => formatDate(employee.joiningDate) },
        { label: 'Tenure', render: (employee) => dayjs(employee.joiningDate).fromNow(true) },
        { label: 'Status', render: (employee) => <StatusTag status={employee.status} /> },
      ],
    },
    {
      title: 'Organization Information',
      fields: [
        { label: 'Department', render: (employee, lookups) => (employee.departmentId ? <Link to={`/departments/${employee.departmentId}`}>{lookups.departmentName(employee.departmentId)}</Link> : '—') },
        { label: 'Manager', render: (employee, lookups) => (employee.managerId ? <Link to={`/employees/${employee.managerId}`}>{lookups.employeeName(employee.managerId)}</Link> : '—') },
        { label: 'Location', render: (employee) => employee.location },
        { label: 'Teams', render: (employee) => <EmployeeTeams employeeId={employee.id} /> },
        { label: 'Direct Reports', span: 'filled', render: (employee) => <EmployeeDirectReports employeeId={employee.id} /> },
      ],
    },
  ],
  detailTabs: (employee) => [
    { key: 'activity', label: 'Activity', children: <RelatedActivities related={{ type: 'employee', id: employee.id }} /> },
    { key: 'tasks', label: 'Tasks', children: <RelatedTasks related={{ type: 'employee', id: employee.id }} assigneeId={employee.id} title="Assigned & related tasks" /> },
    { key: 'documents', label: 'Documents', children: <RelatedDocuments related={{ type: 'employee', id: employee.id }} /> },
    { key: 'notes', label: 'Notes', children: <RelatedNotes related={{ type: 'employee', id: employee.id }} /> },
    { key: 'permissions', label: 'Permissions', children: <EmployeePermissions employee={employee} /> },
  ],
})
