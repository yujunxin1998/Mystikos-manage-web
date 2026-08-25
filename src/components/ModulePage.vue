<script setup lang="ts">
import type { Component } from 'vue'
import { RefreshCcw } from 'lucide-vue-next'
import { NButton, NSpace } from 'naive-ui'
import DataTable from './DataTable.vue'
import RecordFormModal from './RecordFormModal.vue'
import StatCards from './StatCards.vue'
import { useCrudList } from '../composables/useCrudList'
import type { ModuleMeta, RowRecord } from '../types'

const props = defineProps<{
  meta: ModuleMeta
  source: RowRecord[]
  filenamePrefix: string
  actionIcon: Component
  statIcons: Component[]
}>()

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
  meta: props.meta,
  source: props.source,
  filenamePrefix: props.filenamePrefix,
})
</script>

<template>
  <div class="business-page">
    <section class="business-title">
      <div>
        <p>{{ meta.code }}</p>
        <h1>{{ meta.title }}</h1>
        <span>{{ meta.desc }}</span>
      </div>
    </section>

    <StatCards :items="meta.stats" :icons="statIcons" variant="business" />

    <slot name="extra" />

    <DataTable
      :columns="meta.columns"
      :rows="rows"
      :keyword="keyword"
      :status-filter="statusFilter"
      :status-options="statusOptions"
      :table-title="meta.tableTitle"
      :table-desc="`共 ${rows.length} 条演示数据`"
      @update:keyword="keyword = $event"
      @update:status-filter="statusFilter = $event"
      @export="exportRows"
      @edit="openEdit"
      @remove="removeRow"
    >
      <template #actions>
        <NSpace :size="9">
          <NButton @click="resetRows">
            <template #icon><RefreshCcw :size="16" /></template>
            刷新
          </NButton>
          <NButton type="primary" @click="openCreate">
            <template #icon><component :is="actionIcon" :size="17" /></template>
            {{ meta.action }}
          </NButton>
        </NSpace>
      </template>
    </DataTable>

    <RecordFormModal
      :open="modal"
      :title="editingKey ? '编辑记录' : meta.action"
      :subtitle="editingKey ? '修改字段并保存更新' : '填写必要信息后确认提交'"
      :fields="meta.fields"
      :form="form"
      :status-options="statusOptions"
      :default-status="meta.defaultStatus"
      @close="modal = false"
      @submit="submit"
      @update:form="form = $event"
    />
  </div>
</template>
