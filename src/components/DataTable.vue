<script setup lang="ts">
import { computed, h, ref, watch } from 'vue'
import { ArrowDownToLine, Pencil, Search, Trash2 } from 'lucide-vue-next'
import {
  NButton,
  NDataTable,
  NInput,
  NPopconfirm,
  NSelect,
  NSpace,
  type DataTableColumns,
} from 'naive-ui'
import type { ColumnDef, RowRecord } from '../types'
import { DEFAULT_PAGE_SIZE, pageRange } from '../utils/pagination'
import ListPagination from './ListPagination.vue'
import StatusTag from './StatusTag.vue'

const props = defineProps<{
  columns: ColumnDef[]
  rows: RowRecord[]
  keyword: string
  statusFilter: string
  statusOptions: string[]
  tableTitle: string
  tableDesc: string
  showActions?: boolean
}>()

const emit = defineEmits<{
  'update:keyword': [value: string]
  'update:statusFilter': [value: string]
  export: []
  edit: [row: RowRecord]
  remove: [row: RowRecord]
}>()

const page = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)

function recordKey(row: RowRecord): string {
  return row.id || row.image || Object.values(row)[0] || ''
}

const statusSelectOptions = computed(() => [
  { label: '全部状态', value: '全部状态' },
  ...props.statusOptions.map((status) => ({ label: status, value: status })),
])

const pageCount = computed(() => Math.max(1, Math.ceil(props.rows.length / pageSize.value)))
const pageRows = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return props.rows.slice(start, start + pageSize.value)
})
const range = computed(() => pageRange(page.value, pageSize.value, props.rows.length))

watch(
  () => [props.keyword, props.statusFilter] as const,
  () => {
    page.value = 1
  },
)
watch(pageCount, (count) => {
  if (page.value > count) page.value = count
})

function changePageSize(size: number) {
  pageSize.value = size
  page.value = 1
}

const tableColumns = computed<DataTableColumns<RowRecord>>(() => {
  const cols: DataTableColumns<RowRecord> = props.columns.map((col) => ({
    title: col.label,
    key: col.key,
    width: col.kind === 'image' ? 80 : 140,
    render: (row) => {
      if (col.kind === 'image') {
        return h('img', { class: 'product-thumb', src: row[col.key], alt: row.name || '' })
      }
      if (col.kind === 'status') {
        return h(StatusTag, { status: row[col.key], variant: 'business' })
      }
      if (col.kind === 'identifier') {
        return h('span', { class: 'order-identifier' }, row[col.key])
      }
      if (col.kind === 'strong') {
        return h('strong', { class: 'order-member' }, row[col.key])
      }
      return row[col.key]
    },
  }))

  if (props.showActions !== false) {
    cols.push({
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
              title: '编辑',
              onClick: () => emit('edit', row),
            },
            { default: () => h(Pencil, { size: 15 }) },
          ),
          h(
            NPopconfirm,
            { onPositiveClick: () => emit('remove', row) },
            {
              trigger: () =>
                h(
                  NButton,
                  {
                    quaternary: true,
                    circle: true,
                    size: 'small',
                    title: '删除',
                    type: 'error',
                  },
                  { default: () => h(Trash2, { size: 15 }) },
                ),
              default: () => '确认删除该记录？',
            },
          ),
        ]),
    })
  }

  return cols
})

const scrollX = computed(() => Math.max(900, props.columns.length * 140 + 120))
</script>

<template>
  <section class="list-table-panel panel">
    <div class="list-toolbar">
      <div class="list-toolbar-main">
        <div>
          <h2>{{ tableTitle }}</h2>
          <p>{{ tableDesc }}</p>
        </div>
        <div class="list-actions">
          <slot name="actions" />
        </div>
      </div>
      <NSpace class="list-filters" :size="8" wrap align="center">
        <NInput
          :value="keyword"
          clearable
          placeholder="输入关键词搜索"
          style="width: 220px"
          @update:value="emit('update:keyword', $event)"
        >
          <template #prefix><Search :size="16" /></template>
        </NInput>
        <NSelect
          :value="statusFilter"
          aria-label="状态筛选"
          :options="statusSelectOptions"
          style="width: 130px"
          @update:value="emit('update:statusFilter', $event)"
        />
        <NButton secondary @click="emit('export')">
          <template #icon><ArrowDownToLine :size="16" /></template>
          导出
        </NButton>
      </NSpace>
    </div>

    <div class="list-table-host">
      <NDataTable
        :columns="tableColumns"
        :data="pageRows"
        :pagination="false"
        :row-key="recordKey"
        :scroll-x="scrollX"
        :single-line="false"
        striped
      />
    </div>

    <ListPagination
      :page="page"
      :page-size="pageSize"
      :item-count="rows.length"
      :range-start="range.start"
      :range-end="range.end"
      @update:page="page = $event"
      @update:page-size="changePageSize"
    />
  </section>
</template>
