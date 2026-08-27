export interface ThemeTokens {
  primary: string
  primaryHover: string
  primaryPressed: string
  primarySoft: string
  page: string
  surface: string
  surfaceRaised: string
  surfaceMuted: string
  border: string
  borderStrong: string
  text: string
  textMuted: string
  hover: string
  selected: string
  shadow: string
  shadowSubtle: string
  shadowElevated: string
  shadowPrimary: string
  tableHover: string
  tableStriped: string
  success: string
  successSoft: string
  warning: string
  warningSoft: string
  error: string
  errorSoft: string
  info: string
  infoSoft: string
  /** 侧栏保持深色导航，浅/深主题共用同一组侧栏色 */
  sidebarBg: string
  sidebarText: string
  sidebarMuted: string
  sidebarHover: string
  sidebarBorder: string
  sidebarActiveFrom: string
  sidebarActiveTo: string
  sidebarSupportBg: string
}

/** 布局级常量：圆角 / 间距 / 控件高度 / 字号，不随主题切换 */
export const layoutTokens = {
  radiusSm: '8px',
  radiusMd: '10px',
  radiusLg: '12px',
  space1: '4px',
  space2: '8px',
  space3: '12px',
  space4: '16px',
  space5: '20px',
  space6: '24px',
  space8: '32px',
  controlHeight: '40px',
  controlHeightSm: '32px',
  fontXs: '12px',
  fontSm: '13px',
  fontMd: '14px',
  fontLg: '16px',
  fontXl: '24px',
  fontDisplay: '26px',
  pagePadX: '30px',
  pagePadY: '28px',
  pagePadXMobile: '16px',
  pagePadYMobile: '20px',
  sidebarWidth: '238px',
  sidebarCollapsedWidth: '78px',
} as const

export const lightThemeTokens: ThemeTokens = {
  primary: '#7257df',
  primaryHover: '#8067e7',
  primaryPressed: '#6548cf',
  primarySoft: '#eee9ff',
  page: '#f4f6fb',
  surface: '#ffffff',
  surfaceRaised: '#ffffff',
  surfaceMuted: '#f7f8fc',
  border: '#e4e8f0',
  borderStrong: '#d5dbe6',
  text: '#172033',
  textMuted: '#7d899d',
  hover: '#f2f0fb',
  selected: '#eee9ff',
  shadow: '0 10px 30px rgba(23, 32, 51, 0.08)',
  shadowSubtle: '0 1px 2px rgba(23, 32, 51, 0.04)',
  shadowElevated: '0 12px 30px rgba(23, 32, 51, 0.12)',
  shadowPrimary: '0 8px 20px rgba(114, 87, 223, 0.28)',
  tableHover: '#f7f5ff',
  tableStriped: '#fafbfe',
  success: '#18a058',
  successSoft: '#e8f8ef',
  warning: '#f0a020',
  warningSoft: '#fff6e5',
  error: '#d03050',
  errorSoft: '#fdecee',
  info: '#2080f0',
  infoSoft: '#eaf3ff',
  sidebarBg: '#111827',
  sidebarText: '#9ba5b4',
  sidebarMuted: '#6b7686',
  sidebarHover: '#1b2638',
  sidebarBorder: '#2a3445',
  sidebarActiveFrom: '#7357e7',
  sidebarActiveTo: '#6548cf',
  sidebarSupportBg: '#1b2535',
}

export const darkThemeTokens: ThemeTokens = {
  // 深色下用更亮的品牌紫，与侧栏/BrandMark 一致，避免主按钮发灰发淡
  primary: '#8b6cff',
  primaryHover: '#9b80ff',
  primaryPressed: '#7357e7',
  primarySoft: '#2a2448',
  page: '#0f121a',
  surface: '#181c27',
  surfaceRaised: '#1d2230',
  surfaceMuted: '#202532',
  border: '#2a3142',
  borderStrong: '#3a4358',
  text: '#e8ebf2',
  textMuted: '#8b93a7',
  hover: '#242a38',
  selected: '#2a2448',
  shadow: '0 12px 32px rgba(0, 0, 0, 0.35)',
  shadowSubtle: '0 1px 2px rgba(0, 0, 0, 0.25)',
  shadowElevated: '0 12px 32px rgba(0, 0, 0, 0.45)',
  shadowPrimary: '0 8px 22px rgba(139, 108, 255, 0.32)',
  tableHover: '#222838',
  tableStriped: '#1a1f2c',
  success: '#63e2b7',
  successSoft: '#1b3a32',
  warning: '#f2c97d',
  warningSoft: '#3a2f1a',
  error: '#e88080',
  errorSoft: '#3a1f28',
  info: '#70c0e8',
  infoSoft: '#1a2f3f',
  sidebarBg: '#0c1018',
  sidebarText: '#9ba5b4',
  sidebarMuted: '#6b7686',
  sidebarHover: '#1b2638',
  sidebarBorder: '#2a3445',
  sidebarActiveFrom: '#8b6cff',
  sidebarActiveTo: '#6548cf',
  sidebarSupportBg: '#151b27',
}

