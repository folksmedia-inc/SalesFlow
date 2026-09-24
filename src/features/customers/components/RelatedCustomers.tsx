import { Card } from 'antd'
import { useNavigate } from 'react-router'
import { EntityTable } from '@/components/entity/EntityTable'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useLookups } from '@/hooks/useLookups'
import type { Customer } from '@/types/models'
import { customerConfig } from '../config/customerConfig'

/** Read-only customers table used on account pages. */
export function RelatedCustomers({ customers }: { customers: Customer[] }) {
  const navigate = useNavigate()
  const lookups = useLookups()
  return (
    <Card title={`Customers (${customers.length})`} styles={{ body: { padding: customers.length ? 0 : undefined } }}>
      <EntityTable
        config={customerConfig}
        records={customers}
        lookups={lookups}
        hiddenColumns={['company', 'phone', 'createdAt']}
        pagination={false}
        onRowClick={(customer) => navigate(`/customers/${customer.id}`)}
        emptyState={<EmptyState title="No customers linked" description="Link customers to this account from the customer form." compact />}
      />
    </Card>
  )
}
