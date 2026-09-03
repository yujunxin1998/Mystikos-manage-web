import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import ProductDetailDrawer from './ProductDetailDrawer.vue'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('ProductDetailDrawer', () => {
  it('groups product information into an overview, description, and gallery', () => {
    mount(ProductDetailDrawer, {
      props: {
        show: true,
        loading: false,
        product: {
          id: 3,
          categoryId: 2,
          name: '传奇搭档限定钥匙扣',
          description: '限定商品说明',
          price: 199,
          images: ['https://example.com/cover.png', 'https://example.com/detail.png'],
          status: 'ON_SHELF',
        },
      },
      attachTo: document.body,
    })

    expect(document.body.textContent).toContain('商品概览')
    expect(document.body.textContent).toContain('商品说明')
    expect(document.body.textContent).toContain('商品图片')
    expect(document.body.textContent).toContain('¥199.00')
  })
})
