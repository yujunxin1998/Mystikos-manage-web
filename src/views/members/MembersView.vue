<script setup lang="ts">
import { computed, h, onMounted, reactive, ref, type VNode } from 'vue'
import {
  Ban,
  KeyRound,
  Plus,
  RefreshCcw,
  Search,
  ShieldCheck,
  Trash2,
  UsersRound,
} from 'lucide-vue-next'
import {
  NButton,
  NCard,
  NDataTable,
  NDatePicker,
  NForm,
  NFormItem,
  NInput,
  NModal,
  NPopconfirm,
  NSelect,
  NSpace,
  NTag,
  useMessage,
  type DataTableColumns,
} from 'naive-ui'
import ListPagination from '../../components/ListPagination.vue'
import CopyableId from '../../components/CopyableId.vue'
import StatusTag from '../../components/StatusTag.vue'
import {
  addUserRole,
  banUser,
  createUser,
  deleteUser,
  fetchUserPermissions,
  fetchUsers,
  removeUserRole,
} from '../../api/users'
import { useAuthStore } from '../../stores/auth'
import type { CreateUserRequest, UserProfile, UserRole, UserStatus } from '../../types'
import { DEFAULT_PAGE_SIZE, pageRange } from '../../utils/pagination'
import { ROLE_LABELS } from '../../utils/roles'

const message = useMessage()
const authStore = useAuthStore()
const canCreateUser = computed(() => authStore.can('user.create'))
const canManageRoles = computed(() => authStore.can('user.role'))
const canViewPermissions = computed(() => authStore.can('user.permission'))
const canBanUser = computed(() => authStore.can('user.ban'))
const canDeleteUser = computed(() => authStore.can('user.delete'))
const hasRowActions = computed(
  () =>
    canManageRoles.value ||
    canViewPermissions.value ||
    canBanUser.value ||
    canDeleteUser.value,
)
const rows = ref<UserProfile[]>([])
const loading = ref(false)
const keyword = ref('')
const status = ref<'' | UserStatus>('')
const createdFrom = ref<string | null>(null)
const createdTo = ref<string | null>(null)
const pageNum = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)
const total = ref(0)
const pages = ref(0)
const createOpen = ref(false)
const rolesOpen = ref(false)
const permissionsOpen = ref(false)
const selected = ref<UserProfile | null>(null)
const permissions = ref<string[]>([])
const roleToAdd = ref<UserRole>('MEMBER')

const roleOptions: UserRole[] = [
  'GUEST',
  'MEMBER',
  'COMPANION',
  'CUSTOMER_SERVICE',
  'ASSESSOR',
  'ADMIN',
]
const statusLabels: Record<UserStatus, string> = {
  ACTIVE: '正常',
  DISABLED: '已停用',
  BANNED: '已封禁',
  DELETED: '已删除',
}
const roleLabels = ROLE_LABELS
const roleSelectOptions = computed(() =>
  roleOptions.map((role) => ({ label: roleLabels[role], value: role })),
)
const statusSelectOptions = [
  { label: '全部状态', value: '' },
  { label: '正常', value: 'ACTIVE' },
  { label: '已停用', value: 'DISABLED' },
  { label: '已封禁', value: 'BANNED' },
  { label: '已删除', value: 'DELETED' },
]
const form = reactive<CreateUserRequest>({
  phone: '',
  email: '',
  password: '',
  nickname: '',
  initialRole: 'MEMBER',
})
const range = computed(() => pageRange(pageNum.value, pageSize.value, total.value))
const rangeStart = computed(() => range.value.start)
const rangeEnd = computed(() => range.value.end)
const activeCount = computed(() => rows.value.filter((item) => item.status === 'ACTIVE').length)

function toIsoDateTime(value: string | null): string | undefined {
  if (!value) return undefined
  return value.length === 16 ? `${value}:00` : value
}

async function loadUsers() {
  loading.value = true
  try {
    const result = await fetchUsers({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      keyword: keyword.value.trim() || undefined,
      status: status.value || undefined,
      createdFrom: toIsoDateTime(createdFrom.value),
      createdTo: toIsoDateTime(createdTo.value),
    })
    rows.value = result.records
    total.value = result.total
    pages.value = result.pages
  } catch (error) {
    message.error(error instanceof Error ? error.message : '用户列表加载失败')
  } finally {
    loading.value = false
  }
}

