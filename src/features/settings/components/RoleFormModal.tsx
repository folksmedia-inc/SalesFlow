import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, App, Form, Input, Modal } from 'antd'
import { useId } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { FormField } from '@/components/forms/FormField'
import { useEntityCrud, useEntityList } from '@/hooks/useEntityData'
import type { Role } from '@/types/models'
import { emptyPermissionMatrix } from '../utils/permissions'

const roleSchema = z.object({
  name: z.string().trim().min(2, 'Role name must be at least 2 characters').max(40, 'Must be 40 characters or fewer'),
  description: z.string().trim().max(200, 'Must be 200 characters or fewer'),
})

type RoleValues = z.infer<typeof roleSchema>

interface RoleFormModalProps {
  /** Role being edited; omit to create one. */
  role?: Role
  onClose: () => void
  onCreated?: (role: Role) => void
}

/** Create or edit a role's name and description. */
export function RoleFormModal({ role, onClose, onCreated }: RoleFormModalProps) {
  const formId = useId()
  const { message } = App.useApp()
  const crud = useEntityCrud('roles')
  const roles = useEntityList('roles')
  const isSystem = Boolean(role?.isSystem)

  const {
    control,
    handleSubmit,
    setError,
    formState: { isDirty },
  } = useForm<RoleValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: { name: role?.name ?? '', description: role?.description ?? '' },
    mode: 'onTouched',
  })

  const onSubmit = handleSubmit((values) => {
    const name = values.name.trim()
    if (!isSystem && roles.some((other) => other.id !== role?.id && other.name.trim().toLowerCase() === name.toLowerCase())) {
      setError('name', { type: 'validate', message: 'A role with this name already exists' }, { shouldFocus: true })
      return
    }
    if (role) {
      crud.update(role.id, isSystem ? { description: values.description } : { name, description: values.description })
      message.success('Role updated.')
    } else {
      const created = crud.create({ name, description: values.description, isSystem: false, permissions: emptyPermissionMatrix() })
      message.success(`Role "${name}" created. Configure its permissions next.`)
      onCreated?.(created)
    }
    onClose()
  })

  return (
    <Modal
      open
      title={role ? `Edit Role` : 'New Role'}
      okText={role ? 'Save Changes' : 'Create Role'}
      okButtonProps={{ htmlType: 'submit', form: formId, disabled: Boolean(role) && !isDirty }}
      onCancel={onClose}
      destroyOnHidden
      width={520}
    >
      <form id={formId} noValidate onSubmit={onSubmit}>
        <Form component={false} layout="vertical" requiredMark>
          {isSystem && <Alert type="info" showIcon title="System roles can't be renamed. You can still update the description." style={{ marginBottom: 16 }} />}
          <FormField
            control={control}
            name="name"
            label="Role Name"
            required
            render={({ field, id, status }) => <Input {...field} id={id} status={status} disabled={isSystem} placeholder="e.g. Support Agent" autoFocus={!isSystem} />}
          />
          <FormField
            control={control}
            name="description"
            label="Description"
            render={({ field, id, status }) => (
              <Input.TextArea {...field} id={id} status={status} autoSize={{ minRows: 3, maxRows: 5 }} placeholder="What is this role for?" showCount maxLength={200} />
            )}
          />
          {!role && <Alert type="info" showIcon title="New roles start with no permissions." description="Grant access on the Permissions tab after creating the role." />}
        </Form>
      </form>
    </Modal>
  )
}
