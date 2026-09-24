import { isAnyOf } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store'
import { persistedDataKey } from '@/store/entities/createEntitySlice'
import { ENTITY_KEYS } from '@/store/entities/types'
import { AUTH_STORAGE_KEY, loggedOut, login } from '@/store/authSlice'
import { ORGANIZATION_STORAGE_KEY } from '@/store/organizationSlice'
import { UI_STORAGE_KEY, uiSlice } from '@/store/uiSlice'
import { startAppListening } from '@/store/listenerMiddleware'
import { storage } from '@/utils/storage'

const SAVE_DEBOUNCE_MS = 250

/** Persists data, UI preferences and the session to localStorage. */
export function registerPersistenceListeners(): void {
  const lastSaved = new Map<string, unknown>()

  let latestState: RootState | null = null

  const flush = () => {
    const state = latestState
    if (!state) return
    for (const key of ENTITY_KEYS) {
      const slice = state[key]
      if (lastSaved.get(key) !== slice) {
        storage.set(persistedDataKey(key), Object.values(slice.entities))
        lastSaved.set(key, slice)
      }
    }
    if (lastSaved.get('organization') !== state.organization) {
      storage.set(ORGANIZATION_STORAGE_KEY, state.organization)
      lastSaved.set('organization', state.organization)
    }
  }

  // Data collections: debounced, and only the slices that actually changed.
  startAppListening({
    predicate: (_action, current, previous) =>
      current.organization !== previous.organization || ENTITY_KEYS.some((key) => current[key] !== previous[key]),
    effect: async (_action, api) => {
      latestState = api.getState()
      api.cancelActiveListeners()
      await api.delay(SAVE_DEBOUNCE_MS)
      latestState = api.getState()
      flush()
    },
  })

  // Never lose the last change when the tab is closed or reloaded mid-debounce.
  window.addEventListener('pagehide', flush)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush()
  })

  startAppListening({
    matcher: isAnyOf(...Object.values(uiSlice.actions)),
    effect: (_action, api) => storage.set(UI_STORAGE_KEY, api.getState().ui),
  })

  startAppListening({
    actionCreator: login.fulfilled,
    effect: (action) => storage.set(AUTH_STORAGE_KEY, action.payload),
  })

  startAppListening({
    actionCreator: loggedOut,
    effect: () => storage.remove(AUTH_STORAGE_KEY),
  })
}
