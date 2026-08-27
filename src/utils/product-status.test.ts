import { describe, expect, it } from 'vitest'
import { productStatusLabel, productStatusTone } from './product-status'

describe('product status presentation', () => {
  it('maps backend product statuses to stable Chinese labels and tones', () => {
    expect(productStatusLabel.ON_SHELF).toBe('已上架')
    expect(productStatusLabel.OFF_SHELF).toBe('已下架')
    expect(productStatusTone.ON_SHELF).toBe('success')
    expect(productStatusTone.OFF_SHELF).toBe('default')
  })
})
