import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const layoutCss = readFileSync(resolve(process.cwd(), 'src/styles/layout.css'), 'utf8')
const indexCss = readFileSync(resolve(process.cwd(), 'src/styles/index.css'), 'utf8')
const businessCss = readFileSync(resolve(process.cwd(), 'src/styles/business.css'), 'utf8')

describe('admin layout', () => {
  beforeEach(() => {
    const style = document.createElement('style')
    style.dataset.testLayout = 'true'
    style.textContent = `${layoutCss}\n${businessCss}\n${indexCss}`
    document.head.append(style)
  })

  afterEach(() => {
    document.body.innerHTML = ''
    document.head.querySelector('[data-test-layout]')?.remove()
  })

  it('allows the application shell to shrink to the viewport width', () => {
    const shell = document.createElement('div')
    shell.className = 'app'
    document.body.append(shell)

    const minWidth = Number.parseFloat(getComputedStyle(shell).minWidth) || 0

    expect(minWidth).toBe(0)
  })

  it('contains wide order tables inside the order panel', () => {
    const main = document.createElement('main')
    const page = document.createElement('div')
    const panel = document.createElement('section')
    const tableHost = document.createElement('div')
    page.className = 'business-page order-page'
    panel.className = 'order-table-panel panel'
    tableHost.className = 'order-table-host'
    panel.append(tableHost)
    page.append(panel)
    main.append(page)
    document.body.append(main)

    expect(getComputedStyle(main).minWidth).toBe('0px')
    expect(getComputedStyle(page).minWidth).toBe('0px')
    expect(getComputedStyle(panel).overflowX).toBe('hidden')
    expect(getComputedStyle(tableHost).overflowX).toBe('auto')
  })

  it('consumes semantic theme tokens for shell, header, panel and stats', () => {
    expect(layoutCss).toMatch(/\.app\s*\{[^}]*--bg:\s*var\(--app-page\)/)
    expect(layoutCss).toMatch(/\.app\s*\{[^}]*--card:\s*var\(--app-surface\)/)
    expect(layoutCss).toMatch(/\.app\s*\{[^}]*--text:\s*var\(--app-text\)/)
    expect(layoutCss).toMatch(/\.app\s*\{[^}]*--muted:\s*var\(--app-text-muted\)/)
    expect(layoutCss).toMatch(/\.app\s*\{[^}]*--line:\s*var\(--app-border\)/)
    expect(layoutCss).toMatch(/\.app\s*\{[^}]*--hover:\s*var\(--app-hover\)/)
    expect(layoutCss).not.toMatch(/\.app\.dark\s*\{[^}]*--bg:\s*#/)
    expect(layoutCss).toMatch(
      /\.app main > header\s*\{[^}]*background:\s*var\(--app-surface\);[^}]*border-bottom:\s*1px solid var\(--app-border\);[^}]*box-shadow:\s*var\(--app-shadow-subtle\)/,
    )
    expect(layoutCss).toMatch(
      /\.stat-card,\s*\.panel\s*\{[^}]*background:\s*var\(--app-surface\);[^}]*border:\s*1px solid var\(--app-border\);[^}]*border-radius:\s*var\(--app-radius-lg\);[^}]*box-shadow:\s*var\(--app-shadow\)/,
    )
    expect(layoutCss).toMatch(/\.sidebar\s*\{[^}]*background:\s*var\(--app-sidebar-bg\)/)
    expect(layoutCss).toMatch(/\.primary\s*\{[^}]*background:\s*var\(--app-primary\)/)
    expect(businessCss).toMatch(
      /\.business-stats article\s*\{\s*background:\s*var\(--app-surface\);\s*border:\s*1px solid var\(--app-border\);/,
    )

    const root = document.createElement('div')
    root.className = 'theme-root'
    root.style.setProperty('--app-page', '#f4f6fb')
    root.style.setProperty('--app-surface', '#ffffff')
    root.style.setProperty('--app-border', '#e4e8f0')
    root.style.setProperty('--app-text', '#172033')
    root.style.setProperty('--app-text-muted', '#7d899d')
    root.style.setProperty('--app-hover', '#f2f0fb')
    root.style.setProperty('--app-primary', '#7257df')
    root.style.setProperty('--app-radius-lg', '12px')

    const shell = document.createElement('div')
    shell.className = 'app'

    const main = document.createElement('main')
    const header = document.createElement('header')
    main.append(header)

    const panel = document.createElement('section')
    panel.className = 'panel'

    const stats = document.createElement('section')
    stats.className = 'business-stats'
    const article = document.createElement('article')
    stats.append(article)

    shell.append(main, panel, stats)
    root.append(shell)
    document.body.append(root)

    const shellStyle = getComputedStyle(shell)
    expect(shellStyle.getPropertyValue('--bg').trim()).toBe('var(--app-page)')
    expect(shellStyle.getPropertyValue('--card').trim()).toBe('var(--app-surface)')
    expect(shellStyle.getPropertyValue('--text').trim()).toBe('var(--app-text)')
    expect(shellStyle.getPropertyValue('--muted').trim()).toBe('var(--app-text-muted)')
    expect(shellStyle.getPropertyValue('--line').trim()).toBe('var(--app-border)')
    expect(shellStyle.getPropertyValue('--hover').trim()).toBe('var(--app-hover)')
    expect(root.style.getPropertyValue('--app-page')).toBe('#f4f6fb')
    expect(root.style.getPropertyValue('--app-surface')).toBe('#ffffff')
    expect(root.style.getPropertyValue('--app-border')).toBe('#e4e8f0')
    expect(root.style.getPropertyValue('--app-primary')).toBe('#7257df')
  })
})
