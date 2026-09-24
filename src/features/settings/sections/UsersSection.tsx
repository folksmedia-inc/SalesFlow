import { Button } from 'antd'
import { ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router'
import { ROUTES } from '@/constants/routes'
import { UserManagement } from '@/features/users/components/UserManagement'

/** User management embedded in Settings (same component as the Users page). */
export function UsersSection() {
  const navigate = useNavigate()
  return (
    <UserManagement
      embedded
      headerActions={
        <Button icon={<ExternalLink size={15} />} onClick={() => navigate(ROUTES.users)}>
          Open full page
        </Button>
      }
    />
  )
}
