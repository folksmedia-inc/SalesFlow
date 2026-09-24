import { Card } from 'antd'
import { useMemo } from 'react'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useEntityList } from '@/hooks/useEntityData'
import type { RelatedRef } from '@/types/models'
import { DocumentsTable } from './DocumentsTable'
import { DocumentUploadButton } from './DocumentUploadButton'

/** Documents tab for a record's details page. */
export function RelatedDocuments({ related }: { related: RelatedRef }) {
  const documents = useEntityList('documents')
  const items = useMemo(() => documents.filter((document) => document.related?.type === related.type && document.related.id === related.id), [documents, related.id, related.type])

  return (
    <Card title={`Documents (${items.length})`} extra={<DocumentUploadButton related={related} />} styles={{ body: { padding: items.length ? 0 : undefined } }}>
      <DocumentsTable documents={items} showRelated={false} emptyState={<EmptyState title="No documents yet" description="Upload contracts, agreements and other files." compact />} />
    </Card>
  )
}
