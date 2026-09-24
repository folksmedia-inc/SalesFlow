import { Briefcase, Flag, UserRoundCheck } from 'lucide-react'
import { Link } from 'react-router'
import { z } from 'zod'
import { PersonCell } from '@/components/common/PersonCell'
import { StatusTag } from '@/components/common/StatusTag'
import { defineEntityConfig } from '@/components/entity/types'
import { toOptions } from '@/components/entity/useOptions'
import { nonNegativeNumber, optionalPhone, optionalSelect, optionalText, optionalUrl, requiredEmail, requiredText } from '@/components/forms/schemaHelpers'
import { ROUTES } from '@/constants/routes'
import { RelatedActivities } from '@/features/activities/components/RelatedActivities'
import { RelatedDocuments } from '@/features/documents/components/RelatedDocuments'
import { RelatedNotes } from '@/features/notes/components/RelatedNotes'
import { RelatedTasks } from '@/features/tasks/components/RelatedTasks'
import { CUSTOMER_STATUSES, INDUSTRIES } from '@/types/models'
import { formatCurrency, formatDate } from '@/utils/format'
import { CustomerContacts } from '../components/CustomerContacts'

const customerSchema = z.object({
  name: requiredText('Customer name', 80),
  company: requiredText('Company', 100),
  email: requiredEmail(),
  phone: optionalPhone(),
  industry: z.enum(INDUSTRIES, 'Select an industry'),
  ownerId: optionalSelect(),
  accountId: optionalSelect(),
  status: z.enum(CUSTOMER_STATUSES, 'Select a status'),
  website: optionalUrl(),
  city: optionalText(60),
  country: optionalText(60),
  lifetimeValue: nonNegativeNumber('Lifetime value'),
})

export type CustomerFormValues = z.infer<typeof customerSchema>