export function createLayoutCssVars(): Record<string, string> {
  return {
    '--app-radius-sm': layoutTokens.radiusSm,
    '--app-radius-md': layoutTokens.radiusMd,
    '--app-radius-lg': layoutTokens.radiusLg,
    '--app-space-1': layoutTokens.space1,
    '--app-space-2': layoutTokens.space2,
    '--app-space-3': layoutTokens.space3,
    '--app-space-4': layoutTokens.space4,
    '--app-space-5': layoutTokens.space5,
    '--app-space-6': layoutTokens.space6,
    '--app-space-8': layoutTokens.space8,
    '--app-control-height': layoutTokens.controlHeight,
    '--app-control-height-sm': layoutTokens.controlHeightSm,
    '--app-font-xs': layoutTokens.fontXs,
    '--app-font-sm': layoutTokens.fontSm,
    '--app-font-md': layoutTokens.fontMd,
    '--app-font-lg': layoutTokens.fontLg,
    '--app-font-xl': layoutTokens.fontXl,
    '--app-font-display': layoutTokens.fontDisplay,
    '--app-page-pad-x': layoutTokens.pagePadX,
    '--app-page-pad-y': layoutTokens.pagePadY,
    '--app-page-pad-x-mobile': layoutTokens.pagePadXMobile,
    '--app-page-pad-y-mobile': layoutTokens.pagePadYMobile,
    '--app-sidebar-width': layoutTokens.sidebarWidth,
    '--app-sidebar-collapsed-width': layoutTokens.sidebarCollapsedWidth,
  }
}

export function createThemeCssVars(tokens: ThemeTokens): Record<string, string> {
  return {
    ...createLayoutCssVars(),
    '--app-primary': tokens.primary,
    '--app-primary-hover': tokens.primaryHover,
    '--app-primary-pressed': tokens.primaryPressed,
    '--app-primary-soft': tokens.primarySoft,
    '--app-page': tokens.page,
    '--app-surface': tokens.surface,
    '--app-surface-raised': tokens.surfaceRaised,
    '--app-surface-muted': tokens.surfaceMuted,
    '--app-border': tokens.border,
    '--app-border-strong': tokens.borderStrong,
    '--app-text': tokens.text,
    '--app-text-muted': tokens.textMuted,
    '--app-hover': tokens.hover,
    '--app-selected': tokens.selected,
    '--app-shadow': tokens.shadow,
    '--app-shadow-subtle': tokens.shadowSubtle,
    '--app-shadow-elevated': tokens.shadowElevated,
    '--app-shadow-primary': tokens.shadowPrimary,
    '--app-table-hover': tokens.tableHover,
    '--app-table-striped': tokens.tableStriped,
    '--app-success': tokens.success,
    '--app-success-soft': tokens.successSoft,
    '--app-warning': tokens.warning,
    '--app-warning-soft': tokens.warningSoft,
    '--app-error': tokens.error,
    '--app-error-soft': tokens.errorSoft,
    '--app-info': tokens.info,
    '--app-info-soft': tokens.infoSoft,
    '--app-sidebar-bg': tokens.sidebarBg,
    '--app-sidebar-text': tokens.sidebarText,
    '--app-sidebar-muted': tokens.sidebarMuted,
    '--app-sidebar-hover': tokens.sidebarHover,
    '--app-sidebar-border': tokens.sidebarBorder,
    '--app-sidebar-active-from': tokens.sidebarActiveFrom,
    '--app-sidebar-active-to': tokens.sidebarActiveTo,
    '--app-sidebar-support-bg': tokens.sidebarSupportBg,
  }
}
