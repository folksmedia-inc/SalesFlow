import { nanoid, type ActionCreatorWithPayload } from '@reduxjs/toolkit'
import { useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import type { RootState } from '@/app/store'
import type { RecordUpdate } from '@/store/entities/createEntitySlice'
import { ENTITY_META } from '@/store/entities/entityMeta'
import { entities } from '@/store/entities/slices'
import type { EntityKey, EntityOf, NewEntity } from '@/store/entities/types'

/*
 * Data-access hooks. Pages and components read and write application data
 * only through these hooks, never through slices directly — so the storage
 * mechanism (Redux today, an API tomorrow) can change without touching UI.
 */

interface EntitySelectorsOf<T> {
  selectAll: (state: RootState) => T[]
  selectEntities: (state: RootState) => Record<string, T>
  selectById: (state: RootState, id: string) => T | undefined
}

interface EntityActionsOf<T> {
  added: ActionCreatorWithPayload<T>
  updated: ActionCreatorWithPayload<RecordUpdate<T>>
  updatedMany: ActionCreatorWithPayload<RecordUpdate<T>[]>
  removed: ActionCreatorWithPayload<string>
  removedMany: ActionCreatorWithPayload<string[]>
}

function selectorsFor<K extends EntityKey>(key: K): EntitySelectorsOf<EntityOf<K>> {
  return entities[key].selectors as unknown as EntitySelectorsOf<EntityOf<K>>
}

function actionsFor<K extends EntityKey>(key: K): EntityActionsOf<EntityOf<K>> {
  return entities[key].actions as unknown as EntityActionsOf<EntityOf<K>>
}

/** All records of a collection (memoized; stable between unrelated renders). */
export function useEntityList<K extends EntityKey>(key: K): EntityOf<K>[] {
  return useAppSelector(selectorsFor(key).selectAll)
}

/** Records keyed by id. */
export function useEntityMap<K extends EntityKey>(key: K): Record<string, EntityOf<K>> {
  return useAppSelector(selectorsFor(key).selectEntities)
}

export function useEntityRecord<K extends EntityKey>(key: K, id: string | null | undefined): EntityOf<K> | undefined {
  return useAppSelector((state) => (id ? selectorsFor(key).selectById(state, id) : undefined))
}

export interface EntityCrud<K extends EntityKey> {
  create: (values: NewEntity<K>) => EntityOf<K>
  update: (id: string, changes: Partial<NewEntity<K>>) => void
  updateMany: (ids: string[], changes: Partial<NewEntity<K>>) => void
  remove: (id: string) => void
  removeMany: (ids: string[]) => void
}

/** Create / update / delete operations for a collection. */
export function useEntityCrud<K extends EntityKey>(key: K): EntityCrud<K> {
  const dispatch = useAppDispatch()

  return useMemo(() => {
    const actions = actionsFor(key)
    return {
      create(values) {
        const now = new Date().toISOString()
        const record = { ...values, id: `${ENTITY_META[key].idPrefix}_${nanoid(10)}`, createdAt: now, updatedAt: now } as EntityOf<K>
        dispatch(actions.added(record))
        return record
      },
      update(id, changes) {
        dispatch(actions.updated({ id, changes: changes as Partial<EntityOf<K>> }))
      },
      updateMany(ids, changes) {
        dispatch(actions.updatedMany(ids.map((id) => ({ id, changes: changes as Partial<EntityOf<K>> }))))
      },
      remove(id) {
        dispatch(actions.removed(id))
      },
      removeMany(ids) {
        dispatch(actions.removedMany(ids))
      },
    }
  }, [dispatch, key])
}
