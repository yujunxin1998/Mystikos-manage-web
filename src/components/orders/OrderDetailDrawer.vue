<script setup lang="ts">
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

defineProps<{
  show: boolean
  loading: boolean
  order: ManageOrder | null
  error?: string
  actionLoading?: OrderAction
}>()

const emit = defineEmits<{ close: []; retry: []; action: [action: OrderAction] }>()

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
  <NDrawer :show="show" :width="680" :mask-closable="false" @update:show="emit('close')">
    <NDrawerContent title="订单详情" closable>
      <NSpin :show="loading">
        <div v-if="error" class="drawer-error">
          <p>{{ error }}</p>
          <NButton type="primary" @click="emit('retry')">重试</NButton>
        </div>
        <div v-else-if="order" class="order-detail">
          <header class="order-detail-head">
            <div>
              <h2>订单 #{{ order.orderId }}</h2>
              <p>买家 ID：{{ order.patronId }}</p>
            </div>
            <NTag :type="orderStatusTone[order.status]" size="small">
              {{ orderStatusLabel[order.status] }}
            </NTag>
          </header>

          <section class="order-detail-block">
            <h3>收货地址</h3>
            <p>{{ order.shippingAddress || '—' }}</p>
          </section>

          <section class="order-detail-block">
            <h3>商品明细</h3>
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

          <section class="order-detail-foot">
            <div>
              <span>创建时间</span>
              <p>{{ formatDateTime(order.createdAt) }}</p>
            </div>
            <div class="order-detail-total">
              <span>订单总额</span>
              <strong>{{ formatMoney(order.totalAmount) }}</strong>
            </div>
          </section>

          <div class="order-detail-actions">
            <OrderActions
              :status="order.status"
              :loading-action="actionLoading"
              @action="emit('action', $event)"
            />
          </div>
        </div>
      </NSpin>
    </NDrawerContent>
  </NDrawer>
</template>
