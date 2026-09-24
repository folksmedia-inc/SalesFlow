import { Navigate, Outlet, useLocation } from 'react-router'
import { useAppSelector } from '@/app/hooks'
import { ROUTES } from '@/constants/routes'
import { selectIsAuthenticated } from '@/store/authSlice'
import type { RedirectLocationState } from './locationState'

/** Renders child routes only for signed-in users; otherwise redirects to /login. */
export function ProtectedRoute() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    const state: RedirectLocationState = {
      from: { pathname: location.pathname, search: location.search, hash: location.hash },
    }
    return <Navigate to={ROUTES.login} replace state={state} />
  }

  return <Outlet />
}
