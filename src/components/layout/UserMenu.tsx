import { App, Avatar, Dropdown, type MenuProps } from 'antd'
import { ChevronDown, LogOut, Settings, SlidersHorizontal, User } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { ROUTES } from '@/constants/routes'
import { loggedOut, selectCurrentUser, selectCurrentUserRole } from '@/store/authSlice'
import { getFullName, getInitials } from '@/utils/format'
import styles from './UserMenu.module.scss'

type UserMenuKey = 'profile' | 'account' | 'preferences' | 'logout'

export function UserMenu() {
  const user = useAppSelector(selectCurrentUser)
  const role = useAppSelector(selectCurrentUserRole)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { message } = App.useApp()

  if (!user) return null
  const fullName = getFullName(user)

  const handleLogout = () => {
    dispatch(loggedOut())
    message.success('You have been signed out.')
  }

  const items: MenuProps['items'] = [
    {
      key: 'header',
      type: 'group',
      label: (
        <div className={styles.menuHeader}>
          <span className={styles.menuName}>{fullName}</span>
          <span className={styles.menuEmail}>{user.email}</span>
        </div>
      ),
    },
    { type: 'divider' },
    { key: 'profile', icon: <User size={16} />, label: 'My Profile' },
    { key: 'account', icon: <Settings size={16} />, label: 'Account Settings' },
    { key: 'preferences', icon: <SlidersHorizontal size={16} />, label: 'Preferences' },
    { type: 'divider' },
    { key: 'logout', icon: <LogOut size={16} />, label: 'Logout', danger: true },
  ]

  const handleClick: MenuProps['onClick'] = ({ key }) => {
    switch (key as UserMenuKey) {
      case 'profile':
        navigate(`${ROUTES.settings}?section=profile`)
        break
      case 'account':
        navigate(`${ROUTES.settings}?section=account`)
        break
      case 'preferences':
        navigate(`${ROUTES.settings}?section=preferences`)
        break
      case 'logout':
        handleLogout()
        break
    }
  }

  return (
    <Dropdown menu={{ items, onClick: handleClick }} trigger={['click']} placement="bottomRight">
      <button type="button" className={styles.trigger} aria-label={`Account menu for ${fullName}`}>
        <Avatar size={34} className={styles.avatar}>
          {getInitials(fullName)}
        </Avatar>
        <span className={styles.identity}>
          <span className={styles.name}>{fullName}</span>
          <span className={styles.role}>{role?.name ?? user.title}</span>
        </span>
        <ChevronDown size={16} className={styles.chevron} aria-hidden="true" />
      </button>
    </Dropdown>
  )
}
