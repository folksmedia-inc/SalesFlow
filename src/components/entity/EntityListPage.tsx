import { App, Button, Card, Space, Tooltip } from 'antd'
import dayjs from 'dayjs'
import { Download, Plus, RefreshCw } from 'lucide-react'
import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type { FieldValues } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { PageHeader } from '@/components/common/PageHeader'
import { SearchInput } from '@/components/common/SearchInput'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useEntityList, useEntityRecord } from '@/hooks/useEntityData'
import { useLookups } from '@/hooks/useLookups'
import type { EntityKey, EntityOf } from '@/store/entities/types'
import { hiddenColumnsSet, selectHiddenColumns } from '@/store/uiSlice'
import { downloadCsv } from '@/utils/csv'
import { BulkActionBar } from './BulkActionBar'
import { ColumnPicker } from './ColumnPicker'
import { EntityFilters } from './EntityFilters'
import { EntityFormDrawer } from './EntityFormDrawer'
import { EntityTable } from './EntityTable'
import { applyListQuery, getColumnExportValue } from './listQuery'
import { RowActions } from './RowActions'
import type { EntityConfig } from './types'
import { useEntityActions } from './useEntityActions'
import { useListUrlState } from './useListUrlState'
import styles from './EntityListPage.module.scss'

export interface ListViewHelpers<K extends EntityKey> {
  openCreate: (values?: Record<string, unknown>) => void
  openEdit: (record: EntityOf<K>) => void
  requestDelete: (record: EntityOf<K>) => void
}

interface EntityListPageProps<K extends EntityKey, V extends FieldValues> {
  config: EntityConfig<K, V>
  /** Restrict the list to a subset (defaults to the whole collection). */
  records?: EntityOf<K>[]
  headerActions?: ReactNode
  toolbarExtra?: ReactNode
  /** Default values for records created from this page. */
  createDefaults?: Partial<V>
  /** Content above the list (e.g. KPI summary) computed from the filtered records. */
  renderSummary?: (records: EntityOf<K>[]) => ReactNode
  /** Replace the table with a custom view (e.g. Kanban) that receives the filtered records. */
  renderView?: (records: EntityOf<K>[], helpers: ListViewHelpers<K>) => ReactNode
}

/**
 * Generic list page: header, search, filters, column picker, export,
 * bulk actions, sortable/paginated table, and create/edit drawer — all
 * driven by an `EntityConfig`. List state lives in the URL.
 */
