<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue'
import {
  NButton,
  NDataTable,
  NInput,
  NSelect,
  NSpace,
  NTag,
  useMessage,
  type DataTableColumns,
} from 'naive-ui'
import { CircleDollarSign, Eye, PackageSearch, RefreshCcw, Search, Truck } from 'lucide-vue-next'
import ListPagination from '../../components/ListPagination.vue'
import CopyableId from '../../components/CopyableId.vue'
import OrderDetailDrawer from '../../components/orders/OrderDetailDrawer.vue'
import { fetchOrder, fetchOrders, transitionOrder } from '../../api/manage-orders'
import type { ManageOrder, ManageOrderStatus, OrderAction } from '../../types'
import { orderStatusLabel, orderStatusTone } from '../../utils/order-status'
import { DEFAULT_PAGE_SIZE, pageRange } from '../../utils/pagination'
import { formatDateTime, formatMoney } from '../../utils/format'

const message = useMessage()

const rows = ref<ManageOrder[]>([])
const loading = ref(false)
const status = ref<ManageOrderStatus | ''>('')
const patronIdInput = ref('')
const patronId = ref<number>()
const pageNum = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)
const total = ref(0)
const pages = ref(0)

const detailOpen = ref(false)
const detailLoading = ref(false)
const detailError = ref('')
const selected = ref<ManageOrder | null>(null)
const actionLoading = ref<OrderAction>()

const statusOptions = [
  { label: '全部状态', value: '' },
  ...(Object.keys(orderStatusLabel) as ManageOrderStatus[]).map((item) => ({
    label: orderStatusLabel[item],
    value: item,
  })),
]

const paidCount = computed(() => rows.value.filter((item) => item.status === 'PAID').length)
const fulfillingCount = computed(
  () => rows.value.filter((item) => item.status === 'FULFILLING').length,
)

const range = computed(() => pageRange(pageNum.value, pageSize.value, total.value))
const rangeStart = computed(() => range.value.start)
const rangeEnd = computed(() => range.value.end)

function summary(order: ManageOrder) {
  const first = order.items[0]?.productNameSnapshot ?? '—'
  return order.items.length > 1 ? `${first}等${order.items.length}项` : first
}

function quantity(order: ManageOrder) {
  return order.items.reduce((sum, item) => sum + item.quantity, 0)
}

async function loadOrders() {
  loading.value = true
  try {
    const result = await fetchOrders({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      status: status.value || undefined,
      patronId: patronId.value,
    })
    rows.value = result.records
    total.value = result.total
    pages.value = result.pages
  } catch (error) {
    message.error(error instanceof Error ? error.message : '订单列表加载失败')
  } finally {
    loading.value = false
  }
}

async function applyFilters() {
  const raw = patronIdInput.value.trim()
  if (raw) {
    const value = Number(raw)
    if (!Number.isInteger(value) || value <= 0) {
      message.warning('买家 ID 必须为正整数')
      return
    }
    patronId.value = value
  } else {
    patronId.value = undefined
  }
  pageNum.value = 1
  await loadOrders()
}

async function resetFilters() {
  status.value = ''
  patronIdInput.value = ''
  patronId.value = undefined
  pageNum.value = 1
  await loadOrders()
}

async function changePage(page: number) {
  pageNum.value = page
  await loadOrders()
}

async function changePageSize(size: number) {
  pageSize.value = size
  pageNum.value = 1
  await loadOrders()
}

async function openDetail(order: ManageOrder) {
  detailOpen.value = true
  detailError.value = ''
  selected.value = order
  detailLoading.value = true
  try {
    selected.value = await fetchOrder(order.orderId)
  } catch (error) {
    detailError.value = error instanceof Error ? error.message : '订单详情加载失败'
  } finally {
    detailLoading.value = false
  }
}

