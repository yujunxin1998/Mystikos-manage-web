<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue'
import {
  NButton,
  NDataTable,
  NDatePicker,
  NInput,
  NSpace,
  NTag,
  useMessage,
  type DataTableColumns,
} from 'naive-ui'
import { RefreshCcw, ScrollText, Search } from 'lucide-vue-next'
import ListPagination from '../../components/ListPagination.vue'
import { fetchOperationLogs } from '../../api/operation-logs'
import type { OperationLog } from '../../types'
import { DEFAULT_PAGE_SIZE, pageRange } from '../../utils/pagination'
import { formatDateTime } from '../../utils/format'

const message = useMessage()

const rows = ref<OperationLog[]>([])
const loading = ref(false)
const operatorId = ref('')
const pathKeyword = ref('')
const occurredFrom = ref<string | null>(null)
const occurredTo = ref<string | null>(null)
const pageNum = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)
const total = ref(0)
const pages = ref(0)

const range = computed(() => pageRange(pageNum.value, pageSize.value, total.value))
const rangeStart = computed(() => range.value.start)
const rangeEnd = computed(() => range.value.end)

function methodTone(method: string): 'info' | 'success' | 'warning' | 'error' | 'default' {
  switch (method.toUpperCase()) {
    case 'GET':
      return 'info'
    case 'POST':
      return 'success'
    case 'PUT':
    case 'PATCH':
      return 'warning'
    case 'DELETE':
      return 'error'
    default:
      return 'default'
  }
}

async function loadLogs() {
  loading.value = true
  try {
    const result = await fetchOperationLogs({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      operatorId: operatorId.value.trim() || undefined,
      pathKeyword: pathKeyword.value.trim() || undefined,
      occurredFrom: occurredFrom.value ?? undefined,
      occurredTo: occurredTo.value ?? undefined,
    })
    rows.value = result.records
    total.value = result.total
    pages.value = result.pages
  } catch (error) {
    message.error(error instanceof Error ? error.message : '操作日志加载失败')
  } finally {
    loading.value = false
  }
}

async function applyFilters() {
  pageNum.value = 1
  await loadLogs()
}

async function resetFilters() {
  operatorId.value = ''
  pathKeyword.value = ''
  occurredFrom.value = null
  occurredTo.value = null
  pageNum.value = 1
  await loadLogs()
}

async function changePage(page: number) {
  pageNum.value = page
  await loadLogs()
}

async function changePageSize(size: number) {
  pageSize.value = size
  pageNum.value = 1
  await loadLogs()
}

function renderLogDetail(row: OperationLog) {
  const items = [
    h('p', [h('strong', '请求路径 '), h('code', row.requestPath)]),
    h('p', [h('strong', 'Query 参数 '), h('code', row.queryString || '—')]),
    h('p', [h('strong', '请求体 '), h('code', row.requestBody || '—')]),
  ]
  if (row.errorMessage) {
    items.push(h('p', [h('strong', '错误信息 '), h('code', row.errorMessage)]))
  }
  return h('div', { class: 'oplog-detail' }, items)
}

const columns = computed<DataTableColumns<OperationLog>>(() => [
  { type: 'expand', renderExpand: (row) => renderLogDetail(row) },
  { title: '发生时间', key: 'occurredAt', width: 170, render: (row) => formatDateTime(row.occurredAt) },
  { title: '操作人', key: 'operatorId', width: 100 },
  {
    title: '方法',
    key: 'httpMethod',
    width: 84,
    render: (row) =>
      h(NTag, { type: methodTone(row.httpMethod), size: 'small', bordered: false }, () => row.httpMethod),
  },
  { title: '请求路径', key: 'requestPath', width: 260, ellipsis: { tooltip: true } },
  { title: '状态码', key: 'responseStatus', width: 84 },
  {
    title: '结果',
    key: 'success',
    width: 80,
    render: (row) =>
      h(
        NTag,
        { type: row.success ? 'success' : 'error', size: 'small', bordered: false },
        () => (row.success ? '成功' : '失败'),
      ),
  },
  { title: '耗时', key: 'durationMs', width: 90, render: (row) => `${row.durationMs} ms` },
  { title: '客户端 IP', key: 'clientIp', width: 130 },
])

onMounted(loadLogs)
</script>

<template>
  <div class="business-page operation-logs-page">
    <section class="business-title">
      <div>
        <h1>操作日志</h1>
        <span>查看管理员对后台接口的调用记录</span>
      </div>
    </section>

    <section class="list-table-panel panel">
      <div class="list-toolbar">
        <div class="list-toolbar-main">
          <div>
            <h2>日志列表</h2>
            <p>共 {{ total }} 条操作日志</p>
          </div>
          <NSpace class="list-actions" :size="9">
            <NButton :loading="loading" @click="loadLogs">
              <template #icon><RefreshCcw :size="16" /></template>
              刷新
            </NButton>
          </NSpace>
        </div>
        <NSpace class="list-filters" :size="8" wrap align="center">
          <NInput
            v-model:value="operatorId"
            clearable
            aria-label="操作人ID"
            placeholder="操作人用户 ID"
            style="width: 150px"
            @keyup.enter="applyFilters"
          >
            <template #prefix><ScrollText :size="16" /></template>
          </NInput>
          <NInput
            v-model:value="pathKeyword"
            clearable
            aria-label="路径关键字"
            placeholder="请求路径关键字"
            style="width: 180px"
            @keyup.enter="applyFilters"
          >
            <template #prefix><Search :size="16" /></template>
          </NInput>
          <NDatePicker
            v-model:formatted-value="occurredFrom"
            type="datetime"
            clearable
            value-format="yyyy-MM-dd'T'HH:mm:ss"
            aria-label="发生时间开始"
            placeholder="发生时间起"
            style="width: 210px"
          />
          <NDatePicker
            v-model:formatted-value="occurredTo"
            type="datetime"
            clearable
            value-format="yyyy-MM-dd'T'HH:mm:ss"
            aria-label="发生时间结束"
            placeholder="发生时间止"
            style="width: 210px"
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
          :row-key="(row: OperationLog) => row.id"
          :scroll-x="1050"
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
  </div>
</template>
