import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { NConfigProvider, NMessageProvider } from 'naive-ui'
import { defineComponent, h, nextTick } from 'vue'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
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

afterEach(() => {
  document.body.innerHTML = ''
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

    expect(wrapper.find('.order-toolbar').exists()).toBe(true)
    expect(wrapper.find('.n-data-table').exists()).toBe(true)
    expect(wrapper.find('[aria-label="状态筛选"]').exists()).toBe(true)
    const keyword = wrapper.get('input[placeholder="输入关键词搜索"]')
    await keyword.setValue('风起云涌')
    await nextTick()

    expect(wrapper.text()).toContain('KN202608240018')
    expect(wrapper.text()).not.toContain('KN202608240017')
  })

  it('opens the create-order modal from the primary action', async () => {
    const wrapper = mountOrdersView()
    const createButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('创建订单'))

    expect(createButton).toBeDefined()
    await createButton!.trigger('click')
    await nextTick()

    expect(document.body.querySelector('[aria-modal="true"]')).not.toBeNull()
  })
})
