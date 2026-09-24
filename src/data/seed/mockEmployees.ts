import type { Employee, EmployeeStatus, EmploymentType, Gender } from '@/types/models'
import { DEPARTMENT_IDS } from './mockDepartments'
import { ROLE_IDS } from './mockRoles'
import { daysAgo, monthsAgo, OFFICE_ADDRESSES, timestampAgo, toEmail } from './seedUtils'

type RoleKey = keyof typeof ROLE_IDS

type EmployeeSeed = [
  firstName: string,
  lastName: string,
  gender: Gender,
  jobTitle: string,
  departmentIndex: number,
  managerIndex: number | null,
  location: string,
  status: EmployeeStatus,
  employmentType: EmploymentType,
  joinedMonthsAgo: number,
  role: RoleKey,
]

const EMPLOYEES: EmployeeSeed[] = [
  ['Daniel', 'Kim', 'Male', 'VP of Engineering', 0, null, 'San Francisco, CA', 'Active', 'Full-time', 52, 'manager'],
  ['John', 'Smith', 'Male', 'Senior Software Engineer', 0, 0, 'San Francisco, CA', 'Active', 'Full-time', 30, 'employee'],
  ['Aisha', 'Patel', 'Female', 'Staff Software Engineer', 0, 0, 'Seattle, WA', 'Active', 'Full-time', 40, 'employee'],
  ['Lucas', 'Oliveira', 'Male', 'Software Engineer', 0, 1, 'Remote', 'Active', 'Full-time', 11, 'employee'],
  ['Mei', 'Tanaka', 'Female', 'Frontend Engineer', 0, 1, 'San Francisco, CA', 'On Leave', 'Full-time', 20, 'employee'],
  ['Ethan', 'Brooks', 'Male', 'DevOps Engineer', 0, 0, 'Austin, TX', 'Active', 'Full-time', 9, 'employee'],
  ['Zara', 'Ahmed', 'Female', 'QA Engineer', 0, 2, 'Toronto, CA', 'Active', 'Contract', 5, 'employee'],
  ['Noah', 'Fischer', 'Male', 'Software Engineer Intern', 0, 1, 'San Francisco, CA', 'Active', 'Intern', 0, 'employee'],
  ['Sophia', 'Martinez', 'Female', 'Director of Product', 1, null, 'New York, NY', 'Active', 'Full-time', 44, 'manager'],
  ['Liam', "O'Connor", 'Male', 'Senior Product Manager', 1, 8, 'New York, NY', 'Active', 'Full-time', 26, 'employee'],
  ['Hannah', 'Weber', 'Female', 'Product Analyst', 1, 8, 'Chicago, IL', 'Active', 'Full-time', 7, 'employee'],
  ['Isabella', 'Rossi', 'Female', 'Head of Design', 2, null, 'San Francisco, CA', 'Active', 'Full-time', 38, 'manager'],
  ['Kenji', 'Watanabe', 'Male', 'Senior Product Designer', 2, 11, 'Remote', 'Active', 'Full-time', 18, 'employee'],
  ['Chloe', 'Dubois', 'Female', 'UX Researcher', 2, 11, 'London, UK', 'Inactive', 'Part-time', 22, 'employee'],
  ['Michael', 'Johnson', 'Male', 'VP of Sales', 3, null, 'New York, NY', 'Active', 'Full-time', 48, 'manager'],
  ['Sarah', 'Thompson', 'Female', 'Account Executive', 3, 14, 'New York, NY', 'Active', 'Full-time', 24, 'sales'],
  ['Marcus', 'Chen', 'Male', 'Account Executive', 3, 14, 'Chicago, IL', 'Active', 'Full-time', 16, 'sales'],
  ['Emily', 'Davis', 'Female', 'Sales Development Representative', 3, 15, 'Austin, TX', 'Active', 'Full-time', 6, 'sales'],
  ['Carlos', 'Mendes', 'Male', 'Sales Development Representative', 3, 15, 'Remote', 'On Leave', 'Full-time', 10, 'sales'],
  ['Grace', 'Liu', 'Female', 'Sales Operations Analyst', 3, 14, 'San Francisco, CA', 'Active', 'Full-time', 3, 'sales'],
  ['Rachel', 'Green', 'Female', 'Marketing Director', 4, null, 'New York, NY', 'Active', 'Full-time', 36, 'manager'],
  ['David', 'Wilson', 'Male', 'Content Marketing Manager', 4, 20, 'Remote', 'Active', 'Full-time', 19, 'employee'],
  ['Amara', 'Okafor', 'Female', 'Growth Marketer', 4, 20, 'London, UK', 'Active', 'Full-time', 8, 'employee'],
  ['Tom', 'Becker', 'Male', 'Marketing Coordinator', 4, 21, 'Chicago, IL', 'Inactive', 'Contract', 13, 'employee'],
  ['Jessica', 'Moore', 'Female', 'Head of Customer Success', 5, null, 'Austin, TX', 'Active', 'Full-time', 34, 'manager'],
  ['Ryan', 'Murphy', 'Male', 'Customer Success Manager', 5, 24, 'Austin, TX', 'Active', 'Full-time', 15, 'employee'],
  ['Fatima', 'Hassan', 'Female', 'Support Specialist', 5, 24, 'Toronto, CA', 'Active', 'Full-time', 4, 'employee'],
  ['Jake', 'Robinson', 'Male', 'Support Specialist', 5, 25, 'Remote', 'Active', 'Part-time', 2, 'employee'],
  ['Priya', 'Raman', 'Female', 'HR Director', 6, null, 'Chicago, IL', 'Active', 'Full-time', 50, 'hrAdmin'],
  ['Laura', 'Sánchez', 'Female', 'Talent Acquisition Partner', 6, 28, 'Chicago, IL', 'Active', 'Full-time', 12, 'hrAdmin'],
  ['Samuel', 'Adeyemi', 'Male', 'HR Generalist', 6, 28, 'New York, NY', 'On Leave', 'Full-time', 8, 'hrAdmin'],
  ['Andrew', 'Clarke', 'Male', 'Chief Financial Officer', 7, null, 'New York, NY', 'Active', 'Full-time', 58, 'manager'],
  ['Nina', 'Petrova', 'Female', 'Senior Accountant', 7, 31, 'New York, NY', 'Active', 'Full-time', 28, 'employee'],
  ['Oliver', 'Grant', 'Male', 'Financial Analyst', 7, 31, 'London, UK', 'Active', 'Full-time', 5, 'employee'],
  ['Yuki', 'Sato', 'Female', 'Payroll Specialist', 7, 32, 'Remote', 'Active', 'Contract', 0, 'employee'],
  ['Ben', 'Carter', 'Male', 'Accounts Payable Clerk', 7, 32, 'Chicago, IL', 'Inactive', 'Full-time', 17, 'employee'],
]

