import { theme, type ThemeConfig } from 'antd'
import type { ThemeMode } from '@/store/uiSlice'
import { getModeColors } from './theme'

/**
 * Exposes resolved antd design tokens as `--app-*` CSS custom properties on
 * `<html>`, so SCSS modules stay in sync with the active theme.
 */
export function applyCssVariables(config: ThemeConfig, mode: ThemeMode): void {
  const token = theme.getDesignToken(config)
  const colors = getModeColors(mode)
  const root = document.documentElement

  const variables: Record<string, string> = {
    '--app-color-primary': token.colorPrimary,
    '--app-color-primary-bg': token.colorPrimaryBg,
    '--app-color-success': token.colorSuccess,
    '--app-color-warning': token.colorWarning,
    '--app-color-error': token.colorError,
    '--app-bg-layout': token.colorBgLayout,
    '--app-bg-container': token.colorBgContainer,
    '--app-bg-elevated': token.colorBgElevated,
    '--app-bg-subtle': token.colorFillQuaternary,
    '--app-border': token.colorBorder,
    '--app-border-secondary': token.colorBorderSecondary,
    '--app-text': token.colorText,
    '--app-text-secondary': token.colorTextSecondary,
    '--app-text-tertiary': token.colorTextTertiary,
    '--app-text-heading': token.colorTextHeading,
    '--app-sider-bg': colors.siderBg,
    '--app-sider-border': colors.siderBorder,
    '--app-radius': `${token.borderRadius}px`,
    '--app-radius-lg': `${token.borderRadiusLG}px`,
    '--app-shadow-sm': token.boxShadowTertiary,
    '--app-shadow': token.boxShadowSecondary,
    '--app-font-family': token.fontFamily,
  }

  for (const [name, value] of Object.entries(variables)) {
    root.style.setProperty(name, value)
  }
  root.dataset.theme = mode
  root.style.colorScheme = mode
}
