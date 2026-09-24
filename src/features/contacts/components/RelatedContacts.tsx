import { Button, Card } from 'antd'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { EntityFormDrawer } from '@/components/entity/EntityFormDrawer'
import { EntityTable } from '@/components/entity/EntityTable'
import { RowActions } from '@/components/entity/RowActions'
import { useEntityActions } from '@/components/entity/useEntityActions'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useLookups } from '@/hooks/useLookups'
import type { Contact } from '@/types/models'
import { contactConfig, type ContactFormValues } from '../config/contactConfig'

interface RelatedContactsProps {
  contacts: Contact[]
  /** Prefilled values for contacts created from this tab. */
  defaults?: Partial<ContactFormValues>
  hiddenColumns?: string[]
}

/** Contacts tab for account/customer pages, with inline create and edit. */
export function RelatedContacts({ contacts, defaults, hiddenColumns = [] }: RelatedContactsProps) {
  const navigate = useNavigate()
  const lookups = useLookups()
  const { requestDelete } = useEntityActions(contactConfig)
  const [editing, setEditing] = useState<Contact | null>(null)
  const [creating, setCreating] = useState(false)

  return (
    <Card
      title={`Contacts (${contacts.length})`}
      extra={
        <Button icon={<Plus size={16} />} onClick={() => setCreating(true)}>
          New Contact
        </Button>
      }
      styles={{ body: { padding: contacts.length ? 0 : undefined } }}
    >
      <EntityTable
        config={contactConfig}
        records={contacts}
        lookups={lookups}
        hiddenColumns={[...hiddenColumns, 'createdAt']}
        pagination={false}
        onRowClick={(contact) => navigate(`/contacts/${contact.id}`)}
        emptyState={<EmptyState title="No contacts yet" description="Add the people you work with here." compact />}
        renderActions={(contact) => (
          <RowActions label={contact.firstName} onView={() => navigate(`/contacts/${contact.id}`)} onEdit={() => setEditing(contact)} onDelete={() => requestDelete(contact)} />
        )}
      />
      <EntityFormDrawer
        config={contactConfig}
        open={creating || Boolean(editing)}
        record={editing ?? undefined}
        initialValues={defaults}
        onClose={() => {
          setCreating(false)
          setEditing(null)
        }}
      />
    </Card>
  )
}
