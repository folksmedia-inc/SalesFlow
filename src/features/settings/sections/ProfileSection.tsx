import { zodResolver } from '@hookform/resolvers/zod'
import { App, Avatar, Button, Card, Col, Form, Input, Row, Tag, Tooltip } from 'antd'
import { Mail, ShieldCheck } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { z } from 'zod'
import { useAppSelector } from '@/app/hooks'
import { StatusTag } from '@/components/common/StatusTag'
import { EmptyState } from '@/components/feedback/EmptyState'
import { FormField } from '@/components/forms/FormField'
import { ROUTES } from '@/constants/routes'
import { useEntityCrud, useEntityList } from '@/hooks/useEntityData'
import { useLookups } from '@/hooks/useLookups'
import { selectCurrentUser } from '@/store/authSlice'
import type { User } from '@/types/models'
import { avatarColor } from '@/utils/avatar'
import { formatDate, formatDateTime, formatRelativeTime, getFullName, getInitials } from '@/utils/format'
import { FormFooter, SettingsSection } from '../components/SettingsSection'
import styles from './ProfileSection.module.scss'

const profileSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(50, 'Must be 50 characters or fewer'),
  lastName: z.string().trim().min(1, 'Last name is required').max(50, 'Must be 50 characters or fewer'),
  title: z.string().trim().max(80, 'Must be 80 characters or fewer'),
  email: z.string().trim().min(1, 'Email is required').pipe(z.email('Enter a valid email address')),
})

type ProfileValues = z.infer<typeof profileSchema>

const toValues = (user: User): ProfileValues => ({ firstName: user.firstName, lastName: user.lastName, title: user.title, email: user.email })

function ProfileForm({ user }: { user: User }) {
  const { message } = App.useApp()
  const crud = useEntityCrud('users')
  const users = useEntityList('users')

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isDirty },
  } = useForm<ProfileValues>({ resolver: zodResolver(profileSchema), defaultValues: toValues(user), mode: 'onTouched' })

  const onSubmit = handleSubmit((values) => {
    const email = values.email.toLowerCase()
    if (users.some((other) => other.id !== user.id && other.email.toLowerCase() === email)) {
      setError('email', { type: 'validate', message: 'Another user already uses this email' }, { shouldFocus: true })
      return
    }
    const changes = { ...values, email }
    crud.update(user.id, changes)
    reset(changes)
    message.success('Profile updated.')
  })

  return (
    <form noValidate onSubmit={onSubmit} aria-label="Edit profile">
      <Form component={false} layout="vertical" requiredMark>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <FormField control={control} name="firstName" label="First Name" required render={({ field, id, status }) => <Input {...field} id={id} status={status} autoComplete="given-name" />} />
          </Col>
          <Col xs={24} md={12}>
            <FormField control={control} name="lastName" label="Last Name" required render={({ field, id, status }) => <Input {...field} id={id} status={status} autoComplete="family-name" />} />
          </Col>
          <Col xs={24} md={12}>
            <FormField control={control} name="title" label="Title" render={({ field, id, status }) => <Input {...field} id={id} status={status} placeholder="e.g. Operations Manager" autoComplete="organization-title" />} />
          </Col>
          <Col xs={24} md={12}>
            <FormField
              control={control}
              name="email"
              label="Email"
              required
              extra="You sign in with this address."
              render={({ field, id, status }) => <Input {...field} id={id} status={status} type="email" autoComplete="email" prefix={<Mail size={14} aria-hidden="true" />} />}
            />
          </Col>
        </Row>
      </Form>
      <FormFooter dirty={isDirty}>
        <Button onClick={() => reset()} disabled={!isDirty}>
          Reset
        </Button>
        <Button type="primary" htmlType="submit" disabled={!isDirty}>
          Save Changes
        </Button>
      </FormFooter>
    </form>
  )
}

export function ProfileSection() {
  const user = useAppSelector(selectCurrentUser)
  const lookups = useLookups()

  if (!user) return <EmptyState title="No profile" description="Sign in to manage your profile." />
  const name = getFullName(user)

  return (
    <SettingsSection title="My Profile" description="Your personal details as they appear across the Admin Hub.">
      <Card>
        <div className={styles.summary}>
          <Avatar size={64} style={{ background: avatarColor(name), flexShrink: 0, fontSize: 24 }}>
            {getInitials(name)}
          </Avatar>
          <div className={styles.identity}>
            <div className={styles.nameRow}>
              <span className={styles.name}>{name}</span>
              <StatusTag status={user.status} />
            </div>
            <span className={styles.secondary}>{[user.title, user.email].filter(Boolean).join(' · ')}</span>
          </div>
        </div>
        <dl className={styles.facts}>
          <div>
            <dt>Role</dt>
            <dd>
              <Tooltip title="Your role is managed by an administrator.">
                <Tag variant="filled" color="blue" icon={<ShieldCheck size={12} aria-hidden="true" style={{ marginInlineEnd: 4, verticalAlign: -1 }} />}>
                  {lookups.roleName(user.roleId)}
                </Tag>
              </Tooltip>
            </dd>
          </div>
          <div>
            <dt>Last login</dt>
            <dd title={formatDateTime(user.lastLoginAt)}>{user.lastLoginAt ? formatRelativeTime(user.lastLoginAt) : 'Never'}</dd>
          </div>
          <div>
            <dt>Member since</dt>
            <dd>{formatDate(user.createdAt)}</dd>
          </div>
          <div>
            <dt>Employee record</dt>
            <dd>{user.employeeId ? <Link to={ROUTES.employeeDetails(user.employeeId)}>{lookups.employeeName(user.employeeId)}</Link> : 'Not linked'}</dd>
          </div>
        </dl>
      </Card>

      <Card title="Personal Information">
        <ProfileForm key={user.id} user={user} />
      </Card>
    </SettingsSection>
  )
}
