import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { NConfigProvider, NMessageProvider } from 'naive-ui'
import { defineComponent, h, nextTick } from 'vue'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import OrdersView from './OrdersView.vue'

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

function mountOrdersView() {
  const pinia = createPinia()
  const Host = defineComponent({
    setup() {
      return () =>
        h(NConfigProvider, null, {
          default: () =>
            h(NMessageProvider, null, {
              default: () => h(OrdersView),
            }),
        })
    },
  })

  return mount(Host, { global: { plugins: [pinia] } })
}

describe('OrdersView', () => {
  it('renders a Naive UI data table and filters its rows by keyword', async () => {
    const wrapper = mountOrdersView()

    expect(wrapper.find('.n-data-table').exists()).toBe(true)
    const keyword = wrapper.get('input[placeholder="输入关键词搜索"]')
    await keyword.setValue('风起云涌')
    await nextTick()

    expect(wrapper.text()).toContain('KN202608240018')
    expect(wrapper.text()).not.toContain('KN202608240017')
  })
})
