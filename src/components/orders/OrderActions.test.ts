import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import OrderActions from './OrderActions.vue'
import type { ManageOrderStatus } from '../../types'

function labels(status: ManageOrderStatus) {
  const wrapper = mount(OrderActions, { props: { status } })
  return wrapper.findAll('button').map((button) => button.text().trim())
}

describe('OrderActions', () => {
  it('renders the documented transition matrix', () => {
    expect(labels('DRAFT')).toEqual(['取消订单'])
    expect(labels('PENDING_PAYMENT')).toEqual(['取消订单'])
    expect(labels('PAID')).toEqual(['开始处理', '取消订单', '退款'])
    expect(labels('FULFILLING')).toEqual(['发货', '退款'])
    expect(labels('SHIPPED')).toEqual(['完成', '退款'])
    expect(labels('COMPLETED')).toEqual(['退款'])
    expect(labels('CANCELLED')).toEqual([])
    expect(labels('REFUNDED')).toEqual([])
  })
})
