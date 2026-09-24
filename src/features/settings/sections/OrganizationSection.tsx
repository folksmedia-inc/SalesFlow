import { zodResolver } from '@hookform/resolvers/zod'
import { App, Button, Card, Col, Form, Input, Row, Select } from 'antd'
import { Globe, Mail, Phone } from 'lucide-react'
import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { toOptions } from '@/components/entity/useOptions'
import { FormField } from '@/components/forms/FormField'
import { organizationUpdated, selectOrganization } from '@/store/organizationSlice'
import { INDUSTRIES, type Organization } from '@/types/models'
import { FormFooter, SettingsSection } from '../components/SettingsSection'
import { MONTHS, TIMEZONES } from '../constants'
import styles from './OrganizationSection.module.scss'

const PHONE_PATTERN = /^\+?[\d\s().-]{7,20}$/
const text = (max: number) => z.string().trim().max(max, `Must be ${max} characters or fewer`)

const organizationSchema = z.object({
  name: z.string().trim().min(1, 'Organization name is required').max(100, 'Must be 100 characters or fewer'),
  legalName: text(120),
  industry: z.enum(INDUSTRIES, 'Select an industry'),
  timezone: z.string('Select a timezone').min(1, 'Select a timezone'),
  website: z
    .string()
    .trim()
    .refine((value) => value === '' || z.url({ protocol: /^https?$/ }).safeParse(value).success, 'Enter a full URL, e.g. https://example.com'),
  phone: z.string().trim().refine((value) => value === '' || PHONE_PATTERN.test(value), 'Enter a valid phone number'),
  email: z.string().trim().refine((value) => value === '' || z.email().safeParse(value).success, 'Enter a valid email address'),
  address: text(120),
  city: text(60),
  state: text(60),
  country: text(60),
  postalCode: text(12),
  fiscalYearStart: z.enum(MONTHS, 'Select a month'),
})

type OrganizationValues = z.infer<typeof organizationSchema>

const toValues = (organization: Organization): OrganizationValues => ({
  ...organization,
  fiscalYearStart: (MONTHS as readonly string[]).includes(organization.fiscalYearStart) ? (organization.fiscalYearStart as OrganizationValues['fiscalYearStart']) : 'January',
})

const TIMEZONE_OPTIONS = TIMEZONES.map((zone) => ({ value: zone.value, label: zone.label }))

function OrganizationForm({ organization }: { organization: Organization }) {
  const dispatch = useAppDispatch()
  const { message } = App.useApp()
  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<OrganizationValues>({ resolver: zodResolver(organizationSchema), defaultValues: toValues(organization), mode: 'onTouched' })

  const onSubmit = handleSubmit(
    (values) => {
      dispatch(organizationUpdated(values))
      reset(values)
      message.success('Organization settings saved.')
    },
    () => message.error('Please fix the highlighted fields.'),
  )

  const textField = (name: keyof OrganizationValues, label: string, options: { required?: boolean; placeholder?: string; autoComplete?: string; prefix?: ReactNode; type?: string } = {}) => (
    <FormField
      control={control}
      name={name}
      label={label}
      required={options.required}
      render={({ field, id, status }) => (
        <Input {...field} id={id} status={status} placeholder={options.placeholder} autoComplete={options.autoComplete ?? 'off'} prefix={options.prefix} type={options.type} />
      )}
    />
  )

  return (
    <form noValidate onSubmit={onSubmit} aria-label="Organization settings" className={styles.form}>
      <Form component={false} layout="vertical" requiredMark>
        <Card title="Company Profile">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              {textField('name', 'Organization Name', { required: true, autoComplete: 'organization' })}
            </Col>
            <Col xs={24} md={12}>
              {textField('legalName', 'Legal Name', { placeholder: 'e.g. Acme Corporation Inc.' })}
            </Col>
            <Col xs={24} md={12}>
              <FormField
                control={control}
                name="industry"
                label="Industry"
                required
                render={({ field, id, status }) => <Select {...field} id={id} status={status} options={toOptions(INDUSTRIES)} showSearch={{ optionFilterProp: 'label' }} />}
              />
            </Col>
            <Col xs={24} md={12}>
              {textField('website', 'Website', { placeholder: 'https://', type: 'url', autoComplete: 'url', prefix: <Globe size={14} aria-hidden="true" /> })}
            </Col>
          </Row>
        </Card>

        <Card title="Regional Settings">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <FormField
                control={control}
                name="timezone"
                label="Timezone"
                required
                extra="Used for due dates, reports and activity timestamps."
                render={({ field, id, status }) => <Select {...field} id={id} status={status} options={TIMEZONE_OPTIONS} showSearch={{ optionFilterProp: 'label' }} />}
              />
            </Col>
            <Col xs={24} md={12}>
              <FormField
                control={control}
                name="fiscalYearStart"
                label="Fiscal Year Start"
                required
                extra="First month of your financial year."
                render={({ field, id, status }) => <Select {...field} id={id} status={status} options={toOptions(MONTHS)} />}
              />
            </Col>
          </Row>
        </Card>

        <Card title="Contact & Address">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              {textField('phone', 'Phone', { placeholder: '+1 (555) 123-4567', type: 'tel', autoComplete: 'tel', prefix: <Phone size={14} aria-hidden="true" /> })}
            </Col>
            <Col xs={24} md={12}>
              {textField('email', 'Email', { placeholder: 'hello@company.com', type: 'email', autoComplete: 'email', prefix: <Mail size={14} aria-hidden="true" /> })}
            </Col>
            <Col xs={24}>{textField('address', 'Address', { autoComplete: 'street-address' })}</Col>
            <Col xs={24} md={12} lg={6}>
              {textField('city', 'City', { autoComplete: 'address-level2' })}
            </Col>
            <Col xs={24} md={12} lg={6}>
              {textField('state', 'State / Province', { autoComplete: 'address-level1' })}
            </Col>
            <Col xs={24} md={12} lg={6}>
              {textField('postalCode', 'Postal Code', { autoComplete: 'postal-code' })}
            </Col>
            <Col xs={24} md={12} lg={6}>
              {textField('country', 'Country', { autoComplete: 'country-name' })}
            </Col>
          </Row>
        </Card>
      </Form>

      <FormFooter dirty={isDirty} sticky>
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

export function OrganizationSection() {
  const organization = useAppSelector(selectOrganization)

  return (
    <SettingsSection title="Organization" description="Company details used across reports, exports and notifications.">
      {/* Remount when the stored organization is replaced (e.g. demo data reset). */}
      <OrganizationForm key={JSON.stringify(organization)} organization={organization} />
    </SettingsSection>
  )
}
