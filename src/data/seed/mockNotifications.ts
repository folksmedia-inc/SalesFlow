import type { AppNotification } from '@/types/models'
import { timestampAgo } from './seedUtils'

type NotificationSeed = [title: string, description: string, type: AppNotification['type'], read: boolean, link: string | null, minutesAgo: number]

const NOTIFICATIONS: NotificationSeed[] = [
  ['Task due today', '"Escalation: Blue Harbor outage" is due today.', 'task', false, '/tasks', 12],
  ['New customer created', 'Sarah Thompson added Brightline Clinics as a lead.', 'info', false, '/customers/cus_013', 95],
  ['Contract redlines received', 'Wayne Financial returned redlines on the 3-year agreement.', 'warning', false, '/accounts/acc_006', 240],
  ['Employee on leave', 'Mei Tanaka is on leave starting this week.', 'info', true, '/employees/emp_005', 1500],
  ['Report ready', 'Your monthly headcount report is ready to download.', 'success', true, '/reports', 2900],
  ['Security questionnaire due', 'Globex questionnaire is due in 2 days.', 'task', true, '/tasks', 4300],
]

export function createSeedNotifications(): AppNotification[] {
  return NOTIFICATIONS.map(([title, description, type, read, link, minutesAgo], index) => {
    const createdAt = timestampAgo({ minutes: minutesAgo })
    return { id: `ntf_${String(index + 1).padStart(3, '0')}`, title, description, type, read, link, createdAt, updatedAt: createdAt }
  })
}
