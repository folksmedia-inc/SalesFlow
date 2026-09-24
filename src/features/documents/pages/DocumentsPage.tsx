import { App, Button, Card, Select } from 'antd'
import { Trash2 } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useConfirmDelete } from '@/hooks/useConfirmDelete'
import { useEntityCrud, useEntityList } from '@/hooks/useEntityData'
import { useLookups } from '@/hooks/useLookups'
import { decodeRelated, relatedTypeLabel } from '@/hooks/useRelatedOptions'
import { RELATED_ENTITY_TYPES } from '@/types/models'
import { formatNumber, pluralize } from '@/utils/format'
import { SearchInput } from '@/components/common/SearchInput'
import { DocumentsSummary } from '../components/DocumentsSummary'
import { DocumentsTable } from '../components/DocumentsTable'
import { DocumentUploadButton } from '../components/DocumentUploadButton'
import { DocumentUploadPanel } from '../components/DocumentUploadPanel'
import { getFileKind } from '../utils/documentFiles'
import styles from './DocumentsPage.module.scss'

const NO_RELATED = 'none'
const FILTER_KEYS = { types: 'type', related: 'rel', uploaders: 'by' } as const
type FilterKey = keyof typeof FILTER_KEYS

const RELATED_OPTIONS = [...RELATED_ENTITY_TYPES.map((type) => ({ value: type, label: relatedTypeLabel(type) })), { value: NO_RELATED, label: 'Not linked' }]

function readList(params: URLSearchParams, key: string): string[] {
  return params.get(key)?.split(',').filter(Boolean) ?? []
}

