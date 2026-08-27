import { beforeEach, describe, expect, it, vi } from 'vitest'
import http from './http'
import { createProduct, fetchProduct, fetchProducts, updateProduct } from './manage-products'

vi.mock('./http', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const productFixture = {
  id: 88,
  categoryId: 3,
  name: '星轨香薰',
  description: '木质调香',
  price: 99.9,
  images: ['products/88/main.png'],
  status: 'ON_SHELF',
}

describe('manage products api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('按服务端契约分页查询商品', async () => {
    vi.mocked(http.get).mockResolvedValue({
      data: { code: 200, message: 'ok', data: { records: [], total: 0, pageNum: 2, pageSize: 20, pages: 0 } },
    })

    await fetchProducts({ status: 'ON_SHELF', pageNum: 2, pageSize: 20 })

    expect(http.get).toHaveBeenCalledWith('/api/v1/manage/products', {
      params: { status: 'ON_SHELF', pageNum: 2, pageSize: 20 },
    })
  })

  it('空状态筛选不进入查询参数', async () => {
    vi.mocked(http.get).mockResolvedValue({
      data: { code: 200, message: 'ok', data: { records: [], total: 0, pageNum: 1, pageSize: 20, pages: 0 } },
    })

    await fetchProducts({ pageNum: 1, pageSize: 20 })

    expect(http.get).toHaveBeenCalledWith('/api/v1/manage/products', {
      params: { pageNum: 1, pageSize: 20 },
    })
  })

  it('查询商品详情', async () => {
    vi.mocked(http.get).mockResolvedValue({ data: { code: 200, message: 'ok', data: productFixture } })

    await expect(fetchProduct(88)).resolves.toEqual(productFixture)
    expect(http.get).toHaveBeenCalledWith('/api/v1/manage/products/88')
  })

  it('新增商品返回 ID', async () => {
    vi.mocked(http.post).mockResolvedValue({ data: { code: 200, message: 'ok', data: 88 } })

    await expect(
      createProduct({
        name: '星轨香薰',
        description: '木质调香',
        price: 99.9,
        images: ['products/88/main.png'],
        initialStock: 20,
      }),
    ).resolves.toBe(88)

    expect(http.post).toHaveBeenCalledWith('/api/v1/manage/products', {
      name: '星轨香薰',
      description: '木质调香',
      price: 99.9,
      images: ['products/88/main.png'],
      initialStock: 20,
    })
  })

  it('编辑商品并提交上下架状态', async () => {
    vi.mocked(http.put).mockResolvedValue({ data: { code: 200, message: 'ok', data: productFixture } })

    await expect(
      updateProduct(88, {
        name: '星轨香薰',
        description: '木质调香',
        price: 109.9,
        images: ['products/88/main.png'],
        status: 'OFF_SHELF',
      }),
    ).resolves.toEqual(productFixture)

    expect(http.put).toHaveBeenCalledWith('/api/v1/manage/products/88', {
      name: '星轨香薰',
      description: '木质调香',
      price: 109.9,
      images: ['products/88/main.png'],
      status: 'OFF_SHELF',
    })
  })
})
