<script setup lang="ts">
import { NPagination } from 'naive-ui'
import { PAGE_SIZE_OPTIONS } from '../utils/pagination'

defineProps<{
  page: number
  pageSize: number
  itemCount: number
  rangeStart: number
  rangeEnd: number
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:page': [value: number]
  'update:pageSize': [value: number]
}>()
</script>

<template>
  <div class="list-pagination">
    <span>显示 {{ rangeStart }} - {{ rangeEnd }} 条，共 {{ itemCount }} 条</span>
    <NPagination
      :page="page"
      :page-size="pageSize"
      :item-count="itemCount"
      :page-sizes="[...PAGE_SIZE_OPTIONS]"
      :disabled="disabled"
      show-size-picker
      show-quick-jumper
      @update:page="emit('update:page', $event)"
      @update:page-size="emit('update:pageSize', $event)"
    />
  </div>
</template>
