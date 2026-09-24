import { zodResolver } from '@hookform/resolvers/zod'
import { App, Col, DatePicker, Form, Input, Modal, Row, Select } from 'antd'
import dayjs from 'dayjs'
import { useId } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useAppSelector } from '@/app/hooks'
import { toOptions, useOptions } from '@/components/entity/useOptions'
import { FormField } from '@/components/forms/FormField'
import { useEntityCrud } from '@/hooks/useEntityData'
import { decodeRelated, encodeRelated } from '@/hooks/useRelatedOptions'
import { selectCurrentUserName } from '@/store/authSlice'
import { ACTIVITY_TYPES, type ActivityType, type RelatedRef } from '@/types/models'

const schema = z.object({
  type: z.enum(ACTIVITY_TYPES),
  subject: z.string().trim().min(1, 'Subject is required').max(120, 'Keep the subject under 120 characters'),
  description: z.string().max(1000, 'Keep the description under 1000 characters'),
  related: z.string().nullable(),
  occurredAt: z.string().min(1, 'Date is required'),
})

type Values = z.infer<typeof schema>

interface LogActivityModalProps {
  open: boolean
  onClose: () => void
  /** Pre-links the activity to a record and hides the picker. */
  related?: RelatedRef
  defaultType?: ActivityType
}

/** Log a call, email, meeting or note against a record. */
export function LogActivityModal({ open, onClose, related, defaultType = 'Call' }: LogActivityModalProps) {
  const formId = useId()
  const { message } = App.useApp()
  const crud = useEntityCrud('activities')
  const performedBy = useAppSelector(selectCurrentUserName)
  const relatedOptions = useOptions('related')

  const { control, handleSubmit, reset } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { type: defaultType, subject: '', description: '', related: encodeRelated(related), occurredAt: dayjs().toISOString() },
  })

  const close = () => {
    reset()
    onClose()
  }

  const onSubmit = handleSubmit((values) => {
    crud.create({
      type: values.type,
      subject: values.subject,
      description: values.description,
      related: decodeRelated(values.related),
      occurredAt: values.occurredAt,
      performedBy,
    })
    message.success('Activity logged.')
    close()
  })

  return (
    <Modal open={open} title="Log Activity" okText="Log Activity" onCancel={close} okButtonProps={{ htmlType: 'submit', form: formId }} destroyOnHidden width={560}>
      <form id={formId} onSubmit={onSubmit} noValidate>
        <Form component={false} layout="vertical">
          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <FormField control={control} name="type" label="Type" required render={({ field, id }) => <Select {...field} id={id} options={toOptions(ACTIVITY_TYPES)} />} />
            </Col>
            <Col xs={24} sm={12}>
              <FormField
                control={control}
                name="occurredAt"
                label="Date"
                required
                render={({ field, id, status }) => (
                  <DatePicker
                    id={id}
                    status={status}
                    showTime={{ format: 'h:mm A' }}
                    format="MMM D, YYYY h:mm A"
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(value) => field.onChange(value ? value.toISOString() : '')}
                    style={{ width: '100%' }}
                  />
                )}
              />
            </Col>
          </Row>
          <FormField control={control} name="subject" label="Subject" required render={({ field, id, status }) => <Input {...field} id={id} status={status} placeholder="e.g. Discovery call with procurement" />} />
          <FormField
            control={control}
            name="description"
            label="Description"
            render={({ field, id, status }) => <Input.TextArea {...field} id={id} status={status} autoSize={{ minRows: 3, maxRows: 6 }} placeholder="Key points, outcomes and next steps" />}
          />
          {!related && (
            <FormField
              control={control}
              name="related"
              label="Related record"
              render={({ field, id }) => (
                <Select
                  id={id}
                  value={field.value ?? undefined}
                  onChange={(value) => field.onChange(value ?? null)}
                  options={relatedOptions as { label: string; value: string }[]}
                  showSearch={{ optionFilterProp: 'label' }}
                  allowClear
                  placeholder="Link to a customer, account, employee…"
                />
              )}
            />
          )}
        </Form>
      </form>
    </Modal>
  )
}
