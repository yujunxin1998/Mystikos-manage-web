import { beforeEach, describe, expect, it, vi } from 'vitest'
import http from './http'
import { createCommerceOrder } from './commerce'

vi.mock('./http', () => ({
  default: { post: vi.fn() },
}))

describe('commerce api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('按商城契约提交收货地址并返回订单 ID', async () => {
    vi.mocked(http.post).mockResolvedValue({
      data: { code: 200, message: 'ok', data: 2099 },
    })

    const orderId = await createCommerceOrder({ shippingAddress: '浙江省杭州市西湖区' })

    expect(http.post).toHaveBeenCalledWith('/api/v1/orders', {
      shippingAddress: '浙江省杭州市西湖区',
    })
    expect(orderId).toBe(2099)
  })
})
