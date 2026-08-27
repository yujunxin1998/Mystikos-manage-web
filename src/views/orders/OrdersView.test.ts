import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { NConfigProvider, NMessageProvider } from 'naive-ui'
import { defineComponent, h } from 'vue'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import OrdersView from './OrdersView.vue'
import { fetchOrders } from '../../api/manage-orders'
import type { ManageOrder } from '../../types'

vi.mock('../../api/manage-orders', () => ({
  fetchOrders: vi.fn(),
  fetchOrder: vi.fn(),
  transitionOrder: vi.fn(),
}))

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

const orderFixture: ManageOrder = {
  orderId: 2099,
  patronId: 42,
  items: [
    {
      productId: 88,
      productNameSnapshot: '陪玩服务 2 小时',
      unitPriceSnapshot: 120,
      quantity: 2,
      subtotal: 240,
    },
    {
      productId: 89,
      productNameSnapshot: '陪玩服务 1 小时',
      unitPriceSnapshot: 60,
      quantity: 1,
      subtotal: 60,
    },
  ],
  totalAmount: 300,
  shippingAddress: '浙江省杭州市西湖区',
  status: 'PAID',
  createdAt: '2026-08-27T10:00:00',
}

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
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(fetchOrders).mockResolvedValue({
      records: [orderFixture],
      total: 1,
      pageNum: 1,
      pageSize: 10,
      pages: 1,
    })
  })

  it('渲染服务端订单列表，且不提供创建/编辑/删除', async () => {
    const wrapper = mountOrdersView()
    await flushPromises()

    expect(wrapper.text()).toContain('陪玩服务 2 小时等2项')
    expect(wrapper.text()).toContain('¥300.00')
    expect(wrapper.text()).toContain('已支付')
    expect(wrapper.text()).not.toContain('新增订单')
    expect(wrapper.text()).not.toContain('编辑订单')
    expect(wrapper.text()).not.toContain('删除订单')
  })

  it('按买家 ID 提交筛选', async () => {
    const wrapper = mountOrdersView()
    await flushPromises()

    await wrapper.get('input[placeholder="买家用户 ID"]').setValue('42')
    const queryButton = wrapper.findAll('button').find((button) => button.text().includes('查询'))
    await queryButton!.trigger('click')
    await flushPromises()

    expect(fetchOrders).toHaveBeenLastCalledWith(
      expect.objectContaining({ patronId: 42, pageNum: 1, pageSize: 10 }),
    )
  })

  it('重置后不携带筛选条件', async () => {
    const wrapper = mountOrdersView()
    await flushPromises()

    await wrapper.get('input[placeholder="买家用户 ID"]').setValue('42')
    const resetButton = wrapper.findAll('button').find((button) => button.text().includes('重置'))
    await resetButton!.trigger('click')
    await flushPromises()

    expect(fetchOrders).toHaveBeenLastCalledWith(
      expect.objectContaining({ pageNum: 1, pageSize: 10 }),
    )
  })
})