async function applyFilters() {
  pageNum.value = 1
  await loadUsers()
}

async function resetFilters() {
  keyword.value = ''
  status.value = ''
  createdFrom.value = null
  createdTo.value = null
  pageNum.value = 1
  await loadUsers()
}

function resetForm() {
  Object.assign(form, { phone: '', email: '', password: '', nickname: '', initialRole: 'MEMBER' })
}

async function submitCreate() {
  if (!form.phone?.trim() && !form.email?.trim()) {
    message.warning('手机号和邮箱至少填写一项')
    return
  }
  try {
    await createUser({ ...form })
    createOpen.value = false
    resetForm()
    message.success('用户创建成功')
    pageNum.value = 1
    await loadUsers()
  } catch (error) {
    message.error(error instanceof Error ? error.message : '用户创建失败')
  }
}

async function handleDelete(user: UserProfile) {
  try {
    await deleteUser(user.userId)
    message.success('用户已删除')
    await loadUsers()
  } catch (error) {
    message.error(error instanceof Error ? error.message : '删除失败')
  }
}

async function handleBan(user: UserProfile) {
  try {
    await banUser(user.userId)
    message.success('用户已封禁')
    await loadUsers()
  } catch (error) {
    message.error(error instanceof Error ? error.message : '封禁失败')
  }
}

function openRoles(user: UserProfile) {
  selected.value = user
  rolesOpen.value = true
}

async function addRole() {
  if (!selected.value || selected.value.roles.includes(roleToAdd.value)) return
  try {
    await addUserRole(selected.value.userId, roleToAdd.value)
    message.success('角色已分配')
    rolesOpen.value = false
    await loadUsers()
  } catch (error) {
    message.error(error instanceof Error ? error.message : '角色分配失败')
  }
}

async function removeRole(role: UserRole) {
  if (!selected.value) return
  try {
    await removeUserRole(selected.value.userId, role)
    message.success('角色已移除')
    rolesOpen.value = false
    await loadUsers()
  } catch (error) {
    message.error(error instanceof Error ? error.message : '角色移除失败')
  }
}

async function showPermissions(user: UserProfile) {
  selected.value = user
  try {
    permissions.value = await fetchUserPermissions(user.userId)
    permissionsOpen.value = true
  } catch (error) {
    message.error(error instanceof Error ? error.message : '权限加载失败')
  }
}

async function changePage(page: number) {
  pageNum.value = page
  await loadUsers()
}

async function changePageSize(size: number) {
  pageSize.value = size
  pageNum.value = 1
  await loadUsers()
}

