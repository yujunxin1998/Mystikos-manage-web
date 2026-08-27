import type {
  ApiResponse,
  CreateProductRequest,
  PageResult,
  ProductQuery,
  ProductView,
  UpdateProductRequest,
} from '../types'
import http from './http'
import { unwrapApiResponse } from './response'

function compact<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== '' && item !== undefined),
  ) as Partial<T>
}

export async function fetchProducts(query: ProductQuery): Promise<PageResult<ProductView>> {
  const { data } = await http.get<ApiResponse<PageResult<ProductView>>>('/api/v1/manage/products', {
    params: compact(query),
  })
  return unwrapApiResponse(data)
}

export async function fetchProduct(productId: number): Promise<ProductView> {
  const { data } = await http.get<ApiResponse<ProductView>>(`/api/v1/manage/products/${productId}`)
  return unwrapApiResponse(data)
}

export async function createProduct(request: CreateProductRequest): Promise<number> {
  const { data } = await http.post<ApiResponse<number>>('/api/v1/manage/products', compact(request))
  return unwrapApiResponse(data)
}

export async function updateProduct(
  productId: number,
  request: UpdateProductRequest,
): Promise<ProductView> {
  const { data } = await http.put<ApiResponse<ProductView>>(
    `/api/v1/manage/products/${productId}`,
    compact(request),
  )
  return unwrapApiResponse(data)
}
