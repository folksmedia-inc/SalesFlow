import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { seed } from '@/data/seed'
import type { Organization } from '@/types/models'
import { storage } from '@/utils/storage'
import { demoDataReset } from './entities/actions'

export const ORGANIZATION_STORAGE_KEY = 'data.organization'

export const organizationSlice = createSlice({
  name: 'organization',
  initialState: (): Organization => storage.get<Organization>(ORGANIZATION_STORAGE_KEY) ?? seed.organization(),
  reducers: {
    organizationUpdated(state, action: PayloadAction<Partial<Organization>>) {
      Object.assign(state, action.payload)
    },
  },
  extraReducers: (builder) => {
    builder.addCase(demoDataReset, () => seed.organization())
  },
  selectors: {
    selectOrganization: (state) => state,
  },
})

export const { organizationUpdated } = organizationSlice.actions
export const { selectOrganization } = organizationSlice.selectors
