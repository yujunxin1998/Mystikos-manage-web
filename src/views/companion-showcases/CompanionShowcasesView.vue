<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from 'vue'
import { IdCard, RefreshCcw, Search } from 'lucide-vue-next'
import {
  NAvatar,
  NButton,
  NCard,
  NDataTable,
  NDatePicker,
  NDrawer,
  NDrawerContent,
  NForm,
  NFormItem,
  NImage,
  NImageGroup,
  NInput,
  NModal,
  NSelect,
  NSpace,
  NTag,
  useMessage,
  type DataTableColumns,
} from 'naive-ui'
import { fetchCompanionShowcases, reviewCompanionShowcase } from '../../api/companions'
import CopyableId from '../../components/CopyableId.vue'
import ListPagination from '../../components/ListPagination.vue'
import StatusTag from '../../components/StatusTag.vue'
import VoiceMessage from '../../components/VoiceMessage.vue'
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

const previewImages = computed(() => {
  if (!selected.value) return [] as string[]
  const cover = selected.value.coverUrl?.trim()
  const photos = (selected.value.photoUrls || []).map((url) => url.trim()).filter(Boolean)
  return cover ? [cover, ...photos.filter((url) => url !== cover)] : photos
})

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

function renderTagCell(tags: CompanionShowcase['tags']) {
  if (!tags?.length) return '-'
  const shown = tags.slice(0, 2)
  const extra = tags.length - shown.length
  return h(
    'div',
    { class: 'table-tag-cell' },
    [
      ...shown.map((tag) =>
        h(NTag, { size: 'small', bordered: false, type: 'info' }, () => tag.label),
      ),
      extra > 0 ? h(NTag, { size: 'small', bordered: false }, () => `+${extra}`) : null,
    ].filter(Boolean),
  )
}

