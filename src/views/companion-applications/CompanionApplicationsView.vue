<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from 'vue'
import { ExternalLink, Play, RefreshCcw, Search } from 'lucide-vue-next'
import {
  NButton,
  NCard,
  NDataTable,
  NDatePicker,
  NForm,
  NFormItem,
  NInput,
  NModal,
  NSelect,
  NSpace,
  NTag,
  useDialog,
  useMessage,
  type DataTableColumns,
} from 'naive-ui'
import {
  fetchCompanionApplications,
  reviewCompanionApplication,
  startCompanionAssessment,
} from '../../api/companions'
import ListPagination from '../../components/ListPagination.vue'
import CopyableId from '../../components/CopyableId.vue'
import StatusTag from '../../components/StatusTag.vue'
import { useAuthStore } from '../../stores/auth'
import { useTodosStore } from '../../stores/todos'
import type {
  CompanionApplicationStatus,
  CompanionIdentityApplication,
  CompanionReviewResult,
} from '../../types'
import { sortApplicationsForReview } from '../../utils/companionApplications'
import { DEFAULT_PAGE_SIZE, pageRange } from '../../utils/pagination'

const authStore = useAuthStore()
const todosStore = useTodosStore()
const message = useMessage()
const dialog = useDialog()
const rows = ref<CompanionIdentityApplication[]>([])
const loading = ref(false)
const actionLoading = ref(false)
const pageNum = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)
const total = ref(0)
const pages = ref(0)
const keyword = ref('')
const status = ref<'' | CompanionApplicationStatus>('')
const createdFrom = ref<string | null>(null)
const createdTo = ref<string | null>(null)
const reviewOpen = ref(false)
const selected = ref<CompanionIdentityApplication | null>(null)
const reviewForm = reactive<{ result: CompanionReviewResult; comment: string }>({
  result: 'PASS',
  comment: '',
})
const reviewResultOptions = [
  { label: '通过并开通陪玩身份', value: 'PASS' },
  { label: '不通过', value: 'FAIL' },
]
const statusSelectOptions = [
  { label: '全部状态', value: '' },
  { label: '待考核', value: 'SUBMITTED' },
  { label: '考核中', value: 'IN_ASSESSMENT' },
  { label: '已通过', value: 'APPROVED' },
  { label: '未通过', value: 'REJECTED' },
]

const statusLabels: Record<CompanionApplicationStatus, string> = {
  SUBMITTED: '待考核',
  IN_ASSESSMENT: '考核中',
  APPROVED: '已通过',
  REJECTED: '未通过',
}
const range = computed(() => pageRange(pageNum.value, pageSize.value, total.value))
const rangeStart = computed(() => range.value.start)
const rangeEnd = computed(() => range.value.end)
const pendingCount = computed(
  () =>
    rows.value.filter((item) => item.status === 'SUBMITTED' || item.status === 'IN_ASSESSMENT')
      .length,
)

function toIsoDateTime(value: string | null): string | undefined {
  if (!value) return undefined
  return value.length === 16 ? `${value}:00` : value
}

function formatDate(value?: string) {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('zh-CN', { hour12: false })
}

function formatContact(application: CompanionIdentityApplication) {
  if (!application.contactPhone) return '-'
  return `${application.contactCountryCode || ''} ${application.contactPhone}`.trim()
}

async function loadApplications() {
  loading.value = true
  try {
    const result = await fetchCompanionApplications({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      keyword: keyword.value.trim() || undefined,
      status: status.value || undefined,
      createdFrom: toIsoDateTime(createdFrom.value),
      createdTo: toIsoDateTime(createdTo.value),
    })
    rows.value = sortApplicationsForReview(result.records)
    total.value = result.total
    pages.value = result.pages
  } catch (error) {
    message.error(error instanceof Error ? error.message : '陪玩申请列表加载失败')
  } finally {
    loading.value = false
  }
}

async function applyFilters() {
  pageNum.value = 1
  await loadApplications()
}

async function resetFilters() {
  keyword.value = ''
  status.value = ''
  createdFrom.value = null
  createdTo.value = null
  pageNum.value = 1
  await loadApplications()
}

