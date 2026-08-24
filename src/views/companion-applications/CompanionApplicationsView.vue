<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ExternalLink, Play, RefreshCcw, X } from 'lucide-vue-next'
import {
  fetchCompanionApplications,
  reviewCompanionApplication,
  startCompanionAssessment,
} from '../../api/companions'
import StatusTag from '../../components/StatusTag.vue'
import { useAuthStore } from '../../stores/auth'
import { useToastStore } from '../../stores/toast'
import type {
  CompanionApplicationStatus,
  CompanionIdentityApplication,
  CompanionReviewResult,
} from '../../types'

const pageSize = 20
const authStore = useAuthStore()
const toast = useToastStore()
const rows = ref<CompanionIdentityApplication[]>([])
const loading = ref(false)
const actionLoading = ref(false)
const pageNum = ref(1)
const total = ref(0)
const pages = ref(0)
const keyword = ref('')
const status = ref<'' | CompanionApplicationStatus>('')
const createdFrom = ref('')
const createdTo = ref('')
const reviewOpen = ref(false)
const selected = ref<CompanionIdentityApplication | null>(null)
const reviewForm = reactive<{ result: CompanionReviewResult; comment: string }>({
  result: 'PASS',
  comment: '',
})

const statusLabels: Record<CompanionApplicationStatus, string> = {
  SUBMITTED: '待考核',
  IN_ASSESSMENT: '考核中',
  APPROVED: '已通过',
  REJECTED: '未通过',
}
const rangeStart = computed(() => (total.value ? (pageNum.value - 1) * pageSize + 1 : 0))
const rangeEnd = computed(() => Math.min(pageNum.value * pageSize, total.value))
const toIsoDateTime = (value: string) =>
  value ? (value.length === 16 ? `${value}:00` : value) : undefined
function formatDate(value?: string) {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('zh-CN', { hour12: false })
}

