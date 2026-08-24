import { beforeEach, describe, expect, it, vi } from 'vitest'
import http from './http'
import * as companionApi from './companions'
import { createCompanion, fetchCompanionStats, fetchCompanions } from './companions'

vi.mock('./http', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

describe('companions api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('按服务端契约查询陪玩师分页', async () => {
    vi.mocked(http.get).mockResolvedValue({
      data: {
        code: 200,
        message: 'ok',
        data: { records: [], total: 0, pageNum: 3, pageSize: 20, pages: 0 },
      },
    })

    const result = await fetchCompanions({
      pageNum: 3,
      pageSize: 20,
      keyword: '北极星',
      status: 'AVAILABLE',
    })

    expect(http.get).toHaveBeenCalledWith('/api/v1/manage/companions', {
      params: { pageNum: 3, pageSize: 20, keyword: '北极星', status: 'AVAILABLE' },
    })
    expect(result.pageNum).toBe(3)
  })

  it('新增陪玩师时移除空的可选字段并保留标签 ID', async () => {
    vi.mocked(http.post).mockResolvedValue({ data: { code: 200, message: 'ok', data: null } })

    await createCompanion({
      phone: '13800138000',
      email: '',
      password: 'secret123',
      nickname: '北极星',
      level: 'S',
      tagIds: [1, 7],
      hourlyRate: 88,
      status: 'OFFLINE',
      idCardNo: '',
      bankAccountName: '',
      bankAccountNo: '',
      bankName: '',
    })

    expect(http.post).toHaveBeenCalledWith('/api/v1/manage/companions', {
      phone: '13800138000',
      password: 'secret123',
      nickname: '北极星',
      level: 'S',
      tagIds: [1, 7],
      hourlyRate: 88,
      status: 'OFFLINE',
    })
  })

  it('解包统计卡片响应', async () => {
    vi.mocked(http.get).mockResolvedValue({
      data: {
        code: 200,
        message: 'ok',
        data: { totalCount: 78, availableCount: 32, busyCount: 16, avgHourlyRate: 86.5 },
      },
    })

    await expect(fetchCompanionStats()).resolves.toEqual({
      totalCount: 78,
      availableCount: 32,
      busyCount: 16,
      avgHourlyRate: 86.5,
    })
  })

  it('按筛选条件分页查询陪玩身份申请', async () => {
    const fetchApplications = (companionApi as Record<string, unknown>).fetchCompanionApplications
    expect(typeof fetchApplications).toBe('function')
    vi.mocked(http.get).mockResolvedValue({
      data: {
        code: 200,
        message: 'ok',
        data: { records: [], total: 0, pageNum: 2, pageSize: 20, pages: 0 },
      },
    })

    await (fetchApplications as (query: Record<string, unknown>) => Promise<unknown>)({
      pageNum: 2,
      pageSize: 20,
      status: 'SUBMITTED',
      createdFrom: '2026-08-01T00:00:00',
      createdTo: '2026-08-24T23:59:59',
      keyword: '北极星',
    })

    expect(http.get).toHaveBeenCalledWith('/api/v1/manage/companion-applications', {
      params: {
        pageNum: 2,
        pageSize: 20,
        status: 'SUBMITTED',
        createdFrom: '2026-08-01T00:00:00',
        createdTo: '2026-08-24T23:59:59',
        keyword: '北极星',
      },
    })
  })

  it('开始指定申请的线下考核', async () => {
    const startAssessment = (companionApi as Record<string, unknown>).startCompanionAssessment
    expect(typeof startAssessment).toBe('function')
    vi.mocked(http.put).mockResolvedValue({ data: { code: 200, message: 'ok', data: null } })

    await (startAssessment as (id: number) => Promise<void>)(31)

    expect(http.put).toHaveBeenCalledWith(
      '/api/v1/manage/companion-applications/31/start-assessment',
    )
  })

  it('录入考核结果时提交当前审核人、结果和意见', async () => {
    const reviewApplication = (companionApi as Record<string, unknown>).reviewCompanionApplication
    expect(typeof reviewApplication).toBe('function')
    vi.mocked(http.put).mockResolvedValue({ data: { code: 200, message: 'ok', data: null } })

    await (reviewApplication as (id: number, request: Record<string, unknown>) => Promise<void>)(
      31,
      { reviewerId: 1, result: 'PASS', comment: '资料与线下考核均通过' },
    )

    expect(http.put).toHaveBeenCalledWith('/api/v1/manage/companion-applications/31/review', {
      reviewerId: 1,
      result: 'PASS',
      comment: '资料与线下考核均通过',
    })
  })
})