export function EntityListPage<K extends EntityKey, V extends FieldValues>({
  config,
  records: recordsOverride,
  headerActions,
  toolbarExtra,
  createDefaults,
  renderSummary,
  renderView,
}: EntityListPageProps<K, V>) {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const lookups = useLookups()
  const allRecords = useEntityList(config.key)
  const records = recordsOverride ?? allRecords
  const list = useListUrlState(config.defaultSort)
  const { requestDelete, statusToggle } = useEntityActions(config)

  // Create / edit drawer state lives in the URL (?create=1 or ?edit=<id>).
  const [params, setParams] = useSearchParams()
  const editingId = params.get('edit')
  const editingRecord = useEntityRecord(config.key, editingId)
  const drawerOpen = config.formMode === 'drawer' && (params.has('create') || Boolean(editingRecord))
  const [drawerDefaults, setDrawerDefaults] = useState<Partial<V> | undefined>(createDefaults)

  const setDrawerParams = useCallback(
    (mutate: (next: URLSearchParams) => void) =>
      setParams((current) => {
        const next = new URLSearchParams(current)
        mutate(next)
        return next
      }),
    [setParams],
  )

  const openCreate = useCallback(
    (values?: Record<string, unknown>) => {
      if (config.formMode === 'page') {
        navigate(`${config.basePath}/new`)
        return
      }
      setDrawerDefaults({ ...createDefaults, ...values } as Partial<V>)
      setDrawerParams((next) => {
        next.delete('edit')
        next.set('create', '1')
      })
    },
    [config.basePath, config.formMode, createDefaults, navigate, setDrawerParams],
  )

  const openEdit = useCallback(
    (record: EntityOf<K>) => {
      if (config.formMode === 'page') navigate(`${config.basePath}/${record.id}/edit`)
      else
        setDrawerParams((next) => {
          next.delete('create')
          next.set('edit', record.id)
        })
    },
    [config.basePath, config.formMode, navigate, setDrawerParams],
  )

  const closeDrawer = () =>
    setDrawerParams((next) => {
      next.delete('create')
      next.delete('edit')
    })

  const hasDetails = Boolean(config.detailSections)
  const openRecord = (record: EntityOf<K>) => (hasDetails ? navigate(`${config.basePath}/${record.id}`) : openEdit(record))

  // Search, filter and sort.
  const filters = useMemo(() => config.filters ?? [], [config.filters])
  const { search: urlSearch, filters: filterValues, sortField, sortOrder } = list
  const query = useMemo(() => ({ search: urlSearch, filters: filterValues, sortField, sortOrder }), [urlSearch, filterValues, sortField, sortOrder])
  const filtered = useMemo(
    () => applyListQuery(records, query, { searchText: config.searchText, filters, columns: config.columns, lookups }),
    [records, query, filters, config.searchText, config.columns, lookups],
  )

  // Selection (pruned when records disappear).
  const [selection, setSelection] = useState<string[]>([])
  const selectedIds = useMemo(() => {
    const available = new Set(records.map((record) => record.id))
    return selection.filter((id) => available.has(id))
  }, [records, selection])

  // Column visibility (persisted per list).
  const storedHidden = useAppSelector((state) => selectHiddenColumns(state, config.key))
  const defaultHidden = useMemo(() => config.columns.filter((column) => column.defaultHidden).map((column) => column.key), [config.columns])
  const hiddenColumns = storedHidden ?? defaultHidden

  const [refreshing, setRefreshing] = useState(false)
  const refresh = () => {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
      message.success(`${config.label} are up to date.`)
    }, 400)
  }

  const exportCsv = () => {
    const rows = selectedIds.length > 0 ? filtered.filter((record) => selectedIds.includes(record.id)) : filtered
    const columns = config.columns.filter((column) => !hiddenColumns.includes(column.key))
    downloadCsv(
      `${config.key}-${dayjs().format('YYYY-MM-DD')}`,
      columns.map((column) => column.title),
      rows.map((record) => columns.map((column) => getColumnExportValue(record, column, lookups))),
    )
    message.success(`Exported ${rows.length} ${rows.length === 1 ? config.singular.toLowerCase() : config.label.toLowerCase()}.`)
  }

  const clearAll = () => list.clearFilters()

  const hasActiveQuery = list.activeFilterCount > 0 || list.search.length > 0
  const noun = config.label.toLowerCase()
  const emptyState =
    records.length === 0 ? (
      <EmptyState
        title={`No ${noun} yet`}
        description={`Get started by adding your first ${config.singular.toLowerCase()}.`}
        actionLabel={`Add ${config.singular}`}
        onAction={() => openCreate()}
      />
    ) : (
      <EmptyState
        title={`No ${noun} found`}
        description={`Try changing your filters or add a new ${config.singular.toLowerCase()}.`}
        secondaryLabel={hasActiveQuery ? 'Clear filters' : undefined}
        onSecondary={clearAll}
        actionLabel={`Add ${config.singular}`}
        onAction={() => openCreate()}
      />
    )

  const helpers: ListViewHelpers<K> = { openCreate, openEdit, requestDelete: (record) => requestDelete(record) }

  return (
    <>
      <PageHeader
        title={config.label}
        subtitle={config.description}
        actions={
          <>
            {headerActions}
            <Button type="primary" icon={<Plus size={16} />} onClick={() => openCreate()}>
              {config.createLabel ?? `New ${config.singular}`}
            </Button>
          </>
        }
      />

      {renderSummary?.(filtered)}

      <Card className={styles.card} styles={{ body: { padding: 16 } }}>
        <div className={styles.toolbar}>
          <div className={styles.filters}>
            <SearchInput value={list.search} onChange={list.setSearch} placeholder={`Search ${noun}…`} className={styles.search} />
            <EntityFilters filters={filters} records={records} values={list.filters} onChange={list.setFilter} />
            {hasActiveQuery && (
              <Button type="link" onClick={clearAll}>
                Clear all
              </Button>
            )}
          </div>
          <Space size={8} className={styles.tools}>
            {toolbarExtra}
            <Tooltip title="Refresh">
              <Button icon={<RefreshCw size={16} />} aria-label="Refresh" onClick={refresh} loading={refreshing} />
            </Tooltip>
            {!renderView && (
              <ColumnPicker
                columns={config.columns}
                hidden={hiddenColumns}
                onChange={(hidden) => dispatch(hiddenColumnsSet({ list: config.key, hidden }))}
                onReset={() => dispatch(hiddenColumnsSet({ list: config.key, hidden: defaultHidden }))}
              />
            )}
            <Tooltip title={selectedIds.length > 0 ? 'Export selected rows to CSV' : 'Export results to CSV'}>
              <Button icon={<Download size={16} />} onClick={exportCsv} disabled={filtered.length === 0}>
                Export
              </Button>
            </Tooltip>
          </Space>
        </div>

        {selectedIds.length > 0 && !renderView && (
          <BulkActionBar
            entityKey={config.key}
            singular={config.singular}
            plural={config.label}
            actions={config.bulkActions}
            selectedIds={selectedIds}
            onClear={() => setSelection([])}
            getBlocker={
              config.getBulkActionBlocker
                ? (id, action) => {
                    const record = records.find((item) => item.id === id)
                    return record ? (config.getBulkActionBlocker?.(record, action) ?? null) : null
                  }
                : undefined
            }
          />
        )}

        {renderView ? (
          filtered.length === 0 ? emptyState : renderView(filtered, helpers)
        ) : (
          <EntityTable
            config={config}
            records={filtered}
            lookups={lookups}
            hiddenColumns={hiddenColumns}
            selectedIds={selectedIds}
            onSelectionChange={setSelection}
            sort={{ field: list.sortField, order: list.sortOrder }}
            onSortChange={list.setSort}
            pagination={{ page: list.page, pageSize: list.pageSize, onChange: list.setPage }}
            onRowClick={openRecord}
            loading={refreshing}
            emptyState={emptyState}
            renderActions={(record) => {
              const toggle = statusToggle(record)
              return (
                <RowActions
                  label={config.getTitle(record)}
                  onView={hasDetails ? () => navigate(`${config.basePath}/${record.id}`) : undefined}
                  onEdit={() => openEdit(record)}
                  onToggleStatus={toggle ? { label: toggle.label, run: toggle.run } : undefined}
                  onDelete={() => requestDelete(record)}
                />
              )
            }}
          />
        )}
      </Card>

      {config.formMode === 'drawer' && (
        <EntityFormDrawer
          config={config}
          open={drawerOpen}
          record={editingRecord}
          initialValues={editingRecord ? undefined : drawerDefaults}
          onClose={closeDrawer}
        />
      )}
    </>
  )
}
