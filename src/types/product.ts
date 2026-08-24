import type { RowRecord } from './common'

export interface Product extends RowRecord {
  image: string
  name: string
  id: string
  category: string
  price: string
  stock: string
  companion: string
  status: string
}