async function loadApplications() {
  loading.value = true
  try {
    const result = await fetchCompanionApplications({
      pageNum: pageNum.value,
      pageSize,
      keyword: keyword.value.trim() || undefined,
      status: status.value || undefined,
      createdFrom: toIsoDateTime(createdFrom.value),
      createdTo: toIsoDateTime(createdTo.value),
    })
    rows.value = result.records
    total.value = result.total
    pages.value = result.pages
  } catch (error) {
    toast.notify(error instanceof Error ? error.message : '身份申请列表加载失败')
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
  createdFrom.value = ''
  createdTo.value = ''
  pageNum.value = 1
  await loadApplications()
}
async function handleStart(application: CompanionIdentityApplication) {
  if (!window.confirm(`确认开始申请 #${application.id} 的线下考核吗？`)) return
  actionLoading.value = true
  try {
    await startCompanionAssessment(application.id)
    toast.notify('已开始考核')
    await loadApplications()
  } catch (error) {
    toast.notify(error instanceof Error ? error.message : '开始考核失败')
  } finally {
    actionLoading.value = false
  }
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
  if (!reviewerId) return toast.notify('无法获取当前管理员信息，请重新登录')
  actionLoading.value = true
  try {
    await reviewCompanionApplication(selected.value.id, {
      reviewerId,
      result: reviewForm.result,
      comment: reviewForm.comment.trim() || undefined,
    })
    reviewOpen.value = false
    toast.notify(reviewForm.result === 'PASS' ? '考核已通过并开通陪玩身份' : '考核结果已记录')
    await loadApplications()
  } catch (error) {
    toast.notify(error instanceof Error ? error.message : '录入考核结果失败')
  } finally {
    actionLoading.value = false
  }
}
async function changePage(nextPage: number) {
  pageNum.value = nextPage
  await loadApplications()
}
onMounted(loadApplications)
</script>

<template>
  <div class="business-page application-page">
    <section class="business-title">
      <div>
        <p>IDENTITY REVIEW</p>
        <h1>身份申请审核</h1>
        <span>审核陪玩身份申请并记录线下考核结果</span>
      </div>
      <div>
        <button type="button" class="outline-action" :disabled="loading" @click="loadApplications">
          <RefreshCcw :size="16" />刷新
        </button>
      </div>
    </section>
    <section class="business-stats application-summary">
      <article>
        <i class="tone-0"><Play /></i>
        <div>
          <p>申请总数</p>
          <strong>{{ total }}</strong
          ><small>来自服务端实时数据</small>
        </div>
      </article>
      <article>
        <i class="tone-1"><Play /></i>
        <div>
          <p>当前页待处理</p>
          <strong>{{
            rows.filter((item) => item.status === 'SUBMITTED' || item.status === 'IN_ASSESSMENT')
              .length
          }}</strong
          ><small>待考核及考核中</small>
        </div>
      </article>
    </section>
    <section class="business-table panel">
      <div class="business-table-head application-table-head">
        <div>
          <h2>申请列表</h2>
          <p>共 {{ total }} 条身份申请</p>
        </div>
        <div class="business-filters application-filters">
          <label class="application-keyword"
            ><input
              v-model="keyword"
              aria-label="申请关键词"
              placeholder="真实姓名、游戏昵称、手机或邮箱"
              @keyup.enter="applyFilters"
          /></label>
          <select v-model="status" aria-label="申请状态">
            <option value="">全部状态</option>
            <option value="SUBMITTED">待考核</option>
            <option value="IN_ASSESSMENT">考核中</option>
            <option value="APPROVED">已通过</option>
            <option value="REJECTED">未通过</option>
          </select>
          <label class="application-date"
            ><span>提交时间起</span><input v-model="createdFrom" type="datetime-local"
          /></label>
          <label class="application-date"
            ><span>提交时间止</span><input v-model="createdTo" type="datetime-local"
          /></label>
          <button
            type="button"
            class="application-filter-submit"
            :disabled="loading"
            @click="applyFilters"
          >
            查询</button
          ><button type="button" :disabled="loading" @click="resetFilters">重置</button>
        </div>
      </div>
      <div class="business-table-wrap">
        <table>
          <thead>
            <tr>
              <th>申请ID</th>
              <th>申请人</th>
              <th>申请资料</th>
              <th>联系方式</th>
              <th>游戏标签</th>
              <th>提交时间</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="8" class="empty">正在加载身份申请...</td>
            </tr>
            <tr v-for="application in rows" v-else :key="application.id">
              <td class="identifier">#{{ application.id }}</td>
              <td class="strong">
                {{ application.applicantNickname || `用户 #${application.userId}`
                }}<small class="cell-sub">用户ID：{{ application.userId }}</small>
              </td>
              <td>
                <b>{{ application.realName }}</b
                ><small class="cell-sub">游戏昵称：{{ application.gameNickname }}</small
                ><a
                  v-if="application.gameRankProofUrl"
                  class="proof-link"
                  :href="application.gameRankProofUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  >查看段位证明 <ExternalLink :size="13"
                /></a>
              </td>
              <td>
                {{
                  application.contactPhone
                    ? `${application.contactCountryCode || ''} ${application.contactPhone}`.trim()
                    : '-'
                }}<small class="cell-sub">{{ application.contactEmail || '-' }}</small>
              </td>
              <td>
                <div class="role-list">
                  <span v-for="tag in application.tags" :key="tag.id">{{ tag.label }}</span
                  ><small v-if="!application.tags.length">-</small>
                </div>
              </td>
              <td>{{ formatDate(application.createdAt) }}</td>
              <td>
                <StatusTag :status="statusLabels[application.status]" variant="business" /><small
                  v-if="application.reviewerNickname"
                  class="cell-sub"
                  >考核人：{{ application.reviewerNickname }}</small
                >
              </td>
              <td>
                <button
                  v-if="application.status === 'SUBMITTED'"
                  type="button"
                  class="row-text-action"
                  :disabled="actionLoading"
                  @click="handleStart(application)"
                >
                  开始考核</button
                ><button
                  v-else-if="application.status === 'IN_ASSESSMENT'"
                  type="button"
                  class="row-text-action"
                  :disabled="actionLoading"
                  @click="openReview(application)"
                >
                  录入结果</button
                ><span v-else class="review-result">{{
                  application.reviewResult === 'PASS' ? '通过' : '不通过'
                }}</span>
              </td>
            </tr>
            <tr v-if="!loading && !rows.length">
              <td colspan="8" class="empty">没有符合条件的身份申请</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pagination">
        <span>显示 {{ rangeStart }} - {{ rangeEnd }} 条，共 {{ total }} 条</span>
        <div>
          <button
            type="button"
            :disabled="pageNum <= 1 || loading"
            @click="changePage(pageNum - 1)"
          >
            ‹</button
          ><button type="button" class="current">{{ pageNum }}</button
          ><button
            type="button"
            :disabled="pageNum >= pages || loading"
            @click="changePage(pageNum + 1)"
          >
            ›
          </button>
        </div>
      </div>
    </section>
    <div v-if="reviewOpen && selected" class="modal-backdrop">
      <section class="modal compact-modal">
        <div class="modal-head">
          <div>
            <h2>录入考核结果</h2>
            <p>申请 #{{ selected.id }} · {{ selected.realName }}</p>
          </div>
          <button type="button" class="icon-btn" @click="reviewOpen = false">
            <X :size="18" />
          </button>
        </div>
        <div class="form">
          <label
            ><span>考核人</span
            ><input :value="authStore.user?.displayName || '当前管理员'" disabled /></label
          ><label
            ><span>考核结果</span
            ><select v-model="reviewForm.result">
              <option value="PASS">通过并开通陪玩身份</option>
              <option value="FAIL">不通过</option>
            </select></label
          ><label
            ><span>审核意见</span
            ><textarea
              v-model="reviewForm.comment"
              maxlength="500"
              placeholder="可填写线下考核情况和审核意见"
            ></textarea>
          </label>
        </div>
        <div class="modal-foot">
          <button type="button" class="secondary" @click="reviewOpen = false">取消</button
          ><button type="button" class="primary" :disabled="actionLoading" @click="submitReview">
            {{ actionLoading ? '提交中...' : '确认提交' }}
          </button>
        </div>
      </section>
    </div>
  </div>
</template>
