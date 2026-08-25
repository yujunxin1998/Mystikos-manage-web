<script setup lang="ts">
import { computed, h, ref } from 'vue'
import {
  ChevronRight,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Gamepad2,
  Headphones,
  MoreHorizontal,
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
import StatCards from '../../components/StatCards.vue'
import StatusTag from '../../components/StatusTag.vue'
import { chartPaths, dashboardStats } from '../../mocks/dashboard'
import { dashboardOrders } from '../../mocks/orders'
import { useAuthStore } from '../../stores/auth'
import type { DashboardOrder } from '../../types'

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

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
  const weekdays = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  return `${weekdays[now.getDay()]} · ${months[now.getMonth()]} ${now.getDate()}`
})

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
    width: 170,
    render: (row) => h('span', { class: 'order-identifier' }, row.id),
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
  {
    title: '',
    key: 'more',
    width: 48,
    render: () => h(MoreHorizontal, { size: 18 }),
  },
])
</script>

<template>
  <div class="page">
    <section class="welcome">
      <div>
        <p class="eyebrow"><span></span> {{ todayLabel }}</p>
        <h1>{{ greeting }} <span>👋</span></h1>
        <p>今天已有 <b>18</b> 笔新订单，预计营收较昨日提升 <b>12.6%</b>。</p>
      </div>
      <NButton type="primary" size="large" @click="showOrder = true">
        <template #icon><Plus :size="18" /></template>
        创建订单
      </NButton>
    </section>

    <StatCards :items="dashboardStats" :icons="statIcons" :tones="statTones" variant="dashboard" />

    <section class="content-grid">
      <article class="panel revenue">
        <div class="panel-head">
          <div>
            <h2>营收趋势</h2>
            <p>最近{{ range === '周' ? '7天' : '30天' }}业务收入变化</p>
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
            <p>今日订单状态分布</p>
          </div>
          <button type="button" class="text-btn">查看全部 <ChevronRight :size="15" /></button>
        </div>
        <div class="donut-wrap">
          <div class="donut">
            <div><strong>86</strong><small>总订单</small></div>
          </div>
          <ul>
            <li><i class="c1"></i><span>已完成</span><b>42</b><em>48.8%</em></li>
            <li><i class="c2"></i><span>进行中</span><b>28</b><em>32.6%</em></li>
            <li><i class="c3"></i><span>待接单</span><b>12</b><em>14.0%</em></li>
            <li><i class="c4"></i><span>已取消</span><b>4</b><em>4.6%</em></li>
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
          <p>实时查看最新业务订单</p>
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
          <NButton secondary>
            <template #icon><Clock3 :size="16" /></template>
            今日
          </NButton>
          <NButton text type="primary">
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
          :scroll-x="1000"
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
            <NButton type="primary" @click="showOrder = false">
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
