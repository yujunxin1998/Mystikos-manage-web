import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchUsers } from '../../api/users'
import MembersView from './MembersView.vue'

vi.mock('../../api/users', () => ({
  addUserRole: vi.fn(),
  banUser: vi.fn(),
  createUser: vi.fn(),
  deleteUser: vi.fn(),
  fetchUserPermissions: vi.fn(),
  fetchUsers: vi.fn(),
  removeUserRole: vi.fn(),
}))

describe('MembersView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(fetchUsers).mockResolvedValue({
      records: [],
      total: 0,
      pageNum: 1,
      pageSize: 20,
      pages: 0,
    })
  })

  it('查询时提交接口支持的全部筛选条件', async () => {
    const wrapper = mount(MembersView, {
      global: { plugins: [createPinia()] },
    })
    await flushPromises()

    expect(wrapper.find('[aria-label="创建时间开始"]').exists()).toBe(true)
    expect(wrapper.find('[aria-label="创建时间结束"]').exists()).toBe(true)

    await wrapper.get('[aria-label="用户关键词"]').setValue(' 林 ')
    await wrapper.get('[aria-label="账号状态"]').setValue('BANNED')
    await wrapper.get('[aria-label="创建时间开始"]').setValue('2026-08-01T08:30')
    await wrapper.get('[aria-label="创建时间结束"]').setValue('2026-08-24T18:00')
    await wrapper.get('[data-testid="apply-user-filters"]').trigger('click')
    await flushPromises()

    expect(fetchUsers).toHaveBeenLastCalledWith({
      pageNum: 1,
      pageSize: 20,
      keyword: '林',
      status: 'BANNED',
      createdFrom: '2026-08-01T08:30:00',
      createdTo: '2026-08-24T18:00:00',
    })
  })
})
