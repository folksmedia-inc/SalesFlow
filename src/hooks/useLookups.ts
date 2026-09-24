import { useMemo } from 'react'
import { ENTITY_BY_RELATED_TYPE, ENTITY_META } from '@/store/entities/entityMeta'
import type { EntityKey } from '@/store/entities/types'
import type { SelectOption } from '@/types/common'
import type { RelatedRef } from '@/types/models'
import { useEntityList, useEntityMap } from './useEntityData'

/** Collections that can back a select field or be resolved to a display name. */
export type LookupSource = 'employees' | 'departments' | 'teams' | 'customers' | 'accounts' | 'contacts' | 'roles' | 'users'

export interface Lookups {
  name: (source: LookupSource, id: string | null | undefined, fallback?: string) => string
  employeeName: (id: string | null | undefined) => string
  departmentName: (id: string | null | undefined) => string
  accountName: (id: string | null | undefined) => string
  roleName: (id: string | null | undefined) => string
  relatedName: (ref: RelatedRef | null | undefined) => string
  relatedPath: (ref: RelatedRef | null | undefined) => string | undefined
  /** Number of employees in a department. */
  departmentHeadcount: (departmentId: string) => number
  /** Number of employees reporting to a manager. */
  directReportCount: (employeeId: string) => number
}

/** Resolves ids from any collection to display names. */
export function useLookups(): Lookups {
  const maps: Record<LookupSource, Record<string, unknown>> = {
    employees: useEntityMap('employees'),
    departments: useEntityMap('departments'),
    teams: useEntityMap('teams'),
    customers: useEntityMap('customers'),
    accounts: useEntityMap('accounts'),
    contacts: useEntityMap('contacts'),
    roles: useEntityMap('roles'),
    users: useEntityMap('users'),
  }
  const { employees, departments, teams, customers, accounts, contacts, roles, users } = maps

  return useMemo(() => {
    const all = { employees, departments, teams, customers, accounts, contacts, roles, users }
    const headcount = new Map<string, number>()
    const reports = new Map<string, number>()
    for (const employee of Object.values(employees) as { departmentId: string | null; managerId: string | null }[]) {
      if (employee.departmentId) headcount.set(employee.departmentId, (headcount.get(employee.departmentId) ?? 0) + 1)
      if (employee.managerId) reports.set(employee.managerId, (reports.get(employee.managerId) ?? 0) + 1)
    }
    const name = (source: LookupSource, id: string | null | undefined, fallback = '—') => {
      if (!id) return fallback
      const record = all[source][id]
      return record ? (ENTITY_META[source].getName as (value: unknown) => string)(record) : fallback
    }
    return {
      name,
      employeeName: (id) => name('employees', id),
      departmentName: (id) => name('departments', id),
      accountName: (id) => name('accounts', id),
      roleName: (id) => name('roles', id),
      relatedName: (ref) => (ref ? name(ENTITY_BY_RELATED_TYPE[ref.type] as LookupSource, ref.id, 'Deleted record') : '—'),
      relatedPath: (ref) => {
        if (!ref) return undefined
        const key: EntityKey = ENTITY_BY_RELATED_TYPE[ref.type]
        return all[key as LookupSource][ref.id] ? ENTITY_META[key].getPath?.(ref.id) : undefined
      },
      departmentHeadcount: (departmentId) => headcount.get(departmentId) ?? 0,
      directReportCount: (employeeId) => reports.get(employeeId) ?? 0,
    }
  }, [employees, departments, teams, customers, accounts, contacts, roles, users])
}

/** Select options for a lookup collection, sorted by label. */
export function useLookupOptions(source: LookupSource | undefined): SelectOption[] {
  const records = useEntityList(source ?? 'employees')
  return useMemo(() => {
    if (!source) return []
    const getName = ENTITY_META[source].getName as (value: unknown) => string
    return records
      .map((record) => ({ value: record.id, label: getName(record) }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [records, source])
}
