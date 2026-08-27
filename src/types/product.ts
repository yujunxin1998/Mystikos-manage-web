export type ProductStatus = 'ON_SHELF' | 'OFF_SHELF'

export interface ProductView {
  id: number
  categoryId?: number
  name: string
  description?: string
  price: number
  images: string[]
  status: ProductStatus
}

export interface ProductQuery {
  status?: ProductStatus
  pageNum: number
  pageSize: number
}

export interface CreateProductRequest {
  categoryId?: number
  name: string
  description?: string
  price: number
  images?: string[]
  initialStock: number
}

export interface UpdateProductRequest {
  categoryId?: number
  name: string
  description?: string
  price: number
  images?: string[]
  status?: ProductStatus
}
