<script setup lang="ts">
import { computed, h, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import {
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  UsersRound,
} from 'lucide-vue-next'
import {
  NButton,
  NCard,
  NDataTable,
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
  createCompanion,
  deleteCompanion,
  fetchCompanionStats,
  fetchCompanions,
} from '../../api/companions'
import type {
  Companion,
  CompanionStats,
  CompanionStatus,
  CreateCompanionRequest,
} from '../../types'
import { DEFAULT_PAGE_SIZE, pageRange } from '../../utils/pagination'
import { parseCompanionTagIds } from '../../utils/companion'

interface CompanionForm extends Omit<CreateCompanionRequest, 'tagIds' | 'hourlyRate'> {
  tagIdsText: string
  hourlyRateText: string
}

const message = useMessage()
const rows = ref<Companion[]>([])
const stats = ref<CompanionStats>({
  totalCount: 0,
  availableCount: 0,
  busyCount: 0,
  avgHourlyRate: 0,
})
const loading = ref(false)
const keyword = ref('')
const status = ref<'' | CompanionStatus>('')
const pageNum = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)
const total = ref(0)
const pages = ref(0)
const createOpen = ref(false)
let searchTimer: ReturnType<typeof setTimeout> | undefined

const statusLabels: Record<CompanionStatus, string> = {
  AVAILABLE: '在线',
  BUSY: '接单中',
  OFFLINE: '离线',
}
const statusSelectOptions = [
  { label: '全部状态', value: '' },
  { label: '在线', value: 'AVAILABLE' },
  { label: '接单中', value: 'BUSY' },
  { label: '离线', value: 'OFFLINE' },
]
const companionStatusOptions = [
  { label: '在线', value: 'AVAILABLE' },
  { label: '接单中', value: 'BUSY' },
  { label: '离线', value: 'OFFLINE' },
]
const form = reactive<CompanionForm>({
  phone: '',
  email: '',
  password: '',
  nickname: '',
  level: '',
  tagIdsText: '',
  hourlyRateText: '',
  status: 'OFFLINE',
  idCardNo: '',
  bankAccountName: '',
  bankAccountNo: '',
  bankName: '',
})
const range = computed(() => pageRange(pageNum.value, pageSize.value, total.value))
const rangeStart = computed(() => range.value.start)
const rangeEnd = computed(() => range.value.end)

async function loadCompanions() {
  loading.value = true
  try {
    const result = await fetchCompanions({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      keyword: keyword.value.trim() || undefined,
      status: status.value || undefined,
    })
    rows.value = result.records
    total.value = result.total
    pages.value = result.pages
  } catch (error) {
    message.error(error instanceof Error ? error.message : '陪玩师列表加载失败')
  } finally {
    loading.value = false
  }
}

async function loadStats() {
  try {
    stats.value = await fetchCompanionStats()
  } catch (error) {
    message.error(error instanceof Error ? error.message : '统计数据加载失败')
  }
}

async function refreshPage() {
  await Promise.all([loadCompanions(), loadStats()])
}

function resetForm() {
  Object.assign(form, {
    phone: '',
    email: '',
    password: '',
    nickname: '',
    level: '',
    tagIdsText: '',
    hourlyRateText: '',
    status: 'OFFLINE',
    idCardNo: '',
    bankAccountName: '',
    bankAccountNo: '',
    bankName: '',
  })
}

async function submitCreate() {
  if (!form.phone?.trim() && !form.email?.trim()) {
    message.warning('手机号和邮箱至少填写一项')
    return
  }
  const hourlyRate = form.hourlyRateText.trim() ? Number(form.hourlyRateText) : undefined
  if (hourlyRate !== undefined && (!Number.isFinite(hourlyRate) || hourlyRate < 0)) {
    message.warning('请输入有效的小时费率')
    return
  }
  try {
    await createCompanion({
      phone: form.phone,
      email: form.email,
      password: form.password,
      nickname: form.nickname,
      level: form.level,
      tagIds: parseCompanionTagIds(form.tagIdsText),
      hourlyRate,
      status: form.status,
      idCardNo: form.idCardNo,
      bankAccountName: form.bankAccountName,
      bankAccountNo: form.bankAccountNo,
      bankName: form.bankName,
    })
    createOpen.value = false
    resetForm()
    message.success('陪玩师创建成功')
    pageNum.value = 1
    await refreshPage()
  } catch (error) {
    message.error(error instanceof Error ? error.message : '陪玩师创建失败')
  }
}

async function handleDelete(companion: Companion) {
  try {
    await deleteCompanion(companion.userId)
    message.success('陪玩师已删除')
    await refreshPage()
  } catch (error) {
    message.error(error instanceof Error ? error.message : '删除失败')
  }
}

async function changePage(page: number) {
  pageNum.value = page
  await loadCompanions()
}

async function changePageSize(size: number) {
  pageSize.value = size
  pageNum.value = 1
  await loadCompanions()
}

