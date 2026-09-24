import { App } from 'antd'
import { useCallback } from 'react'
import type { FieldValues } from 'react-hook-form'
import { useConfirmDelete } from '@/hooks/useConfirmDelete'
import { useEntityCrud } from '@/hooks/useEntityData'
import type { EntityKey, EntityOf, NewEntity } from '@/store/entities/types'
import type { EntityConfig } from './types'

/** "Suspend" → "suspended", "Activate" → "activated". */
function pastTense(verb: string): string {
  const word = verb.toLowerCase()
  return word.endsWith('e') ? `${word}d` : `${word}ed`
}

/** Delete (with confirmation) and status-toggle actions shared by lists and detail pages. */
export function useEntityActions<K extends EntityKey, V extends FieldValues>(config: EntityConfig<K, V>) {
  const { message } = App.useApp()
  const crud = useEntityCrud(config.key)
  const confirmDelete = useConfirmDelete()

  const requestDelete = useCallback(
    (record: EntityOf<K>, onDeleted?: () => void) => {
      const blocker = config.getDeleteBlocker?.(record)
      if (blocker) {
        message.warning(blocker)
        return
      }
      confirmDelete({
        entityLabel: config.singular,
        name: config.getTitle(record),
        onConfirm: () => {
          onDeleted?.()
          crud.remove(record.id)
          message.success(`${config.singular} deleted.`)
        },
      })
    },
    [config, confirmDelete, crud, message],
  )

  const statusToggle = useCallback(
    (record: EntityOf<K>) => {
      const toggle = config.statusToggle
      if (!toggle) return undefined
      const isActive = (record as unknown as Record<string, unknown>)[toggle.field] === toggle.activeValue
      return {
        isActive,
        label: isActive ? toggle.deactivateLabel : toggle.activateLabel,
        run: () => {
          const blocker = config.getStatusToggleBlocker?.(record)
          if (blocker) {
            message.warning(blocker)
            return
          }
          crud.update(record.id, { [toggle.field]: isActive ? toggle.inactiveValue : toggle.activeValue } as Partial<NewEntity<K>>)
          message.success(`${config.getTitle(record)} ${pastTense(isActive ? toggle.deactivateLabel : toggle.activateLabel)}.`)
        },
      }
    },
    [config, crud, message],
  )

  return { requestDelete, statusToggle, crud }
}
