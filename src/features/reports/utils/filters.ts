import type { SelectOption } from '@/types/common'

/** A record passes a multi-select filter when nothing is selected or its value is selected. */
export function matches(selected: string[] | undefined, value: string | null | undefined): boolean {
  return !selected?.length || selected.includes(value ?? '')
}

export function enumOptions(values: readonly string[]): SelectOption[] {
  return values.map((value) => ({ value, label: value }))
}

/** Sentinel filter value for records with no department / assignee. */
export const NONE_VALUE = '__none__'
