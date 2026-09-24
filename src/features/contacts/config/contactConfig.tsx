import { Contact as ContactIcon, UserRoundCheck } from 'lucide-react'
import { Link } from 'react-router'
import { z } from 'zod'
import { PersonCell } from '@/components/common/PersonCell'
import { StatusTag } from '@/components/common/StatusTag'
import { defineEntityConfig } from '@/components/entity/types'
import { toOptions } from '@/components/entity/useOptions'
import { optionalPhone, optionalSelect, optionalText, requiredEmail, requiredText } from '@/components/forms/schemaHelpers'
import { ROUTES } from '@/constants/routes'
import { RelatedActivities } from '@/features/activities/components/RelatedActivities'
import { RelatedNotes } from '@/features/notes/components/RelatedNotes'
import { RelatedTasks } from '@/features/tasks/components/RelatedTasks'
import { RECORD_STATUSES } from '@/types/models'
import { formatDate, getFullName } from '@/utils/format'

const contactSchema = z.object({
  firstName: requiredText('First name', 50),
  lastName: requiredText('Last name', 50),
  email: requiredEmail(),
  phone: optionalPhone(),
  accountId: optionalSelect(),
  customerId: optionalSelect(),
  jobTitle: optionalText(80),
  ownerId: optionalSelect(),
  status: z.enum(RECORD_STATUSES, 'Select a status'),
})

export type ContactFormValues = z.infer<typeof contactSchema>

