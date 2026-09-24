import { createAction } from '@reduxjs/toolkit'
import type { EntityKey } from './types'

/** Restores every entity slice to its seed data. */
export const demoDataReset = createAction('data/demoDataReset')

/**
 * Broadcast after records are deleted so other slices can clean up
 * references to them (e.g. team members, managers, related records).
 */
export const recordsRemoved = createAction<{ entity: EntityKey; ids: string[] }>('data/recordsRemoved')
