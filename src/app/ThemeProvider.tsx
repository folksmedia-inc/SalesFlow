import { App as AntApp, ConfigProvider } from 'antd'
import enUS from 'antd/locale/en_US'
import { useLayoutEffect, useMemo, type ReactNode } from 'react'
import { useAppSelector } from '@/app/hooks'
import { selectThemeMode } from '@/store/uiSlice'
import { applyCssVariables } from '@/styles/applyCssVariables'
import { getThemeConfig } from '@/styles/theme'

/**
 * Applies the active theme to antd (ConfigProvider) and to custom styles
 * (CSS variables on <html>). `AntApp` provides theme-aware `message`,
 * `notification` and `modal` via `App.useApp()`.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const mode = useAppSelector(selectThemeMode)
  const themeConfig = useMemo(() => getThemeConfig(mode), [mode])

  useLayoutEffect(() => {
    applyCssVariables(themeConfig, mode)
  }, [themeConfig, mode])

  return (
    <ConfigProvider theme={themeConfig} locale={enUS} componentSize="middle">
      <AntApp message={{ maxCount: 3 }} notification={{ placement: 'topRight' }}>
        {children}
      </AntApp>
    </ConfigProvider>
  )
}
