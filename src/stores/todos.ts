import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { fetchCompanionApplications, fetchCompanionShowcases } from '../api/companions'

function formatBadge(count: number): string | undefined {
  if (count <= 0) return undefined
  return count > 99 ? '99+' : String(count)
}

export const useTodosStore = defineStore('todos', () => {
  const applicationPending = ref(0)
  const showcasePending = ref(0)
  const loading = ref(false)
  let lastFetchedAt = 0

  const totalPending = computed(() => applicationPending.value + showcasePending.value)
  const applicationBadge = computed(() => formatBadge(applicationPending.value))
  const showcaseBadge = computed(() => formatBadge(showcasePending.value))
  const hasPending = computed(() => totalPending.value > 0)

  async function refresh(force = false): Promise<void> {
    const now = Date.now()
    if (!force && loading.value) return
    if (!force && now - lastFetchedAt < 8_000) return

    loading.value = true
    try {
      const [submitted, assessing, showcases] = await Promise.all([
        fetchCompanionApplications({ pageNum: 1, pageSize: 1, status: 'SUBMITTED' }),
        fetchCompanionApplications({ pageNum: 1, pageSize: 1, status: 'IN_ASSESSMENT' }),
        fetchCompanionShowcases({ pageNum: 1, pageSize: 1, status: 'PENDING_REVIEW' }),
      ])
      applicationPending.value = (submitted.total || 0) + (assessing.total || 0)
      showcasePending.value = showcases.total || 0
      lastFetchedAt = Date.now()
    } catch (error) {
      console.warn('待办数量刷新失败', error)
    } finally {
      loading.value = false
    }
  }

  return {
    applicationPending,
    showcasePending,
    loading,
    totalPending,
    applicationBadge,
    showcaseBadge,
    hasPending,
    refresh,
  }
})
