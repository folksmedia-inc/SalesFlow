import { Table, type TableProps } from 'antd'
import type { SorterResult } from 'antd/es/table/interface'
import type { ReactNode } from 'react'
import type { FieldValues } from 'react-hook-form'
import { useAppSelector } from '@/app/hooks'
import { PAGE_SIZE_OPTIONS } from '@/constants/app'
import type { Lookups } from '@/hooks/useLookups'
import type { EntityKey, EntityOf } from '@/store/entities/types'
import { selectTableDensity } from '@/store/uiSlice'
import type { SortOrder } from '@/types/common'
import type { EntityConfig } from './types'

interface EntityTableProps<K extends EntityKey, V extends FieldValues> {
  config: EntityConfig<K, V>
  records: EntityOf<K>[]
  lookups: Lookups
  hiddenColumns?: string[]
  selectedIds?: string[]
  onSelectionChange?: (ids: string[]) => void
  sort?: { field: string | null; order: SortOrder | null }
  onSortChange?: (field: string | null, order: SortOrder | null) => void
  pagination?: { page: number; pageSize: number; onChange: (page: number, pageSize: number) => void } | false
  onRowClick?: (record: EntityOf<K>) => void
  renderActions?: (record: EntityOf<K>) => ReactNode
  loading?: boolean
  emptyState?: ReactNode
}

/** Config-driven data table: columns, sorting, selection and pagination. */
export function EntityTable<K extends EntityKey, V extends FieldValues>({
  config,
  records,
  lookups,
  hiddenColumns = [],
  selectedIds,
  onSelectionChange,
  sort,
  onSortChange,
  pagination,
  onRowClick,
  renderActions,
  loading,
  emptyState,
}: EntityTableProps<K, V>) {
  const density = useAppSelector(selectTableDensity)

  const columns: TableProps<EntityOf<K>>['columns'] = (() => {
    const visible = config.columns
      .filter((column) => !hiddenColumns.includes(column.key))
      .map((column) => ({
        key: column.key,
        dataIndex: column.key,
        title: column.title,
        width: column.width,
        fixed: column.fixed,
        align: column.align,
        ellipsis: !column.render,
        sorter: column.sortable && onSortChange ? true : undefined,
        sortOrder:
          column.sortable && sort?.field === column.key && sort.order ? (sort.order === 'asc' ? ('ascend' as const) : ('descend' as const)) : null,
        render: (_: unknown, record: EntityOf<K>) =>
          column.render ? column.render(record, lookups) : ((record as unknown as Record<string, ReactNode>)[column.key] ?? '—'),
      }))

    if (renderActions) {
      visible.push({
        key: '__actions',
        dataIndex: '__actions',
        title: 'Actions',
        width: 80,
        fixed: 'right',
        align: 'center',
        ellipsis: false,
        sorter: undefined,
        sortOrder: null,
        render: (_: unknown, record: EntityOf<K>) => (
          <span onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
            {renderActions(record)}
          </span>
        ),
      })
    }
    return visible
  })()

  const handleChange: TableProps<EntityOf<K>>['onChange'] = (tablePagination, _filters, sorter, extra) => {
    if (extra.action === 'sort' && onSortChange) {
      const single = sorter as SorterResult<EntityOf<K>>
      const order = single.order === 'ascend' ? 'asc' : single.order === 'descend' ? 'desc' : null
      onSortChange(order ? String(single.columnKey) : null, order)
    }
    if (extra.action === 'paginate' && pagination) {
      pagination.onChange(tablePagination.current ?? 1, tablePagination.pageSize ?? pagination.pageSize)
    }
  }

  const maxPage = pagination ? Math.max(1, Math.ceil(records.length / pagination.pageSize)) : 1

  return (
    <Table<EntityOf<K>>
      rowKey="id"
      size={density}
      columns={columns}
      dataSource={records}
      loading={loading}
      onChange={handleChange}
      scroll={{ x: 'max-content' }}
      locale={emptyState ? { emptyText: emptyState } : undefined}
      rowSelection={
        onSelectionChange
          ? { selectedRowKeys: selectedIds, onChange: (keys) => onSelectionChange(keys.map(String)), preserveSelectedRowKeys: true }
          : undefined
      }
      onRow={onRowClick ? (record) => ({ onClick: () => onRowClick(record), style: { cursor: 'pointer' } }) : undefined}
      pagination={
        pagination
          ? {
              current: Math.min(pagination.page, maxPage),
              pageSize: pagination.pageSize,
              total: records.length,
              showSizeChanger: true,
              pageSizeOptions: PAGE_SIZE_OPTIONS.map(String),
              showTotal: (total, [from, to]) => `${from}–${to} of ${total}`,
            }
          : false
      }
    />
  )
}
