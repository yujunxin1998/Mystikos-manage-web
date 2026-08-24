<script setup lang="ts">
import { ArrowDownToLine, Filter, Pencil, Search, Trash2 } from 'lucide-vue-next'
import type { ColumnDef, RowRecord } from '../types'
import StatusTag from './StatusTag.vue'

defineProps<{
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

function recordKey(row: RowRecord): string {
  return row.id || row.image || Object.values(row)[0] || ''
}
</script>

<template>
  <section class="business-table panel">
    <div class="business-table-head">
      <div>
        <h2>{{ tableTitle }}</h2>
        <p>{{ tableDesc }}</p>
      </div>
      <div class="business-filters">
        <label>
          <Search :size="16" />
          <input
            :value="keyword"
            placeholder="输入关键词搜索"
            @input="emit('update:keyword', ($event.target as HTMLInputElement).value)"
          />
        </label>
        <select
          :value="statusFilter"
          aria-label="状态筛选"
          @change="emit('update:statusFilter', ($event.target as HTMLSelectElement).value)"
        >
          <option>全部状态</option>
          <option v-for="item in statusOptions" :key="item">{{ item }}</option>
        </select>
        <button type="button"><Filter :size="16" />筛选</button>
        <button type="button" @click="emit('export')"><ArrowDownToLine :size="16" />导出</button>
      </div>
    </div>

    <div class="business-table-wrap">
      <table>
        <thead>
          <tr>
            <th v-for="col in columns" :key="col.key">{{ col.label }}</th>
            <th v-if="showActions !== false">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="recordKey(row)">
            <td
              v-for="col in columns"
              :key="col.key"
              :class="{
                identifier: col.kind === 'identifier',
                strong: col.kind === 'strong',
              }"
            >
              <img
                v-if="col.kind === 'image'"
                class="product-thumb"
                :src="row[col.key]"
                :alt="row.name"
              />
              <StatusTag
                v-else-if="col.kind === 'status'"
                :status="row[col.key]"
                variant="business"
              />
              <template v-else>{{ row[col.key] }}</template>
            </td>
            <td v-if="showActions !== false">
              <div class="row-actions">
                <button type="button" title="编辑" @click="emit('edit', row)">
                  <Pencil :size="15" />
                </button>
                <button type="button" title="删除" class="danger-action" @click="emit('remove', row)">
                  <Trash2 :size="15" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!rows.length">
            <td :colspan="columns.length + (showActions !== false ? 1 : 0)" class="empty">
              没有找到符合条件的数据
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <span>显示 1 - {{ rows.length }} 条，共 {{ rows.length }} 条</span>
      <div>
        <button type="button" disabled>‹</button>
        <button type="button" class="current">1</button>
        <button type="button" disabled>›</button>
      </div>
    </div>
  </section>
</template>
