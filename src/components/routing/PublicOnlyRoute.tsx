import { Navigate, Outlet, useLocation } from 'react-router'
import { useAppSelector } from '@/app/hooks'
import { ROUTES } from '@/constants/routes'
import { selectIsAuthenticated } from '@/store/authSlice'
import { getRedirectPath } from './locationState'

/**
 * For pages like /login: signed-in users are sent on to the page they
 * originally requested (or the dashboard).
 */
export function PublicOnlyRoute() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const location = useLocation()

  if (isAuthenticated) {
    return <Navigate to={getRedirectPath(location.state, ROUTES.dashboard)} replace />
  }

  return <Outlet />
}
