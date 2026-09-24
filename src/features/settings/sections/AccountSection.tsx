import { zodResolver } from '@hookform/resolvers/zod'
import { App, Button, Card, Col, Form, Input, Row } from 'antd'
import { CheckCircle2, Circle, LogOut, MonitorSmartphone } from 'lucide-react'
import { useId } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { FormField } from '@/components/forms/FormField'
import { loggedOut, selectCurrentUser } from '@/store/authSlice'
import { formatDateTime } from '@/utils/format'
import { FormFooter, SettingsSection } from '../components/SettingsSection'
import styles from './AccountSection.module.scss'

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (value: string) => value.length >= 8 },
  { label: 'One uppercase letter', test: (value: string) => /[A-Z]/.test(value) },
  { label: 'One number', test: (value: string) => /\d/.test(value) },
] as const

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z
      .string()
      .min(1, 'Enter a new password')
      .min(8, 'Use at least 8 characters')
      .regex(/[A-Z]/, 'Include at least one uppercase letter')
      .regex(/\d/, 'Include at least one number'),
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' })
  .refine((values) => !values.newPassword || values.newPassword !== values.currentPassword, {
    path: ['newPassword'],
    message: 'New password must be different from your current password',
  })

type PasswordValues = z.infer<typeof passwordSchema>

const EMPTY: PasswordValues = { currentPassword: '', newPassword: '', confirmPassword: '' }

function ChangePasswordForm() {
  const { message } = App.useApp()
  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema), defaultValues: EMPTY, mode: 'onTouched' })
  const newPassword = useWatch({ control, name: 'newPassword' })
  const rulesId = useId()

  const onSubmit = handleSubmit(() => {
    // Demo only: there is no credential store, so nothing is persisted.
    reset(EMPTY)
    message.success('Password updated.')
  })

  return (
    <form noValidate onSubmit={onSubmit} aria-label="Change password">
      <Form component={false} layout="vertical" requiredMark>
        <Row gutter={24}>
          <Col xs={24} lg={14}>
            <FormField
              control={control}
              name="currentPassword"
              label="Current Password"
              required
              render={({ field, id, status }) => <Input.Password {...field} id={id} status={status} autoComplete="current-password" />}
            />
            <FormField
              control={control}
              name="newPassword"
              label="New Password"
              required
              render={({ field, id, status }) => <Input.Password {...field} id={id} status={status} autoComplete="new-password" aria-describedby={rulesId} />}
            />
            <FormField
              control={control}
              name="confirmPassword"
              label="Confirm New Password"
              required
              render={({ field, id, status }) => <Input.Password {...field} id={id} status={status} autoComplete="new-password" />}
            />
          </Col>
          <Col xs={24} lg={10}>
            <div className={styles.rules} id={rulesId}>
              <div className={styles.rulesTitle}>Password requirements</div>
              <ul>
                {PASSWORD_RULES.map((rule) => {
                  const met = rule.test(newPassword)
                  return (
                    <li key={rule.label} className={met ? styles.met : undefined}>
                      {met ? <CheckCircle2 size={16} aria-hidden="true" /> : <Circle size={16} aria-hidden="true" />}
                      <span>
                        {rule.label}
                        <span className={styles.srOnly}>{met ? ' (met)' : ' (not met)'}</span>
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          </Col>
        </Row>
      </Form>
      <FormFooter dirty={isDirty} dirtyLabel="Password not saved yet">
        <Button onClick={() => reset(EMPTY)} disabled={!isDirty}>
          Cancel
        </Button>
        <Button type="primary" htmlType="submit">
          Update Password
        </Button>
      </FormFooter>
    </form>
  )
}

export function AccountSection() {
  const { modal, message } = App.useApp()
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectCurrentUser)

  const signOutEverywhere = () =>
    modal.confirm({
      title: 'Sign out of all sessions?',
      content: 'You will be signed out on this and every other device, and will need to sign in again.',
      okText: 'Sign out everywhere',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      focusable: { autoFocusButton: 'cancel' },
      onOk: () => {
        dispatch(loggedOut())
        message.success('Signed out of all sessions.')
      },
    })

  return (
    <SettingsSection title="Account Settings" description="Manage your password and active sessions.">
      <Card title="Change Password">
        <ChangePasswordForm />
      </Card>

      <Card title="Sessions">
        <div className={styles.session}>
          <span className={styles.sessionIcon} aria-hidden="true">
            <MonitorSmartphone size={20} />
          </span>
          <div className={styles.sessionText}>
            <span className={styles.sessionTitle}>This browser · current session</span>
            <span className={styles.sessionMeta}>
              Signed in as {user?.email ?? 'unknown'}
              {user?.lastLoginAt ? ` · last login ${formatDateTime(user.lastLoginAt)}` : ''}
            </span>
          </div>
          <Button danger icon={<LogOut size={16} />} onClick={signOutEverywhere} className={styles.sessionAction}>
            Sign out of all sessions
          </Button>
        </div>
      </Card>
    </SettingsSection>
  )
}