const columns = computed<DataTableColumns<UserProfile>>(() => {
  const cols: DataTableColumns<UserProfile> = [
    {
      title: '用户ID',
      key: 'userId',
      width: 148,
      render: (row) => h(CopyableId, { value: row.userId, prefix: '#', name: '用户ID' }),
    },
    {
      title: '用户',
      key: 'nickname',
      width: 140,
      render: (row) => h('strong', { class: 'order-member' }, row.nickname || '未设置昵称'),
    },
    {
      title: '联系方式',
      key: 'contact',
      width: 200,
      render: (row) =>
        h('div', [
          h('span', row.phone || '-'),
          h('small', { class: 'cell-sub' }, row.email || '-'),
        ]),
    },
    {
      title: '角色',
      key: 'roles',
      width: 180,
      render: (row) =>
        h(
          'div',
          { class: 'app-form-roles' },
          row.roles.map((role) => h(NTag, { size: 'small', type: 'info', bordered: false }, () => roleLabels[role])),
        ),
    },
    {
      title: '会员等级',
      key: 'membership',
      width: 110,
      render: (row) => row.membershipTierCode || row.membershipTierLevel || '-',
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: (row) => h(StatusTag, { status: statusLabels[row.status], variant: 'business' }),
    },
  ]

  if (hasRowActions.value) {
    const actionCount =
      Number(canManageRoles.value) +
      Number(canViewPermissions.value) +
      Number(canBanUser.value) +
      Number(canDeleteUser.value)
    cols.push({
      title: '操作',
      key: 'actions',
      width: Math.max(88, actionCount * 36 + 16),
      fixed: 'right',
      render: (row) =>
        h(NSpace, { size: 2, wrap: false }, () => {
          const buttons: VNode[] = []
          if (canManageRoles.value) {
            buttons.push(
              h(
                NButton,
                {
                  quaternary: true,
                  circle: true,
                  size: 'small',
                  title: '角色管理',
                  onClick: () => openRoles(row),
                },
                { default: () => h(ShieldCheck, { size: 15 }) },
              ),
            )
          }
          if (canViewPermissions.value) {
            buttons.push(
              h(
                NButton,
                {
                  quaternary: true,
                  circle: true,
                  size: 'small',
                  title: '查看权限',
                  onClick: () => showPermissions(row),
                },
                { default: () => h(KeyRound, { size: 15 }) },
              ),
            )
          }
          if (canBanUser.value) {
            buttons.push(
              h(
                NPopconfirm,
                { onPositiveClick: () => handleBan(row) },
                {
                  trigger: () =>
                    h(
                      NButton,
                      {
                        quaternary: true,
                        circle: true,
                        size: 'small',
                        title: '封禁',
                        type: 'warning',
                      },
                      { default: () => h(Ban, { size: 15 }) },
                    ),
                  default: () => `确认封禁用户“${row.nickname || row.userId}”吗？`,
                },
              ),
            )
          }
          if (canDeleteUser.value) {
            buttons.push(
              h(
                NPopconfirm,
                { onPositiveClick: () => handleDelete(row) },
                {
                  trigger: () =>
                    h(
                      NButton,
                      {
                        quaternary: true,
                        circle: true,
                        size: 'small',
                        title: '删除',
                        type: 'error',
                      },
                      { default: () => h(Trash2, { size: 15 }) },
                    ),
                  default: () => `确认删除用户“${row.nickname || row.userId}”吗？`,
                },
              ),
            )
          }
          return buttons
        }),
    })
  }

  return cols
})

onMounted(loadUsers)
</script>

