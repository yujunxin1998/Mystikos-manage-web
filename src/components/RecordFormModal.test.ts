import { mount } from '@vue/test-utils'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import RecordFormModal from './RecordFormModal.vue'

beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
})

afterEach(() => {
  document.body.innerHTML = ''
})

function mountModal() {
  return mount(RecordFormModal, {
    props: {
      open: true,
      title: '编辑记录',
      subtitle: '填写信息',
      fields: [],
      form: {},
      statusOptions: [],
      defaultStatus: '正常',
    },
    attachTo: document.body,
  })
}

describe('RecordFormModal', () => {
  it('点击遮罩层不会关闭弹窗', async () => {
    const wrapper = mountModal()
    await nextTick()

    const mask = document.body.querySelector('.n-modal-mask')
    expect(mask).not.toBeNull()
    mask?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()

    expect(wrapper.emitted('close')).toBeUndefined()
    expect(document.body.querySelector('[aria-modal="true"]')).not.toBeNull()
  })

  it('点击关闭按钮仍然关闭弹窗', async () => {
    const wrapper = mountModal()
    await nextTick()

    const closeButton = document.body.querySelector('.n-base-close') as HTMLElement | null
    expect(closeButton).not.toBeNull()
    closeButton?.click()
    await nextTick()

    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})
