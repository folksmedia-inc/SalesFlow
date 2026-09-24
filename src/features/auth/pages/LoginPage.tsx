import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, App, Button, Form, Input, Typography } from 'antd'
import { BarChart3, Lock, Mail, ShieldCheck, Users } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { useAppDispatch } from '@/app/hooks'
import { BrandLogo } from '@/components/common/BrandLogo'
import { FormField } from '@/components/forms/FormField'
import { login } from '@/store/authSlice'
import { loginSchema, type LoginFormValues } from '../schemas/loginSchema'
import styles from './LoginPage.module.scss'

const DEMO_CREDENTIALS: LoginFormValues = { email: 'admin@adminhub.dev', password: 'Admin@123' }

const HIGHLIGHTS = [
  { icon: Users, text: 'Manage employees, teams and departments in one place' },
  { icon: BarChart3, text: 'Track customers, accounts and pipeline activity' },
  { icon: ShieldCheck, text: 'Role-based access with granular permissions' },
]

export default function LoginPage() {
  const dispatch = useAppDispatch()
  const { message, modal } = App.useApp()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { control, handleSubmit, reset } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    setIsLoading(true)
    setError(null)
    try {
      await dispatch(login(values)).unwrap()
      message.success('Welcome back!')
      // PublicOnlyRoute redirects to the originally requested page.
    } catch (reason) {
      setError(typeof reason === 'string' ? reason : 'Unable to sign in. Please try again.')
      setIsLoading(false)
    }
  })

  const fillDemoCredentials = () => {
    setError(null)
    reset(DEMO_CREDENTIALS)
  }

  const showForgotPassword = () => {
    modal.info({
      title: 'Reset your password',
      content:
        'Password resets are handled by your organization administrator. In production this sends a reset link to your email address.',
      okText: 'Got it',
    })
  }

  return (
    <div className={styles.page}>
      <aside className={styles.brandPanel} aria-hidden="true">
        <BrandLogo />
        <div className={styles.pitch}>
          <h2 className={styles.pitchTitle}>One hub for your people and customer data.</h2>
          <ul className={styles.highlights}>
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text}>
                <Icon size={18} />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
        <span className={styles.footnote}>© {new Date().getFullYear()} Salesforce Admin Hub</span>
      </aside>

      <main className={styles.formPanel}>
        <div className={styles.formCard}>
          <div className={styles.mobileLogo}>
            <BrandLogo tone="dark" />
          </div>
          <Typography.Title level={2} className={styles.title}>
            Welcome back
          </Typography.Title>
          <Typography.Text type="secondary">Sign in to continue to your workspace.</Typography.Text>

          <div className={styles.alerts}>
            {error && <Alert type="error" showIcon title={error} />}
          </div>

          <form noValidate onSubmit={onSubmit} aria-label="Sign in">
            <Form component={false} layout="vertical" requiredMark={false}>
              <FormField
                control={control}
                name="email"
                label="Email"
                required
                render={({ field, id, status }) => (
                  <Input
                    {...field}
                    id={id}
                    status={status}
                    size="large"
                    type="email"
                    autoComplete="username"
                    placeholder="you@company.com"
                    prefix={<Mail size={16} aria-hidden="true" />}
                    autoFocus
                  />
                )}
              />
              <FormField
                control={control}
                name="password"
                label="Password"
                required
                render={({ field, id, status }) => (
                  <Input.Password
                    {...field}
                    id={id}
                    status={status}
                    size="large"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    prefix={<Lock size={16} aria-hidden="true" />}
                  />
                )}
              />
              <div className={styles.forgotRow}>
                <Button type="link" size="small" onClick={showForgotPassword} className={styles.linkButton}>
                  Forgot password?
                </Button>
              </div>
              <Button type="primary" htmlType="submit" size="large" block loading={isLoading}>
                Sign In
              </Button>
            </Form>
          </form>

          <div className={styles.demo}>
            <Typography.Text type="secondary" className={styles.demoText}>
              Demo account: <strong>{DEMO_CREDENTIALS.email}</strong> / <strong>{DEMO_CREDENTIALS.password}</strong>
            </Typography.Text>
            <Button size="small" onClick={fillDemoCredentials}>
              Use demo account
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
