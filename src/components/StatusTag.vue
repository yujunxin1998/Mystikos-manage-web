<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status: string
  variant?: 'table' | 'business'
}>()

const STATUS_TONE: Record<string, string> = {
  进行中: 'status-info',
  服务中: 'status-info',
  待接单: 'status-warning',
  待审核: 'status-warning',
  已完成: 'status-success',
  已上架: 'status-success',
  已通过: 'status-success',
  已取消: 'status-error',
  已封禁: 'status-error',
  已删除: 'status-error',
  已下架: 'status-error',
  未通过: 'status-error',
}

const toneClass = computed(() => STATUS_TONE[props.status] || 'status-info')
const rootClass = computed(() => (props.variant === 'table' ? 'status' : 'business-status'))
</script>

<template>
  <span :class="[rootClass, toneClass, status]">{{ status }}</span>
</template>
