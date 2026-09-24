import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import type { FieldValues } from 'react-hook-form'
import type { z } from 'zod'
import type { Lookups, LookupSource } from '@/hooks/useLookups'
import type { EntityKey, EntityOf, NewEntity } from '@/store/entities/types'
import type { SelectOption, SortOrder } from '@/types/common'

/**
 * Configuration contract for the generic entity architecture. A config
 * fully describes how a collection is listed, filtered, edited and shown,
 * so adding a new entity means writing a config — not new pages.
 */

/**
 * Options for select fields/filters: a static list, a lookup collection, or
 * `related` — every linkable record, encoded as `"<type>:<id>"`.
 */
export type OptionsSource = readonly SelectOption[] | LookupSource | 'related'

export interface ColumnConfig<T> {
  key: string
  title: string
  render?: (record: T, lookups: Lookups) => ReactNode
  /** Primitive value used for sorting and CSV export. Defaults to `record[key]`. */
  value?: (record: T, lookups: Lookups) => string | number | null | undefined
  sortable?: boolean
  width?: number
  fixed?: 'left' | 'right'
  align?: 'left' | 'center' | 'right'
  /** Hidden until the user enables it from the column picker. */
  defaultHidden?: boolean
  /** Cannot be hidden from the column picker. */
  alwaysVisible?: boolean
}

export interface FilterConfig<T> {
  key: string
  label: string
  type: 'select' | 'dateRange'
  /** `distinct` builds options from the distinct values present in the data. */
  options?: OptionsSource | 'distinct'
  /** The record value(s) the filter compares against. */
  getValue: (record: T) => string | readonly string[] | null | undefined
}

export type FieldType = 'text' | 'email' | 'phone' | 'url' | 'textarea' | 'number' | 'currency' | 'select' | 'multiselect' | 'date'

export interface FieldConfig {
  name: string
  label: string
  type: FieldType
  required?: boolean
  placeholder?: string
  options?: OptionsSource
  /** Grid width on medium+ screens. Defaults to `half`. */
  span?: 'full' | 'half' | 'third'
  help?: string
  min?: number
  max?: number
}

export interface FormSectionConfig {
  title: string
  description?: string
  fields: FieldConfig[]
}

export interface ValidationContext<K extends EntityKey> {
  records: EntityOf<K>[]
  /** Id of the record being edited (undefined when creating). */
  currentId?: string
}

export interface EntityFormConfig<K extends EntityKey, V extends FieldValues> {
  schema: z.ZodType<V, V>
  sections: FormSectionConfig[]
  defaultValues: V
  toValues: (record: EntityOf<K>) => V
  toRecord: (values: V) => NewEntity<K>
  /** Computed defaults for new records (e.g. the next employee ID). */
  getDefaults?: (context: ValidationContext<K>) => Partial<V>
  /** Cross-record validation (e.g. unique email). Returns field → message. */
  validate?: (values: V, context: ValidationContext<K>) => Partial<Record<string, string>>
}

export interface DetailFieldConfig<T> {
  label: string
  render: (record: T, lookups: Lookups) => ReactNode
  /** `filled` stretches the field to the end of its row. */
  span?: 1 | 2 | 'filled'
}

export interface DetailSectionConfig<T> {
  title: string
  fields: DetailFieldConfig<T>[]
}

export interface DetailTab {
  key: string
  label: ReactNode
  children: ReactNode
}

export type BulkActionConfig<T> =
  | { key: string; label: string; icon?: LucideIcon; kind: 'update'; changes: Partial<T> }
  | { key: string; label: string; icon?: LucideIcon; kind: 'assign'; field: keyof T & string; fieldLabel: string; options: OptionsSource }
  | { key: string; label: string; icon?: LucideIcon; kind: 'delete' }

/** Activate/deactivate style toggle shown on rows and the details header. */
export interface StatusToggleConfig<T> {
  field: keyof T & string
  activeValue: string
  inactiveValue: string
  activateLabel: string
  deactivateLabel: string
}

export interface EntityConfig<K extends EntityKey, V extends FieldValues = FieldValues> {
  key: K
  label: string
  singular: string
  description?: string
  basePath: string
  icon: LucideIcon
  getTitle: (record: EntityOf<K>) => string
  getSubtitle?: (record: EntityOf<K>, lookups: Lookups) => ReactNode
  getStatus?: (record: EntityOf<K>) => string
  /** Show initials in an avatar (people) instead of the entity icon. */
  avatar?: 'initials' | 'icon'
  /** Extra metadata shown under the details title (e.g. "Employee ID: EMP-10234"). */
  getMeta?: (record: EntityOf<K>, lookups: Lookups) => ReactNode[]
  /** Text the list search matches against. */
  searchText: (record: EntityOf<K>, lookups: Lookups) => string
  columns: ColumnConfig<EntityOf<K>>[]
  filters?: FilterConfig<EntityOf<K>>[]
  defaultSort?: { field: string; order: SortOrder }
  form: EntityFormConfig<K, V>
  /** `page` uses /new and /:id/edit routes; `drawer` edits in place. */
  formMode: 'page' | 'drawer'
  detailSections?: DetailSectionConfig<EntityOf<K>>[]
  detailTabs?: (record: EntityOf<K>) => DetailTab[]
  bulkActions?: BulkActionConfig<EntityOf<K>>[]
  statusToggle?: StatusToggleConfig<EntityOf<K>>
  /** Return a reason to block deletion (e.g. "Role is assigned to 3 users"). */
  getDeleteBlocker?: (record: EntityOf<K>) => string | null
  /** Return a reason to block the status toggle for a record (e.g. suspending yourself). */
  getStatusToggleBlocker?: (record: EntityOf<K>) => string | null
  /** Return a reason to skip a record in a bulk action; other selected records are still processed. */
  getBulkActionBlocker?: (record: EntityOf<K>, action: BulkActionConfig<EntityOf<K>>) => string | null
  /** Label of the create button (defaults to "New <singular>"). */
  createLabel?: string
}

/** Identity helper that gives configs full type inference. */
export function defineEntityConfig<K extends EntityKey, V extends FieldValues>(config: EntityConfig<K, V>): EntityConfig<K, V> {
  return config
}
