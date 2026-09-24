import { configureStore } from '@reduxjs/toolkit'
import { authSlice } from '@/store/authSlice'
import { entities } from '@/store/entities/slices'
import { filterSlice } from '@/store/filterSlice'
import { listenerMiddleware } from '@/store/listenerMiddleware'
import { registerDataListeners } from '@/store/listeners/dataListeners'
import { registerPersistenceListeners } from '@/store/listeners/persistenceListeners'
import { organizationSlice } from '@/store/organizationSlice'
import { uiSlice } from '@/store/uiSlice'

export const store = configureStore({
  reducer: {
    // Client state
    auth: authSlice.reducer,
    ui: uiSlice.reducer,
    filters: filterSlice.reducer,
    // Application data
    organization: organizationSlice.reducer,
    employees: entities.employees.reducer,
    departments: entities.departments.reducer,
    teams: entities.teams.reducer,
    customers: entities.customers.reducer,
    accounts: entities.accounts.reducer,
    contacts: entities.contacts.reducer,
    tasks: entities.tasks.reducer,
    activities: entities.activities.reducer,
    notes: entities.notes.reducer,
    documents: entities.documents.reducer,
    users: entities.users.reducer,
    roles: entities.roles.reducer,
    notifications: entities.notifications.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(listenerMiddleware.middleware),
})

export type AppStore = typeof store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

registerPersistenceListeners()
registerDataListeners()
