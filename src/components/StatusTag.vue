<script setup lang="ts">
defineProps<{
  status: string
  variant?: 'table' | 'business'
}>()
</script>

<template>
  <span :class="[variant === 'table' ? 'status' : 'business-status', status]">{{ status }}</span>
</template>