const columns = computed<DataTableColumns<CompanionShowcase>>(() => [
  {
    title: '修订ID',
    key: 'id',
    width: 148,
    render: (row) => h(CopyableId, { value: row.id, prefix: '#', name: '修订ID' }),
  },
  {
    title: '用户',
    key: 'applicantNickname',
    width: 160,
    ellipsis: { tooltip: true },
    render: (row) =>
      h('strong', { class: 'order-member' }, row.applicantNickname || `用户 #${row.userId}`),
  },
  {
    title: '联系方式',
    key: 'contact',
    width: 220,
    ellipsis: { tooltip: true },
    render: (row) => row.applicantPhone || row.applicantEmail || '-',
  },
  {
    title: '标语',
    key: 'tagline',
    minWidth: 180,
    ellipsis: { tooltip: true },
    render: (row) => row.tagline || '-',
  },
  {
    title: '标签',
    key: 'tags',
    width: 220,
    render: (row) => renderTagCell(row.tags),
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row) => h(StatusTag, { status: statusLabels[row.status], variant: 'table' }),
  },
  {
    title: '更新时间',
    key: 'updatedAt',
    width: 168,
    ellipsis: { tooltip: true },
    render: (row) => formatDate(row.updatedAt || row.createdAt),
  },
  {
    title: '操作',
    key: 'actions',
    width: 112,
    fixed: 'right',
    render: (row) =>
      h(NSpace, { size: 8, wrap: false }, () => {
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
        <h1>陪玩名片审核</h1>
        <span>审核展示卡资料，封面与媒体可在页内预览后决定通过或驳回</span>
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
          :scroll-x="1320"
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

    <NDrawer
      :show="detailOpen && !!selected"
      :width="840"
      placement="right"
      display-directive="if"
      :trap-focus="false"
      to="body"
      @update:show="(show) => (detailOpen = show)"
    >
      <NDrawerContent
        class="showcase-drawer"
        closable
        :native-scrollbar="false"
        @close="detailOpen = false"
      >
        <template #header>
          <div v-if="selected" class="showcase-profile-head">
            <NAvatar
              round
              :size="48"
              :src="selected.photoUrls?.[0] || selected.coverUrl"
            >
              {{ (selected.applicantNickname || '用').slice(0, 1) }}
            </NAvatar>
            <div class="showcase-profile-copy">
              <span>名片详情</span>
              <strong>{{ selected.applicantNickname || `用户 #${selected.userId}` }}</strong>
              <small>{{ selected.applicantPhone || selected.applicantEmail || '暂未提供联系方式' }}</small>
            </div>
            <StatusTag :status="statusLabels[selected.status]" variant="table" />
          </div>
        </template>

        <div v-if="selected" class="showcase-sheet">
          <header class="showcase-identity">
            <div>
              <span class="showcase-identity-label">名片标语</span>
              <h2>{{ selected.tagline || selected.applicantNickname || `修订 #${selected.id}` }}</h2>
              <p v-if="selected.availability">{{ selected.availability }}</p>
            </div>
            <div v-if="selected.tags?.length" class="showcase-tags">
              <NTag
                v-for="tag in selected.tags"
                :key="tag.id"
                size="small"
                type="info"
                :bordered="false"
              >
                {{ tag.label }}
              </NTag>
            </div>
          </header>

          <NImageGroup v-if="previewImages.length">
            <figure v-if="selected.coverUrl" class="showcase-media-stage">
              <div
                class="showcase-media-backdrop"
                :style="{ backgroundImage: `url(${selected.coverUrl})` }"
                aria-hidden="true"
              ></div>
              <NImage
                :src="selected.coverUrl"
                alt="封面"
                object-fit="contain"
                :img-props="{ loading: 'lazy', draggable: false }"
              />
            </figure>

            <section v-if="selected.photoUrls?.length" class="showcase-photo-strip">
              <div class="showcase-section-title">
                <h3>照片</h3>
                <span>{{ selected.photoUrls.length }} 张</span>
              </div>
              <div class="showcase-photos">
                <NImage
                  v-for="(url, index) in selected.photoUrls"
                  :key="`${url}-${index}`"
                  :src="url"
                  :alt="`照片 ${index + 1}`"
                  :width="148"
                  :height="111"
                  object-fit="cover"
                  :img-props="{ loading: 'lazy', draggable: false }"
                />
              </div>
            </section>
          </NImageGroup>
          <p v-else class="showcase-empty-media">暂无封面或照片</p>

          <div class="showcase-detail-grid">
            <div class="showcase-detail-main">
              <section class="showcase-section showcase-copy-section">
                <div class="showcase-section-title"><h3>简介</h3></div>
                <p v-if="selected.bio" class="showcase-bio">{{ selected.bio }}</p>
                <p v-else class="showcase-muted-copy">暂未填写简介</p>
              </section>

              <section v-if="selected.audioUrls?.length" class="showcase-section showcase-voice-section">
                <div class="showcase-section-title"><h3>语音介绍</h3><span>{{ selected.audioUrls.length }} 条</span></div>
                <ul class="showcase-voice-list">
                  <li v-for="(url, index) in selected.audioUrls" :key="`audio-${index}`">
                    <VoiceMessage :src="url" :label="`语音 ${index + 1}`" :index="index + 1" />
                  </li>
                </ul>
              </section>

              <section v-if="selected.videoUrls?.length" class="showcase-section">
                <div class="showcase-section-title"><h3>视频</h3><span>{{ selected.videoUrls.length }} 条</span></div>
                <ul class="showcase-av-list">
                  <li v-for="(url, index) in selected.videoUrls" :key="`video-${index}`">
                    <span>视频 {{ index + 1 }}</span>
                    <video controls preload="metadata" playsinline :src="url">当前浏览器不支持视频播放</video>
                  </li>
                </ul>
              </section>
            </div>

            <aside class="showcase-detail-aside">
              <section class="showcase-section">
                <div class="showcase-section-title"><h3>资料</h3></div>
                <dl class="showcase-facts">
                  <div><dt>联系方式</dt><dd>{{ selected.applicantPhone || selected.applicantEmail || '-' }}</dd></div>
                  <div><dt>更新时间</dt><dd>{{ formatDate(selected.updatedAt || selected.createdAt) }}</dd></div>
                  <div v-if="selected.reviewerNickname"><dt>审核人</dt><dd>{{ selected.reviewerNickname }}</dd></div>
                  <div v-if="selected.reviewedAt"><dt>审核时间</dt><dd>{{ formatDate(selected.reviewedAt) }}</dd></div>
                </dl>
              </section>
              <section v-if="selected.reviewComment" class="showcase-review-note">
                <h3>审核意见</h3>
                <p>{{ selected.reviewComment }}</p>
              </section>
            </aside>
          </div>
        </div>

        <template #footer>
          <NSpace class="showcase-drawer-actions" justify="end">
            <NButton @click="detailOpen = false">关闭</NButton>
            <NButton
              v-if="selected?.status === 'PENDING_REVIEW'"
              type="error"
              secondary
              @click="openReview(selected, false)"
            >
              驳回
            </NButton>
            <NButton
              v-if="selected?.status === 'PENDING_REVIEW'"
              type="primary"
              @click="openReview(selected, true)"
            >
              通过审核
            </NButton>
          </NSpace>
        </template>
      </NDrawerContent>
    </NDrawer>

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