function handleStart(application: CompanionIdentityApplication) {
  dialog.warning({
    title: '开始线下考核',
    content: `确认开始申请 #${application.id} 的线下考核吗？`,
    positiveText: '确认开始',
    negativeText: '取消',
    onPositiveClick: async () => {
      actionLoading.value = true
      try {
        await startCompanionAssessment(application.id)
        message.success('已开始考核')
        await loadApplications()
        await todosStore.refresh(true)
      } catch (error) {
        message.error(error instanceof Error ? error.message : '开始考核失败')
        return false
      } finally {
        actionLoading.value = false
      }
    },
  })
}

function openReview(application: CompanionIdentityApplication) {
  selected.value = application
  reviewForm.result = 'PASS'
  reviewForm.comment = ''
  reviewOpen.value = true
}

async function submitReview() {
  if (!selected.value) return
  const reviewerId = authStore.user?.id
  if (!reviewerId) {
    message.warning('无法获取当前管理员信息，请重新登录')
    return
  }
  actionLoading.value = true
  try {
    await reviewCompanionApplication(selected.value.id, {
      reviewerId,
      result: reviewForm.result,
      comment: reviewForm.comment.trim() || undefined,
    })
    reviewOpen.value = false
    message.success(reviewForm.result === 'PASS' ? '考核已通过并开通陪玩身份' : '考核结果已记录')
    await loadApplications()
    await todosStore.refresh(true)
  } catch (error) {
    message.error(error instanceof Error ? error.message : '录入考核结果失败')
  } finally {
    actionLoading.value = false
  }
}

async function changePage(nextPage: number) {
  pageNum.value = nextPage
  await loadApplications()
}

async function changePageSize(size: number) {
  pageSize.value = size
  pageNum.value = 1
  await loadApplications()
}

const columns = computed<DataTableColumns<CompanionIdentityApplication>>(() => [
  {
    title: '申请ID',
    key: 'id',
    width: 148,
    render: (row) => h(CopyableId, { value: row.id, prefix: '#', name: '申请ID' }),
  },
  {
    title: '申请人',
    key: 'applicant',
    width: 150,
    render: (row) =>
      h('div', [
        h('strong', { class: 'order-member' }, row.applicantNickname || `用户 #${row.userId}`),
        h('small', { class: 'cell-sub' }, `用户ID：${row.userId}`),
      ]),
  },
  {
    title: '申请资料',
    key: 'applicationInfo',
    width: 200,
    render: (row) =>
      h('div', [
        h('b', row.realName),
        h('small', { class: 'cell-sub' }, `游戏昵称：${row.gameNickname}`),
        row.gameRankProofUrl
          ? h(
              'a',
              {
                class: 'proof-link',
                href: row.gameRankProofUrl,
                target: '_blank',
                rel: 'noopener noreferrer',
              },
              ['查看段位证明 ', h(ExternalLink, { size: 13 })],
            )
          : null,
      ]),
  },
  {
    title: '联系方式',
    key: 'contact',
    width: 180,
    render: (row) =>
      h('div', [
        h('span', formatContact(row)),
        h('small', { class: 'cell-sub' }, row.contactEmail || '-'),
      ]),
  },
  {
    title: '游戏标签',
    key: 'tags',
    width: 160,
    render: (row) =>
      h(
        'div',
        { class: 'app-form-roles' },
        row.tags.length
          ? row.tags.map((tag) =>
              h(NTag, { key: tag.id, size: 'small', type: 'info', bordered: false }, () => tag.label),
            )
          : [h('span', '-')],
      ),
  },
  {
    title: '提交时间',
    key: 'createdAt',
    width: 170,
    render: (row) => formatDate(row.createdAt),
  },
  {
    title: '状态',
    key: 'status',
    width: 130,
    render: (row) =>
      h('div', [
        h(StatusTag, { status: statusLabels[row.status], variant: 'business' }),
        row.reviewerNickname
          ? h('small', { class: 'cell-sub' }, `考核人：${row.reviewerNickname}`)
          : null,
      ]),
  },
  {
    title: '操作',
    key: 'actions',
    width: 110,
    fixed: 'right',
    render: (row) => {
      if (row.status === 'SUBMITTED') {
        return h(
          NButton,
          {
            text: true,
            type: 'primary',
            size: 'small',
            disabled: actionLoading.value,
            onClick: () => handleStart(row),
          },
          { default: () => '开始考核' },
        )
      }
      if (row.status === 'IN_ASSESSMENT') {
        return h(
          NButton,
          {
            text: true,
            type: 'primary',
            size: 'small',
            disabled: actionLoading.value,
            onClick: () => openReview(row),
          },
          { default: () => '录入结果' },
        )
      }
      return h(
        'span',
        { class: 'review-result' },
        row.reviewResult === 'PASS' ? '通过' : '不通过',
      )
    },
  },
])

