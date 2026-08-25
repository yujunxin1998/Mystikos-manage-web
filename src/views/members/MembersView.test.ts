import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { NConfigProvider, NMessageProvider } from 'naive-ui'
import { defineComponent, h } from 'vue'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
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

beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
})

function mountMembersView() {
  const Host = defineComponent({
    setup() {
      return () =>
        h(NConfigProvider, null, {
          default: () =>
            h(NMessageProvider, null, {
              default: () => h(MembersView),
            }),
        })
    },
  })

  return mount(Host, { global: { plugins: [createPinia()] } })
}

describe('MembersView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(fetchUsers).mockResolvedValue({
      records: [],
      total: 0,
      pageNum: 1,
      pageSize: 10,
      pages: 0,
    })
  })

  it('查询时提交接口支持的全部筛选条件', async () => {
    const wrapper = mountMembersView()
    await flushPromises()

    expect(wrapper.find('.list-toolbar').exists()).toBe(true)
    expect(wrapper.find('.n-data-table').exists()).toBe(true)
    expect(wrapper.find('[aria-label="创建时间开始"]').exists()).toBe(true)
    expect(wrapper.find('[aria-label="创建时间结束"]').exists()).toBe(true)

    const keywordInput = wrapper.get('input[placeholder="搜索昵称、手机号或邮箱"]')
    await keywordInput.setValue(' 林 ')
    const statusSelect = wrapper.getComponent({ name: 'Select' })
    await statusSelect.vm.$emit('update:value', 'BANNED')
    const datePickers = wrapper.findAllComponents({ name: 'DatePicker' })
    await datePickers[0].vm.$emit('update:formatted-value', '2026-08-01T08:30')
    await datePickers[1].vm.$emit('update:formatted-value', '2026-08-24T18:00')
    await wrapper.get('[data-testid="apply-user-filters"]').trigger('click')
    await flushPromises()

    expect(fetchUsers).toHaveBeenLastCalledWith({
      pageNum: 1,
      pageSize: 10,
      keyword: '林',
      status: 'BANNED',
      createdFrom: '2026-08-01T08:30:00',
      createdTo: '2026-08-24T18:00:00',
    })
  })
})
