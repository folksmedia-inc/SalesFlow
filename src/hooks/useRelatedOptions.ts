import { useMemo } from 'react'
import { ENTITY_BY_RELATED_TYPE, ENTITY_META } from '@/store/entities/entityMeta'
import type { SelectOption } from '@/types/common'
import type { RelatedEntityType, RelatedRef } from '@/types/models'
import { useEntityList } from './useEntityData'

const RELATED_LABELS: Record<RelatedEntityType, string> = {
  employee: 'Employee',
  customer: 'Customer',
  account: 'Account',
  contact: 'Contact',
  department: 'Department',
  team: 'Team',
}

export function encodeRelated(ref: RelatedRef | null | undefined): string | null {
  return ref ? `${ref.type}:${ref.id}` : null
}

export function decodeRelated(value: string | null | undefined): RelatedRef | null {
  if (!value) return null
  const [type, id] = value.split(':')
  return type in ENTITY_BY_RELATED_TYPE && id ? { type: type as RelatedEntityType, id } : null
}

export function relatedTypeLabel(type: RelatedEntityType): string {
  return RELATED_LABELS[type]
}

/** Every record a task/activity/document can be linked to, as `"<type>:<id>"` options. */
export function useRelatedOptions(): SelectOption[] {
  const employees = useEntityList('employees')
  const customers = useEntityList('customers')
  const accounts = useEntityList('accounts')
  const contacts = useEntityList('contacts')
  const departments = useEntityList('departments')
  const teams = useEntityList('teams')

  return useMemo(() => {
    const groups: [RelatedEntityType, { id: string }[]][] = [
      ['customer', customers],
      ['account', accounts],
      ['contact', contacts],
      ['employee', employees],
      ['department', departments],
      ['team', teams],
    ]
    return groups.flatMap(([type, records]) => {
      const getName = ENTITY_META[ENTITY_BY_RELATED_TYPE[type]].getName as (value: unknown) => string
      return records.map((record) => ({ value: `${type}:${record.id}`, label: `${RELATED_LABELS[type]} · ${getName(record)}` }))
    })
  }, [employees, customers, accounts, contacts, departments, teams])
}
