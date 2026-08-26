import type { ApiResponse, CreateCommerceOrderRequest } from '../types'
import http from './http'
import { unwrapApiResponse } from './response'

export async function createCommerceOrder(request: CreateCommerceOrderRequest): Promise<number> {
  const { data } = await http.post<ApiResponse<number>>('/api/v1/orders', request)
  return unwrapApiResponse(data)
}
