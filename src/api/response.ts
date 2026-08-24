import type { ApiResponse } from '../types'

export function unwrapApiResponse<T>(response: ApiResponse<T>): T {
  if (response.code !== 200) {
    throw new Error(response.message || '请求失败')
  }
  return response.data
}
