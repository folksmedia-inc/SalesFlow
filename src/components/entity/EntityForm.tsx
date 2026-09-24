import { zodResolver } from '@hookform/resolvers/zod'
import { App, Col, Form, Row, Typography } from 'antd'
import { useEffect } from 'react'
import { useForm, type DefaultValues, type FieldValues, type Path, type Resolver } from 'react-hook-form'
import { FieldControl } from '@/components/forms/FieldControl'
import { FormField } from '@/components/forms/FormField'
import { useEntityCrud, useEntityList } from '@/hooks/useEntityData'
import type { EntityKey, EntityOf } from '@/store/entities/types'
import type { EntityConfig, FieldConfig } from './types'
import styles from './EntityForm.module.scss'

const SPAN: Record<NonNullable<FieldConfig['span']>, { xs: number; md: number; lg: number }> = {
  full: { xs: 24, md: 24, lg: 24 },
  half: { xs: 24, md: 12, lg: 12 },
  third: { xs: 24, md: 12, lg: 8 },
}

export interface EntityFormProps<K extends EntityKey, V extends FieldValues> {
  config: EntityConfig<K, V>
  /** Record being edited; omit to create a new one. */
  record?: EntityOf<K>
  /** Prefilled values for a new record. */
  initialValues?: Partial<V>
  formId: string
  onSaved: (record: EntityOf<K>, mode: 'create' | 'edit') => void
  onDirtyChange?: (dirty: boolean) => void
}

/**
 * Config-driven create/edit form. The same component handles both modes:
 * validation (Zod + cross-record rules), save through the data hooks,
 * success toast and reset. Submit/reset buttons live outside and target
 * the form via `form={formId}`.
 */
export function EntityForm<K extends EntityKey, V extends FieldValues>({
  config,
  record,
  initialValues,
  formId,
  onSaved,
  onDirtyChange,
}: EntityFormProps<K, V>) {
  const { message } = App.useApp()
  const crud = useEntityCrud(config.key)
  const records = useEntityList(config.key)
  const { form } = config

  const startValues = (
    record ? form.toValues(record) : { ...form.defaultValues, ...form.getDefaults?.({ records }), ...initialValues }
  ) as DefaultValues<V>

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isDirty },
  } = useForm<V>({
    resolver: zodResolver(form.schema as never) as unknown as Resolver<V>,
    defaultValues: startValues,
    mode: 'onTouched',
  })

  useEffect(() => onDirtyChange?.(isDirty), [isDirty, onDirtyChange])

  const onSubmit = handleSubmit((values) => {
    const errors = form.validate?.(values, { records, currentId: record?.id }) ?? {}
    const entries = Object.entries(errors).filter((entry): entry is [string, string] => Boolean(entry[1]))
    if (entries.length > 0) {
      entries.forEach(([name, messageText]) => setError(name as Path<V>, { type: 'validate', message: messageText }, { shouldFocus: true }))
      message.error('Please fix the highlighted fields.')
      return
    }

    const data = form.toRecord(values)
    if (record) {
      crud.update(record.id, data)
      message.success(`${config.singular} updated successfully.`)
      onSaved({ ...record, ...data }, 'edit')
    } else {
      const created = crud.create(data)
      message.success(`${config.singular} created successfully.`)
      onSaved(created, 'create')
    }
    reset(values)
  })

  return (
    <form
      id={formId}
      noValidate
      onSubmit={onSubmit}
      onReset={(event) => {
        event.preventDefault()
        reset(startValues)
      }}
    >
      <Form component={false} layout="vertical" requiredMark>
        {form.sections.map((section) => (
          <section key={section.title} className={styles.section}>
            <div className={styles.sectionHeader}>
              <Typography.Title level={5} className={styles.sectionTitle}>
                {section.title}
              </Typography.Title>
              {section.description && <Typography.Text type="secondary">{section.description}</Typography.Text>}
            </div>
            <Row gutter={16}>
              {section.fields.map((field) => (
                <Col key={field.name} {...SPAN[field.span ?? 'half']}>
                  <FormField
                    control={control}
                    name={field.name as Path<V>}
                    label={field.label}
                    required={field.required}
                    extra={field.help}
                    render={({ field: controllerField, id, status }) => (
                      <FieldControl config={field} field={controllerField as never} id={id} status={status} />
                    )}
                  />
                </Col>
              ))}
            </Row>
          </section>
        ))}
      </Form>
    </form>
  )
}
