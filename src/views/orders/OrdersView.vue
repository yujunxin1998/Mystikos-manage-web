<script setup lang="ts">
import { computed, h, ref, watch } from 'vue'
import {
  NButton,
  NCard,
  NDataTable,
  NForm,
  NFormItem,
  NInput,
  NModal,
  NPopconfirm,
  NSelect,
  NSpace,
  useMessage,
  type DataTableColumns,
} from 'naive-ui'
import {
  ArrowDownToLine,
  CircleDollarSign,
  Gamepad2,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  TrendingUp,
  UsersRound,
} from 'lucide-vue-next'
import ListPagination from '../../components/ListPagination.vue'
import StatCards from '../../components/StatCards.vue'
import StatusTag from '../../components/StatusTag.vue'
import { useCrudList } from '../../composables/useCrudList'
import { orderMeta, orderRows } from '../../mocks/orders'
import type { Order } from '../../types'
import { DEFAULT_PAGE_SIZE, pageRange } from '../../utils/pagination'

const statIcons = [TrendingUp, UsersRound, Gamepad2, CircleDollarSign]
const message = useMessage()
const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)

const {
  keyword,
  statusFilter,
  modal,
  editingKey,
  form,
  statusOptions,
  rows,
  resetRows,
  openCreate,
  openEdit,
  removeRow,
  submit,
  exportRows,
} = useCrudList({
  meta: orderMeta,
  source: orderRows,
  filenamePrefix: '订单管理',
  notify: (text) => message.success(text),
})

const statusSelectOptions = computed(() => [
  { label: '全部状态', value: '全部状态' },
  ...statusOptions.value.map((status) => ({ label: status, value: status })),
])
const pageCount = computed(() => Math.max(1, Math.ceil(rows.value.length / pageSize.value)))
const pageRows = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return rows.value.slice(start, start + pageSize.value)
})
const range = computed(() => pageRange(page.value, pageSize.value, rows.value.length))
const rangeStart = computed(() => range.value.start)
const rangeEnd = computed(() => range.value.end)

watch([keyword, statusFilter], () => {
  page.value = 1
})
watch(pageCount, (count) => {
  if (page.value > count) page.value = count
})

function changePageSize(size: number) {
  pageSize.value = size
  page.value = 1
}

const columns = computed<DataTableColumns<Order>>(() => [
  {
    title: '订单编号',
    key: 'id',
    width: 180,
    fixed: 'left',
    render: (row) => h('span', { class: 'order-identifier' }, row.id),
  },
  {
    title: '会员',
    key: 'member',
    width: 130,
    render: (row) => h('strong', { class: 'order-member' }, row.member),
  },
  { title: '游戏 / 服务', key: 'service', width: 190 },
  { title: '陪玩师', key: 'worker', width: 120 },
  { title: '订单金额', key: 'amount', width: 120 },
  { title: '支付方式', key: 'pay', width: 120 },
  {
    title: '订单状态',
    key: 'status',
    width: 110,
    render: (row) => h(StatusTag, { status: row.status, variant: 'business' }),
  },
  { title: '下单时间', key: 'created', width: 130 },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    fixed: 'right',
    render: (row) =>
      h(NSpace, { size: 2, wrap: false }, () => [
        h(
          NButton,
          {
            quaternary: true,
            circle: true,
            size: 'small',
            title: '编辑订单',
            onClick: () => openEdit(row),
          },
          { default: () => h(Pencil, { size: 15 }) },
        ),
        h(
          NPopconfirm,
          { onPositiveClick: () => removeRow(row) },
          {
            trigger: () =>
              h(
                NButton,
                {
                  quaternary: true,
                  circle: true,
                  size: 'small',
                  title: '删除订单',
                  type: 'error',
                },
                { default: () => h(Trash2, { size: 15 }) },
              ),
            default: () => `确认删除订单 ${row.id}？`,
          },
        ),
      ]),
  },
])

function updateFormField(key: string, value: string | null) {
  form.value = { ...form.value, [key]: value ?? '' }
}
</script>

<template>
  <div class="business-page order-page">
    <section class="business-title">
      <div>
        <p>{{ orderMeta.code }}</p>
        <h1>{{ orderMeta.title }}</h1>
        <span>{{ orderMeta.desc }}</span>
      </div>
    </section>

    <StatCards :items="orderMeta.stats" :icons="statIcons" variant="business" />

    <section class="order-table-panel list-table-panel panel">
      <div class="order-table-head order-toolbar list-toolbar">
        <div class="list-toolbar-main">
          <div>
            <h2>{{ orderMeta.tableTitle }}</h2>
            <p>共 {{ rows.length }} 条演示数据</p>
          </div>
          <NSpace class="list-actions" :size="9">
            <NButton @click="resetRows">
              <template #icon><RefreshCcw :size="16" /></template>
              刷新
            </NButton>
            <NButton type="primary" @click="openCreate">
              <template #icon><Plus :size="17" /></template>
              {{ orderMeta.action }}
            </NButton>
          </NSpace>
        </div>
        <NSpace class="order-filters list-filters" :size="8" wrap align="center">
          <NInput v-model:value="keyword" clearable placeholder="输入关键词搜索">
            <template #prefix><Search :size="16" /></template>
          </NInput>
          <NSelect
            v-model:value="statusFilter"
            aria-label="状态筛选"
            :options="statusSelectOptions"
            style="width: 130px"
          />
          <NButton secondary @click="exportRows">
            <template #icon><ArrowDownToLine :size="16" /></template>
            导出
          </NButton>
        </NSpace>
      </div>

      <div class="order-table-host">
        <NDataTable
          :columns="columns"
          :data="pageRows"
          :pagination="false"
          :row-key="(row: Order) => row.id"
          :scroll-x="1200"
          :single-line="false"
          striped
        />
      </div>

      <ListPagination
        :page="page"
        :page-size="pageSize"
        :item-count="rows.length"
        :range-start="rangeStart"
        :range-end="rangeEnd"
        @update:page="page = $event"
        @update:page-size="changePageSize"
      />
    </section>

    <NModal v-model:show="modal" :mask-closable="false">
      <NCard
        class="order-form-modal"
        :title="editingKey ? '编辑订单' : orderMeta.action"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <p class="order-form-subtitle">
          {{ editingKey ? '修改字段并保存更新' : '填写必要信息后确认提交' }}
        </p>
        <NForm class="order-form-grid" label-placement="top">
          <NFormItem v-for="field in orderMeta.fields" :key="field.key" :label="field.label">
            <NSelect
              v-if="field.type === 'select'"
              :value="form[field.key]"
              :options="field.options?.map((option) => ({ label: option, value: option }))"
              :placeholder="field.placeholder || `请选择${field.label}`"
              @update:value="(value) => updateFormField(field.key, value)"
            />
            <NInput
              v-else
              :value="form[field.key]"
              :placeholder="field.placeholder"
              @update:value="(value) => updateFormField(field.key, value)"
            />
          </NFormItem>
        </NForm>
        <template #footer>
          <NSpace justify="end">
            <NButton @click="modal = false">取消</NButton>
            <NButton type="primary" @click="submit">确认提交</NButton>
          </NSpace>
        </template>
      </NCard>
    </NModal>
  </div>
</template>
