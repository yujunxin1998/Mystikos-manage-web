<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import {
  darkTheme,
  dateZhCN,
  NConfigProvider,
  NDialogProvider,
  NMessageProvider,
  zhCN,
} from 'naive-ui'
import { useAppStore } from './stores/app'
import { mystikosThemeOverrides } from './theme/naive'

const appStore = useAppStore()
const { dark } = storeToRefs(appStore)
const naiveTheme = computed(() => (dark.value ? darkTheme : null))
</script>

<template>
  <NConfigProvider
    :theme="naiveTheme"
    :theme-overrides="mystikosThemeOverrides"
    :locale="zhCN"
    :date-locale="dateZhCN"
  >
    <NDialogProvider>
      <NMessageProvider>
        <RouterView />
      </NMessageProvider>
    </NDialogProvider>
  </NConfigProvider>
</template>
