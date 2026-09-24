import type { Note, RelatedEntityType } from '@/types/models'
import { ACCOUNT_IDS } from './mockAccounts'
import { CUSTOMER_IDS } from './mockCustomers'
import { EMPLOYEE_IDS } from './mockEmployees'
import { timestampAgo } from './seedUtils'

type NoteSeed = [content: string, author: string, related: [RelatedEntityType, number], daysAgo: number]

const NOTES: NoteSeed[] = [
  ['Strong performer this half — led the migration to the new auth service ahead of schedule.', 'Daniel Kim', ['employee', 1], 6],
  ['Interested in moving toward a tech lead role next year. Discuss growth plan at next 1:1.', 'Daniel Kim', ['employee', 1], 40],
  ['Parental leave through end of next month. Coverage arranged with Lucas.', 'Priya Raman', ['employee', 4], 12],
  ['Completed security training and laptop setup. Buddy: John Smith.', 'Laura Sánchez', ['employee', 7], 25],
  ['Procurement requires three competing quotes for renewals over $250k.', 'Sarah Thompson', ['customer', 0], 8],
  ['Decision maker is Hank; Mindy runs the evaluation committee.', 'Marcus Chen', ['customer', 1], 15],
  ['Very happy with support response times. Potential case study.', 'Ryan Murphy', ['customer', 2], 30],
  ['Churned due to budget cuts, not product fit. Revisit in 6 months.', 'Jessica Moore', ['customer', 6], 45],
  ['Board approved digital transformation budget for next fiscal year.', 'Michael Johnson', ['account', 4], 18],
  ['Requires EU data residency for the London subsidiary.', 'Michael Johnson', ['account', 5], 22],
  ['Two new campuses opening in spring — expansion opportunity.', 'Sarah Thompson', ['account', 9], 5],
  ['Asked about volume discount for 500+ seats.', 'Grace Liu', ['account', 11], 10],
]

const REF_IDS: Record<string, readonly string[]> = { employee: EMPLOYEE_IDS, customer: CUSTOMER_IDS, account: ACCOUNT_IDS }

export function createSeedNotes(): Note[] {
  return NOTES.map(([content, authorName, [type, refIndex], days], index) => {
    const createdAt = timestampAgo({ days, hours: index })
    return {
      id: `not_${String(index + 1).padStart(3, '0')}`,
      content,
      authorName,
      related: { type, id: REF_IDS[type][refIndex] },
      createdAt,
      updatedAt: createdAt,
    }
  })
}
