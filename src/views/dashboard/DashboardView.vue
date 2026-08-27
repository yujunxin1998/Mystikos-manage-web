<script setup lang="ts">
import { computed, h, ref } from 'vue'
import {
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  Gamepad2,
  Headphones,
  Plus,
  Search,
  UserRound,
} from 'lucide-vue-next'
import {
  NButton,
  NCard,
  NDataTable,
  NForm,
  NFormItem,
  NInput,
  NModal,
  NSelect,
  NSpace,
  type DataTableColumns,
} from 'naive-ui'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import StatCards from '../../components/StatCards.vue'
import CopyableId from '../../components/CopyableId.vue'
import StatusTag from '../../components/StatusTag.vue'
import { chartPaths, dashboardStats } from '../../mocks/dashboard'
import { dashboardOrders } from '../../mocks/orders'
import { useAuthStore } from '../../stores/auth'
import { useToastStore } from '../../stores/toast'
import { useTodosStore } from '../../stores/todos'
import type { DashboardOrder } from '../../types'

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()
const todosStore = useTodosStore()
const { user } = storeToRefs(authStore)
const { applicationPending, showcasePending, hasPending } = storeToRefs(todosStore)

const range = ref<'周' | '月'>('周')
const showOrder = ref(false)
const keyword = ref('')
const orderDraft = ref({
  member: '',
  game: '三角洲行动',
  amount: '299.00',
  pay: '账户余额',
  note: '',
})

const greeting = computed(() => {
  const hour = new Date().getHours()
  const period = hour < 12 ? '上午好' : hour < 18 ? '下午好' : '晚上好'
  return `${period}，${user.value?.displayName || '管理员'}`
})

const todayLabel = computed(() => {
  const now = new Date()
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  return `${weekdays[now.getDay()]} ${now.getMonth() + 1}月${now.getDate()}日`
})

const welcomeHint = computed(() => {
  const pending = applicationPending.value + showcasePending.value
  if (pending > 0) {
    return `当前有 ${pending} 项待处理，可从下方入口进入审核。`
  }
  return '今日暂无待审核事项，可从侧栏进入各业务模块。'
})

function confirmDemoOrder() {
  showOrder.value = false
  toastStore.notify('演示环境不会保存订单')
}

const filtered = computed(() =>
  dashboardOrders.filter((order) =>
    Object.values(order).some((value) => value.includes(keyword.value)),
  ),
)

const chart = computed(() => chartPaths[range.value])

const statIcons = [CircleDollarSign, Gamepad2, UserRound, Headphones]
const statTones = ['violet', 'orange', 'blue', 'green']
const gameOptions = [
  { label: '三角洲行动', value: '三角洲行动' },
  { label: '无畏契约', value: '无畏契约' },
]
const payOptions = [
  { label: '账户余额', value: '账户余额' },
  { label: '扫码支付', value: '扫码支付' },
]

const orderColumns = computed<DataTableColumns<DashboardOrder>>(() => [
  {
    title: '订单编号',
    key: 'id',
    width: 200,
    render: (row) => h(CopyableId, { value: row.id, name: '订单编号' }),
  },
  {
    title: '会员',
    key: 'user',
    width: 130,
    render: (row) =>
      h('div', { class: 'member' }, [
        h('span', row.user.slice(0, 1)),
        row.user,
      ]),
  },
  {
    title: '游戏 / 服务',
    key: 'game',
    width: 180,
    render: (row) =>
      h('div', [h('b', row.game), h('small', { class: 'cell-sub' }, row.service)]),
  },
  { title: '陪玩师', key: 'worker', width: 110 },
  {
    title: '金额',
    key: 'amount',
    width: 110,
    render: (row) => h('span', { class: 'amount' }, row.amount),
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row) => h(StatusTag, { status: row.status, variant: 'table' }),
  },
  { title: '下单时间', key: 'time', width: 120 },
])
</script>

