import type { Department } from '@/types/models'
import { timestampAgo } from './seedUtils'

export const DEPARTMENT_IDS = ['dep_eng', 'dep_prd', 'dep_dsn', 'dep_sls', 'dep_mkt', 'dep_cs', 'dep_hr', 'dep_fin'] as const

type DepartmentSeed = [name: string, code: string, headIndex: number, location: string, budget: number, description: string, status?: Department['status']]

const DEPARTMENTS: DepartmentSeed[] = [
  ['Engineering', 'ENG', 0, 'San Francisco, CA', 4_800_000, 'Builds and operates the core platform, web and mobile products.'],
  ['Product', 'PRD', 8, 'New York, NY', 1_200_000, 'Owns product strategy, roadmap and discovery.'],
  ['Design', 'DSN', 11, 'San Francisco, CA', 850_000, 'Product design, UX research and the design system.'],
  ['Sales', 'SLS', 14, 'New York, NY', 2_600_000, 'New business, account management and sales operations.'],
  ['Marketing', 'MKT', 20, 'New York, NY', 1_700_000, 'Brand, content, demand generation and growth.'],
  ['Customer Success', 'CS', 24, 'Austin, TX', 1_100_000, 'Onboarding, support and retention of customers.'],
  ['Human Resources', 'HR', 28, 'Chicago, IL', 650_000, 'Talent acquisition, people operations and culture.'],
  ['Finance', 'FIN', 31, 'New York, NY', 900_000, 'Accounting, payroll, FP&A and procurement.'],
]

export function createSeedDepartments(employeeIds: readonly string[]): Department[] {
  return DEPARTMENTS.map(([name, code, headIndex, location, budget, description, status = 'Active'], index) => {
    const createdAt = timestampAgo({ days: 1500 - index * 90 })
    return {
      id: DEPARTMENT_IDS[index],
      name,
      code,
      headId: employeeIds[headIndex] ?? null,
      location,
      budget,
      description,
      status,
      createdAt,
      updatedAt: createdAt,
    }
  })
}
