import { Button, Result } from 'antd'
import { useEffect } from 'react'
import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router'
import { ROUTES } from '@/constants/routes'
import styles from './RouteErrorBoundary.module.scss'

function isChunkLoadError(error: unknown): boolean {
  return (
    error instanceof Error &&
    /Failed to fetch dynamically imported module|Importing a module script failed/i.test(error.message)
  )
}

/** Error boundary for route rendering and lazy-loading failures. */
export function RouteErrorBoundary() {
  const error = useRouteError()
  const navigate = useNavigate()
  const isNotFound = isRouteErrorResponse(error) && error.status === 404

  useEffect(() => {
    if (!isNotFound) console.error('[route error]', error)
  }, [error, isNotFound])

  const title = isNotFound
    ? 'Page not found'
    : isChunkLoadError(error)
      ? 'A new version is available'
      : 'Something went wrong'

  const subTitle = isNotFound
    ? 'The page you are looking for does not exist or has been moved.'
    : isChunkLoadError(error)
      ? 'Reload the page to get the latest version of the application.'
      : 'An unexpected error occurred while displaying this page. Please try again.'

  return (
    <div className={styles.container}>
      <Result
        status={isNotFound ? '404' : '500'}
        title={title}
        subTitle={subTitle}
        extra={[
          <Button key="reload" onClick={() => window.location.reload()}>
            Reload
          </Button>,
          <Button key="home" type="primary" onClick={() => navigate(ROUTES.dashboard)}>
            Go to Dashboard
          </Button>,
        ]}
      />
    </div>
  )
}
