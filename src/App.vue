<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
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
import {
  createThemeCssVars,
  darkNaiveThemeOverrides,
  darkThemeTokens,
  lightNaiveThemeOverrides,
  lightThemeTokens,
} from './theme/naive'
import { watchDisableBrowserAutofill } from './utils/disableBrowserAutofill'

const appStore = useAppStore()
const { dark } = storeToRefs(appStore)
const naiveTheme = computed(() => (dark.value ? darkTheme : null))
const themeOverrides = computed(() =>
  dark.value ? darkNaiveThemeOverrides : lightNaiveThemeOverrides,
)
const themeCssVars = computed(() =>
  createThemeCssVars(dark.value ? darkThemeTokens : lightThemeTokens),
)

const themeRootRef = ref<HTMLElement | null>(null)
let stopAutofillWatch: (() => void) | undefined

onMounted(() => {
  if (themeRootRef.value) {
    stopAutofillWatch = watchDisableBrowserAutofill(themeRootRef.value)
  }
})

onBeforeUnmount(() => {
  stopAutofillWatch?.()
})
</script>

<template>
  <NConfigProvider
    :theme="naiveTheme"
    :theme-overrides="themeOverrides"
    :locale="zhCN"
    :date-locale="dateZhCN"
  >
    <NDialogProvider>
      <NMessageProvider>
        <div
          ref="themeRootRef"
          class="theme-root"
          :data-theme="dark ? 'dark' : 'light'"
          :style="themeCssVars"
        >
          <RouterView />
        </div>
      </NMessageProvider>
    </NDialogProvider>
  </NConfigProvider>
</template>
