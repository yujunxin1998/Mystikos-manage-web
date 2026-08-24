import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import StatusTag from './StatusTag.vue'

describe('StatusTag', () => {
  it('渲染状态文案', () => {
    const wrapper = mount(StatusTag, {
      props: {
        status: '进行中',
        variant: 'table',
      },
    })
    expect(wrapper.text()).toBe('进行中')
    expect(wrapper.classes()).toContain('status')
    expect(wrapper.classes()).toContain('进行中')
  })
})