export const customerConfig = defineEntityConfig({
  key: 'customers',
  label: 'Customers',
  singular: 'Customer',
  description: 'Track leads, prospects and active customers through your pipeline.',
  basePath: ROUTES.customers,
  icon: Briefcase,
  avatar: 'initials',
  formMode: 'page',
  getTitle: (customer) => customer.name,
  getSubtitle: (customer) => customer.company,
  getStatus: (customer) => customer.status,
  getMeta: (customer, lookups) => [
    <span key="industry">{customer.industry}</span>,
    <span key="owner">Owner: {lookups.employeeName(customer.ownerId)}</span>,
    <span key="ltv">Lifetime value: {formatCurrency(customer.lifetimeValue)}</span>,
  ],
  searchText: (customer, lookups) => [customer.name, customer.company, customer.email, customer.phone, customer.industry, lookups.employeeName(customer.ownerId)].join(' '),
  defaultSort: { field: 'createdAt', order: 'desc' },
  columns: [
    {
      key: 'name',
      title: 'Customer',
      sortable: true,
      alwaysVisible: true,
      render: (customer) => <PersonCell name={customer.name} subtitle={customer.email} to={`${ROUTES.customers}/${customer.id}`} />,
    },
    { key: 'company', title: 'Company', sortable: true },
    { key: 'email', title: 'Email', sortable: true, defaultHidden: true },
    { key: 'phone', title: 'Phone' },
    { key: 'industry', title: 'Industry', sortable: true },
    { key: 'owner', title: 'Owner', sortable: true, value: (customer, lookups) => lookups.employeeName(customer.ownerId), render: (customer, lookups) => lookups.employeeName(customer.ownerId) },
    { key: 'status', title: 'Status', sortable: true, render: (customer) => <StatusTag status={customer.status} /> },
    { key: 'lifetimeValue', title: 'Lifetime Value', sortable: true, align: 'right', defaultHidden: true, render: (customer) => formatCurrency(customer.lifetimeValue) },
    { key: 'createdAt', title: 'Created Date', sortable: true, render: (customer) => formatDate(customer.createdAt) },
  ],
  filters: [
    { key: 'industry', label: 'Industry', type: 'select', options: toOptions(INDUSTRIES), getValue: (customer) => customer.industry },
    { key: 'status', label: 'Status', type: 'select', options: toOptions(CUSTOMER_STATUSES), getValue: (customer) => customer.status },
    { key: 'owner', label: 'Owner', type: 'select', options: 'employees', getValue: (customer) => customer.ownerId },
  ],
  bulkActions: [
    { key: 'status', label: 'Change Status', icon: Flag, kind: 'assign', field: 'status', fieldLabel: 'Status', options: toOptions(CUSTOMER_STATUSES) },
    { key: 'owner', label: 'Assign Owner', icon: UserRoundCheck, kind: 'assign', field: 'ownerId', fieldLabel: 'Owner', options: 'employees' },
    { key: 'delete', label: 'Delete', kind: 'delete' },
  ],
  form: {
    schema: customerSchema,
    defaultValues: { name: '', company: '', email: '', phone: '', industry: 'Technology', ownerId: null, accountId: null, status: 'Lead', website: '', city: '', country: '', lifetimeValue: 0 },
    toValues: (customer) => ({
      name: customer.name,
      company: customer.company,
      email: customer.email,
      phone: customer.phone,
      industry: customer.industry,
      ownerId: customer.ownerId,
      accountId: customer.accountId,
      status: customer.status,
      website: customer.website,
      city: customer.city,
      country: customer.country,
      lifetimeValue: customer.lifetimeValue,
    }),
    toRecord: (values) => values,
    validate: (values, { records, currentId }) => ({
      email: records.some((customer) => customer.id !== currentId && customer.email.toLowerCase() === values.email.toLowerCase()) ? 'A customer with this email already exists' : undefined,
    }),
    sections: [
      {
        title: 'Customer Information',
        fields: [
          { name: 'name', label: 'Customer Name', type: 'text', required: true, placeholder: 'Primary contact' },
          { name: 'company', label: 'Company', type: 'text', required: true },
          { name: 'email', label: 'Email', type: 'email', required: true },
          { name: 'phone', label: 'Phone', type: 'phone' },
          { name: 'industry', label: 'Industry', type: 'select', options: toOptions(INDUSTRIES), required: true },
          { name: 'status', label: 'Status', type: 'select', options: toOptions(CUSTOMER_STATUSES), required: true },
        ],
      },
      {
        title: 'Ownership & Account',
        fields: [
          { name: 'ownerId', label: 'Owner', type: 'select', options: 'employees' },
          { name: 'accountId', label: 'Account', type: 'select', options: 'accounts' },
          { name: 'lifetimeValue', label: 'Lifetime Value', type: 'currency', min: 0 },
          { name: 'website', label: 'Website', type: 'url', placeholder: 'https://www.example.com' },
          { name: 'city', label: 'City', type: 'text' },
          { name: 'country', label: 'Country', type: 'text' },
        ],
      },
    ],
  },
  detailSections: [
    {
      title: 'Company Information',
      fields: [
        { label: 'Company', render: (customer) => customer.company },
        { label: 'Industry', render: (customer) => customer.industry },
        { label: 'Website', render: (customer) => (customer.website ? <a href={customer.website} target="_blank" rel="noreferrer">{customer.website.replace(/^https?:\/\/(www\.)?/, '')}</a> : '—') },
        { label: 'Location', render: (customer) => [customer.city, customer.country].filter(Boolean).join(', ') || '—' },
        { label: 'Account', render: (customer, lookups) => (customer.accountId ? <Link to={`/accounts/${customer.accountId}`}>{lookups.accountName(customer.accountId)}</Link> : '—') },
      ],
    },
    {
      title: 'Relationship',
      fields: [
        { label: 'Primary Contact', render: (customer) => customer.name },
        { label: 'Email', render: (customer) => <a href={`mailto:${customer.email}`}>{customer.email}</a> },
        { label: 'Phone', render: (customer) => (customer.phone ? <a href={`tel:${customer.phone}`}>{customer.phone}</a> : '—') },
        { label: 'Owner', render: (customer, lookups) => (customer.ownerId ? <Link to={`/employees/${customer.ownerId}`}>{lookups.employeeName(customer.ownerId)}</Link> : '—') },
        { label: 'Status', render: (customer) => <StatusTag status={customer.status} /> },
        { label: 'Lifetime Value', render: (customer) => formatCurrency(customer.lifetimeValue) },
        { label: 'Customer Since', render: (customer) => formatDate(customer.createdAt) },
      ],
    },
  ],
  detailTabs: (customer) => [
    { key: 'contacts', label: 'Contacts', children: <CustomerContacts customer={customer} /> },
    { key: 'activity', label: 'Activities', children: <RelatedActivities related={{ type: 'customer', id: customer.id }} /> },
    { key: 'tasks', label: 'Tasks', children: <RelatedTasks related={{ type: 'customer', id: customer.id }} /> },
    { key: 'notes', label: 'Notes', children: <RelatedNotes related={{ type: 'customer', id: customer.id }} /> },
    { key: 'documents', label: 'Documents', children: <RelatedDocuments related={{ type: 'customer', id: customer.id }} /> },
  ],
})
