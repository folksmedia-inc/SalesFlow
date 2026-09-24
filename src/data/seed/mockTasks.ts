import type { RelatedEntityType, Task, TaskPriority, TaskStatus } from '@/types/models'
import { ACCOUNT_IDS } from './mockAccounts'
import { CUSTOMER_IDS } from './mockCustomers'
import { DEPARTMENT_IDS } from './mockDepartments'
import { EMPLOYEE_IDS } from './mockEmployees'
import { daysFromNow, timestampAgo } from './seedUtils'

type RelatedSeed = [RelatedEntityType, number] | null

type TaskSeed = [title: string, description: string, assigneeIndex: number, priority: TaskPriority, dueInDays: number, status: TaskStatus, related: RelatedSeed]

const TASKS: TaskSeed[] = [
  ['Prepare Q4 renewal proposal', 'Draft pricing and terms for the Acme renewal, including the new analytics add-on.', 15, 'High', 6, 'In Progress', ['customer', 0]],
  ['Security questionnaire for Globex', 'Complete the vendor security assessment sent by Globex procurement.', 16, 'Critical', 2, 'In Progress', ['customer', 1]],
  ['Schedule onboarding kickoff', 'Book the kickoff call with Initech stakeholders and share the onboarding plan.', 25, 'Medium', 4, 'Not Started', ['customer', 2]],
  ['Follow up on Umbrella Health demo', 'Send recap, recording and pricing overview after the product demo.', 16, 'High', 1, 'Not Started', ['customer', 3]],
  ['Quarterly business review deck', 'Build the QBR deck for Stark Retail with adoption and ROI metrics.', 14, 'Medium', 12, 'Not Started', ['account', 4]],
  ['Negotiate multi-year contract', 'Work with legal on redlines for the Wayne Financial 3-year agreement.', 14, 'Critical', -2, 'In Progress', ['account', 5]],
  ['Win-back outreach to Northwind', 'Reach out to former champion about the new logistics module.', 19, 'Low', 20, 'Not Started', ['customer', 6]],
  ['Qualify Contoso Media lead', 'Discovery call to confirm budget, authority and timeline.', 17, 'Medium', 3, 'Completed', ['customer', 7]],
  ['Onboard new hire: Noah Fischer', 'Laptop, accounts, buddy assignment and first-week schedule.', 29, 'High', -5, 'Completed', ['employee', 7]],
  ['Complete performance reviews', 'Submit mid-year reviews for all direct reports.', 0, 'High', 9, 'In Progress', ['department', 0]],
  ['Update employee handbook', 'Revise remote work and PTO sections for the new policy.', 28, 'Medium', 15, 'In Progress', ['department', 6]],
  ['Benefits enrollment reminder', 'Send open enrollment reminders to employees who have not enrolled.', 30, 'Low', 7, 'Not Started', ['department', 6]],
  ['Migrate CI pipelines', 'Move remaining build pipelines to the new runners and retire the old cluster.', 5, 'High', 10, 'In Progress', ['department', 0]],
  ['Fix login rate limiting bug', 'Investigate intermittent 429s on the login endpoint reported by support.', 1, 'Critical', 1, 'In Progress', null],
  ['Accessibility audit of dashboard', 'Run an axe audit and fix contrast and keyboard navigation issues.', 4, 'Medium', 18, 'Not Started', null],
  ['Design system token cleanup', 'Consolidate color tokens and remove unused spacing values.', 12, 'Low', 25, 'Not Started', ['department', 2]],
  ['User interviews: reporting', 'Run 6 interviews with admins about custom reporting needs.', 13, 'Medium', -12, 'Cancelled', ['department', 1]],
  ['Write PRD for bulk actions', 'Define requirements and success metrics for bulk record updates.', 9, 'High', 5, 'In Progress', ['department', 1]],
  ['Analyze trial conversion funnel', 'Break down conversion by channel and identify the largest drop-off.', 10, 'Medium', 8, 'Not Started', null],
  ['Launch webinar campaign', 'Publish landing page and email sequence for the October webinar.', 22, 'High', 11, 'In Progress', ['department', 4]],
  ['Refresh website case studies', 'Update three case studies with new customer quotes and metrics.', 21, 'Low', 30, 'Not Started', ['department', 4]],
  ['Close September books', 'Reconcile accounts and finalize the September month-end close.', 32, 'Critical', -1, 'Completed', ['department', 7]],
  ['Prepare FY budget model', 'Build the first draft of next fiscal year departmental budgets.', 33, 'High', 21, 'In Progress', ['department', 7]],
  ['Process contractor invoices', 'Review and approve outstanding contractor invoices.', 35, 'Medium', -3, 'Not Started', null],
  ['Run payroll for October', 'Validate hours, deductions and submit payroll.', 34, 'Critical', 14, 'Not Started', ['department', 7]],
  ['Customer health score review', 'Review at-risk accounts and create success plans.', 24, 'High', 6, 'In Progress', ['department', 5]],
  ['Knowledge base: SSO setup', 'Write a help article on configuring SAML single sign-on.', 26, 'Low', 16, 'Not Started', null],
  ['Escalation: Blue Harbor outage', 'Coordinate with engineering on the booking sync incident.', 25, 'Critical', 0, 'Completed', ['customer', 8]],
  ['Plan team offsite', 'Shortlist venues and draft agenda for the Q1 offsite.', 11, 'Low', 40, 'Not Started', ['department', 2]],
  ['Territory planning', 'Rebalance enterprise territories for next quarter.', 14, 'Medium', 17, 'Not Started', ['department', 3]],
  ['Update CRM data hygiene rules', 'Define required fields and dedupe rules for new leads.', 19, 'Medium', 9, 'In Progress', ['department', 3]],
  ['Renewal call with Evergreen', 'Discuss renewal timeline and expansion to two new campuses.', 15, 'High', 13, 'Not Started', ['account', 9]],
  ['Pinnacle Analytics pilot scope', 'Agree pilot success criteria and timeline with Ravi.', 17, 'Medium', -4, 'Cancelled', ['customer', 10]],
]

const REF_IDS: Record<RelatedEntityType, readonly string[]> = {
  employee: EMPLOYEE_IDS,
  customer: CUSTOMER_IDS,
  account: ACCOUNT_IDS,
  department: DEPARTMENT_IDS,
  contact: [],
  team: [],
}

export function createSeedTasks(): Task[] {
  return TASKS.map(([title, description, assigneeIndex, priority, dueInDays, status, related], index) => {
    const createdAt = timestampAgo({ days: 20 + (index % 9) * 3, hours: index })
    return {
      id: `tsk_${String(index + 1).padStart(3, '0')}`,
      title,
      description,
      assigneeId: EMPLOYEE_IDS[assigneeIndex],
      priority,
      dueDate: daysFromNow(dueInDays),
      status,
      related: related ? { type: related[0], id: REF_IDS[related[0]][related[1]] } : null,
      createdAt,
      updatedAt: timestampAgo({ days: index % 6, hours: index }),
    }
  })
}
