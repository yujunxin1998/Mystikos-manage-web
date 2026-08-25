<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileBarChart,
  Gamepad2,
  Headphones,
  IdCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Search,
  ShoppingBag,
  Sparkles,
  Sun,
  Target,
  UsersRound,
  Wallet,
} from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import ToastHost from '../components/ToastHost.vue'
import { useAppStore } from '../stores/app'
import { useAuthStore } from '../stores/auth'
import { useTodosStore } from '../stores/todos'
import { formatRoleLabels } from '../utils/roles'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()
const todosStore = useTodosStore()
const { dark, collapsed } = storeToRefs(appStore)
const { user } = storeToRefs(authStore)
const { applicationBadge, showcaseBadge, applicationPending, showcasePending, hasPending } =
  storeToRefs(todosStore)

const profileOpen = ref(false)
const noticeOpen = ref(false)
let pollTimer: ReturnType<typeof setInterval> | undefined

const roleText = computed(() => formatRoleLabels(user.value?.roles))
const avatarText = computed(() => user.value?.avatar || '管')
const displayName = computed(() => user.value?.displayName || '未登录')

const nav = computed(() => [
  { label: '总览', path: '/', icon: LayoutDashboard },
  { label: '用户管理', path: '/members', icon: UsersRound },
  { label: '订单管理', path: '/orders', icon: Gamepad2 },
  { label: '陪玩师管理', path: '/workers', icon: Headphones },
  {
    label: '陪玩申请',
    path: '/companion-applications',
    icon: ClipboardCheck,
    badge: applicationBadge.value,
  },
  {
    label: '陪玩名片审核',
    path: '/companion-showcases',
    icon: IdCard,
    badge: showcaseBadge.value,
  },
  { label: '商品管理', path: '/products', icon: ShoppingBag },
  { label: '财务中心', path: '/finance', icon: Wallet },
  { label: '数据报表', path: '/reports', icon: FileBarChart },
])

const pageTitle = computed(() => {
  const matched = nav.value.find((item) => item.path === route.path)
  if (matched) return matched.label
  return '总览'
})

const noticeItems = computed(() => {
  const items: Array<{ label: string; path: string; count: number }> = []
  if (applicationPending.value > 0) {
    items.push({
      label: '陪玩申请待处理',
      path: '/companion-applications',
      count: applicationPending.value,
    })
  }
  if (showcasePending.value > 0) {
    items.push({
      label: '陪玩名片待审核',
      path: '/companion-showcases',
      count: showcasePending.value,
    })
  }
  return items
})

function isActive(path: string): boolean {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

function navigate(path: string) {
  router.push(path)
}

function toggleProfile() {
  noticeOpen.value = false
  profileOpen.value = !profileOpen.value
}

function toggleNotice() {
  profileOpen.value = false
  noticeOpen.value = !noticeOpen.value
  if (noticeOpen.value) void todosStore.refresh(true)
}

function openNoticeItem(path: string) {
  noticeOpen.value = false
  navigate(path)
}

function closeOverlays(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  if (!target?.closest('.profile-wrap')) profileOpen.value = false
  if (!target?.closest('.notice-wrap')) noticeOpen.value = false
}

async function handleLogout() {
  try {
    authStore.logout()
    profileOpen.value = false
    noticeOpen.value = false
    await router.replace('/login')
  } catch (error) {
    console.error('退出登录失败', error)
  }
}

watch(
  () => route.path,
  (path, previous) => {
    if (
      previous?.startsWith('/companion-applications') ||
      previous?.startsWith('/companion-showcases') ||
      path.startsWith('/companion-applications') ||
      path.startsWith('/companion-showcases')
    ) {
      void todosStore.refresh(true)
    }
  },
)

onMounted(() => {
  document.addEventListener('click', closeOverlays)
  authStore.hydrateUser().catch(async () => {
    await authStore.logout()
    await router.replace('/login')
  })
  void todosStore.refresh(true)
  pollTimer = setInterval(() => {
    void todosStore.refresh()
  }, 120_000)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeOverlays)
  if (pollTimer) clearInterval(pollTimer)
})
</script>

<template>
  <div class="app" :class="{ dark, collapsed }">
    <aside class="sidebar">
      <div class="brand">
        <span class="brand-mark"><Sparkles :size="19" /></span>
        <strong>MYSTIKOS</strong>
      </div>
      <div class="workspace"><span>运营中心</span><ChevronDown :size="15" /></div>
      <nav>
        <p class="nav-title">业务管理</p>
        <button
          v-for="item in nav"
          :key="item.path"
          type="button"
          :class="{ active: isActive(item.path) }"
          @click="navigate(item.path)"
        >
          <component :is="item.icon" :size="19" />
          <span>{{ item.label }}</span>
          <em v-if="item.badge">{{ item.badge }}</em>
        </button>
      </nav>
      <div class="support">
        <div class="support-icon"><Target :size="20" /></div>
        <div><b>需要帮助？</b><small>查看使用指南</small></div>
        <ChevronRight :size="16" />
      </div>
      <button type="button" class="collapse" @click="appStore.toggleCollapsed()">
        <ChevronLeft v-if="!collapsed" :size="18" />
        <ChevronRight v-else :size="18" />
      </button>
    </aside>

    <main>
      <header>
        <button type="button" class="icon-btn mobile-menu"><Menu :size="20" /></button>
        <div class="crumb">
          <span>运营中心</span><i>/</i><b>{{ pageTitle }}</b>
        </div>
        <div class="header-actions">
          <label class="global-search">
            <Search :size="17" />
            <input placeholder="搜索订单、会员..." />
          </label>
          <button type="button" class="icon-btn" @click="appStore.toggleDark()">
            <Sun v-if="dark" :size="19" />
            <Moon v-else :size="19" />
          </button>
          <div class="notice-wrap">
            <button
              type="button"
              class="icon-btn notification"
              :aria-expanded="noticeOpen"
              aria-label="待办通知"
              @click.stop="toggleNotice"
            >
              <Bell :size="19" />
              <i v-if="hasPending"></i>
            </button>
            <div v-if="noticeOpen" class="notice-menu">
              <p class="notice-title">待处理事项</p>
              <button
                v-for="item in noticeItems"
                :key="item.path"
                type="button"
                @click="openNoticeItem(item.path)"
              >
                <span>{{ item.label }}</span>
                <em>{{ item.count > 99 ? '99+' : item.count }}</em>
              </button>
              <p v-if="!noticeItems.length" class="notice-empty">暂无待办</p>
            </div>
          </div>
          <div class="profile-wrap">
            <button type="button" class="profile" @click.stop="toggleProfile">
              <span class="avatar">{{ avatarText }}</span>
              <div>
                <b>{{ displayName }}</b>
                <small>{{ roleText }}</small>
              </div>
              <ChevronDown :size="15" />
            </button>
            <div v-if="profileOpen" class="profile-menu">
              <button type="button" @click="handleLogout"><LogOut :size="15" />退出登录</button>
            </div>
          </div>
        </div>
      </header>

      <RouterView />
    </main>

    <ToastHost />
  </div>
</template>
