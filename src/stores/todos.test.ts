import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchCompanionApplications, fetchCompanionShowcases } from '../api/companions'
import { useTodosStore } from './todos'

vi.mock('../api/companions', () => ({
  fetchCompanionApplications: vi.fn(),
  fetchCompanionShowcases: vi.fn(),
}))

describe('todos store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('汇总申请待办与名片待审数量', async () => {
    vi.mocked(fetchCompanionApplications)
      .mockResolvedValueOnce({
        records: [],
        total: 3,
        pageNum: 1,
        pageSize: 1,
        pages: 3,
      })
      .mockResolvedValueOnce({
        records: [],
        total: 2,
        pageNum: 1,
        pageSize: 1,
        pages: 2,
      })
    vi.mocked(fetchCompanionShowcases).mockResolvedValue({
      records: [],
      total: 4,
      pageNum: 1,
      pageSize: 1,
      pages: 4,
    })

    const store = useTodosStore()
    await store.refresh(true)

    expect(store.applicationPending).toBe(5)
    expect(store.showcasePending).toBe(4)
    expect(store.totalPending).toBe(9)
    expect(store.applicationBadge).toBe('5')
    expect(store.showcaseBadge).toBe('4')
  })

  it('接口 total 为字符串时仍按数字汇总，不拼成 01', async () => {
    vi.mocked(fetchCompanionApplications)
      .mockResolvedValueOnce({
        records: [],
        total: '0' as unknown as number,
        pageNum: 1,
        pageSize: 1,
        pages: 0,
      })
      .mockResolvedValueOnce({
        records: [],
        total: '1' as unknown as number,
        pageNum: 1,
        pageSize: 1,
        pages: 1,
      })
    vi.mocked(fetchCompanionShowcases).mockResolvedValue({
      records: [],
      total: '2' as unknown as number,
      pageNum: 1,
      pageSize: 1,
      pages: 2,
    })

    const store = useTodosStore()
    await store.refresh(true)

    expect(store.applicationPending).toBe(1)
    expect(store.showcasePending).toBe(2)
    expect(store.applicationBadge).toBe('1')
  })

  it('超过 99 显示 99+', async () => {
    vi.mocked(fetchCompanionApplications)
      .mockResolvedValueOnce({
        records: [],
        total: 80,
        pageNum: 1,
        pageSize: 1,
        pages: 80,
      })
      .mockResolvedValueOnce({
        records: [],
        total: 30,
        pageNum: 1,
        pageSize: 1,
        pages: 30,
      })
    vi.mocked(fetchCompanionShowcases).mockResolvedValue({
      records: [],
      total: 0,
      pageNum: 1,
      pageSize: 1,
      pages: 0,
    })

    const store = useTodosStore()
    await store.refresh(true)

    expect(store.applicationBadge).toBe('99+')
    expect(store.showcaseBadge).toBeUndefined()
  })
})
