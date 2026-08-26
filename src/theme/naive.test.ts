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
    const darkVars = createThemeCssVars(darkThemeTokens)
    expect(darkVars['--app-surface']).toBe('#181c27')
    expect(darkVars['--app-primary']).toBe('#8b6cff')
    expect(darkVars['--app-radius-md']).toBe('10px')
    expect(darkVars['--app-sidebar-bg']).toBe('#0c1018')

    expect(createThemeCssVars(lightThemeTokens)['--app-page']).toBe('#f4f6fb')
    expect(createThemeCssVars(lightThemeTokens)['--app-primary']).toBe('#7257df')

    const darkOverrides = createNaiveThemeOverrides(darkThemeTokens)
    expect(darkOverrides.common?.cardColor).toBe('#181c27')
    expect(darkOverrides.common?.bodyColor).toBe('#0f121a')
    expect(darkOverrides.common?.primaryColor).toBe('#8b6cff')
    expect(darkOverrides.common?.borderRadius).toBe('10px')
    expect(darkOverrides.Button?.heightMedium).toBe('40px')
    expect(darkOverrides.Button?.colorPrimary).toBe('#8b6cff')
    expect(darkOverrides.Button?.textColorPrimary).toBe('#ffffff')
    expect(darkOverrides.Input?.heightMedium).toBe('40px')
    expect(darkOverrides.DataTable?.fontSizeMedium).toBe('13px')
    expect(darkOverrides.Card?.borderRadius).toBe('12px')
  })
})
