import { Building2, Flag, UserRoundCheck } from 'lucide-react'
import { Link } from 'react-router'
import { z } from 'zod'
import { StatusTag } from '@/components/common/StatusTag'
import { defineEntityConfig } from '@/components/entity/types'
import { toOptions } from '@/components/entity/useOptions'
import { nonNegativeNumber, optionalPhone, optionalSelect, optionalText, optionalUrl, requiredText } from '@/components/forms/schemaHelpers'
import { ROUTES } from '@/constants/routes'
import { RelatedActivities } from '@/features/activities/components/RelatedActivities'
import { RelatedDocuments } from '@/features/documents/components/RelatedDocuments'
import { RelatedNotes } from '@/features/notes/components/RelatedNotes'
import { RelatedTasks } from '@/features/tasks/components/RelatedTasks'
import { ACCOUNT_STATUSES, INDUSTRIES } from '@/types/models'
import { formatCurrency, formatDate, formatNumber } from '@/utils/format'
import { AccountContacts, AccountCustomers } from '../components/AccountRelations'

const accountSchema = z.object({
  name: requiredText('Account name', 100),
  industry: z.enum(INDUSTRIES, 'Select an industry'),
  website: optionalUrl(),
  phone: optionalPhone(),
  ownerId: optionalSelect(),
  employeeCount: nonNegativeNumber('Employees').int('Employees must be a whole number'),
  annualRevenue: nonNegativeNumber('Revenue'),
  status: z.enum(ACCOUNT_STATUSES, 'Select a status'),
  city: optionalText(60),
  country: optionalText(60),
})

export type AccountFormValues = z.infer<typeof accountSchema>

const websiteLabel = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '')

