import { Button, Tooltip } from 'antd'
import { Moon, Sun } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { selectThemeMode, themeToggled } from '@/store/uiSlice'

export function ThemeToggle() {
  const dispatch = useAppDispatch()
  const mode = useAppSelector(selectThemeMode)
  const label = mode === 'light' ? 'Switch to dark theme' : 'Switch to light theme'

  return (
    <Tooltip title={label}>
      <Button
        type="text"
        shape="circle"
        aria-label={label}
        icon={mode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        onClick={() => dispatch(themeToggled())}
      />
    </Tooltip>
  )
}
