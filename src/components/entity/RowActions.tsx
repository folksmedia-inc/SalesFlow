import { Button, Dropdown, type MenuProps } from 'antd'
import { Eye, MoreHorizontal, Pencil, Power, Trash2 } from 'lucide-react'

interface RowActionsProps {
  label: string
  onView?: () => void
  onEdit?: () => void
  onToggleStatus?: { label: string; run: () => void }
  onDelete?: () => void
  extraItems?: MenuProps['items']
}

/** "More" menu for a table row. */
export function RowActions({ label, onView, onEdit, onToggleStatus, onDelete, extraItems = [] }: RowActionsProps) {
  const items: MenuProps['items'] = [
    ...(onView ? [{ key: 'view', icon: <Eye size={14} />, label: 'View details', onClick: onView }] : []),
    ...(onEdit ? [{ key: 'edit', icon: <Pencil size={14} />, label: 'Edit', onClick: onEdit }] : []),
    ...(onToggleStatus ? [{ key: 'status', icon: <Power size={14} />, label: onToggleStatus.label, onClick: onToggleStatus.run }] : []),
    ...extraItems,
    ...(onDelete ? [{ type: 'divider' as const }, { key: 'delete', icon: <Trash2 size={14} />, label: 'Delete', danger: true, onClick: onDelete }] : []),
  ]

  return (
    <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
      <Button type="text" size="small" icon={<MoreHorizontal size={16} />} aria-label={`Actions for ${label}`} />
    </Dropdown>
  )
}
