<script setup lang="ts">
import { computed } from 'vue'
import { Copy } from 'lucide-vue-next'
import { NButton, NTooltip, useMessage } from 'naive-ui'
import { copyText } from '../utils/clipboard'

const props = withDefaults(
  defineProps<{
    value: string | number
    prefix?: string
    name?: string
  }>(),
  {
    prefix: '',
    name: '编号',
  },
)

const fallbackMessage = {
  success: (text: string) => console.info(text),
  error: (text: string) => console.warn(text),
}

let message: { success: (text: string) => void; error: (text: string) => void } = fallbackMessage
try {
  message = useMessage()
} catch {
  message = fallbackMessage
}
const displayText = computed(() => `${props.prefix}${props.value}`)
const copyValue = computed(() => String(props.value))

async function handleCopy(event: MouseEvent) {
  event.stopPropagation()
  try {
    await copyText(copyValue.value)
    message.success(`${props.name}已复制`)
  } catch {
    message.error('复制失败，请手动复制')
  }
}
</script>

<template>
  <div class="copyable-id">
    <NTooltip trigger="hover">
      <template #trigger>
        <span class="order-identifier">{{ displayText }}</span>
      </template>
      {{ displayText }}
    </NTooltip>
    <NButton
      text
      size="tiny"
      :aria-label="`复制${name} ${copyValue}`"
      @click="handleCopy"
    >
      <template #icon>
        <Copy :size="14" />
      </template>
    </NButton>
  </div>
</template>
