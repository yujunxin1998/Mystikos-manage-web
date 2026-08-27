import type { ApiResponse, OperationLog, OperationLogQuery, PageResult } from '../types'
import http from './http'
import { unwrapApiResponse } from './response'

function compact<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== '' && item !== undefined),
  ) as Partial<T>
}

export async function fetchOperationLogs(
  query: OperationLogQuery,
): Promise<PageResult<OperationLog>> {
  const { data } = await http.get<ApiResponse<PageResult<OperationLog>>>(
    '/api/v1/manage/operation-logs',
    { params: compact(query) },
  )
  return unwrapApiResponse(data)
}
