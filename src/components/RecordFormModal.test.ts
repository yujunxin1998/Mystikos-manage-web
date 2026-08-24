import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import RecordFormModal from './RecordFormModal.vue'

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
  })
}

describe('RecordFormModal', () => {
  it('点击遮罩层不会关闭弹窗', async () => {
    const wrapper = mountModal()

    await wrapper.get('.modal-backdrop').trigger('click')

    expect(wrapper.emitted('close')).toBeUndefined()
  })

  it('点击关闭按钮仍然关闭弹窗', async () => {
    const wrapper = mountModal()

    await wrapper.get('.modal-head .icon-btn').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})
