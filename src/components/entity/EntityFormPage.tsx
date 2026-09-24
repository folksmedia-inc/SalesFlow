import { Button, Card, Result } from 'antd'
import { useId, useState } from 'react'
import type { FieldValues } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router'
import { PageHeader } from '@/components/common/PageHeader'
import { useEntityRecord } from '@/hooks/useEntityData'
import type { EntityKey } from '@/store/entities/types'
import { EntityForm } from './EntityForm'
import type { EntityConfig } from './types'
import styles from './EntityFormPage.module.scss'

interface EntityFormPageProps<K extends EntityKey, V extends FieldValues> {
  config: EntityConfig<K, V>
}

/** Full-page create/edit form for `/<entity>/new` and `/<entity>/:id/edit`. */
export function EntityFormPage<K extends EntityKey, V extends FieldValues>({ config }: EntityFormPageProps<K, V>) {
  const { id } = useParams()
  const navigate = useNavigate()
  const record = useEntityRecord(config.key, id)
  const formId = useId()
  const [dirty, setDirty] = useState(false)

  if (id && !record) {
    return (
      <Result
        status="404"
        title={`${config.singular} not found`}
        extra={<Button onClick={() => navigate(config.basePath)}>Back to {config.label}</Button>}
      />
    )
  }

  const title = record ? config.getTitle(record) : undefined
  const cancel = () => navigate(record ? `${config.basePath}/${record.id}` : config.basePath)

  return (
    <>
      <PageHeader
        title={record ? `Edit ${title}` : `New ${config.singular}`}
        subtitle={record ? `Update the ${config.singular.toLowerCase()}'s information.` : `Fill in the details to add a new ${config.singular.toLowerCase()}.`}
        crumbLabels={record ? { [`${config.basePath}/${record.id}`]: title ?? 'Details' } : undefined}
      />
      <Card>
        <EntityForm
          config={config}
          record={record}
          formId={formId}
          onDirtyChange={setDirty}
          onSaved={(saved) => navigate(`${config.basePath}/${saved.id}`, { replace: true })}
        />
      </Card>
      <div className={styles.footer}>
        <Button onClick={cancel}>Cancel</Button>
        <Button htmlType="reset" form={formId} disabled={!dirty}>
          Reset
        </Button>
        <Button type="primary" htmlType="submit" form={formId}>
          {record ? 'Save Changes' : `Create ${config.singular}`}
        </Button>
      </div>
    </>
  )
}
