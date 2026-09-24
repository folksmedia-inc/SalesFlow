import { theme, type ThemeConfig } from 'antd'
import type { ThemeMode } from '@/store/uiSlice'

/**
 * Design tokens for the application. This file is the single source of truth
 * for colors: antd consumes the ThemeConfig, and `applyCssVariables` exposes
 * the resolved tokens to SCSS modules as `--app-*` custom properties.
 */

export const palette = {
  brand: '#0176d3',
  brandDark: '#014486',
  brandLight: '#1b96ff',
  success: '#2e844a',
  warning: '#dd7a01',
  error: '#ba0517',
  /** Lighter reds/greens/oranges that keep contrast on dark surfaces. */
  errorOnDark: '#fe5c4c',
  successOnDark: '#45c65a',
  warningOnDark: '#fe9339',
} as const

const FONT_FAMILY =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif"

interface ModeColors {
  primary: string
  bgLayout: string
  bgContainer: string
  bgElevated: string
  border: string
  borderSecondary: string
  siderBg: string
  siderBorder: string
  tableHeaderBg: string
}

const modeColors: Record<ThemeMode, ModeColors> = {
  light: {
    primary: palette.brand,
    bgLayout: '#f3f5f8',
    bgContainer: '#ffffff',
    bgElevated: '#ffffff',
    border: '#d8dde6',
    borderSecondary: '#e8ebf0',
    siderBg: '#0b2545',
    siderBorder: '#0b2545',
    tableHeaderBg: '#f7f9fb',
  },
  dark: {
    primary: palette.brandLight,
    bgLayout: '#0d1117',
    bgContainer: '#151b23',
    bgElevated: '#1c2430',
    border: '#2d3643',
    borderSecondary: '#232b36',
    siderBg: '#10161e',
    siderBorder: '#232b36',
    tableHeaderBg: '#1a212b',
  },
}

export function getThemeConfig(mode: ThemeMode): ThemeConfig {
  const colors = modeColors[mode]

  return {
    algorithm: mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: colors.primary,
      colorInfo: colors.primary,
      colorSuccess: mode === 'dark' ? palette.successOnDark : palette.success,
      colorWarning: mode === 'dark' ? palette.warningOnDark : palette.warning,
      colorError: mode === 'dark' ? palette.errorOnDark : palette.error,
      colorLink: colors.primary,
      colorBgLayout: colors.bgLayout,
      colorBgContainer: colors.bgContainer,
      colorBgElevated: colors.bgElevated,
      colorBorder: colors.border,
      colorBorderSecondary: colors.borderSecondary,
      fontFamily: FONT_FAMILY,
      fontSize: 14,
      borderRadius: 6,
      borderRadiusLG: 10,
      controlHeight: 34,
      wireframe: false,
    },
    components: {
      Layout: {
        siderBg: colors.siderBg,
        headerBg: colors.bgContainer,
        headerHeight: 60,
        headerPadding: '0 20px',
        bodyBg: colors.bgLayout,
      },
      Menu: {
        darkItemBg: colors.siderBg,
        darkSubMenuItemBg: colors.siderBg,
        darkPopupBg: colors.siderBg,
        darkItemColor: 'rgba(255, 255, 255, 0.74)',
        darkItemHoverColor: '#ffffff',
        darkItemHoverBg: 'rgba(255, 255, 255, 0.08)',
        darkItemSelectedBg: palette.brand,
        darkItemSelectedColor: '#ffffff',
        darkGroupTitleColor: 'rgba(255, 255, 255, 0.45)',
        itemHeight: 40,
        itemMarginInline: 10,
        itemBorderRadius: 6,
        iconSize: 18,
        collapsedIconSize: 18,
        collapsedWidth: 72,
      },
      Card: {
        headerFontSize: 15,
      },
      Table: {
        headerBg: colors.tableHeaderBg,
        headerSplitColor: 'transparent',
      },
      Button: {
        primaryShadow: 'none',
        defaultShadow: 'none',
        dangerShadow: 'none',
      },
    },
  }
}

/** Mode-specific colors not covered by antd's global token set. */
export function getModeColors(mode: ThemeMode): ModeColors {
  return modeColors[mode]
}
