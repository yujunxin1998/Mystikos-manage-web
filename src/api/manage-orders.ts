import type {
  ApiResponse,
  ManageOrder,
  ManageOrderQuery,
  OrderAction,
  PageResult,
} from '../types'
import http from './http'
import { unwrapApiResponse } from './response'

function compact<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== '' && item !== undefined),
  ) as Partial<T>
}

export async function fetchOrders(query: ManageOrderQuery): Promise<PageResult<ManageOrder>> {
  const { data } = await http.get<ApiResponse<PageResult<ManageOrder>>>('/api/v1/manage/orders', {
    params: compact(query),
  })
  return unwrapApiResponse(data)
}

export async function fetchOrder(orderId: number): Promise<ManageOrder> {
  const { data } = await http.get<ApiResponse<ManageOrder>>(`/api/v1/manage/orders/${orderId}`)
  return unwrapApiResponse(data)
}

export async function transitionOrder(
  orderId: number,
  action: OrderAction,
): Promise<ManageOrder> {
  const { data } = await http.put<ApiResponse<ManageOrder>>(
    `/api/v1/manage/orders/${orderId}/${action}`,
  )
  return unwrapApiResponse(data)
}
