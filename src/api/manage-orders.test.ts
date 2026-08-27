import { beforeEach, describe, expect, it, vi } from 'vitest'
import http from './http'
import { fetchOrder, fetchOrders, transitionOrder } from './manage-orders'

vi.mock('./http', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const orderFixture = {
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
  ],
  totalAmount: 240,
  shippingAddress: '浙江省杭州市西湖区',
  status: 'PAID',
  createdAt: '2026-08-27T10:00:00',
}

describe('manage orders api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('分页查询订单并带上可选筛选', async () => {
    vi.mocked(http.get).mockResolvedValue({
      data: { code: 200, message: 'ok', data: { records: [], total: 0, pageNum: 2, pageSize: 20, pages: 0 } },
    })

    await fetchOrders({ status: 'PAID', patronId: 42, pageNum: 2, pageSize: 20 })

    expect(http.get).toHaveBeenCalledWith('/api/v1/manage/orders', {
      params: { status: 'PAID', patronId: 42, pageNum: 2, pageSize: 20 },
    })
  })

  it('空筛选不进入查询参数', async () => {
    vi.mocked(http.get).mockResolvedValue({
      data: { code: 200, message: 'ok', data: { records: [], total: 0, pageNum: 1, pageSize: 20, pages: 0 } },
    })

    await fetchOrders({ pageNum: 1, pageSize: 20 })

    expect(http.get).toHaveBeenCalledWith('/api/v1/manage/orders', {
      params: { pageNum: 1, pageSize: 20 },
    })
  })

  it('查询订单详情', async () => {
    vi.mocked(http.get).mockResolvedValue({ data: { code: 200, message: 'ok', data: orderFixture } })

    await expect(fetchOrder(2099)).resolves.toEqual(orderFixture)
    expect(http.get).toHaveBeenCalledWith('/api/v1/manage/orders/2099')
  })

  it('按动作流转订单状态', async () => {
    vi.mocked(http.put).mockResolvedValue({
      data: { code: 200, message: 'ok', data: { ...orderFixture, status: 'FULFILLING' } },
    })

    for (const action of ['start-fulfilling', 'ship', 'complete', 'cancel', 'refund'] as const) {
      await transitionOrder(2099, action)
      expect(http.put).toHaveBeenCalledWith(`/api/v1/manage/orders/2099/${action}`)
    }
  })
})
