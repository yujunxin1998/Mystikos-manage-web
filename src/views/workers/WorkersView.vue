<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import {
  CircleDollarSign,
  Plus,
  RefreshCcw,
  Trash2,
  UserCheck,
  UsersRound,
  X,
} from 'lucide-vue-next'
import StatusTag from '../../components/StatusTag.vue'
import {
  createCompanion,
  deleteCompanion,
  fetchCompanionStats,
  fetchCompanions,
} from '../../api/companions'
import { useToastStore } from '../../stores/toast'
import type {
  Companion,
  CompanionStats,
  CompanionStatus,
  CreateCompanionRequest,
} from '../../types'
import { parseCompanionTagIds } from '../../utils/companion'

interface CompanionForm extends Omit<CreateCompanionRequest, 'tagIds' | 'hourlyRate'> {
  tagIdsText: string
  hourlyRateText: string
}

const toast = useToastStore()
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
const pageSize = 20
const total = ref(0)
const pages = ref(0)
const createOpen = ref(false)
let searchTimer: ReturnType<typeof setTimeout> | undefined

const statusLabels: Record<CompanionStatus, string> = {
  AVAILABLE: '在线',
  BUSY: '服务中',
  OFFLINE: '离线',
}
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
const rangeStart = computed(() => (total.value ? (pageNum.value - 1) * pageSize + 1 : 0))
const rangeEnd = computed(() => Math.min(pageNum.value * pageSize, total.value))

async function loadCompanions() {
  loading.value = true
  try {
    const result = await fetchCompanions({
      pageNum: pageNum.value,
      pageSize,
      keyword: keyword.value.trim() || undefined,
      status: status.value || undefined,
    })
    rows.value = result.records
    total.value = result.total
    pages.value = result.pages
  } catch (error) {
    toast.notify(error instanceof Error ? error.message : '陪玩师列表加载失败')
  } finally {
    loading.value = false
  }
}

async function loadStats() {
  try {
    stats.value = await fetchCompanionStats()
  } catch (error) {
    toast.notify(error instanceof Error ? error.message : '统计数据加载失败')
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
  if (!form.phone?.trim() && !form.email?.trim()) return toast.notify('手机号和邮箱至少填写一项')
  const hourlyRate = form.hourlyRateText.trim() ? Number(form.hourlyRateText) : undefined
  if (hourlyRate !== undefined && (!Number.isFinite(hourlyRate) || hourlyRate < 0))
    return toast.notify('请输入有效的小时费率')
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
    toast.notify('陪玩师创建成功')
    pageNum.value = 1
    await refreshPage()
  } catch (error) {
    toast.notify(error instanceof Error ? error.message : '陪玩师创建失败')
  }
}

