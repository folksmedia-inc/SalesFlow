import { Form } from 'antd'
import { useId, type ReactElement, type ReactNode } from 'react'
import {
  Controller,
  type Control,
  type ControllerFieldState,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'

export interface FormFieldRenderProps<TValues extends FieldValues, TName extends FieldPath<TValues>> {
  field: ControllerRenderProps<TValues, TName>
  fieldState: ControllerFieldState
  /** Id to put on the input so the label is associated with it. */
  id: string
  /** antd `status` value for the input. */
  status: 'error' | undefined
}

interface FormFieldProps<TValues extends FieldValues, TName extends FieldPath<TValues>> {
  control: Control<TValues>
  name: TName
  label?: ReactNode
  required?: boolean
  extra?: ReactNode
  className?: string
  render: (props: FormFieldRenderProps<TValues, TName>) => ReactElement
}

/**
 * Bridges React Hook Form and antd: RHF owns the value and validation,
 * antd's `Form.Item` provides the label, layout and error message.
 * Render inside `<Form component={false} layout="vertical">` for styling.
 */
export function FormField<TValues extends FieldValues, TName extends FieldPath<TValues>>({
  control,
  name,
  label,
  required,
  extra,
  className,
  render,
}: FormFieldProps<TValues, TName>) {
  const id = useId()

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Form.Item
          label={label}
          htmlFor={id}
          required={required}
          extra={extra}
          className={className}
          validateStatus={fieldState.error ? 'error' : undefined}
          help={fieldState.error?.message}
        >
          {render({ field, fieldState, id, status: fieldState.error ? 'error' : undefined })}
        </Form.Item>
      )}
    />
  )
}
