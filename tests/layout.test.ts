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
})