export const accountConfig = defineEntityConfig({
  key: 'accounts',
  label: 'Accounts',
  singular: 'Account',
  description: 'Companies you do business with, their size and revenue.',
  basePath: ROUTES.accounts,
  icon: Building2,
  formMode: 'drawer',
  getTitle: (account) => account.name,
  getSubtitle: (account) => `${account.industry} · ${[account.city, account.country].filter(Boolean).join(', ')}`,
  getStatus: (account) => account.status,
  getMeta: (account, lookups) => [
    <span key="owner">Owner: {lookups.employeeName(account.ownerId)}</span>,
    <span key="rev">Revenue: {formatCurrency(account.annualRevenue, true)}</span>,
    <span key="emp">{formatNumber(account.employeeCount)} employees</span>,
  ],
  searchText: (account, lookups) => [account.name, account.industry, account.website, account.city, account.country, lookups.employeeName(account.ownerId)].join(' '),
  defaultSort: { field: 'name', order: 'asc' },
  columns: [
    {
      key: 'name',
      title: 'Account Name',
      sortable: true,
      alwaysVisible: true,
      render: (account) => (
        <Link to={`${ROUTES.accounts}/${account.id}`} style={{ fontWeight: 500 }} onClick={(event) => event.stopPropagation()}>
          {account.name}
        </Link>
      ),
    },
    { key: 'industry', title: 'Industry', sortable: true },
    {
      key: 'website',
      title: 'Website',
      render: (account) =>
        account.website ? (
          <a href={account.website} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>
            {websiteLabel(account.website)}
          </a>
        ) : (
          '—'
        ),
    },
    { key: 'phone', title: 'Phone' },
    { key: 'owner', title: 'Owner', sortable: true, value: (account, lookups) => lookups.employeeName(account.ownerId), render: (account, lookups) => lookups.employeeName(account.ownerId) },
    { key: 'employeeCount', title: 'Employees', sortable: true, align: 'right', render: (account) => formatNumber(account.employeeCount) },
    { key: 'annualRevenue', title: 'Revenue', sortable: true, align: 'right', render: (account) => formatCurrency(account.annualRevenue, true) },
    { key: 'status', title: 'Status', sortable: true, render: (account) => <StatusTag status={account.status} /> },
    { key: 'createdAt', title: 'Created', sortable: true, defaultHidden: true, render: (account) => formatDate(account.createdAt) },
  ],
  filters: [
    { key: 'industry', label: 'Industry', type: 'select', options: toOptions(INDUSTRIES), getValue: (account) => account.industry },
    { key: 'status', label: 'Status', type: 'select', options: toOptions(ACCOUNT_STATUSES), getValue: (account) => account.status },
    { key: 'owner', label: 'Owner', type: 'select', options: 'employees', getValue: (account) => account.ownerId },
  ],
  bulkActions: [
    { key: 'owner', label: 'Assign Owner', icon: UserRoundCheck, kind: 'assign', field: 'ownerId', fieldLabel: 'Owner', options: 'employees' },
    { key: 'status', label: 'Change Status', icon: Flag, kind: 'assign', field: 'status', fieldLabel: 'Status', options: toOptions(ACCOUNT_STATUSES) },
    { key: 'delete', label: 'Delete', kind: 'delete' },
  ],
  form: {
    schema: accountSchema,
    defaultValues: { name: '', industry: 'Technology', website: '', phone: '', ownerId: null, employeeCount: 0, annualRevenue: 0, status: 'Prospect', city: '', country: '' },
    toValues: (account) => ({
      name: account.name,
      industry: account.industry,
      website: account.website,
      phone: account.phone,
      ownerId: account.ownerId,
      employeeCount: account.employeeCount,
      annualRevenue: account.annualRevenue,
      status: account.status,
      city: account.city,
      country: account.country,
    }),
    toRecord: (values) => values,
    validate: (values, { records, currentId }) => ({
      name: records.some((account) => account.id !== currentId && account.name.toLowerCase() === values.name.toLowerCase()) ? 'An account with this name already exists' : undefined,
    }),
    sections: [
      {
        title: 'Account Information',
        fields: [
          { name: 'name', label: 'Account Name', type: 'text', required: true },
          { name: 'industry', label: 'Industry', type: 'select', options: toOptions(INDUSTRIES), required: true },
          { name: 'website', label: 'Website', type: 'url', placeholder: 'https://www.example.com' },
          { name: 'phone', label: 'Phone', type: 'phone' },
          { name: 'ownerId', label: 'Owner', type: 'select', options: 'employees' },
          { name: 'status', label: 'Status', type: 'select', options: toOptions(ACCOUNT_STATUSES), required: true },
        ],
      },
      {
        title: 'Company Profile',
        fields: [
          { name: 'employeeCount', label: 'Employees', type: 'number', min: 0 },
          { name: 'annualRevenue', label: 'Annual Revenue', type: 'currency', min: 0 },
          { name: 'city', label: 'City', type: 'text' },
          { name: 'country', label: 'Country', type: 'text' },
        ],
      },
    ],
  },
  detailSections: [
    {
      title: 'Account Information',
      fields: [
        { label: 'Industry', render: (account) => account.industry },
        { label: 'Website', render: (account) => (account.website ? <a href={account.website} target="_blank" rel="noreferrer">{websiteLabel(account.website)}</a> : '—') },
        { label: 'Phone', render: (account) => account.phone || '—' },
        { label: 'Owner', render: (account, lookups) => (account.ownerId ? <Link to={`/employees/${account.ownerId}`}>{lookups.employeeName(account.ownerId)}</Link> : '—') },
        { label: 'Status', render: (account) => <StatusTag status={account.status} /> },
        { label: 'Customer Since', render: (account) => formatDate(account.createdAt) },
      ],
    },
    {
      title: 'Company Profile',
      fields: [
        { label: 'Employees', render: (account) => formatNumber(account.employeeCount) },
        { label: 'Annual Revenue', render: (account) => formatCurrency(account.annualRevenue) },
        { label: 'Location', render: (account) => [account.city, account.country].filter(Boolean).join(', ') || '—' },
      ],
    },
  ],
  detailTabs: (account) => [
    { key: 'contacts', label: 'Contacts', children: <AccountContacts accountId={account.id} /> },
    { key: 'customers', label: 'Customers', children: <AccountCustomers accountId={account.id} /> },
    { key: 'activity', label: 'Activity', children: <RelatedActivities related={{ type: 'account', id: account.id }} /> },
    { key: 'tasks', label: 'Tasks', children: <RelatedTasks related={{ type: 'account', id: account.id }} /> },
    { key: 'notes', label: 'Notes', children: <RelatedNotes related={{ type: 'account', id: account.id }} /> },
    { key: 'documents', label: 'Documents', children: <RelatedDocuments related={{ type: 'account', id: account.id }} /> },
  ],
})
