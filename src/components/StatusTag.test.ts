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
    expect(wrapper.classes()).toContain('status-info')
  })

  it('maps business statuses to stable semantic tone classes', () => {
    expect(mount(StatusTag, { props: { status: '进行中' } }).classes()).toContain('status-info')
    expect(mount(StatusTag, { props: { status: '待接单' } }).classes()).toContain('status-warning')
    expect(mount(StatusTag, { props: { status: '已完成' } }).classes()).toContain('status-success')
    expect(mount(StatusTag, { props: { status: '已取消' } }).classes()).toContain('status-error')
  })
})
