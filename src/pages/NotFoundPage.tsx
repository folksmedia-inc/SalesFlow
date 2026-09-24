import { Button, Result } from 'antd'
import { useNavigate } from 'react-router'
import { ROUTES } from '@/constants/routes'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <Result
      status="404"
      title="Page not found"
      subTitle="The page you are looking for does not exist or has been moved."
      extra={
        <Button type="primary" onClick={() => navigate(ROUTES.dashboard)}>
          Go to Dashboard
        </Button>
      }
    />
  )
}
