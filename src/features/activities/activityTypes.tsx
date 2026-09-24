import type { LucideIcon } from 'lucide-react'
import { CalendarDays, CheckSquare, Mail, PencilLine, Phone, StickyNote } from 'lucide-react'
import type { ActivityType } from '@/types/models'

export const ACTIVITY_TYPE_STYLE: Record<ActivityType, { icon: LucideIcon; color: string }> = {
  Call: { icon: Phone, color: '#2e844a' },
  Email: { icon: Mail, color: '#0176d3' },
  Meeting: { icon: CalendarDays, color: '#8a4fd1' },
  Note: { icon: StickyNote, color: '#dd7a01' },
  Task: { icon: CheckSquare, color: '#0b827c' },
  Update: { icon: PencilLine, color: '#5c6b80' },
}
