import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import OrderDetailDrawer from './OrderDetailDrawer.vue'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('OrderDetailDrawer', () => {
  it('presents order identity, fulfillment information, and totals in distinct groups', () => {
    mount(OrderDetailDrawer, {
      props: {
        show: true,
        loading: false,
        order: {
          orderId: 2092543776294645762,
          patronId: 12,
          items: [
            {
              productId: 1,
              productNameSnapshot: '公会周边T恤',
              unitPriceSnapshot: 89,
              quantity: 1,
              subtotal: 89,
            },
          ],
          totalAmount: 89,
          shippingAddress: '上海市徐汇区测试路 1 号',
          status: 'DRAFT',
          createdAt: '2026-08-26T17:24:48',
        },
      },
      attachTo: document.body,
    })

    expect(document.body.textContent).toContain('买家信息')
    expect(document.body.textContent).toContain('下单时间')
    expect(document.body.textContent).toContain('商品数量')
    expect(document.body.textContent).toContain('收货信息')
    expect(document.body.textContent).toContain('订单合计')
  })
})