async function handleAction(action: OrderAction) {
  if (!selected.value || actionLoading.value) return
  actionLoading.value = action
  try {
    const updated = await transitionOrder(selected.value.orderId, action)
    selected.value = updated
    message.success('订单状态已更新')
    await loadOrders()
  } catch (error) {
    message.error(error instanceof Error ? error.message : '订单操作失败')
  } finally {
    actionLoading.value = undefined
  }
}

const columns = computed<DataTableColumns<ManageOrder>>(() => [
  {
    title: '订单 ID',
    key: 'orderId',
    width: 120,
    render: (row) => h(CopyableId, { value: row.orderId, prefix: '#', name: '订单ID' }),
  },
  { title: '买家 ID', key: 'patronId', width: 100 },
  {
    title: '商品摘要',
    key: 'summary',
    width: 220,
    render: (row) => h('strong', { class: 'order-member' }, summary(row)),
  },
  { title: '件数', key: 'quantity', width: 70, render: (row) => quantity(row) },
  { title: '总金额', key: 'totalAmount', width: 120, render: (row) => formatMoney(row.totalAmount) },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row) =>
      h(
        NTag,
        { type: orderStatusTone[row.status], size: 'small', bordered: false },
        () => orderStatusLabel[row.status],
      ),
  },
  { title: '创建时间', key: 'createdAt', width: 170, render: (row) => formatDateTime(row.createdAt) },
  {
    title: '操作',
    key: 'actions',
    width: 80,
    fixed: 'right',
    render: (row) =>
      h(
        NButton,
        {
          quaternary: true,
          circle: true,
          size: 'small',
          title: '查看详情',
          onClick: () => openDetail(row),
        },
        { default: () => h(Eye, { size: 15 }) },
      ),
  },
])

onMounted(loadOrders)
</script>

<template>
  <div class="business-page order-page">
    <section class="business-title">
      <div>
        <h1>订单管理</h1>
        <span>查看订单明细并执行发货、退款等状态流转</span>
      </div>
    </section>

    <section class="business-stats order-summary">
      <article>
        <i class="tone-0"><PackageSearch /></i>
        <div>
          <p>订单总量</p>
          <strong>{{ total }}</strong>
          <small>来自服务器实时数据</small>
        </div>
      </article>
      <article>
        <i class="tone-1"><CircleDollarSign /></i>
        <div>
          <p>当前页待处理</p>
          <strong>{{ paidCount }}</strong>
          <small>PAID 状态</small>
        </div>
      </article>
      <article>
        <i class="tone-2"><Truck /></i>
        <div>
          <p>当前页处理中</p>
          <strong>{{ fulfillingCount }}</strong>
          <small>FULFILLING 状态</small>
        </div>
      </article>
    </section>

    <section class="list-table-panel panel">
      <div class="list-toolbar">
        <div class="list-toolbar-main">
          <div>
            <h2>订单列表</h2>
            <p>共 {{ total }} 个订单</p>
          </div>
          <NSpace class="list-actions" :size="9">
            <NButton :loading="loading" @click="loadOrders">
              <template #icon><RefreshCcw :size="16" /></template>
              刷新
            </NButton>
          </NSpace>
        </div>
        <NSpace class="list-filters" :size="8" wrap align="center">
          <NSelect
            v-model:value="status"
            aria-label="订单状态"
            :options="statusOptions"
            style="width: 130px"
          />
          <NInput
            v-model:value="patronIdInput"
            clearable
            aria-label="买家ID"
            placeholder="买家用户 ID"
            style="width: 140px"
            @keyup.enter="applyFilters"
          >
            <template #prefix><Search :size="16" /></template>
          </NInput>
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
          :row-key="(row: ManageOrder) => row.orderId"
          :scroll-x="1000"
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

    <OrderDetailDrawer
      :show="detailOpen"
      :loading="detailLoading"
      :order="selected"
      :error="detailError"
      :action-loading="actionLoading"
      @close="detailOpen = false"
      @retry="selected && openDetail(selected)"
      @action="handleAction"
    />
  </div>
</template>
