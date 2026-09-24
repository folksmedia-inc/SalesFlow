import { Button, Drawer, Space } from 'antd'
import { useId, useState } from 'react'
import type { FieldValues } from 'react-hook-form'
import type { EntityKey, EntityOf } from '@/store/entities/types'
import { EntityForm } from './EntityForm'
import type { EntityConfig } from './types'

interface EntityFormDrawerProps<K extends EntityKey, V extends FieldValues> {
  config: EntityConfig<K, V>
  open: boolean
  record?: EntityOf<K>
  initialValues?: Partial<V>
  onClose: () => void
  onSaved?: (record: EntityOf<K>, mode: 'create' | 'edit') => void
}

/** Create/edit a record in a side drawer (used by entities with `formMode: 'drawer'`). */
export function EntityFormDrawer<K extends EntityKey, V extends FieldValues>({
  config,
  open,
  record,
  initialValues,
  onClose,
  onSaved,
}: EntityFormDrawerProps<K, V>) {
  const formId = useId()
  const [dirty, setDirty] = useState(false)

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={record ? `Edit ${config.singular}` : `New ${config.singular}`}
      size={720}
      destroyOnHidden
      footer={
        <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button htmlType="reset" form={formId} disabled={!dirty}>
            Reset
          </Button>
          <Button type="primary" htmlType="submit" form={formId}>
            {record ? 'Save Changes' : `Create ${config.singular}`}
          </Button>
        </Space>
      }
    >
      {open && (
        <EntityForm
          key={record?.id ?? 'new'}
          config={config}
          record={record}
          initialValues={initialValues}
          formId={formId}
          onDirtyChange={setDirty}
          onSaved={(saved, mode) => {
            onSaved?.(saved, mode)
            onClose()
          }}
        />
      )}
    </Drawer>
  )
}