<template>
  <div class="business-page user-page">
    <section class="business-title">
      <div>
        <h1>用户管理</h1>
        <span>管理系统用户、账号状态、角色与权限</span>
      </div>
    </section>

    <section class="business-stats user-summary">
      <article>
        <i class="tone-0"><UsersRound /></i>
        <div>
          <p>用户总数</p>
          <strong>{{ total }}</strong>
          <small>来自服务器实时数据</small>
        </div>
      </article>
      <article>
        <i class="tone-1"><ShieldCheck /></i>
        <div>
          <p>当前页正常用户</p>
          <strong>{{ activeCount }}</strong>
          <small>当前第 {{ pageNum }} 页</small>
        </div>
      </article>
    </section>

    <section class="list-table-panel panel">
      <div class="list-toolbar">
        <div class="list-toolbar-main">
          <div>
            <h2>用户列表</h2>
            <p>共 {{ total }} 个系统用户</p>
          </div>
          <NSpace class="list-actions" :size="9">
            <NButton :loading="loading" @click="loadUsers">
              <template #icon><RefreshCcw :size="16" /></template>
              刷新
            </NButton>
            <NButton v-if="canCreateUser" type="primary" @click="createOpen = true">
              <template #icon><Plus :size="17" /></template>
              新增用户
            </NButton>
          </NSpace>
        </div>
        <NSpace class="list-filters" :size="8" wrap align="center">
          <NInput
            v-model:value="keyword"
            clearable
            aria-label="用户关键词"
            placeholder="搜索昵称、手机号或邮箱"
            style="width: 220px"
            @keyup.enter="applyFilters"
          >
            <template #prefix><Search :size="16" /></template>
          </NInput>
          <NSelect
            v-model:value="status"
            aria-label="账号状态"
            :options="statusSelectOptions"
            style="width: 130px"
          />
          <NDatePicker
            v-model:formatted-value="createdFrom"
            type="datetime"
            clearable
            value-format="yyyy-MM-dd'T'HH:mm"
            aria-label="创建时间开始"
            placeholder="创建时间起"
            style="width: 200px"
          />
          <NDatePicker
            v-model:formatted-value="createdTo"
            type="datetime"
            clearable
            value-format="yyyy-MM-dd'T'HH:mm"
            aria-label="创建时间结束"
            placeholder="创建时间止"
            style="width: 200px"
          />
          <NButton
            type="primary"
            data-testid="apply-user-filters"
            :loading="loading"
            @click="applyFilters"
          >
            查询
          </NButton>
          <NButton :disabled="loading" @click="resetFilters">重置</NButton>
        </NSpace>
      </div>

      <div class="list-table-host">
        <NDataTable
          :columns="columns"
          :data="rows"
          :loading="loading"
          :pagination="false"
          :row-key="(row: UserProfile) => row.userId"
          :scroll-x="1160"
          :single-line="false"
          striped
        />
      </div>

      <ListPagination
        :page="pageNum"
        :page-size="pageSize"
        :item-count="total"
        :range-start="rangeStart"
        :range-end="rangeEnd"
        :disabled="loading"
        @update:page="changePage"
        @update:page-size="changePageSize"
      />
    </section>

    <NModal v-model:show="createOpen" :mask-closable="false">
      <NCard
        class="app-form-modal"
        title="新增用户"
        :bordered="false"
        size="huge"
        closable
        role="dialog"
        aria-modal="true"
        @close="createOpen = false"
      >
        <p class="app-form-subtitle">手机号与邮箱至少填写一项</p>
        <NForm class="app-form-grid" label-placement="top">
          <NFormItem label="昵称">
            <NInput v-model:value="form.nickname" placeholder="请输入昵称" />
          </NFormItem>
          <NFormItem label="手机号">
            <NInput v-model:value="form.phone" placeholder="请输入手机号" />
          </NFormItem>
          <NFormItem label="邮箱">
            <NInput v-model:value="form.email" placeholder="请输入邮箱" />
          </NFormItem>
          <NFormItem label="初始密码">
            <NInput
              v-model:value="form.password"
              type="password"
              show-password-on="click"
              autocomplete="new-password"
              placeholder="留空则仅支持验证码登录"
            />
          </NFormItem>
          <NFormItem label="初始角色">
            <NSelect v-model:value="form.initialRole" :options="roleSelectOptions" />
          </NFormItem>
        </NForm>
        <template #footer>
          <NSpace justify="end">
            <NButton @click="createOpen = false">取消</NButton>
            <NButton type="primary" @click="submitCreate">确认创建</NButton>
          </NSpace>
        </template>
      </NCard>
    </NModal>

    <NModal
      :show="rolesOpen && !!selected"
      :mask-closable="false"
      @update:show="(show) => (rolesOpen = show)"
    >
      <NCard
        v-if="selected"
        class="app-form-modal compact"
        title="角色管理"
        :bordered="false"
        size="huge"
        closable
        role="dialog"
        aria-modal="true"
        @close="rolesOpen = false"
      >
        <p class="app-form-subtitle">{{ selected.nickname || `用户 #${selected.userId}` }}</p>
        <div class="app-form-roles">
          <NTag
            v-for="role in selected.roles"
            :key="role"
            closable
            type="info"
            @close="removeRole(role)"
          >
            {{ roleLabels[role] }}
          </NTag>
        </div>
        <NForm label-placement="top">
          <NFormItem label="新增角色">
            <NSelect v-model:value="roleToAdd" :options="roleSelectOptions" />
          </NFormItem>
        </NForm>
        <template #footer>
          <NSpace justify="end">
            <NButton @click="rolesOpen = false">关闭</NButton>
            <NButton type="primary" @click="addRole">分配角色</NButton>
          </NSpace>
        </template>
      </NCard>
    </NModal>

    <NModal
      :show="permissionsOpen && !!selected"
      :mask-closable="false"
      @update:show="(show) => (permissionsOpen = show)"
    >
      <NCard
        v-if="selected"
        class="app-form-modal compact"
        title="权限列表"
        :bordered="false"
        size="huge"
        closable
        role="dialog"
        aria-modal="true"
        @close="permissionsOpen = false"
      >
        <p class="app-form-subtitle">{{ selected.nickname || `用户 #${selected.userId}` }}</p>
        <div class="app-permission-list">
          <code v-for="item in permissions" :key="item">{{ item }}</code>
          <p v-if="!permissions.length">当前没有已解析权限</p>
        </div>
        <template #footer>
          <NSpace justify="end">
            <NButton type="primary" @click="permissionsOpen = false">知道了</NButton>
          </NSpace>
        </template>
      </NCard>
    </NModal>
  </div>
</template>
