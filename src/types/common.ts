export type EntityId = string

/** ISO-8601 date (YYYY-MM-DD) or date-time string. */
export type ISODateString = string

export type SortOrder = 'asc' | 'desc'

export interface SelectOption<V extends string = string> {
  label: string
  value: V
}

/** Every stored record has a string id and audit timestamps. */
export interface BaseRecord {
  id: EntityId
  createdAt: ISODateString
  updatedAt: ISODateString
}
