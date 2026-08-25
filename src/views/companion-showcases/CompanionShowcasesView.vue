<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from 'vue'
import { IdCard, RefreshCcw, Search } from 'lucide-vue-next'
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
  useMessage,
  type DataTableColumns,
} from 'naive-ui'
import { fetchCompanionShowcases, reviewCompanionShowcase } from '../../api/companions'
import ListPagination from '../../components/ListPagination.vue'
import StatusTag from '../../components/StatusTag.vue'
import { useTodosStore } from '../../stores/todos'
import type { CompanionShowcase, CompanionShowcaseStatus } from '../../types'
import { sortShowcasesForReview } from '../../utils/companionShowcases'
import { DEFAULT_PAGE_SIZE, pageRange } from '../../utils/pagination'

const message = useMessage()
const todosStore = useTodosStore()
const rows = ref<CompanionShowcase[]>([])
const loading = ref(false)
const actionLoading = ref(false)
const pageNum = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)
const total = ref(0)
const keyword = ref('')
const status = ref<'' | CompanionShowcaseStatus>('PENDING_REVIEW')
const createdFrom = ref<string | null>(null)
const createdTo = ref<string | null>(null)
const detailOpen = ref(false)
const reviewOpen = ref(false)
const selected = ref<CompanionShowcase | null>(null)
const reviewForm = reactive<{ approved: 'PASS' | 'FAIL'; comment: string }>({
  approved: 'PASS',
  comment: '',
})

const statusLabels: Record<CompanionShowcaseStatus, string> = {
  DRAFT: '草稿',
  PENDING_REVIEW: '待审核',
  APPROVED: '已通过',
  REJECTED: '已驳回',
}
const statusSelectOptions = [
  { label: '全部状态', value: '' },
  { label: '待审核', value: 'PENDING_REVIEW' },
  { label: '已通过', value: 'APPROVED' },
  { label: '已驳回', value: 'REJECTED' },
  { label: '草稿', value: 'DRAFT' },
]
const reviewResultOptions = [
  { label: '通过并发布', value: 'PASS' },
  { label: '驳回', value: 'FAIL' },
]

