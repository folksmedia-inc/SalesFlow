import { useMemo } from 'react'
import { RelatedContacts } from '@/features/contacts/components/RelatedContacts'
import { RelatedCustomers } from '@/features/customers/components/RelatedCustomers'
import { useEntityList } from '@/hooks/useEntityData'

export function AccountContacts({ accountId }: { accountId: string }) {
  const contacts = useEntityList('contacts')
  const items = useMemo(() => contacts.filter((contact) => contact.accountId === accountId), [accountId, contacts])
  return <RelatedContacts contacts={items} defaults={{ accountId }} hiddenColumns={['account']} />
}

export function AccountCustomers({ accountId }: { accountId: string }) {
  const customers = useEntityList('customers')
  const items = useMemo(() => customers.filter((customer) => customer.accountId === accountId), [accountId, customers])
  return <RelatedCustomers customers={items} />
}
