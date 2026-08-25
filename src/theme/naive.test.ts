import { describe, expect, it } from 'vitest'
import {
  createNaiveThemeOverrides,
  createThemeCssVars,
  darkThemeTokens,
  lightThemeTokens,
} from './naive'

describe('dual-theme tokens', () => {
  it('exposes fixed light and dark surface values', () => {
    expect(lightThemeTokens.page).toBe('#f4f6fb')
    expect(lightThemeTokens.surface).toBe('#ffffff')
    expect(lightThemeTokens.surfaceRaised).toBe('#ffffff')
    expect(lightThemeTokens.surfaceMuted).toBe('#f7f8fc')
    expect(lightThemeTokens.primary).toBe('#7257df')

    expect(darkThemeTokens.page).toBe('#0f121a')
    expect(darkThemeTokens.surface).toBe('#181c27')
    expect(darkThemeTokens.surfaceRaised).toBe('#1d2230')
    expect(darkThemeTokens.surfaceMuted).toBe('#202532')
  })

  it('maps tokens to CSS variables and Naive overrides', () => {
    expect(createThemeCssVars(darkThemeTokens)['--app-surface']).toBe('#181c27')
    expect(createThemeCssVars(lightThemeTokens)['--app-page']).toBe('#f4f6fb')

    const darkOverrides = createNaiveThemeOverrides(darkThemeTokens)
    expect(darkOverrides.common?.cardColor).toBe('#181c27')
    expect(darkOverrides.common?.bodyColor).toBe('#0f121a')
    expect(darkOverrides.common?.primaryColor).toBe('#8b6cff')
    expect(darkOverrides.Button?.heightMedium).toBe('40px')
    expect(darkOverrides.Button?.colorPrimary).toBe('#8b6cff')
    expect(darkOverrides.Button?.textColorPrimary).toBe('#ffffff')
    expect(darkOverrides.Input?.heightMedium).toBe('38px')
    expect(darkOverrides.DataTable?.fontSizeMedium).toBe('13px')
  })
})
