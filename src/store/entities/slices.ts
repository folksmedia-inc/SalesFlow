import type { Draft } from '@reduxjs/toolkit'
import { seed } from '@/data/seed'
import type { RelatedEntityType, RelatedRef } from '@/types/models'
import { recordsRemoved } from './actions'
import { createEntitySlice } from './createEntitySlice'
import type { EntityKey } from './types'

/** Entity collections that can be the target of a `RelatedRef`. */
export const RELATED_TYPE_BY_ENTITY: Partial<Record<EntityKey, RelatedEntityType>> = {
  employees: 'employee',
  customers: 'customer',
  accounts: 'account',
  contacts: 'contact',
  departments: 'department',
  teams: 'team',
}

function refersToRemoved(related: RelatedRef | null, entity: EntityKey, ids: Set<string>): boolean {
  return related !== null && related.type === RELATED_TYPE_BY_ENTITY[entity] && ids.has(related.id)
}

/** Nulls out `field` on every record whose value is one of the removed ids. */
function clearReference<T extends Record<K, string | null>, K extends keyof T>(
  records: Record<string, Draft<T> | undefined>,
  field: K,
  ids: Set<string>,
) {
  for (const record of Object.values(records)) {
    const value = record?.[field as keyof Draft<T>] as unknown
    if (record && typeof value === 'string' && ids.has(value)) {
      ;(record as Record<K, string | null>)[field] = null
    }
  }
}

const byNewest = (a: { createdAt: string }, b: { createdAt: string }) => b.createdAt.localeCompare(a.createdAt)

export const employeesEntity = createEntitySlice({
  name: 'employees',
  seed: seed.employees,
  extraReducers: (builder) => {
    builder.addCase(recordsRemoved, (state, { payload }) => {
      const ids = new Set(payload.ids)
      if (payload.entity === 'employees') clearReference(state.entities, 'managerId', ids)
      if (payload.entity === 'departments') clearReference(state.entities, 'departmentId', ids)
      if (payload.entity === 'roles') clearReference(state.entities, 'roleId', ids)
    })
  },
})

export const departmentsEntity = createEntitySlice({
  name: 'departments',
  seed: seed.departments,
  extraReducers: (builder) => {
    builder.addCase(recordsRemoved, (state, { payload }) => {
      if (payload.entity === 'employees') clearReference(state.entities, 'headId', new Set(payload.ids))
    })
  },
})

export const teamsEntity = createEntitySlice({
  name: 'teams',
  seed: seed.teams,
  extraReducers: (builder) => {
    builder.addCase(recordsRemoved, (state, { payload }) => {
      const ids = new Set(payload.ids)
      if (payload.entity === 'employees') {
        clearReference(state.entities, 'leadId', ids)
        for (const team of Object.values(state.entities)) {
          team.memberIds = team.memberIds.filter((memberId) => !ids.has(memberId))
        }
      }
      if (payload.entity === 'departments') clearReference(state.entities, 'departmentId', ids)
    })
  },
})

export const customersEntity = createEntitySlice({
  name: 'customers',
  seed: seed.customers,
  extraReducers: (builder) => {
    builder.addCase(recordsRemoved, (state, { payload }) => {
      const ids = new Set(payload.ids)
      if (payload.entity === 'employees') clearReference(state.entities, 'ownerId', ids)
      if (payload.entity === 'accounts') clearReference(state.entities, 'accountId', ids)
    })
  },
})

export const accountsEntity = createEntitySlice({
  name: 'accounts',
  seed: seed.accounts,
  extraReducers: (builder) => {
    builder.addCase(recordsRemoved, (state, { payload }) => {
      if (payload.entity === 'employees') clearReference(state.entities, 'ownerId', new Set(payload.ids))
    })
  },
})

export const contactsEntity = createEntitySlice({
  name: 'contacts',
  seed: seed.contacts,
  extraReducers: (builder) => {
    builder.addCase(recordsRemoved, (state, { payload }) => {
      const ids = new Set(payload.ids)
      if (payload.entity === 'employees') clearReference(state.entities, 'ownerId', ids)
      if (payload.entity === 'accounts') clearReference(state.entities, 'accountId', ids)
      if (payload.entity === 'customers') clearReference(state.entities, 'customerId', ids)
    })
  },
})

export const tasksEntity = createEntitySlice({
  name: 'tasks',
  seed: seed.tasks,
  extraReducers: (builder) => {
    builder.addCase(recordsRemoved, (state, { payload }) => {
      const ids = new Set(payload.ids)
      if (payload.entity === 'employees') clearReference(state.entities, 'assigneeId', ids)
      for (const task of Object.values(state.entities)) {
        if (refersToRemoved(task.related, payload.entity, ids)) task.related = null
      }
    })
  },
})

export const activitiesEntity = createEntitySlice({
  name: 'activities',
  seed: seed.activities,
  sortComparer: (a, b) => b.occurredAt.localeCompare(a.occurredAt),
  extraReducers: (builder) => {
    builder.addCase(recordsRemoved, (state, { payload }) => {
      const ids = new Set(payload.ids)
      for (const activity of Object.values(state.entities)) {
        if (refersToRemoved(activity.related, payload.entity, ids)) activity.related = null
      }
    })
  },
})

export const notesEntity = createEntitySlice({
  name: 'notes',
  seed: seed.notes,
  sortComparer: byNewest,
  extraReducers: (builder, adapter) => {
    builder.addCase(recordsRemoved, (state, { payload }) => {
      const ids = new Set(payload.ids)
      const orphaned = Object.values(state.entities)
        .filter((note) => refersToRemoved(note.related, payload.entity, ids))
        .map((note) => note.id)
      adapter.removeMany(state, orphaned)
    })
  },
})

export const documentsEntity = createEntitySlice({
  name: 'documents',
  seed: seed.documents,
  sortComparer: byNewest,
  extraReducers: (builder) => {
    builder.addCase(recordsRemoved, (state, { payload }) => {
      const ids = new Set(payload.ids)
      for (const document of Object.values(state.entities)) {
        if (refersToRemoved(document.related, payload.entity, ids)) document.related = null
      }
    })
  },
})

export const usersEntity = createEntitySlice({
  name: 'users',
  seed: seed.users,
  extraReducers: (builder) => {
    builder.addCase(recordsRemoved, (state, { payload }) => {
      if (payload.entity === 'employees') clearReference(state.entities, 'employeeId', new Set(payload.ids))
    })
  },
})

export const rolesEntity = createEntitySlice({ name: 'roles', seed: seed.roles })

export const notificationsEntity = createEntitySlice({
  name: 'notifications',
  seed: seed.notifications,
  sortComparer: byNewest,
})

/** Registry of every entity collection, keyed by store key. */
export const entities = {
  employees: employeesEntity,
  departments: departmentsEntity,
  teams: teamsEntity,
  customers: customersEntity,
  accounts: accountsEntity,
  contacts: contactsEntity,
  tasks: tasksEntity,
  activities: activitiesEntity,
  notes: notesEntity,
  documents: documentsEntity,
  users: usersEntity,
  roles: rolesEntity,
  notifications: notificationsEntity,
} as const
