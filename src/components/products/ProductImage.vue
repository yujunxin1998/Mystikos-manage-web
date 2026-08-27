<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { ImageOff } from 'lucide-vue-next'
import { getFileUrl } from '../../api/files'

const props = defineProps<{ src: string }>()

const url = ref('')
const failed = ref(false)

function isHttpUrl(value: string) {
  return /^https?:\/\//.test(value)
}

async function resolve() {
  failed.value = false
  url.value = ''
  if (!props.src) {
    failed.value = true
    return
  }
  // 已是可直接展示的 URL 时直接使用，否则按 objectKey 解析预签名地址
  if (isHttpUrl(props.src)) {
    url.value = props.src
    return
  }
  try {
    url.value = await getFileUrl(props.src)
  } catch {
    failed.value = true
  }
}

watch(() => props.src, resolve)
onMounted(resolve)
</script>

<template>
  <span class="product-image">
    <img v-if="url && !failed" :src="url" alt="" @error="failed = true" />
    <span v-else class="product-image__fallback">
      <ImageOff :size="20" />
    </span>
  </span>
</template>
