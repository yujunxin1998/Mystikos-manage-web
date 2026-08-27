import { beforeEach, describe, expect, it, vi } from 'vitest'
import http from './http'
import { fetchOperationLogs } from './operation-logs'

vi.mock('./http', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

describe('operation logs api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('分页查询操作日志并带上筛选', async () => {
    vi.mocked(http.get).mockResolvedValue({
      data: { code: 200, message: 'ok', data: { records: [], total: 0, pageNum: 2, pageSize: 20, pages: 0 } },
    })

    await fetchOperationLogs({
      operatorId: '1',
      pathKeyword: '/api/v1/manage',
      occurredFrom: '2026-08-01T00:00:00',
      occurredTo: '2026-08-27T23:59:59',
      pageNum: 2,
      pageSize: 20,
    })

    expect(http.get).toHaveBeenCalledWith('/api/v1/manage/operation-logs', {
      params: {
        operatorId: '1',
        pathKeyword: '/api/v1/manage',
        occurredFrom: '2026-08-01T00:00:00',
        occurredTo: '2026-08-27T23:59:59',
        pageNum: 2,
        pageSize: 20,
      },
    })
  })

  it('空筛选不进入查询参数', async () => {
    vi.mocked(http.get).mockResolvedValue({
      data: { code: 200, message: 'ok', data: { records: [], total: 0, pageNum: 1, pageSize: 10, pages: 0 } },
    })

    await fetchOperationLogs({ pageNum: 1, pageSize: 10 })

    expect(http.get).toHaveBeenCalledWith('/api/v1/manage/operation-logs', {
      params: { pageNum: 1, pageSize: 10 },
    })
  })
})
