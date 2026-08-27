import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { NConfigProvider, NMessageProvider } from 'naive-ui'
import { defineComponent, h } from 'vue'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import ProductsView from './ProductsView.vue'
import { fetchProducts } from '../../api/manage-products'
import type { ProductView } from '../../types'

vi.mock('../../api/manage-products', () => ({
  fetchProducts: vi.fn(),
  fetchProduct: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
}))

vi.mock('../../api/files', () => ({
  getFileUrl: vi.fn(),
  uploadFile: vi.fn(),
  deleteFile: vi.fn(),
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

const productFixture: ProductView = {
  id: 88,
  categoryId: 3,
  name: '星轨香薰',
  description: '木质调香',
  price: 99.9,
  images: [],
  status: 'ON_SHELF',
}

function mountProductsView() {
  const pinia = createPinia()
  const Host = defineComponent({
    setup() {
      return () =>
        h(NConfigProvider, null, {
          default: () =>
            h(NMessageProvider, null, {
              default: () => h(ProductsView),
            }),
        })
    },
  })
  return mount(Host, { global: { plugins: [pinia] } })
}

describe('ProductsView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(fetchProducts).mockResolvedValue({
      records: [productFixture],
      total: 1,
      pageNum: 1,
      pageSize: 10,
      pages: 1,
    })
  })

  it('渲染服务端商品列表，且不展示库存与陪玩师字段', async () => {
    const wrapper = mountProductsView()
    await flushPromises()

    expect(wrapper.text()).toContain('星轨香薰')
    expect(wrapper.text()).toContain('¥99.90')
    expect(wrapper.text()).toContain('已上架')
    expect(wrapper.text()).not.toContain('陪玩师')
    expect(wrapper.text()).not.toContain('库存')
  })

  it('点击新增商品打开创建弹窗', async () => {
    const wrapper = mountProductsView()
    await flushPromises()

    const createButton = wrapper.findAll('button').find((button) => button.text().includes('新增商品'))
    await createButton!.trigger('click')
    await flushPromises()

    expect(document.body.textContent).toContain('确认提交')
    expect(document.body.textContent).toContain('商品名称')
  })
})
