import { beforeEach, describe, expect, it, vi } from 'vitest'
import http from './http'
import { createUser, fetchUsers } from './users'

vi.mock('./http', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('users api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('按服务端分页契约查询用户', async () => {
    vi.mocked(http.get).mockResolvedValue({
      data: {
        code: 200,
        message: 'ok',
        data: { records: [], total: 0, pageNum: 2, pageSize: 20, pages: 0 },
      },
    })

    const result = await fetchUsers({ pageNum: 2, pageSize: 20, keyword: '林', status: 'ACTIVE' })

    expect(http.get).toHaveBeenCalledWith('/api/v1/manage/users', {
      params: { pageNum: 2, pageSize: 20, keyword: '林', status: 'ACTIVE' },
    })
    expect(result.pageNum).toBe(2)
  })

  it('按后端字段提交新增用户', async () => {
    vi.mocked(http.post).mockResolvedValue({
      data: {
        code: 200,
        message: 'ok',
        data: {
          userId: 9,
          phone: '13800138000',
          nickname: '新用户',
          roles: ['MEMBER'],
          status: 'ACTIVE',
        },
      },
    })

    const user = await createUser({
      phone: '13800138000',
      email: '',
      password: 'secret123',
      nickname: '新用户',
      initialRole: 'MEMBER',
    })

    expect(http.post).toHaveBeenCalledWith('/api/v1/manage/users', {
      phone: '13800138000',
      password: 'secret123',
      nickname: '新用户',
      initialRole: 'MEMBER',
    })
    expect(user.userId).toBe(9)
  })
})
