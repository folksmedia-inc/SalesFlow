import { Tag } from 'antd'
import { useMemo } from 'react'
import { useAppSelector } from '@/app/hooks'
import { PersonCell } from '@/components/common/PersonCell'
import { selectCurrentUser } from '@/store/authSlice'
import { getFullName } from '@/utils/format'
import { userConfig } from '../config/userConfig'

const SELF_DELETE_MESSAGE = "You can't delete your own account."
const SELF_SUSPEND_MESSAGE = "You can't suspend or deactivate your own account."

/**
 * `userConfig` extended with rules that depend on who is signed in: a "You"
 * badge on your own row, and you can't delete or suspend your own account.
 */
export function useUserListConfig(): typeof userConfig {
  const currentUser = useAppSelector(selectCurrentUser)
  const currentUserId = currentUser?.id

  return useMemo(() => {
    if (!currentUserId) return userConfig
    const { form } = userConfig
    return {
      ...userConfig,
      columns: userConfig.columns.map((column) =>
        column.key === 'name'
          ? {
              ...column,
              render: (user) => (
                <PersonCell
                  name={getFullName(user)}
                  subtitle={
                    user.id === currentUserId ? (
                      <>
                        {user.email}{' '}
                        <Tag color="blue" variant="filled" style={{ marginInlineStart: 4, fontSize: 11, lineHeight: '16px', paddingInline: 5 }}>
                          You
                        </Tag>
                      </>
                    ) : (
                      user.email
                    )
                  }
                />
              ),
            }
          : column,
      ),
      getDeleteBlocker: (user) => (user.id === currentUserId ? SELF_DELETE_MESSAGE : null),
      getStatusToggleBlocker: (user) => (user.id === currentUserId && user.status === 'Active' ? SELF_SUSPEND_MESSAGE : null),
      getBulkActionBlocker: (user, action) => {
        if (user.id !== currentUserId) return null
        if (action.kind === 'delete') return SELF_DELETE_MESSAGE
        if (action.kind === 'update' && action.changes.status !== undefined && action.changes.status !== 'Active') return SELF_SUSPEND_MESSAGE
        return null
      },
      form: {
        ...form,
        validate: (values, context) => ({
          ...form.validate?.(values, context),
          ...(context.currentId === currentUserId && values.status !== 'Active' ? { status: SELF_SUSPEND_MESSAGE } : {}),
        }),
      },
    }
  }, [currentUserId])
}