onMounted(loadApplications)
</script>

<template>
  <div class="business-page application-page">
    <section class="business-title">
      <div>
        <h1>陪玩申请</h1>
        <span>审核新陪玩身份申请，待处理项优先展示</span>
      </div>
    </section>

    <section class="business-stats application-summary">
      <article>
        <i class="tone-0"><Play /></i>
        <div>
          <p>申请总数</p>
          <strong>{{ total }}</strong>
          <small>来自服务端实时数据</small>
        </div>
      </article>
      <article>
        <i class="tone-1"><Play /></i>
        <div>
          <p>当前页待处理</p>
          <strong>{{ pendingCount }}</strong>
          <small>待考核及考核中</small>
        </div>
      </article>
    </section>

    <section class="list-table-panel panel">
      <div class="list-toolbar">
        <div class="list-toolbar-main">
          <div>
            <h2>新申请列表</h2>
            <p>共 {{ total }} 条陪玩申请，待考核优先排序</p>
          </div>
          <NSpace class="list-actions" :size="9">
            <NButton :loading="loading" @click="loadApplications">
              <template #icon><RefreshCcw :size="16" /></template>
              刷新
            </NButton>
          </NSpace>
        </div>
        <NSpace class="list-filters" :size="8" wrap align="center">
          <NInput
            v-model:value="keyword"
            clearable
            aria-label="申请关键词"
            placeholder="真实姓名、游戏昵称、手机或邮箱"
            style="width: 240px"
            @keyup.enter="applyFilters"
          >
            <template #prefix><Search :size="16" /></template>
          </NInput>
          <NSelect
            v-model:value="status"
            aria-label="申请状态"
            :options="statusSelectOptions"
            style="width: 130px"
          />
          <NDatePicker
            v-model:formatted-value="createdFrom"
            type="datetime"
            clearable
            value-format="yyyy-MM-dd'T'HH:mm"
            aria-label="提交时间开始"
            placeholder="提交时间起"
            style="width: 200px"
          />
          <NDatePicker
            v-model:formatted-value="createdTo"
            type="datetime"
            clearable
            value-format="yyyy-MM-dd'T'HH:mm"
            aria-label="提交时间结束"
            placeholder="提交时间止"
            style="width: 200px"
          />
          <NButton type="primary" :loading="loading" @click="applyFilters">查询</NButton>
          <NButton :disabled="loading" @click="resetFilters">重置</NButton>
        </NSpace>
      </div>

      <div class="list-table-host">
        <NDataTable
          :columns="columns"
          :data="rows"
          :loading="loading"
          :pagination="false"
          :row-key="(row: CompanionIdentityApplication) => row.id"
          :scroll-x="1260"
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

    <NModal
      :show="reviewOpen && !!selected"
      :mask-closable="false"
      @update:show="(show) => (reviewOpen = show)"
    >
      <NCard
        v-if="selected"
        class="app-form-modal compact"
        title="录入考核结果"
        :bordered="false"
        size="huge"
        closable
        role="dialog"
        aria-modal="true"
        @close="reviewOpen = false"
      >
        <p class="app-form-subtitle">申请 #{{ selected.id }} · {{ selected.realName }}</p>
        <NForm class="app-form-grid single-column" label-placement="top">
          <NFormItem label="考核人">
            <NInput :value="authStore.user?.displayName || '当前管理员'" disabled />
          </NFormItem>
          <NFormItem label="考核结果">
            <NSelect v-model:value="reviewForm.result" :options="reviewResultOptions" />
          </NFormItem>
          <NFormItem label="审核意见">
            <NInput
              v-model:value="reviewForm.comment"
              type="textarea"
              maxlength="500"
              show-count
              :autosize="{ minRows: 3, maxRows: 6 }"
              placeholder="可填写线下考核情况和审核意见"
            />
          </NFormItem>
        </NForm>
        <template #footer>
          <NSpace justify="end">
            <NButton @click="reviewOpen = false">取消</NButton>
            <NButton type="primary" :loading="actionLoading" @click="submitReview">
              确认提交
            </NButton>
          </NSpace>
        </template>
      </NCard>
    </NModal>
  </div>
</template>
