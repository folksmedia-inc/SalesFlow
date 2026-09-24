import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { DEMO_PASSWORD } from '@/data/seed'
import type { AuthSession, LoginCredentials } from '@/types/auth'
import type { Role, User } from '@/types/models'
import { storage } from '@/utils/storage'
import type { EntitySliceState } from './entities/createEntitySlice'
import { rolesEntity, usersEntity } from './entities/slices'

export const AUTH_STORAGE_KEY = 'auth'
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000

export interface AuthState {
  userId: string | null
  token: string | null
  expiresAt: string | null
}

/** Minimal root-state shape these selectors need (avoids importing the store). */
interface AuthRootState {
  auth: AuthState
  users: EntitySliceState<User>
  roles: EntitySliceState<Role>
}

const emptyState: AuthState = { userId: null, token: null, expiresAt: null }

function loadInitialState(): AuthState {
  const persisted = storage.get<AuthState>(AUTH_STORAGE_KEY)
  if (!persisted?.token || !persisted.userId || !persisted.expiresAt) return emptyState
  if (new Date(persisted.expiresAt).getTime() <= Date.now()) return emptyState
  return persisted
}

/**
 * Demo sign-in: checks credentials against the Users collection in the
 * store. Every active user accepts the shared demo password.
 */
export const login = createAsyncThunk<AuthSession, LoginCredentials, { rejectValue: string }>(
  'auth/login',
  ({ email, password }, { getState, rejectWithValue }) => {
    const state = getState() as AuthRootState
    const normalizedEmail = email.trim().toLowerCase()
    const user = usersEntity.selectors.selectAll(state).find((candidate) => candidate.email.toLowerCase() === normalizedEmail)

    if (!user || password !== DEMO_PASSWORD) return rejectWithValue('Invalid email or password.')
    if (user.status === 'Suspended') return rejectWithValue('This account is suspended. Contact your administrator.')
    if (user.status === 'Invited') return rejectWithValue('This invitation has not been accepted yet.')

    return {
      userId: user.id,
      token: `local.${btoa(`${user.id}:${Date.now()}`)}`,
      expiresAt: new Date(Date.now() + SESSION_DURATION_MS).toISOString(),
    }
  },
)

export const authSlice = createSlice({
  name: 'auth',
  initialState: loadInitialState,
  reducers: {
    loggedOut() {
      return emptyState
    },
  },
  extraReducers: (builder) => {
    builder.addCase(login.fulfilled, (_state, action) => action.payload)
  },
})

export const { loggedOut } = authSlice.actions

export function selectCurrentUser(state: AuthRootState): User | undefined {
  const { userId } = state.auth
  return userId ? usersEntity.selectors.selectById(state, userId) : undefined
}

export function selectCurrentUserRole(state: AuthRootState): Role | undefined {
  const user = selectCurrentUser(state)
  return user ? rolesEntity.selectors.selectById(state, user.roleId) : undefined
}

/** Signed in, and the user record still exists and is active. */
export function selectIsAuthenticated(state: AuthRootState): boolean {
  const user = selectCurrentUser(state)
  return Boolean(state.auth.token && user && user.status === 'Active')
}

export function selectCurrentUserName(state: AuthRootState): string {
  const user = selectCurrentUser(state)
  return user ? `${user.firstName} ${user.lastName}` : 'System'
}
