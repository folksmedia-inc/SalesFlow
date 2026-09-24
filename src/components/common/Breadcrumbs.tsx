import { Breadcrumb } from 'antd'
import { House } from 'lucide-react'
import { memo } from 'react'
import { Link } from 'react-router'
import { ROUTES } from '@/constants/routes'
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs'

interface BreadcrumbsProps {
  /** Overrides labels by pathname, e.g. `{ '/employees/emp_001': 'John Smith' }`. */
  labels?: Record<string, string>
}

/** Route-driven breadcrumbs. Labels come from each route's `handle.crumb`. */
export const Breadcrumbs = memo(function Breadcrumbs({ labels }: BreadcrumbsProps) {
  const crumbs = useBreadcrumbs()
  if (crumbs.length === 0) return null

  const items = [
    {
      key: 'home',
      title: (
        <Link to={ROUTES.dashboard} aria-label="Dashboard">
          <House size={14} aria-hidden="true" />
        </Link>
      ),
    },
    ...crumbs.map((crumb, index) => {
      const label = labels?.[crumb.path] ?? crumb.label
      return {
        key: crumb.path,
        title: index === crumbs.length - 1 ? label : <Link to={crumb.path}>{label}</Link>,
      }
    }),
  ]

  return <Breadcrumb items={items} />
})
