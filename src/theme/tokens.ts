export interface ThemeTokens {
  primary: string
  primaryHover: string
  primaryPressed: string
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
}

export const lightThemeTokens: ThemeTokens = {
  primary: '#7257df',
  primaryHover: '#8067e7',
  primaryPressed: '#6548cf',
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
}

export const darkThemeTokens: ThemeTokens = {
  // 深色下用更亮的品牌紫，与侧栏/BrandMark 一致，避免主按钮发灰发淡
  primary: '#8b6cff',
  primaryHover: '#9b80ff',
  primaryPressed: '#7357e7',
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
}

export function createThemeCssVars(tokens: ThemeTokens): Record<string, string> {
  return {
    '--app-page': tokens.page,
    '--app-surface': tokens.surface,
    '--app-surface-raised': tokens.surfaceRaised,
    '--app-surface-muted': tokens.surfaceMuted,
    '--app-border': tokens.border,
    '--app-text': tokens.text,
    '--app-text-muted': tokens.textMuted,
    '--app-hover': tokens.hover,
    '--app-selected': tokens.selected,
    '--app-shadow': tokens.shadow,
    '--app-shadow-subtle': tokens.shadowSubtle,
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
  }
}