const range = computed(() => pageRange(pageNum.value, pageSize.value, total.value))
const rangeStart = computed(() => range.value.start)
const rangeEnd = computed(() => range.value.end)
const pendingCount = computed(
  () => rows.value.filter((item) => item.status === 'PENDING_REVIEW').length,
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

async function loadShowcases() {
  loading.value = true
  try {
    const result = await fetchCompanionShowcases({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      keyword: keyword.value.trim() || undefined,
      status: status.value || undefined,
      createdFrom: toIsoDateTime(createdFrom.value),
      createdTo: toIsoDateTime(createdTo.value),
    })
    rows.value = sortShowcasesForReview(result.records)
    total.value = result.total
  } catch (error) {
    message.error(error instanceof Error ? error.message : '陪玩名片列表加载失败')
  } finally {
    loading.value = false
  }
}

async function applyFilters() {
  pageNum.value = 1
  await loadShowcases()
}

async function resetFilters() {
  keyword.value = ''
  status.value = 'PENDING_REVIEW'
  createdFrom.value = null
  createdTo.value = null
  pageNum.value = 1
  await loadShowcases()
}

function openDetail(row: CompanionShowcase) {
  selected.value = row
  detailOpen.value = true
}

function openReview(row: CompanionShowcase, approved = true) {
  selected.value = row
  reviewForm.approved = approved ? 'PASS' : 'FAIL'
  reviewForm.comment = ''
  reviewOpen.value = true
}

async function submitReview() {
  if (!selected.value) return
  const approved = reviewForm.approved === 'PASS'
  if (!approved && !reviewForm.comment.trim()) {
    message.warning('驳回时请填写审核意见')
    return
  }
  actionLoading.value = true
  try {
    await reviewCompanionShowcase(selected.value.id, {
      approved,
      comment: reviewForm.comment.trim() || undefined,
    })
    reviewOpen.value = false
    detailOpen.value = false
    message.success(approved ? '名片已通过' : '名片已驳回')
    await loadShowcases()
    await todosStore.refresh(true)
  } catch (error) {
    message.error(error instanceof Error ? error.message : '录入名片审核结果失败')
  } finally {
    actionLoading.value = false
  }
}

async function changePage(page: number) {
  pageNum.value = page
  await loadShowcases()
}

async function changePageSize(size: number) {
  pageSize.value = size
  pageNum.value = 1
  await loadShowcases()
}

const columns = computed<DataTableColumns<CompanionShowcase>>(() => [
  {
    title: '修订ID',
    key: 'id',
    width: 90,
    render: (row) => h('span', { class: 'order-identifier' }, `#${row.id}`),
  },
  {
    title: '用户',
    key: 'applicantNickname',
    width: 150,
    render: (row) =>
      h('strong', { class: 'order-member' }, row.applicantNickname || `用户 #${row.userId}`),
  },
  {
    title: '联系方式',
    key: 'contact',
    width: 180,
    render: (row) => row.applicantPhone || row.applicantEmail || '-',
  },
  {
    title: '标语',
    key: 'tagline',
    ellipsis: { tooltip: true },
    render: (row) => row.tagline || '-',
  },
  {
    title: '标签',
    key: 'tags',
    width: 200,
    render: (row) =>
      h(NSpace, { size: 4, wrap: true }, () =>
        (row.tags || []).length
          ? (row.tags || []).map((tag) =>
              h(NTag, { size: 'small', bordered: false, type: 'info' }, () => tag.label),
            )
          : [h('span', '-')],
      ),
  },
  {
    title: '状态',
    key: 'status',
    width: 110,
    render: (row) => h(StatusTag, { status: statusLabels[row.status], variant: 'table' }),
  },
  {
    title: '更新时间',
    key: 'updatedAt',
    width: 170,
    render: (row) => formatDate(row.updatedAt || row.createdAt),
  },
  {
    title: '操作',
    key: 'actions',
    width: 220,
    fixed: 'right',
    render: (row) =>
      h(NSpace, { size: 6, wrap: false }, () => {
        const buttons = [
          h(
            NButton,
            { text: true, type: 'primary', size: 'small', onClick: () => openDetail(row) },
            { default: () => '查看' },
          ),
        ]
        if (row.status === 'PENDING_REVIEW') {
          buttons.push(
            h(
              NButton,
              {
                text: true,
                type: 'primary',
                size: 'small',
                disabled: actionLoading.value,
                onClick: () => openReview(row, true),
              },
              { default: () => '审核' },
            ),
          )
        }
        return buttons
      }),
  },
])

onMounted(loadShowcases)
</script>

<template>
  <div class="business-page showcase-page">
    <section class="business-title">
      <div>
        <p>SHOWCASE REVIEW</p>
        <h1>陪玩名片审核</h1>
        <span>审核陪玩上传的展示卡资料，通过后对外发布</span>
      </div>
    </section>

    <section class="business-stats application-summary">
      <article>
        <i class="tone-0"><IdCard /></i>
        <div>
          <p>名片总数</p>
          <strong>{{ total }}</strong>
          <small>当前筛选结果</small>
        </div>
      </article>
      <article>
        <i class="tone-1"><IdCard /></i>
        <div>
          <p>当前页待审</p>
          <strong>{{ pendingCount }}</strong>
          <small>本页 PENDING_REVIEW</small>
        </div>
      </article>
    </section>

    <section class="list-table-panel panel">
      <div class="list-toolbar">
        <div class="list-toolbar-main">
          <div>
            <h2>名片列表</h2>
            <p>共 {{ total }} 条记录，待审优先排序</p>
          </div>
          <NSpace class="list-actions" :size="9">
            <NButton :loading="loading" @click="loadShowcases">
              <template #icon><RefreshCcw :size="16" /></template>
              刷新
            </NButton>
          </NSpace>
        </div>
        <NSpace class="list-filters" :size="8" wrap align="center">
          <NInput
            v-model:value="keyword"
            clearable
            aria-label="名片关键词"
            placeholder="昵称、手机或邮箱"
            style="width: 220px"
            @keyup.enter="applyFilters"
          >
            <template #prefix><Search :size="16" /></template>
          </NInput>
          <NSelect
            v-model:value="status"
            aria-label="名片状态"
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
          :row-key="(row: CompanionShowcase) => row.id"
          :scroll-x="1200"
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
      :show="detailOpen && !!selected"
      :mask-closable="false"
      @update:show="(show) => (detailOpen = show)"
    >
      <NCard
        v-if="selected"
        class="app-form-modal wide"
        title="名片详情"
        :bordered="false"
        size="huge"
        closable
        role="dialog"
        aria-modal="true"
        @close="detailOpen = false"
      >
        <p class="app-form-subtitle">
          {{ selected.applicantNickname || `用户 #${selected.userId}` }} ·
          {{ statusLabels[selected.status] }}
        </p>
        <div class="showcase-detail">
          <div v-if="selected.coverUrl" class="showcase-cover">
            <img :src="selected.coverUrl" alt="封面" />
          </div>
          <dl class="showcase-meta">
            <div><dt>标语</dt><dd>{{ selected.tagline || '-' }}</dd></div>
            <div><dt>可约时间</dt><dd>{{ selected.availability || '-' }}</dd></div>
            <div><dt>简介</dt><dd>{{ selected.bio || '-' }}</dd></div>
            <div>
              <dt>标签</dt>
              <dd>
                <NSpace v-if="selected.tags?.length" :size="6">
                  <NTag
                    v-for="tag in selected.tags"
                    :key="tag.id"
                    size="small"
                    type="info"
                    :bordered="false"
                  >
                    {{ tag.label }}
                  </NTag>
                </NSpace>
                <span v-else>-</span>
              </dd>
            </div>
            <div>
              <dt>联系方式</dt>
              <dd>{{ selected.applicantPhone || selected.applicantEmail || '-' }}</dd>
            </div>
            <div>
              <dt>审核意见</dt>
              <dd>{{ selected.reviewComment || '-' }}</dd>
            </div>
          </dl>
          <div v-if="selected.photoUrls?.length" class="showcase-media">
            <h3>照片</h3>
            <div class="showcase-photos">
              <a
                v-for="(url, index) in selected.photoUrls"
                :key="url"
                :href="url"
                target="_blank"
                rel="noreferrer"
              >
                <img :src="url" :alt="`照片 ${index + 1}`" />
              </a>
            </div>
          </div>
          <div v-if="selected.videoUrls?.length" class="showcase-media">
            <h3>视频</h3>
            <ul>
              <li v-for="url in selected.videoUrls" :key="url">
                <a :href="url" target="_blank" rel="noreferrer">{{ url }}</a>
              </li>
            </ul>
          </div>
          <div v-if="selected.audioUrls?.length" class="showcase-media">
            <h3>音频</h3>
            <ul>
              <li v-for="url in selected.audioUrls" :key="url">
                <a :href="url" target="_blank" rel="noreferrer">{{ url }}</a>
              </li>
            </ul>
          </div>
        </div>
        <template #footer>
          <NSpace justify="end">
            <NButton @click="detailOpen = false">关闭</NButton>
            <NButton
              v-if="selected.status === 'PENDING_REVIEW'"
              type="primary"
              @click="openReview(selected, true)"
            >
              去审核
            </NButton>
          </NSpace>
        </template>
      </NCard>
    </NModal>

    <NModal v-model:show="reviewOpen" :mask-closable="false">
      <NCard
        class="app-form-modal compact"
        title="录入名片审核结果"
        :bordered="false"
        size="huge"
        closable
        role="dialog"
        aria-modal="true"
        @close="reviewOpen = false"
      >
        <p class="app-form-subtitle">
          {{ selected?.applicantNickname || `修订 #${selected?.id}` }}
        </p>
        <NForm class="app-form-grid single-column" label-placement="top">
          <NFormItem label="审核结果">
            <NSelect
              v-model:value="reviewForm.approved"
              :options="reviewResultOptions"
              :consistent-menu-width="false"
            />
          </NFormItem>
          <NFormItem :label="reviewForm.approved === 'PASS' ? '审核意见（可选）' : '驳回原因'">
            <NInput
              v-model:value="reviewForm.comment"
              type="textarea"
              :rows="4"
              :placeholder="reviewForm.approved === 'PASS' ? '可填写备注' : '请填写驳回原因'"
            />
          </NFormItem>
        </NForm>
        <template #footer>
          <NSpace justify="end">
            <NButton :disabled="actionLoading" @click="reviewOpen = false">取消</NButton>
            <NButton type="primary" :loading="actionLoading" @click="submitReview">
              确认提交
            </NButton>
          </NSpace>
        </template>
      </NCard>
    </NModal>
  </div>
</template>