export const EMPLOYEE_IDS: readonly string[] = EMPLOYEES.map((_, index) => `emp_${String(index + 1).padStart(3, '0')}`)

export function createSeedEmployees(): Employee[] {
  return EMPLOYEES.map(
    ([firstName, lastName, gender, jobTitle, departmentIndex, managerIndex, location, status, employmentType, joinedMonthsAgo, role], index) => {
      // 0 = a recent hire (within the last couple of weeks).
      const joiningDate = joinedMonthsAgo === 0 ? daysAgo(4 + (index % 9)) : monthsAgo(joinedMonthsAgo, 3 + ((index * 7) % 24))
      const office = OFFICE_ADDRESSES[location] ?? OFFICE_ADDRESSES.Remote
      const birthYear = 1972 + ((index * 7) % 27)
      const birthMonth = String(((index * 5) % 12) + 1).padStart(2, '0')
      const birthDay = String(((index * 11) % 27) + 1).padStart(2, '0')
      const createdAt = new Date(`${joiningDate}T09:00:00Z`).toISOString()

      return {
        id: EMPLOYEE_IDS[index],
        employeeId: `EMP-${10201 + index}`,
        firstName,
        lastName,
        email: toEmail(firstName, lastName),
        phone: `+1 (${[415, 212, 512, 312, 206][index % 5]}) 555-${String(1200 + index * 37).slice(-4)}`,
        dateOfBirth: `${birthYear}-${birthMonth}-${birthDay}`,
        gender,
        jobTitle,
        departmentId: DEPARTMENT_IDS[departmentIndex],
        managerId: managerIndex === null ? null : EMPLOYEE_IDS[managerIndex],
        employmentType,
        joiningDate,
        location,
        status,
        roleId: ROLE_IDS[role],
        ...office,
        createdAt,
        updatedAt: timestampAgo({ days: (index * 3) % 40, hours: index }),
      }
    },
  )
}
