import { isAnyOf, nanoid, type PayloadAction, type UnknownAction } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store'
import { selectCurrentUserName } from '@/store/authSlice'
import { recordsRemoved } from '@/store/entities/actions'
import { ENTITY_META } from '@/store/entities/entityMeta'
import { activitiesEntity, entities, notificationsEntity } from '@/store/entities/slices'
import type { EntityKey } from '@/store/entities/types'
import { startAppListening } from '@/store/listenerMiddleware'
import type { Activity, ActivityType, RelatedRef } from '@/types/models'

/** Collections whose changes are written to the activity timeline. */
const LOGGED_ENTITIES = [
  'employees',
  'departments',
  'teams',
  'customers',
  'accounts',
  'contacts',
  'tasks',
  'documents',
  'users',
  'roles',
] as const satisfies readonly EntityKey[]

type LoggedEntity = (typeof LOGGED_ENTITIES)[number]

const allEntities = Object.values(entities)

function entityKeyOf(action: UnknownAction): EntityKey {
  return action.type.split('/')[0] as EntityKey
}

function findRecord(state: RootState, key: EntityKey, id: string): Record<string, unknown> | undefined {
  return state[key].entities[id] as unknown as Record<string, unknown> | undefined
}

function recordName(state: RootState, key: EntityKey, id: string): string {
  const record = findRecord(state, key, id)
  if (!record) return 'record'
  return (ENTITY_META[key].getName as (value: unknown) => string)(record)
}

function relatedRefFor(state: RootState, key: EntityKey, id: string): RelatedRef | null {
  const relatedType = ENTITY_META[key].relatedType
  if (relatedType) return { type: relatedType, id }
  const record = findRecord(state, key, id) as { related?: RelatedRef | null } | undefined
  return record?.related ?? null
}

const FIELD_LABELS: Record<string, string> = {
  jobTitle: 'job title', departmentId: 'department', managerId: 'manager', ownerId: 'owner', assigneeId: 'assignee',
  accountId: 'account', customerId: 'customer', leadId: 'team lead', headId: 'department head', memberIds: 'members',
  roleId: 'role', dueDate: 'due date', employeeCount: 'employee count', annualRevenue: 'revenue', firstName: 'first name',
  lastName: 'last name', joiningDate: 'joining date', employmentType: 'employment type', lifetimeValue: 'lifetime value',
}

function describeChanges(changes: Record<string, unknown>): string {
  const fields = Object.keys(changes).filter((field) => field !== 'updatedAt')
  if (fields.length === 0) return 'Details updated.'
  return `Changed ${fields.map((field) => FIELD_LABELS[field] ?? field).join(', ')}.`
}

function buildActivity(fields: Pick<Activity, 'type' | 'subject' | 'description' | 'performedBy' | 'related'>): Activity {
  const now = new Date().toISOString()
  return { id: `act_${nanoid(10)}`, ...fields, occurredAt: now, createdAt: now, updatedAt: now }
}

export function registerDataListeners(): void {
  // Broadcast deletions so every slice can clean up references to them.
  startAppListening({
    matcher: isAnyOf(...allEntities.map((entity) => entity.actions.removed), ...allEntities.map((entity) => entity.actions.removedMany)),
    effect: (action, api) => {
      const { payload } = action as PayloadAction<string | string[]>
      const ids = Array.isArray(payload) ? payload : [payload]
      api.dispatch(recordsRemoved({ entity: entityKeyOf(action), ids }))
    },
  })

  // Record every change to business data on the activity timeline.
  const logged = LOGGED_ENTITIES.map((key) => entities[key])
  startAppListening({
    matcher: isAnyOf(
      ...logged.map((entity) => entity.actions.added),
      ...logged.map((entity) => entity.actions.updated),
      ...logged.map((entity) => entity.actions.updatedMany),
      ...logged.map((entity) => entity.actions.removed),
      ...logged.map((entity) => entity.actions.removedMany),
    ),
    effect: (action, api) => {
      const { payload } = action as PayloadAction<unknown>
      const key = entityKeyOf(action) as LoggedEntity
      const meta = ENTITY_META[key]
      const operation = action.type.split('/')[1]
      const state = api.getState()
      const previous = api.getOriginalState()
      const performedBy = selectCurrentUserName(state)
      const noun = meta.singular.toLowerCase()
      let type: ActivityType = 'Update'
      let activity: Activity | undefined

      if (operation === 'added') {
        const id = (payload as { id: string }).id
        const name = recordName(state, key, id)
        type = key === 'tasks' ? 'Task' : 'Update'
        activity = buildActivity({ type, subject: `Created ${noun} ${name}`, description: `${performedBy} created ${noun} "${name}".`, performedBy, related: relatedRefFor(state, key, id) })
      } else if (operation === 'updated') {
        const { id, changes } = payload as { id: string; changes: Record<string, unknown> }
        const name = recordName(state, key, id)
        const completedTask = key === 'tasks' && changes.status === 'Completed'
        activity = buildActivity({
          type: completedTask ? 'Task' : 'Update',
          subject: completedTask ? `Completed task ${name}` : `Updated ${noun} ${name}`,
          description: completedTask ? `${performedBy} marked "${name}" as completed.` : describeChanges(changes),
          performedBy,
          related: relatedRefFor(state, key, id),
        })
      } else if (operation === 'updatedMany') {
        const updates = payload as { id: string; changes: Record<string, unknown> }[]
        if (updates.length === 0) return
        activity = buildActivity({ type, subject: `Updated ${updates.length} ${updates.length === 1 ? noun : meta.plural.toLowerCase()}`, description: describeChanges(updates[0].changes), performedBy, related: null })
      } else if (operation === 'removed') {
        const id = payload as string
        activity = buildActivity({ type, subject: `Deleted ${noun} ${recordName(previous, key, id)}`, description: `${performedBy} deleted this ${noun}.`, performedBy, related: null })
      } else if (operation === 'removedMany') {
        const ids = payload as string[]
        activity = buildActivity({ type, subject: `Deleted ${ids.length} ${ids.length === 1 ? noun : meta.plural.toLowerCase()}`, description: `${performedBy} deleted ${ids.length} records.`, performedBy, related: null })
      }

      if (activity) api.dispatch(activitiesEntity.actions.added(activity))

      // Notify about newly created tasks.
      if (key === 'tasks' && operation === 'added') {
        const task = payload as { id: string; title: string; assigneeId: string | null }
        const assignee = task.assigneeId ? recordName(state, 'employees', task.assigneeId) : 'Unassigned'
        const now = new Date().toISOString()
        api.dispatch(
          notificationsEntity.actions.added({
            id: `ntf_${nanoid(10)}`,
            title: 'New task created',
            description: `"${task.title}" was assigned to ${assignee}.`,
            type: 'task',
            read: false,
            link: `/tasks?edit=${task.id}`,
            createdAt: now,
            updatedAt: now,
          }),
        )
      }
    },
  })
}
