import type { ProductStatus } from '../types/product'

export const productStatusLabel: Record<ProductStatus, string> = {
  ON_SHELF: '已上架',
  OFF_SHELF: '已下架',
}

export const productStatusTone: Record<ProductStatus, 'success' | 'default'> = {
  ON_SHELF: 'success',
  OFF_SHELF: 'default',
}
