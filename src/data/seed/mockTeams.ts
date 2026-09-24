import type { Team } from '@/types/models'
import { DEPARTMENT_IDS } from './mockDepartments'
import { EMPLOYEE_IDS } from './mockEmployees'
import { timestampAgo } from './seedUtils'

type TeamSeed = [name: string, departmentIndex: number, leadIndex: number, memberIndexes: number[], description: string, status?: Team['status']]

const TEAMS: TeamSeed[] = [
  ['Platform', 0, 2, [2, 3, 5, 6], 'Core services, infrastructure and developer tooling.'],
  ['Web Experience', 0, 1, [1, 4, 7, 12], 'Customer-facing web application and design system implementation.'],
  ['Product Discovery', 1, 9, [9, 10, 12, 13], 'Research, prototyping and validation of new product bets.'],
  ['Enterprise Sales', 3, 15, [15, 16, 19], 'Named enterprise accounts and strategic deals.'],
  ['Sales Development', 3, 17, [17, 18], 'Outbound prospecting and inbound lead qualification.'],
  ['Growth Marketing', 4, 22, [21, 22, 23], 'Acquisition campaigns, lifecycle email and experimentation.', 'Inactive'],
  ['Customer Onboarding', 5, 25, [25, 26, 27], 'Implementation and onboarding for new customers.'],
  ['People Operations', 6, 29, [28, 29, 30], 'Hiring, onboarding and employee experience programs.'],
]

export function createSeedTeams(): Team[] {
  return TEAMS.map(([name, departmentIndex, leadIndex, memberIndexes, description, status = 'Active'], index) => {
    const createdAt = timestampAgo({ days: 600 - index * 45 })
    return {
      id: `team_${String(index + 1).padStart(2, '0')}`,
      name,
      departmentId: DEPARTMENT_IDS[departmentIndex],
      leadId: EMPLOYEE_IDS[leadIndex],
      memberIds: memberIndexes.map((memberIndex) => EMPLOYEE_IDS[memberIndex]),
      description,
      status,
      createdAt,
      updatedAt: createdAt,
    }
  })
}
