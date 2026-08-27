export interface OperationLog {
  id: number
  operatorId: string
  httpMethod: string
  requestPath: string
  queryString: string
  requestBody: string
  responseStatus: number
  success: boolean
  errorMessage: string
  clientIp: string
  durationMs: number
  occurredAt: string
}

export interface OperationLogQuery {
  operatorId?: string
  pathKeyword?: string
  occurredFrom?: string
  occurredTo?: string
  pageNum: number
  pageSize: number
}
