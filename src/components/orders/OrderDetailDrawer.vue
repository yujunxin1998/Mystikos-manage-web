<script setup lang="ts">
import { computed } from 'vue'
import {
  NButton,
  NDataTable,
  NDrawer,
  NDrawerContent,
  NSpin,
  NTag,
  type DataTableColumns,
} from 'naive-ui'
import OrderActions from './OrderActions.vue'
import type { ManageOrder, OrderAction, OrderLineItemResponse } from '../../types'
import { orderStatusLabel, orderStatusTone } from '../../utils/order-status'
import { formatDateTime, formatMoney } from '../../utils/format'

const props = defineProps<{
  show: boolean
  loading: boolean
  order: ManageOrder | null
  error?: string
  actionLoading?: OrderAction
}>()

const emit = defineEmits<{ close: []; retry: []; action: [action: OrderAction] }>()

const itemCount = computed(
  () => props.order?.items.reduce((total, item) => total + item.quantity, 0) ?? 0,
)

const itemColumns: DataTableColumns<OrderLineItemResponse> = [
  { title: '商品 ID', key: 'productId', width: 90 },
  { title: '商品名称', key: 'productNameSnapshot', width: 180 },
  {
    title: '单价',
    key: 'unitPriceSnapshot',
    width: 100,
    render: (row) => formatMoney(row.unitPriceSnapshot),
  },
  { title: '数量', key: 'quantity', width: 70 },
  { title: '小计', key: 'subtotal', width: 110, render: (row) => formatMoney(row.subtotal) },
]
</script>

<template>
  <NDrawer
    class="order-detail-drawer"
    :show="show"
    width="min(760px, 100vw)"
    :mask-closable="false"
    @update:show="emit('close')"
  >
    <NDrawerContent title="订单详情" closable>
      <NSpin :show="loading">
        <div v-if="error" class="drawer-error">
          <p>{{ error }}</p>
          <NButton type="primary" @click="emit('retry')">重试</NButton>
        </div>
        <div v-else-if="order" class="order-detail">
          <header class="order-detail-head">
            <div>
              <span class="order-detail-eyebrow">订单编号</span>
              <h2>订单 #{{ order.orderId }}</h2>
            </div>
            <div class="order-detail-head-aside">
              <NTag :type="orderStatusTone[order.status]" size="small">
                {{ orderStatusLabel[order.status] }}
              </NTag>
              <span>订单总额</span>
              <strong>{{ formatMoney(order.totalAmount) }}</strong>
            </div>
          </header>

          <section class="order-detail-facts" aria-label="订单摘要">
            <div>
              <span>买家信息</span>
              <strong>用户 #{{ order.patronId }}</strong>
            </div>
            <div>
              <span>下单时间</span>
              <strong>{{ formatDateTime(order.createdAt) }}</strong>
            </div>
            <div>
              <span>商品数量</span>
              <strong>{{ itemCount }} 件</strong>
            </div>
          </section>

          <section class="detail-section order-shipping" aria-labelledby="shipping-title">
            <div class="detail-section-heading">
              <h3 id="shipping-title">收货信息</h3>
            </div>
            <p>{{ order.shippingAddress || '暂无收货地址' }}</p>
          </section>

          <section class="detail-section" aria-labelledby="order-items-title">
            <div class="detail-section-heading">
              <h3 id="order-items-title">商品明细</h3>
              <span>共 {{ itemCount }} 件</span>
            </div>
            <div class="order-detail-table">
              <NDataTable
                :columns="itemColumns"
                :data="order.items"
                :pagination="false"
                :scroll-x="560"
                :row-key="(row: OrderLineItemResponse) => row.productId"
                size="small"
              />
            </div>
          </section>
        </div>
      </NSpin>
      <template #footer>
        <div v-if="order" class="order-detail-footer">
          <div class="order-detail-total">
            <span>订单合计</span>
            <strong>{{ formatMoney(order.totalAmount) }}</strong>
          </div>
          <OrderActions
            :status="order.status"
            :loading-action="actionLoading"
            @action="emit('action', $event)"
          />
        </div>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>