async function handleDelete(companion: Companion) {
  if (!window.confirm(`确认删除陪玩师“${companion.nickname || companion.userId}”吗？`)) return
  try {
    await deleteCompanion(companion.userId)
    toast.notify('陪玩师已删除')
    await refreshPage()
  } catch (error) {
    toast.notify(error instanceof Error ? error.message : '删除失败')
  }
}

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
        <p>COMPANION MANAGEMENT</p>
        <h1>陪玩师管理</h1>
        <span>维护陪玩师资料、接单状态和服务绩效</span>
      </div>
      <div>
        <button type="button" class="outline-action" :disabled="loading" @click="refreshPage">
          <RefreshCcw :size="16" />刷新</button
        ><button type="button" class="primary" @click="createOpen = true">
          <Plus :size="17" />新增陪玩师
        </button>
      </div>
    </section>

    <section class="business-stats">
      <article>
        <i class="tone-0"><UsersRound /></i>
        <div>
          <p>陪玩师总数</p>
          <strong>{{ stats.totalCount }}</strong
          ><small>服务器实时统计</small>
        </div>
      </article>
      <article>
        <i class="tone-1"><UserCheck /></i>
        <div>
          <p>当前在线</p>
          <strong>{{ stats.availableCount }}</strong
          ><small>可接受新订单</small>
        </div>
      </article>
      <article>
        <i class="tone-2"><UsersRound /></i>
        <div>
          <p>服务中</p>
          <strong>{{ stats.busyCount }}</strong
          ><small>正在进行服务</small>
        </div>
      </article>
      <article>
        <i class="tone-3"><CircleDollarSign /></i>
        <div>
          <p>平均时薪</p>
          <strong>¥{{ stats.avgHourlyRate ?? 0 }}</strong
          ><small>所有陪玩师均值</small>
        </div>
      </article>
    </section>

    <section class="business-table panel">
      <div class="business-table-head">
        <div>
          <h2>陪玩师列表</h2>
          <p>共 {{ total }} 名陪玩师</p>
        </div>
        <div class="business-filters">
          <label><input v-model="keyword" placeholder="搜索昵称、手机号或身份证号" /></label
          ><select v-model="status" aria-label="接单状态">
            <option value="">全部状态</option>
            <option value="AVAILABLE">在线</option>
            <option value="BUSY">服务中</option>
            <option value="OFFLINE">离线</option>
          </select>
        </div>
      </div>
      <div class="business-table-wrap">
        <table>
          <thead>
            <tr>
              <th>用户ID</th>
              <th>陪玩师</th>
              <th>联系方式</th>
              <th>擅长标签</th>
              <th>等级</th>
              <th>小时费率</th>
              <th>完成订单</th>
              <th>评分</th>
              <th>总营收</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="11" class="empty">正在加载陪玩师数据...</td>
            </tr>
            <tr v-for="companion in rows" v-else :key="companion.userId">
              <td class="identifier">#{{ companion.userId }}</td>
              <td class="strong">{{ companion.nickname || '未设置昵称' }}</td>
              <td>
                <span>{{ companion.phone || '-' }}</span
                ><small class="cell-sub">{{ companion.email || '-' }}</small>
              </td>
              <td>
                <div class="role-list">
                  <span v-for="tag in companion.tags || []" :key="tag.id">{{ tag.label }}</span
                  ><span v-if="!companion.tags?.length">-</span>
                </div>
              </td>
              <td>{{ companion.level || '-' }}</td>
              <td>¥{{ companion.hourlyRate ?? 0 }}</td>
              <td>{{ companion.performance?.totalOrders ?? 0 }}</td>
              <td>{{ companion.performance?.avgRating ?? '-' }}</td>
              <td>¥{{ companion.performance?.totalRevenue ?? 0 }}</td>
              <td><StatusTag :status="statusLabels[companion.status]" variant="business" /></td>
              <td>
                <div class="row-actions">
                  <button
                    type="button"
                    title="删除"
                    class="danger-action"
                    @click="handleDelete(companion)"
                  >
                    <Trash2 :size="15" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!loading && !rows.length">
              <td colspan="11" class="empty">没有找到符合条件的陪玩师</td>
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
            @click="
              pageNum--;
              loadCompanions()
            "
          >
            ‹</button
          ><button type="button" class="current">{{ pageNum }}</button
          ><button
            type="button"
            :disabled="pageNum >= pages || loading"
            @click="
              pageNum++;
              loadCompanions()
            "
          >
            ›
          </button>
        </div>
      </div>
    </section>

    <div v-if="createOpen" class="modal-backdrop">
      <form class="modal companion-modal" @submit.prevent="submitCreate">
        <div class="modal-head">
          <div>
            <h2>新增陪玩师</h2>
            <p>手机号与邮箱至少填写一项，敏感信息不会显示在列表中</p>
          </div>
          <button type="button" class="icon-btn" @click="createOpen = false">
            <X :size="19" />
          </button>
        </div>
        <div class="business-form companion-form">
          <label><span>昵称</span><input v-model="form.nickname" placeholder="请输入昵称" /></label
          ><label
            ><span>手机号</span
            ><input v-model="form.phone" type="tel" placeholder="请输入手机号" /></label
          ><label
            ><span>邮箱</span
            ><input v-model="form.email" type="email" placeholder="请输入邮箱" /></label
          ><label
            ><span>初始密码</span
            ><input
              v-model="form.password"
              type="password"
              autocomplete="new-password"
              placeholder="留空则仅支持验证码登录" /></label
          ><label><span>级别</span><input v-model="form.level" placeholder="例如 S" /></label
          ><label
            ><span>游戏标签 ID</span
            ><input v-model="form.tagIdsText" placeholder="例如 1, 7, 12" /></label
          ><label
            ><span>小时费率</span
            ><input
              v-model="form.hourlyRateText"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00" /></label
          ><label
            ><span>接单状态</span
            ><select v-model="form.status">
              <option value="AVAILABLE">在线</option>
              <option value="BUSY">服务中</option>
              <option value="OFFLINE">离线</option>
            </select></label
          ><label
            ><span>身份证号</span
            ><input v-model="form.idCardNo" placeholder="请输入身份证号" /></label
          ><label
            ><span>开户人姓名</span
            ><input v-model="form.bankAccountName" placeholder="请输入开户人姓名" /></label
          ><label
            ><span>银行卡号</span
            ><input v-model="form.bankAccountNo" placeholder="请输入银行卡号" /></label
          ><label
            ><span>开户行</span><input v-model="form.bankName" placeholder="请输入开户行"
          /></label>
        </div>
        <div class="modal-foot">
          <button type="button" class="secondary" @click="createOpen = false">取消</button
          ><button type="submit" class="primary">确认创建</button>
        </div>
      </form>
    </div>
  </div>
</template>
