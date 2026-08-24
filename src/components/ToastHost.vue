<script setup lang="ts">
import { Check } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { useToastStore } from '../stores/toast'

const toastStore = useToastStore()
const { message } = storeToRefs(toastStore)
</script>

<template>
  <div v-if="message" class="business-toast"><Check :size="17" />{{ message }}</div>
</template>
