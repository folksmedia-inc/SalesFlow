import { App, Button, Form, Modal, Select, Space } from 'antd'
import { Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { useConfirmDelete } from '@/hooks/useConfirmDelete'
import { useEntityCrud } from '@/hooks/useEntityData'
import type { EntityKey, EntityOf, NewEntity } from '@/store/entities/types'
import type { BulkActionConfig } from './types'
import { useOptions } from './useOptions'
import styles from './BulkActionBar.module.scss'

type AssignAction<T> = Extract<BulkActionConfig<T>, { kind: 'assign' }>

function AssignModal<T>({ action, count, onCancel, onApply }: { action: AssignAction<T>; count: number; onCancel: () => void; onApply: (value: string) => void }) {
  const options = useOptions(action.options)
  const [value, setValue] = useState<string>()

  return (
    <Modal
      open
      title={`${action.label} (${count} selected)`}
      okText="Apply"
      okButtonProps={{ disabled: !value }}
      onOk={() => value && onApply(value)}
      onCancel={onCancel}
      destroyOnHidden
    >
      <Form layout="vertical" component="div">
        <Form.Item label={action.fieldLabel} required>
          <Select
            autoFocus
            value={value}
            onChange={setValue}
            options={options as { label: string; value: string }[]}
            showSearch={{ optionFilterProp: 'label' }}
            placeholder={`Select ${action.fieldLabel.toLowerCase()}`}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

interface BulkActionBarProps<K extends EntityKey> {
  entityKey: K
  singular: string
  plural: string
  actions?: BulkActionConfig<EntityOf<K>>[]
  selectedIds: string[]
  onClear: () => void
  /** Reason to skip a record for an action (it's left out, the rest are processed). */
  getBlocker?: (id: string, action: BulkActionConfig<EntityOf<K>>) => string | null
}

const DEFAULT_ACTIONS = [{ key: 'delete', label: 'Delete', kind: 'delete' as const }]

/** Toolbar shown while rows are selected; runs the config's bulk actions. */
export function BulkActionBar<K extends EntityKey>({
  entityKey,
  singular,
  plural: pluralLabel,
  actions = DEFAULT_ACTIONS,
  selectedIds,
  onClear,
  getBlocker,
}: BulkActionBarProps<K>) {
  const { message } = App.useApp()
  const crud = useEntityCrud(entityKey)
  const confirmDelete = useConfirmDelete()
  const [assigning, setAssigning] = useState<AssignAction<EntityOf<K>> | null>(null)
  const [targetIds, setTargetIds] = useState<string[]>(selectedIds)
  const count = targetIds.length
  const plural = count === 1 ? singular : pluralLabel
  const nounFor = (n: number) => (n === 1 ? singular : pluralLabel).toLowerCase()

  const run = (action: BulkActionConfig<EntityOf<K>>) => {
    // Leave out records the config blocks for this action, and say why.
    const reasons = selectedIds.map((id) => getBlocker?.(id, action) ?? null)
    const allowed = selectedIds.filter((_, index) => !reasons[index])
    const firstReason = reasons.find(Boolean)
    if (allowed.length === 0) {
      message.warning(firstReason ?? 'This action is not available for the selection.')
      return
    }
    if (firstReason) message.warning(`${selectedIds.length - allowed.length} skipped: ${firstReason}`)
    setTargetIds(allowed)
    const ids = allowed
    const n = ids.length

    if (action.kind === 'update') {
      crud.updateMany(ids, action.changes as Partial<NewEntity<K>>)
      message.success(`${n} ${nounFor(n)} updated.`)
      onClear()
    } else if (action.kind === 'assign') {
      setAssigning(action)
    } else {
      confirmDelete({
        entityLabel: `${n} ${n === 1 ? singular : pluralLabel}`,
        name: `${n} selected ${nounFor(n)}`,
        onConfirm: () => {
          crud.removeMany(ids)
          message.success(`${n} ${nounFor(n)} deleted.`)
          onClear()
        },
      })
    }
  }

  return (
    <div className={styles.bar} role="region" aria-label="Bulk actions">
      <span className={styles.count}>{selectedIds.length} selected</span>
      <Space wrap size={6}>
        {actions.map((action) => {
          const Icon = action.kind === 'delete' ? Trash2 : action.icon
          return (
            <Button key={action.key} size="small" danger={action.kind === 'delete'} icon={Icon ? <Icon size={14} /> : undefined} onClick={() => run(action)}>
              {action.label}
            </Button>
          )
        })}
      </Space>
      <Button size="small" type="text" icon={<X size={14} />} onClick={onClear} className={styles.clear}>
        Clear selection
      </Button>
      {assigning && (
        <AssignModal
          action={assigning}
          count={count}
          onCancel={() => setAssigning(null)}
          onApply={(value) => {
            crud.updateMany(targetIds, { [assigning.field]: value } as Partial<NewEntity<K>>)
            message.success(`${assigning.fieldLabel} updated for ${count} ${plural.toLowerCase()}.`)
            setAssigning(null)
            onClear()
          }}
        />
      )}
    </div>
  )
}
