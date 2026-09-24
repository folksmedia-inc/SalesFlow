import type { User, UserStatus } from '@/types/models'
import { EMPLOYEE_IDS } from './mockEmployees'
import { ROLE_IDS } from './mockRoles'
import { timestampAgo, toEmail } from './seedUtils'

/** Password accepted for every demo user (demo only — never do this with real auth). */
export const DEMO_PASSWORD = 'Admin@123'

type UserSeed = [firstName: string, lastName: string, email: string | null, title: string, role: keyof typeof ROLE_IDS, status: UserStatus, employeeIndex: number | null, lastLoginHoursAgo: number | null]

const USERS: UserSeed[] = [
  ['Alex', 'Morgan', 'admin@adminhub.dev', 'System Administrator', 'admin', 'Active', null, 1],
  ['Priya', 'Raman', 'hr@adminhub.dev', 'HR Director', 'hrAdmin', 'Active', 28, 5],
  ['Marcus', 'Chen', 'sales@adminhub.dev', 'Account Executive', 'sales', 'Active', 16, 20],
  ['Daniel', 'Kim', null, 'VP of Engineering', 'manager', 'Active', 0, 3],
  ['Sophia', 'Martinez', null, 'Director of Product', 'manager', 'Active', 8, 30],
  ['Michael', 'Johnson', null, 'VP of Sales', 'manager', 'Active', 14, 8],
  ['Sarah', 'Thompson', null, 'Account Executive', 'sales', 'Active', 15, 2],
  ['Laura', 'Sánchez', null, 'Talent Acquisition Partner', 'hrAdmin', 'Active', 29, 50],
  ['John', 'Smith', null, 'Senior Software Engineer', 'employee', 'Active', 1, 12],
  ['Grace', 'Liu', null, 'Sales Operations Analyst', 'sales', 'Invited', 19, null],
  ['Chloe', 'Dubois', null, 'UX Researcher', 'employee', 'Suspended', 13, 900],
  ['Jessica', 'Moore', null, 'Head of Customer Success', 'manager', 'Active', 24, 70],
]

export function createSeedUsers(): User[] {
  return USERS.map(([firstName, lastName, email, title, role, status, employeeIndex, lastLoginHoursAgo], index) => {
    const createdAt = timestampAgo({ days: 380 - index * 23 })
    return {
      id: `usr_${String(index + 1).padStart(3, '0')}`,
      firstName,
      lastName,
      email: email ?? toEmail(firstName, lastName),
      title,
      roleId: ROLE_IDS[role],
      status,
      employeeId: employeeIndex === null ? null : EMPLOYEE_IDS[employeeIndex],
      lastLoginAt: lastLoginHoursAgo === null ? null : timestampAgo({ hours: lastLoginHoursAgo }),
      createdAt,
      updatedAt: createdAt,
    }
  })
}
