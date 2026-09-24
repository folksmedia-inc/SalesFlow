import { Button, Space, Table, Tooltip } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Download, Eye, Trash2 } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useAppSelector } from '@/app/hooks'
import { RelatedLink } from '@/components/common/RelatedLink'
import { useConfirmDelete } from '@/hooks/useConfirmDelete'
import { useEntityCrud } from '@/hooks/useEntityData'
import { selectTableDensity } from '@/store/uiSlice'
import type { DocumentFile } from '@/types/models'
import { formatDate, formatFileSize } from '@/utils/format'
import { downloadDocument, getFileKind } from '../utils/documentFiles'
import { DocumentPreviewModal } from './DocumentPreviewModal'
import { FileName } from './FileName'

interface DocumentsTableProps {
  documents: DocumentFile[]
  showRelated?: boolean
  emptyState?: ReactNode
  selectedIds?: string[]
  onSelectionChange?: (ids: string[]) => void
}

/** Documents with preview, download and delete actions. */
export function DocumentsTable({ documents, showRelated = true, emptyState, selectedIds, onSelectionChange }: DocumentsTableProps) {
  const crud = useEntityCrud('documents')
  const confirmDelete = useConfirmDelete()
  const density = useAppSelector(selectTableDensity)
  const [previewing, setPreviewing] = useState<DocumentFile | null>(null)

  const columns: ColumnsType<DocumentFile> = [
    { key: 'name', title: 'File Name', sorter: (a, b) => a.name.localeCompare(b.name), render: (_, document) => <FileName name={document.name} mimeType={document.mimeType} /> },
    { key: 'type', title: 'Type', render: (_, document) => getFileKind(document.mimeType, document.name).label, sorter: (a, b) => getFileKind(a.mimeType, a.name).label.localeCompare(getFileKind(b.mimeType, b.name).label) },
    { key: 'size', title: 'Size', align: 'right', sorter: (a, b) => a.size - b.size, render: (_, document) => formatFileSize(document.size) },
    { key: 'uploadedBy', title: 'Uploaded By', dataIndex: 'uploadedBy', sorter: (a, b) => a.uploadedBy.localeCompare(b.uploadedBy) },
    { key: 'createdAt', title: 'Uploaded Date', sorter: (a, b) => a.createdAt.localeCompare(b.createdAt), defaultSortOrder: 'descend', render: (_, document) => formatDate(document.createdAt) },
    ...(showRelated ? [{ key: 'related', title: 'Related Entity', render: (_: unknown, document: DocumentFile) => <RelatedLink related={document.related} /> }] : []),
    {
      key: 'actions',
      title: 'Actions',
      align: 'center',
      fixed: 'right',
      width: 130,
      render: (_, document) => (
        <Space size={2}>
          <Tooltip title="Preview">
            <Button type="text" size="small" aria-label={`Preview ${document.name}`} icon={<Eye size={16} />} onClick={() => setPreviewing(document)} />
          </Tooltip>
          <Tooltip title="Download">
            <Button type="text" size="small" aria-label={`Download ${document.name}`} icon={<Download size={16} />} onClick={() => void downloadDocument(document)} />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              size="small"
              danger
              aria-label={`Delete ${document.name}`}
              icon={<Trash2 size={16} />}
              onClick={() => confirmDelete({ entityLabel: 'Document', name: document.name, onConfirm: () => crud.remove(document.id) })}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <>
      <Table<DocumentFile>
        rowKey="id"
        size={density}
        columns={columns}
        dataSource={documents}
        scroll={{ x: 'max-content' }}
        locale={emptyState ? { emptyText: emptyState } : undefined}
        pagination={documents.length > 10 ? { pageSize: 10, showSizeChanger: true, showTotal: (total, [from, to]) => `${from}–${to} of ${total}` } : false}
        rowSelection={onSelectionChange ? { selectedRowKeys: selectedIds, onChange: (keys) => onSelectionChange(keys.map(String)) } : undefined}
      />
      <DocumentPreviewModal document={previewing} onClose={() => setPreviewing(null)} />
    </>
  )
}
