import type { Activity, ActivityType, RelatedEntityType } from '@/types/models'
import { ACCOUNT_IDS } from './mockAccounts'
import { CUSTOMER_IDS } from './mockCustomers'
import { DEPARTMENT_IDS } from './mockDepartments'
import { EMPLOYEE_IDS } from './mockEmployees'
import { timestampAgo } from './seedUtils'

type ActivitySeed = [type: ActivityType, subject: string, description: string, performedBy: string, related: [RelatedEntityType, number] | null, hoursAgo: number]

const ACTIVITIES: ActivitySeed[] = [
  ['Update', 'Updated employee profile', 'Changed job title and reporting line for John Smith.', 'Priya Raman', ['employee', 1], 1],
  ['Update', 'Created a new customer', 'Added Brightline Clinics as a new lead.', 'Sarah Thompson', ['customer', 12], 2],
  ['Task', 'Completed a task', 'Closed "Escalation: Blue Harbor outage".', 'Ryan Murphy', ['customer', 8], 3],
  ['Update', 'Added a new department', 'Created the Customer Success department structure.', 'Alex Morgan', ['department', 5], 5],
  ['Call', 'Discovery call with Contoso Media', 'Confirmed budget for Q1 and identified two additional stakeholders.', 'Emily Davis', ['customer', 7], 7],
  ['Email', 'Sent renewal proposal', 'Shared the renewal proposal and pricing sheet with Wile Coyote.', 'Sarah Thompson', ['customer', 0], 9],
  ['Meeting', 'QBR with Stark Retail Group', 'Reviewed adoption metrics; customer asked for SSO rollout plan.', 'Michael Johnson', ['account', 4], 22],
  ['Note', 'Contract redlines received', 'Legal returned redlines on liability cap and data residency.', 'Michael Johnson', ['account', 5], 26],
  ['Call', 'Security review call', 'Walked Globex through SOC 2 report and pen test summary.', 'Marcus Chen', ['customer', 1], 28],
  ['Update', 'Employee status changed', 'Mei Tanaka marked as On Leave.', 'Priya Raman', ['employee', 4], 30],
  ['Meeting', 'Onboarding session', 'Completed first-week onboarding for Noah Fischer.', 'Laura Sánchez', ['employee', 7], 34],
  ['Email', 'Follow-up after demo', 'Sent recording and next steps to Alice Hartley.', 'Marcus Chen', ['customer', 3], 46],
  ['Task', 'Completed a task', 'Closed "Close September books".', 'Nina Petrova', ['department', 7], 50],
  ['Update', 'Updated account details', 'Updated annual revenue and employee count for Globex Industries.', 'Grace Liu', ['account', 1], 54],
  ['Call', 'Check-in with Evergreen University', 'Discussed expansion to two new campuses next semester.', 'Sarah Thompson', ['account', 9], 70],
  ['Meeting', 'Engineering all-hands', 'Presented platform roadmap and reliability goals.', 'Daniel Kim', ['department', 0], 76],
  ['Note', 'Candidate pipeline update', 'Three engineering candidates moved to final round.', 'Laura Sánchez', ['department', 6], 80],
  ['Email', 'Invoice reminder', 'Sent payment reminder for overdue invoice INV-2291.', 'Nina Petrova', ['account', 11], 96],
  ['Update', 'Created a new customer', 'Added Copperleaf Energy as a prospect.', 'Emily Davis', ['customer', 13], 100],
  ['Call', 'Churn interview', 'Spoke with Northwind about reasons for cancellation.', 'Jessica Moore', ['customer', 6], 120],
  ['Meeting', 'Pipeline review', 'Weekly pipeline review with the enterprise sales team.', 'Michael Johnson', ['department', 3], 130],
  ['Task', 'Completed a task', 'Closed "Qualify Contoso Media lead".', 'Emily Davis', ['customer', 7], 140],
  ['Update', 'Employee joined', 'Yuki Sato joined Finance as Payroll Specialist.', 'Priya Raman', ['employee', 34], 160],
  ['Note', 'Customer feedback', 'Initech asked for scheduled report exports to email.', 'Ryan Murphy', ['customer', 2], 175],
  ['Email', 'Webinar invitations sent', 'October webinar invitation sent to 4,200 contacts.', 'Amara Okafor', ['department', 4], 190],
  ['Call', 'Reference call', 'Lucius Fox agreed to be a reference for Umbrella Health.', 'Michael Johnson', ['customer', 5], 210],
  ['Meeting', 'Design critique', 'Reviewed new dashboard layout and data table patterns.', 'Isabella Rossi', ['department', 2], 230],
  ['Update', 'Team created', 'Created the Customer Onboarding team.', 'Jessica Moore', ['department', 5], 260],
  ['Task', 'Completed a task', 'Closed "Onboard new hire: Noah Fischer".', 'Laura Sánchez', ['employee', 7], 280],
  ['Email', 'Pilot proposal sent', 'Shared pilot scope document with Pinnacle Analytics.', 'Emily Davis', ['customer', 10], 300],
  ['Call', 'Budget sync', 'Aligned FY budget assumptions with department heads.', 'Andrew Clarke', ['department', 7], 330],
  ['Note', 'Contract signed', 'Blue Harbor Hotels signed a 2-year renewal.', 'Marcus Chen', ['account', 8], 360],
  ['Update', 'Employee status changed', 'Ben Carter marked as Inactive.', 'Priya Raman', ['employee', 35], 400],
  ['Meeting', 'Kickoff with Summit Logistics', 'Kicked off UK rollout; agreed on data migration plan.', 'Grace Liu', ['account', 11], 450],
  ['Call', 'Intro call with Brightline', 'First conversation with Victor Alvarez; demo scheduled.', 'Sarah Thompson', ['customer', 12], 500],
  ['Update', 'Role updated', 'Granted export permission on Reports to Managers.', 'Alex Morgan', null, 560],
]

const REF_IDS: Record<RelatedEntityType, readonly string[]> = {
  employee: EMPLOYEE_IDS,
  customer: CUSTOMER_IDS,
  account: ACCOUNT_IDS,
  department: DEPARTMENT_IDS,
  contact: [],
  team: [],
}

export function createSeedActivities(): Activity[] {
  return ACTIVITIES.map(([type, subject, description, performedBy, related, hoursAgo], index) => {
    const occurredAt = timestampAgo({ hours: hoursAgo, minutes: (index * 17) % 60 })
    return {
      id: `act_${String(index + 1).padStart(3, '0')}`,
      type,
      subject,
      description,
      performedBy,
      related: related ? { type: related[0], id: REF_IDS[related[0]][related[1]] } : null,
      occurredAt,
      createdAt: occurredAt,
      updatedAt: occurredAt,
    }
  })
}
