import { describe, expect, it } from 'vitest'
import {
  ALLOW_AUTOFILL_ATTR,
  applyDisableBrowserAutofill,
} from './disableBrowserAutofill'

describe('disableBrowserAutofill', () => {
  it('为普通输入与表单关闭自动填充', () => {
    const root = document.createElement('div')
    root.innerHTML = `
      <form>
        <input type="text" />
        <input type="email" />
        <input type="password" />
        <textarea></textarea>
      </form>
    `

    applyDisableBrowserAutofill(root)

    const form = root.querySelector('form')
    const [text, email, password, textarea] = Array.from(
      root.querySelectorAll('input, textarea'),
    ) as Array<HTMLInputElement | HTMLTextAreaElement>

    expect(form?.getAttribute('autocomplete')).toBe('off')
    expect(text.getAttribute('autocomplete')).toBe('nope')
    expect(email.getAttribute('autocomplete')).toBe('nope')
    expect(password.getAttribute('autocomplete')).toBe('new-password')
    expect(textarea.getAttribute('autocomplete')).toBe('nope')
  })

  it('不处理 data-allow-autofill 区域内的控件', () => {
    const root = document.createElement('div')
    root.innerHTML = `
      <form ${ALLOW_AUTOFILL_ATTR}>
        <input type="email" autocomplete="username" />
        <input type="password" autocomplete="current-password" />
      </form>
      <input type="text" />
    `

    applyDisableBrowserAutofill(root)

    const [username, password, other] = Array.from(
      root.querySelectorAll('input'),
    )
    expect(username.getAttribute('autocomplete')).toBe('username')
    expect(password.getAttribute('autocomplete')).toBe('current-password')
    expect(other.getAttribute('autocomplete')).toBe('nope')
  })
})
