/** 允许浏览器自动填充的区域（如登录表单） */
export const ALLOW_AUTOFILL_ATTR = 'data-allow-autofill'

const SKIP_INPUT_TYPES = new Set([
  'hidden',
  'checkbox',
  'radio',
  'file',
  'submit',
  'button',
  'reset',
  'image',
  'range',
  'color',
])

/** 保留的显式 autocomplete（仅用于已标记允许区） */
const PRESERVED_OUTSIDE_ALLOW = new Set(['username', 'current-password'])

/**
 * 关闭根节点内表单/输入的浏览器自动填充与地址建议。
 * Chrome 常忽略 autocomplete="off"，对普通输入使用无法识别的 token。
 * 登录等场景请在祖先节点加 data-allow-autofill。
 */
export function applyDisableBrowserAutofill(root: ParentNode): void {
  root.querySelectorAll('form, input, textarea, select').forEach((node) => {
    if (!(node instanceof HTMLElement)) return
    if (node.closest(`[${ALLOW_AUTOFILL_ATTR}]`)) return

    if (node instanceof HTMLFormElement) {
      if (node.getAttribute('autocomplete') !== 'off') {
        node.setAttribute('autocomplete', 'off')
      }
      return
    }

    if (
      !(node instanceof HTMLInputElement) &&
      !(node instanceof HTMLTextAreaElement) &&
      !(node instanceof HTMLSelectElement)
    ) {
      return
    }

    if (node instanceof HTMLInputElement) {
      const type = (node.type || 'text').toLowerCase()
      if (SKIP_INPUT_TYPES.has(type)) return
      if (type === 'password') {
        if (node.getAttribute('autocomplete') !== 'new-password') {
          node.setAttribute('autocomplete', 'new-password')
        }
        return
      }
    }

    const current = node.getAttribute('autocomplete')
    if (current && PRESERVED_OUTSIDE_ALLOW.has(current)) return

    // 非标准值，避免 Chrome 按 email/地址启发式弹出「管理地址」
    if (current !== 'nope') {
      node.setAttribute('autocomplete', 'nope')
    }
  })
}

/**
 * 监听 DOM 变化，持续为动态渲染的 Naive 输入框关闭自动填充。
 */
export function watchDisableBrowserAutofill(root: HTMLElement): () => void {
  applyDisableBrowserAutofill(root)

  let scheduled = false
  const observer = new MutationObserver(() => {
    if (scheduled) return
    scheduled = true
    queueMicrotask(() => {
      scheduled = false
      applyDisableBrowserAutofill(root)
    })
  })

  observer.observe(root, { childList: true, subtree: true })
  return () => observer.disconnect()
}