export const contactConfig = defineEntityConfig({
  key: 'contacts',
  label: 'Contacts',
  singular: 'Contact',
  description: 'People you work with at your accounts and customers.',
  basePath: ROUTES.contacts,
  icon: ContactIcon,
  avatar: 'initials',
  formMode: 'drawer',
  getTitle: getFullName,
  getSubtitle: (contact, lookups) => [contact.jobTitle, contact.accountId ? lookups.accountName(contact.accountId) : null].filter(Boolean).join(' at '),
  getStatus: (contact) => contact.status,
  getMeta: (contact) => [<span key="email">{contact.email}</span>, <span key="phone">{contact.phone || 'No phone'}</span>],
  searchText: (contact, lookups) => [getFullName(contact), contact.email, contact.phone, contact.jobTitle, lookups.accountName(contact.accountId)].join(' '),
  defaultSort: { field: 'name', order: 'asc' },
  columns: [
    { key: 'name', title: 'Name', sortable: true, alwaysVisible: true, value: getFullName, render: (contact) => <PersonCell name={getFullName(contact)} to={`${ROUTES.contacts}/${contact.id}`} /> },
    { key: 'email', title: 'Email', sortable: true },
    { key: 'phone', title: 'Phone' },
    {
      key: 'account',
      title: 'Account',
      sortable: true,
      value: (contact, lookups) => lookups.accountName(contact.accountId),
      render: (contact, lookups) => (contact.accountId ? <Link to={`/accounts/${contact.accountId}`} onClick={(event) => event.stopPropagation()}>{lookups.accountName(contact.accountId)}</Link> : '—'),
    },
    { key: 'jobTitle', title: 'Job Title', sortable: true },
    { key: 'owner', title: 'Owner', sortable: true, value: (contact, lookups) => lookups.employeeName(contact.ownerId), render: (contact, lookups) => lookups.employeeName(contact.ownerId) },
    { key: 'status', title: 'Status', sortable: true, render: (contact) => <StatusTag status={contact.status} /> },
    { key: 'createdAt', title: 'Created', sortable: true, defaultHidden: true, render: (contact) => formatDate(contact.createdAt) },
  ],
  filters: [
    { key: 'account', label: 'Account', type: 'select', options: 'accounts', getValue: (contact) => contact.accountId },
    { key: 'owner', label: 'Owner', type: 'select', options: 'employees', getValue: (contact) => contact.ownerId },
    { key: 'status', label: 'Status', type: 'select', options: toOptions(RECORD_STATUSES), getValue: (contact) => contact.status },
  ],
  bulkActions: [
    { key: 'owner', label: 'Assign Owner', icon: UserRoundCheck, kind: 'assign', field: 'ownerId', fieldLabel: 'Owner', options: 'employees' },
    { key: 'account', label: 'Change Account', kind: 'assign', field: 'accountId', fieldLabel: 'Account', options: 'accounts' },
    { key: 'delete', label: 'Delete', kind: 'delete' },
  ],
  statusToggle: { field: 'status', activeValue: 'Active', inactiveValue: 'Inactive', activateLabel: 'Activate', deactivateLabel: 'Deactivate' },
  form: {
    schema: contactSchema,
    defaultValues: { firstName: '', lastName: '', email: '', phone: '', accountId: null, customerId: null, jobTitle: '', ownerId: null, status: 'Active' },
    toValues: (contact) => ({
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      accountId: contact.accountId,
      customerId: contact.customerId,
      jobTitle: contact.jobTitle,
      ownerId: contact.ownerId,
      status: contact.status,
    }),
    toRecord: (values) => values,
    validate: (values, { records, currentId }) => ({
      email: records.some((contact) => contact.id !== currentId && contact.email.toLowerCase() === values.email.toLowerCase()) ? 'A contact with this email already exists' : undefined,
    }),
    sections: [
      {
        title: 'Contact Details',
        fields: [
          { name: 'firstName', label: 'First Name', type: 'text', required: true },
          { name: 'lastName', label: 'Last Name', type: 'text', required: true },
          { name: 'email', label: 'Email', type: 'email', required: true },
          { name: 'phone', label: 'Phone', type: 'phone' },
          { name: 'jobTitle', label: 'Job Title', type: 'text' },
          { name: 'status', label: 'Status', type: 'select', options: toOptions(RECORD_STATUSES), required: true },
        ],
      },
      {
        title: 'Relationships',
        fields: [
          { name: 'accountId', label: 'Account', type: 'select', options: 'accounts' },
          { name: 'customerId', label: 'Customer', type: 'select', options: 'customers' },
          { name: 'ownerId', label: 'Owner', type: 'select', options: 'employees' },
        ],
      },
    ],
  },
  detailSections: [
    {
      title: 'Contact Information',
      fields: [
        { label: 'Email', render: (contact) => <a href={`mailto:${contact.email}`}>{contact.email}</a> },
        { label: 'Phone', render: (contact) => (contact.phone ? <a href={`tel:${contact.phone}`}>{contact.phone}</a> : '—') },
        { label: 'Job Title', render: (contact) => contact.jobTitle || '—' },
        { label: 'Status', render: (contact) => <StatusTag status={contact.status} /> },
        { label: 'Created', render: (contact) => formatDate(contact.createdAt) },
      ],
    },
    {
      title: 'Relationships',
      fields: [
        { label: 'Account', render: (contact, lookups) => (contact.accountId ? <Link to={`/accounts/${contact.accountId}`}>{lookups.accountName(contact.accountId)}</Link> : '—') },
        { label: 'Customer', render: (contact, lookups) => (contact.customerId ? <Link to={`/customers/${contact.customerId}`}>{lookups.name('customers', contact.customerId)}</Link> : '—') },
        { label: 'Owner', render: (contact, lookups) => (contact.ownerId ? <Link to={`/employees/${contact.ownerId}`}>{lookups.employeeName(contact.ownerId)}</Link> : '—') },
      ],
    },
  ],
  detailTabs: (contact) => [
    { key: 'activity', label: 'Activity', children: <RelatedActivities related={{ type: 'contact', id: contact.id }} /> },
    { key: 'tasks', label: 'Tasks', children: <RelatedTasks related={{ type: 'contact', id: contact.id }} /> },
    { key: 'notes', label: 'Notes', children: <RelatedNotes related={{ type: 'contact', id: contact.id }} /> },
  ],
})
