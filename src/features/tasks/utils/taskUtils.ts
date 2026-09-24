import dayjs from 'dayjs'
import type { TaskStatus } from '@/types/models'

export function isTaskOverdue(dueDate: string | null, status: TaskStatus): boolean {
  return Boolean(dueDate) && status !== 'Completed' && status !== 'Cancelled' && dayjs(dueDate).isBefore(dayjs(), 'day')
}
