import {
  createEntityAdapter,
  createSlice,
  type ActionReducerMapBuilder,
  type EntityAdapter,
  type EntityState,
  type PayloadAction,
} from '@reduxjs/toolkit'
import type { BaseRecord } from '@/types/common'
import { storage } from '@/utils/storage'
import { demoDataReset } from './actions'

export type EntitySliceState<T extends BaseRecord> = EntityState<T, string>

export interface RecordUpdate<T> {
  id: string
  changes: Partial<T>
}

interface EntitySliceOptions<T extends BaseRecord, Name extends string> {
  name: Name
  seed: () => T[]
  sortComparer?: (a: T, b: T) => number
  /** Extra reducers, e.g. reacting to `recordsRemoved` to clean up references. */
  extraReducers?: (builder: ActionReducerMapBuilder<EntitySliceState<T>>, adapter: EntityAdapter<T, string>) => void
}

export function persistedDataKey(name: string): string {
  return `data.${name}`
}

/**
 * Creates a normalized collection slice with standard CRUD reducers.
 * Initial state comes from localStorage (if the user changed data before)
 * or from seed data.
 */
export function createEntitySlice<T extends BaseRecord, const Name extends string>({
  name,
  seed,
  sortComparer,
  extraReducers,
}: EntitySliceOptions<T, Name>) {
  const adapter = createEntityAdapter<T>({ sortComparer })

  const loadInitialState = (): EntitySliceState<T> =>
    adapter.setAll(adapter.getInitialState(), storage.get<T[]>(persistedDataKey(name)) ?? seed())

  const touch = (changes: Partial<T>): Partial<T> => ({ ...changes, updatedAt: new Date().toISOString() })

  const slice = createSlice({
    name,
    initialState: loadInitialState,
    reducers: {
      added(state, action: PayloadAction<T>) {
        adapter.addOne(state as EntitySliceState<T>, action.payload)
      },
      addedMany(state, action: PayloadAction<T[]>) {
        adapter.addMany(state as EntitySliceState<T>, action.payload)
      },
      updated(state, action: PayloadAction<RecordUpdate<T>>) {
        const { id, changes } = action.payload
        adapter.updateOne(state as EntitySliceState<T>, { id, changes: touch(changes) })
      },
      updatedMany(state, action: PayloadAction<RecordUpdate<T>[]>) {
        adapter.updateMany(
          state as EntitySliceState<T>,
          action.payload.map(({ id, changes }) => ({ id, changes: touch(changes) })),
        )
      },
      removed(state, action: PayloadAction<string>) {
        adapter.removeOne(state as EntitySliceState<T>, action.payload)
      },
      removedMany(state, action: PayloadAction<string[]>) {
        adapter.removeMany(state as EntitySliceState<T>, action.payload)
      },
    },
    extraReducers: (builder) => {
      builder.addCase(demoDataReset, (state) => {
        adapter.setAll(state as EntitySliceState<T>, seed())
      })
      extraReducers?.(builder as ActionReducerMapBuilder<EntitySliceState<T>>, adapter)
    },
  })

  const selectors = adapter.getSelectors((rootState: Record<Name, EntitySliceState<T>>) => rootState[name])

  return { slice, adapter, selectors, actions: slice.actions, reducer: slice.reducer, name }
}