const columns = computed<DataTableColumns<Companion>>(() => [
  {
    title: '用户ID',
    key: 'userId',
    width: 148,
    render: (row) => h(CopyableId, { value: row.userId, prefix: '#', name: '用户ID' }),
  },
  {
    title: '陪玩师',
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
    title: '擅长标签',
    key: 'tags',
    width: 180,
    render: (row) =>
      h(
        'div',
        { class: 'app-form-roles' },
        row.tags?.length
          ? row.tags.map((tag) =>
              h(NTag, { key: tag.id, size: 'small', type: 'info', bordered: false }, () => tag.label),
            )
          : [h('span', '-')],
      ),
  },
  {
    title: '等级',
    key: 'level',
    width: 90,
    render: (row) => row.level || '-',
  },
  {
    title: '小时费率',
    key: 'hourlyRate',
    width: 110,
    render: (row) => `¥${row.hourlyRate ?? 0}`,
  },
  {
    title: '完成订单',
    key: 'totalOrders',
    width: 100,
    render: (row) => row.performance?.totalOrders ?? 0,
  },
  {
    title: '评分',
    key: 'avgRating',
    width: 90,
    render: (row) => row.performance?.avgRating ?? '-',
  },
  {
    title: '总营收',
    key: 'totalRevenue',
    width: 110,
    render: (row) => `¥${row.performance?.totalRevenue ?? 0}`,
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row) => h(StatusTag, { status: statusLabels[row.status], variant: 'business' }),
  },
  {
    title: '操作',
    key: 'actions',
    width: 80,
    fixed: 'right',
    render: (row) =>
      h(NSpace, { size: 2, wrap: false }, () => [
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
            default: () => `确认删除陪玩师“${row.nickname || row.userId}”吗？`,
          },
        ),
      ]),
  },
])

watch(keyword, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    pageNum.value = 1
    void loadCompanions()
  }, 350)
})
watch(status, () => {
  pageNum.value = 1
  void loadCompanions()
})
onMounted(refreshPage)
onBeforeUnmount(() => clearTimeout(searchTimer))
</script>

<template>
  <div class="business-page companion-page">
    <section class="business-title">
      <div>
        <h1>陪玩师管理</h1>
        <span>维护陪玩师资料、接单状态和服务绩效</span>
      </div>
    </section>

    <section class="business-stats workers-summary">
      <article>
        <i class="tone-0"><UsersRound /></i>
        <div>
          <p>陪玩师总数</p>
          <strong>{{ stats.totalCount }}</strong>
          <small>服务器实时统计</small>
        </div>
      </article>
      <article>
        <i class="tone-2"><UsersRound /></i>
        <div>
          <p>接单中</p>
          <strong>{{ stats.busyCount }}</strong>
          <small>当前接单中人数</small>
        </div>
      </article>
    </section>

    <section class="list-table-panel panel">
      <div class="list-toolbar">
        <div class="list-toolbar-main">
          <div>
            <h2>陪玩师列表</h2>
            <p>共 {{ total }} 名陪玩师</p>
          </div>
          <NSpace class="list-actions" :size="9">
            <NButton :loading="loading" @click="refreshPage">
              <template #icon><RefreshCcw :size="16" /></template>
              刷新
            </NButton>
            <NButton type="primary" @click="createOpen = true">
              <template #icon><Plus :size="17" /></template>
              新增陪玩师
            </NButton>
          </NSpace>
        </div>
        <NSpace class="list-filters" :size="8" wrap align="center">
          <NInput
            v-model:value="keyword"
            clearable
            aria-label="陪玩师关键词"
            placeholder="搜索昵称、手机号或身份证号"
            style="width: 240px"
          >
            <template #prefix><Search :size="16" /></template>
          </NInput>
          <NSelect
            v-model:value="status"
            aria-label="接单状态"
            :options="statusSelectOptions"
            style="width: 130px"
          />
        </NSpace>
      </div>

      <div class="list-table-host">
        <NDataTable
          :columns="columns"
          :data="rows"
          :loading="loading"
          :pagination="false"
          :row-key="(row: Companion) => row.userId"
          :scroll-x="1300"
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
        class="app-form-modal wide"
        title="新增陪玩师"
        :bordered="false"
        size="huge"
        closable
        role="dialog"
        aria-modal="true"
        @close="createOpen = false"
      >
        <p class="app-form-subtitle">手机号与邮箱至少填写一项，敏感信息不会显示在列表中</p>
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
          <NFormItem label="级别">
            <NInput v-model:value="form.level" placeholder="例如 S" />
          </NFormItem>
          <NFormItem label="游戏标签 ID">
            <NInput v-model:value="form.tagIdsText" placeholder="例如 1, 7, 12" />
          </NFormItem>
          <NFormItem label="小时费率">
            <NInput v-model:value="form.hourlyRateText" placeholder="0.00" />
          </NFormItem>
          <NFormItem label="接单状态">
            <NSelect v-model:value="form.status" :options="companionStatusOptions" />
          </NFormItem>
          <NFormItem label="身份证号">
            <NInput v-model:value="form.idCardNo" placeholder="请输入身份证号" />
          </NFormItem>
          <NFormItem label="开户人姓名">
            <NInput v-model:value="form.bankAccountName" placeholder="请输入开户人姓名" />
          </NFormItem>
          <NFormItem label="银行卡号">
            <NInput v-model:value="form.bankAccountNo" placeholder="请输入银行卡号" />
          </NFormItem>
          <NFormItem label="开户行">
            <NInput v-model:value="form.bankName" placeholder="请输入开户行" />
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
  </div>
</template>
