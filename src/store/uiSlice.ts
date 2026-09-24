import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { storage } from '@/utils/storage'

export const UI_STORAGE_KEY = 'ui'

export type ThemeMode = 'light' | 'dark'
export type TableDensity = 'large' | 'middle' | 'small'

export interface UiState {
  sidebarCollapsed: boolean
  themeMode: ThemeMode
  tableDensity: TableDensity
  /** Hidden table columns per list, keyed by entity key. */
  hiddenColumns: Record<string, string[]>
}

function prefersDarkMode(): boolean {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch {
    return false
  }
}

function loadInitialState(): UiState {
  const defaults: UiState = {
    sidebarCollapsed: false,
    themeMode: prefersDarkMode() ? 'dark' : 'light',
    tableDensity: 'middle',
    hiddenColumns: {},
  }
  return { ...defaults, ...storage.get<Partial<UiState>>(UI_STORAGE_KEY) }
}

export const uiSlice = createSlice({
  name: 'ui',
  initialState: loadInitialState,
  reducers: {
    sidebarToggled(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    sidebarCollapsedSet(state, action: PayloadAction<boolean>) {
      state.sidebarCollapsed = action.payload
    },
    themeToggled(state) {
      state.themeMode = state.themeMode === 'light' ? 'dark' : 'light'
    },
    themeModeSet(state, action: PayloadAction<ThemeMode>) {
      state.themeMode = action.payload
    },
    tableDensitySet(state, action: PayloadAction<TableDensity>) {
      state.tableDensity = action.payload
    },
    hiddenColumnsSet(state, action: PayloadAction<{ list: string; hidden: string[] }>) {
      state.hiddenColumns[action.payload.list] = action.payload.hidden
    },
  },
  selectors: {
    selectSidebarCollapsed: (state) => state.sidebarCollapsed,
    selectThemeMode: (state) => state.themeMode,
    selectTableDensity: (state) => state.tableDensity,
    selectHiddenColumns: (state, list: string): string[] | undefined => state.hiddenColumns[list],
  },
})

export const { sidebarToggled, sidebarCollapsedSet, themeToggled, themeModeSet, tableDensitySet, hiddenColumnsSet } =
  uiSlice.actions
export const { selectSidebarCollapsed, selectThemeMode, selectTableDensity, selectHiddenColumns } = uiSlice.selectors
