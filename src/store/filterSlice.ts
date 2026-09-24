import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ISODateString } from '@/types/common'

/**
 * Global, cross-page filters (e.g. the reporting period shared by the
 * dashboard and reports). Page-specific filters live in the URL instead,
 * so they can be bookmarked and shared.
 */

export type DateRangePreset =
  | 'last7Days'
  | 'last30Days'
  | 'last90Days'
  | 'last12Months'
  | 'yearToDate'
  | 'next30Days'
  | 'next90Days'
  | 'custom'

export interface GlobalDateRange {
  preset: DateRangePreset
  /** Only used when `preset` is `custom`. */
  from: ISODateString | null
  to: ISODateString | null
}

export interface FilterState {
  dateRange: GlobalDateRange
}

const initialState: FilterState = {
  dateRange: { preset: 'last12Months', from: null, to: null },
}

export const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    dateRangePresetSet(state, action: PayloadAction<Exclude<DateRangePreset, 'custom'>>) {
      state.dateRange = { preset: action.payload, from: null, to: null }
    },
    customDateRangeSet(state, action: PayloadAction<{ from: ISODateString; to: ISODateString }>) {
      state.dateRange = { preset: 'custom', ...action.payload }
    },
    filtersReset() {
      return initialState
    },
  },
  selectors: {
    selectGlobalDateRange: (state) => state.dateRange,
  },
})

export const { dateRangePresetSet, customDateRangeSet, filtersReset } = filterSlice.actions
export const { selectGlobalDateRange } = filterSlice.selectors