/** Organization document library: upload, search, filter, preview, download and bulk delete. */
export default function DocumentsPage() {
  const { message } = App.useApp()
  const documents = useEntityList('documents')
  const crud = useEntityCrud('documents')
  const lookups = useLookups()
  const confirmDelete = useConfirmDelete()
  const [params, setParams] = useSearchParams()
  const [uploadRelated, setUploadRelated] = useState<string | null>(null)
  const [selection, setSelection] = useState<string[]>([])

  // Search and filters live in the URL: ?q=contract&type=PDF,Spreadsheet&rel=customer&by=Priya%20Raman
  const search = params.get('q') ?? ''
  const filters = useMemo(
    () => ({ types: readList(params, FILTER_KEYS.types), related: readList(params, FILTER_KEYS.related), uploaders: readList(params, FILTER_KEYS.uploaders) }),
    [params],
  )
  const activeCount = (search ? 1 : 0) + Object.values(filters).filter((values) => values.length > 0).length

  const updateParams = useCallback(
    (mutate: (next: URLSearchParams) => void) =>
      setParams(
        (current) => {
          const next = new URLSearchParams(current)
          mutate(next)
          return next
        },
        { replace: true },
      ),
    [setParams],
  )
  const setSearch = useCallback((value: string) => updateParams((next) => (value ? next.set('q', value) : next.delete('q'))), [updateParams])
  const setFilter = (key: FilterKey, values: string[]) =>
    updateParams((next) => (values.length > 0 ? next.set(FILTER_KEYS[key], values.join(',')) : next.delete(FILTER_KEYS[key])))
  const clearAll = () =>
    updateParams((next) => {
      for (const key of ['q', ...Object.values(FILTER_KEYS)]) next.delete(key)
    })

  const typeOptions = useMemo(
    () => [...new Set(documents.map((document) => getFileKind(document.mimeType, document.name).label))].sort().map((label) => ({ value: label, label })),
    [documents],
  )
  const uploaderOptions = useMemo(
    () => [...new Set(documents.map((document) => document.uploadedBy))].sort((a, b) => a.localeCompare(b)).map((name) => ({ value: name, label: name })),
    [documents],
  )

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return documents.filter((document) => {
      if (filters.types.length > 0 && !filters.types.includes(getFileKind(document.mimeType, document.name).label)) return false
      if (filters.related.length > 0 && !filters.related.includes(document.related?.type ?? NO_RELATED)) return false
      if (filters.uploaders.length > 0 && !filters.uploaders.includes(document.uploadedBy)) return false
      if (term) {
        const text = [document.name, document.uploadedBy, document.related ? lookups.relatedName(document.related) : ''].join(' ').toLowerCase()
        if (!text.includes(term)) return false
      }
      return true
    })
  }, [documents, filters, lookups, search])

  // Only rows that are still visible can stay selected.
  const selectedIds = useMemo(() => {
    const visible = new Set(filtered.map((document) => document.id))
    return selection.filter((id) => visible.has(id))
  }, [filtered, selection])

  const deleteSelected = () => {
    const ids = selectedIds
    confirmDelete({
      entityLabel: ids.length === 1 ? 'Document' : `${ids.length} Documents`,
      name: ids.length === 1 ? documents.find((document) => document.id === ids[0])?.name : `these ${ids.length} documents`,
      onConfirm: () => {
        crud.removeMany(ids)
        setSelection([])
        message.success(`${pluralize(ids.length, 'document')} deleted.`)
      },
    })
  }

  const emptyState =
    documents.length === 0 ? (
      <EmptyState title="No documents yet" description="Upload contracts, proposals and other files to share them with your team." compact />
    ) : (
      <EmptyState
        title="No documents found"
        description="Try a different search or adjust the filters."
        secondaryLabel={activeCount > 0 ? 'Clear filters' : undefined}
        onSecondary={clearAll}
        compact
      />
    )

  return (
    <>
      <PageHeader
        subtitle="Store, preview and share files linked to your customers, accounts and people."
        actions={<DocumentUploadButton type="primary" related={decodeRelated(uploadRelated)} />}
      />

      <DocumentsSummary documents={documents} />

      <Card title="Upload files" className={styles.card}>
        <DocumentUploadPanel relatedValue={uploadRelated} onRelatedChange={setUploadRelated} />
      </Card>

      <Card className={styles.card} styles={{ body: { padding: 16 } }}>
        <div className={styles.toolbar}>
          <div className={styles.filters}>
            <SearchInput value={search} onChange={setSearch} placeholder="Search documents…" className={styles.search} />
            <Select
              aria-label="File type"
              mode="multiple"
              placeholder="File type"
              value={filters.types}
              onChange={(values: string[]) => setFilter('types', values)}
              options={typeOptions}
              maxTagCount={1}
              allowClear
              showSearch={{ optionFilterProp: 'label' }}
              className={styles.select}
              popupMatchSelectWidth={false}
            />
            <Select
              aria-label="Related to"
              mode="multiple"
              placeholder="Related to"
              value={filters.related}
              onChange={(values: string[]) => setFilter('related', values)}
              options={RELATED_OPTIONS}
              maxTagCount={1}
              allowClear
              showSearch={{ optionFilterProp: 'label' }}
              className={styles.select}
              popupMatchSelectWidth={false}
            />
            <Select
              aria-label="Uploaded by"
              mode="multiple"
              placeholder="Uploaded by"
              value={filters.uploaders}
              onChange={(values: string[]) => setFilter('uploaders', values)}
              options={uploaderOptions}
              maxTagCount={1}
              maxTagTextLength={14}
              allowClear
              showSearch={{ optionFilterProp: 'label' }}
              className={styles.select}
              popupMatchSelectWidth={false}
            />
            {activeCount > 0 && (
              <Button type="link" onClick={clearAll}>
                Clear all
              </Button>
            )}
          </div>
          <span className={styles.count} aria-live="polite">
            {filtered.length === documents.length
              ? pluralize(documents.length, 'document')
              : `${formatNumber(filtered.length)} of ${pluralize(documents.length, 'document')}`}
          </span>
        </div>

        {selectedIds.length > 0 && (
          <div className={styles.bulkBar} role="region" aria-label="Bulk actions">
            <span className={styles.bulkCount}>{formatNumber(selectedIds.length)} selected</span>
            <Button type="link" size="small" onClick={() => setSelection([])}>
              Clear selection
            </Button>
            <span className={styles.bulkSpacer} />
            <Button danger size="small" icon={<Trash2 size={14} />} onClick={deleteSelected}>
              Delete selected
            </Button>
          </div>
        )}

        <DocumentsTable documents={filtered} emptyState={emptyState} selectedIds={selectedIds} onSelectionChange={setSelection} />
      </Card>
    </>
  )
}
