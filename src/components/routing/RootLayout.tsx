import { Outlet, ScrollRestoration } from 'react-router'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useRouteHandle } from '@/hooks/useRouteHandle'

/** Top-level route element: keeps the document title in sync and restores scroll. */
export function RootLayout() {
  const handle = useRouteHandle()
  useDocumentTitle(handle?.title)

  return (
    <>
      <Outlet />
      <ScrollRestoration />
    </>
  )
}
