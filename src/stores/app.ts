import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

const THEME_KEY = 'mystikos_admin_dark'
const COLLAPSED_KEY = 'mystikos_admin_collapsed'

function readBool(key: string, fallback = false): boolean {
  try {
    const value = localStorage.getItem(key)
    if (value === null) return fallback
    return value === '1'
  } catch {
    return fallback
  }
}

export const useAppStore = defineStore('app', () => {
  const dark = ref(readBool(THEME_KEY))
  const collapsed = ref(readBool(COLLAPSED_KEY))
  const appTitle = computed(() => import.meta.env.VITE_APP_TITLE || 'Mystikos 运营中心')

  function toggleDark() {
    dark.value = !dark.value
  }

  function toggleCollapsed() {
    collapsed.value = !collapsed.value
  }

  watch(dark, (value) => {
    try {
      localStorage.setItem(THEME_KEY, value ? '1' : '0')
    } catch (error) {
      console.error('保存主题失败', error)
    }
  })

  watch(collapsed, (value) => {
    try {
      localStorage.setItem(COLLAPSED_KEY, value ? '1' : '0')
    } catch (error) {
      console.error('保存侧边栏状态失败', error)
    }
  })

  return {
    dark,
    collapsed,
    appTitle,
    toggleDark,
    toggleCollapsed,
  }
})
