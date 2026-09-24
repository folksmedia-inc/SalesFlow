import { useMemo } from 'react'
import { RelatedContacts } from '@/features/contacts/components/RelatedContacts'
import { useEntityList } from '@/hooks/useEntityData'
import type { Customer } from '@/types/models'

/** Contacts linked to the customer directly or through its account. */
export function CustomerContacts({ customer }: { customer: Customer }) {
  const contacts = useEntityList('contacts')
  const items = useMemo(
    () => contacts.filter((contact) => contact.customerId === customer.id || (customer.accountId !== null && contact.accountId === customer.accountId)),
    [contacts, customer.accountId, customer.id],
  )
  return <RelatedContacts contacts={items} defaults={{ customerId: customer.id, accountId: customer.accountId }} />
}