<template>
  <div class="page">
    <section class="welcome">
      <div>
        <p class="welcome-date">{{ todayLabel }}</p>
        <h1>{{ greeting }}</h1>
        <p>{{ welcomeHint }}</p>
      </div>
      <NButton type="primary" size="large" @click="showOrder = true">
        <template #icon><Plus :size="18" /></template>
        创建订单
      </NButton>
    </section>

    <section v-if="hasPending" class="todo-strip" aria-label="待处理事项">
      <button
        v-if="applicationPending > 0"
        type="button"
        @click="router.push('/companion-applications')"
      >
        <div>
          <span>陪玩申请待处理</span>
          <strong>{{ applicationPending }}</strong>
        </div>
        <em>去处理 →</em>
      </button>
      <button
        v-if="showcasePending > 0"
        type="button"
        @click="router.push('/companion-showcases')"
      >
        <div>
          <span>陪玩名片待审核</span>
          <strong>{{ showcasePending }}</strong>
        </div>
        <em>去审核 →</em>
      </button>
    </section>

    <StatCards :items="dashboardStats" :icons="statIcons" :tones="statTones" variant="dashboard" />

    <section class="content-grid">
      <article class="panel revenue">
        <div class="panel-head">
          <div>
            <h2>营收趋势</h2>
            <p>最近{{ range === '周' ? '7天' : '30天' }}演示数据</p>
          </div>
          <div class="switch">
            <button type="button" :class="{ active: range === '周' }" @click="range = '周'">
              近7天
            </button>
            <button type="button" :class="{ active: range === '月' }" @click="range = '月'">
              近30天
            </button>
          </div>
        </div>
        <div class="chart-total"><strong>¥ 68,420</strong><span>+14.6% 较上期</span></div>
        <div class="chart">
          <div class="y-axis">
            <span>20k</span><span>15k</span><span>10k</span><span>5k</span><span>0</span>
          </div>
          <svg viewBox="0 0 540 170" preserveAspectRatio="none">
            <defs>
              <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#7c5cfc" stop-opacity=".28" />
                <stop offset="1" stop-color="#7c5cfc" stop-opacity="0" />
              </linearGradient>
            </defs>
            <path :d="chart + ' L540 170 L0 170Z'" fill="url(#fill)" />
            <path :d="chart" fill="none" stroke="#7c5cfc" stroke-width="3" stroke-linecap="round" />
          </svg>
          <div class="x-axis">
            <span>周一</span><span>周二</span><span>周三</span><span>周四</span><span>周五</span
            ><span>周六</span><span>周日</span>
          </div>
        </div>
      </article>

      <article class="panel overview">
        <div class="panel-head">
          <div>
            <h2>订单概览</h2>
            <p>演示数据，不代表真实订单</p>
          </div>
          <button type="button" class="text-btn" @click="router.push('/orders')">
            查看全部 <ChevronRight :size="15" />
          </button>
        </div>
        <div class="donut-wrap">
          <div class="donut">
            <div><strong>86</strong><small>总订单</small></div>
          </div>
          <ul>
            <li><i class="c1"></i><span>已完成</span><b>42</b><em>48.8%</em></li>
            <li><i class="c2"></i><span>进行中</span><b>26</b><em>30.2%</em></li>
            <li><i class="c3"></i><span>待接单</span><b>12</b><em>14.0%</em></li>
            <li><i class="c4"></i><span>已流单</span><b>4</b><em>4.7%</em></li>
            <li><i class="c5"></i><span>已退款</span><b>2</b><em>2.3%</em></li>
          </ul>
        </div>
        <div class="completion">
          <span>今日完成率 <b>83.2%</b></span>
          <div><i></i></div>
        </div>
      </article>
    </section>

    <section class="panel orders">
      <div class="panel-head dashboard-order-head">
        <div>
          <h2>最新订单</h2>
          <p>演示数据，可按编号或会员筛选</p>
        </div>
        <NSpace class="dashboard-order-actions" :size="8" align="center" wrap>
          <NInput
            v-model:value="keyword"
            clearable
            placeholder="搜索订单"
            style="width: 220px"
          >
            <template #prefix><Search :size="16" /></template>
          </NInput>
          <NButton text type="primary" @click="router.push('/orders')">
            全部订单
            <template #icon><ChevronRight :size="15" /></template>
          </NButton>
        </NSpace>
      </div>
      <div class="dashboard-order-table">
        <NDataTable
          :columns="orderColumns"
          :data="filtered"
          :pagination="false"
          :row-key="(row: DashboardOrder) => row.id"
          :scroll-x="1100"
          :single-line="false"
          striped
        />
      </div>
    </section>

    <NModal v-model:show="showOrder" :mask-closable="false">
      <NCard
        class="app-form-modal"
        title="创建新订单"
        :bordered="false"
        size="huge"
        closable
        role="dialog"
        aria-modal="true"
        @close="showOrder = false"
      >
        <p class="app-form-subtitle">录入会员的陪玩服务需求</p>
        <NForm class="app-form-grid" label-placement="top">
          <NFormItem label="选择会员">
            <NInput v-model:value="orderDraft.member" placeholder="输入昵称或手机号搜索" />
          </NFormItem>
          <NFormItem label="游戏项目">
            <NSelect v-model:value="orderDraft.game" :options="gameOptions" />
          </NFormItem>
          <NFormItem label="订单金额">
            <NInput v-model:value="orderDraft.amount" placeholder="0.00">
              <template #prefix>¥</template>
            </NInput>
          </NFormItem>
          <NFormItem label="支付方式">
            <NSelect v-model:value="orderDraft.pay" :options="payOptions" />
          </NFormItem>
          <NFormItem class="app-form-span-2" label="服务备注">
            <NInput
              v-model:value="orderDraft.note"
              type="textarea"
              :autosize="{ minRows: 3, maxRows: 5 }"
              placeholder="填写段位、局数或其他需求"
            />
          </NFormItem>
        </NForm>
        <template #footer>
          <NSpace justify="end">
            <NButton @click="showOrder = false">取消</NButton>
            <NButton type="primary" @click="confirmDemoOrder">
              <template #icon><CreditCard :size="17" /></template>
              确认创建
            </NButton>
          </NSpace>
        </template>
      </NCard>
    </NModal>
  </div>
</template>

<style scoped>
.dashboard-order-head {
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

.dashboard-order-actions {
  margin-left: auto;
}

.dashboard-order-table {
  min-width: 0;
  overflow-x: auto;
  border-top: 1px solid var(--app-border);
}
</style>
