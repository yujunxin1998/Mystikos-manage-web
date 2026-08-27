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
  ScrollText,
  Search,
  ShoppingBag,
  Sparkles,
  Sun,
  UsersRound,
  Wallet,
} from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import ToastHost from '../components/ToastHost.vue'
import { useAppStore } from '../stores/app'
import { useAuthStore } from '../stores/auth'
import { useTodosStore } from '../stores/todos'
import { matchNavItems } from '../utils/navSearch'
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
const searchOpen = ref(false)
const mobileNavOpen = ref(false)
const globalKeyword = ref('')
const searchIndex = ref(0)
let pollTimer: ReturnType<typeof setInterval> | undefined

const roleText = computed(() => formatRoleLabels(user.value?.roles) || '未登录')
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
  { label: '操作日志', path: '/operation-logs', icon: ScrollText },
])

const pageTitle = computed(() => {
  const matched = nav.value.find((item) => item.path === route.path)
  if (matched) return matched.label
  return '总览'
})

const searchHits = computed(() => matchNavItems(nav.value, globalKeyword.value))

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

function closeMenus() {
  profileOpen.value = false
  noticeOpen.value = false
  searchOpen.value = false
}

function navigate(path: string) {
  closeMenus()
  mobileNavOpen.value = false
  void router.push(path)
}

function openSearch() {
  profileOpen.value = false
  noticeOpen.value = false
  searchOpen.value = true
  searchIndex.value = 0
}

function closeSearch() {
  searchOpen.value = false
  searchIndex.value = 0
}

function jumpToHit(path?: string) {
  const target = path ?? searchHits.value[searchIndex.value]?.path ?? searchHits.value[0]?.path
  if (!target) return
  globalKeyword.value = ''
  navigate(target)
}

function onSearchKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (!searchHits.value.length) return
    searchIndex.value = (searchIndex.value + 1) % searchHits.value.length
    return
  }
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    if (!searchHits.value.length) return
    searchIndex.value = (searchIndex.value - 1 + searchHits.value.length) % searchHits.value.length
    return
  }
  if (event.key === 'Enter') {
    event.preventDefault()
    jumpToHit()
  }
}

watch(searchHits, () => {
  searchIndex.value = 0
})

function toggleProfile() {
  noticeOpen.value = false
  searchOpen.value = false
  profileOpen.value = !profileOpen.value
}

function toggleNotice() {
  profileOpen.value = false
  searchOpen.value = false
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
  if (!target?.closest('.global-search')) closeSearch()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape') return
  closeMenus()
  mobileNavOpen.value = false
}

async function handleLogout() {
  closeMenus()
  mobileNavOpen.value = false
  try {
    await authStore.logout()
    todosStore.reset()
    await router.replace('/login')
  } catch (error) {
    console.error('退出登录失败', error)
    await router.replace('/login')
  }
}

watch(
  () => route.path,
  (path, previous) => {
    closeMenus()
    mobileNavOpen.value = false
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
  document.addEventListener('keydown', onKeydown)
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
  document.removeEventListener('keydown', onKeydown)
  if (pollTimer) clearInterval(pollTimer)
})
</script>

<template>
  <div class="app" :class="{ dark, collapsed, 'mobile-open': mobileNavOpen }">
    <button
      v-if="mobileNavOpen"
      type="button"
      class="sidebar-backdrop"
      aria-label="关闭导航"
      @click="mobileNavOpen = false"
    />
    <aside class="sidebar">
      <div class="brand">
        <span class="brand-mark"><Sparkles :size="19" /></span>
        <strong>MYSTIKOS</strong>
      </div>
      <p class="workspace"><span>运营中心</span></p>
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
      <button
        type="button"
        class="collapse"
        :aria-label="collapsed ? '展开侧边栏' : '收起侧边栏'"
        @click="appStore.toggleCollapsed()"
      >
        <ChevronLeft v-if="!collapsed" :size="18" />
        <ChevronRight v-else :size="18" />
      </button>
    </aside>

    <main>
      <header>
        <button
          type="button"
          class="icon-btn mobile-menu"
          :aria-expanded="mobileNavOpen"
          aria-label="打开导航"
          @click="mobileNavOpen = !mobileNavOpen"
        >
          <Menu :size="20" />
        </button>
        <div class="crumb">
          <span>运营中心</span><i>/</i><b>{{ pageTitle }}</b>
        </div>
        <div class="header-actions">
          <div class="global-search" @click.stop>
            <Search :size="17" />
            <input
              v-model="globalKeyword"
              placeholder="跳转到页面"
              aria-label="跳转到页面"
              autocomplete="off"
              @focus="openSearch"
              @keydown="onSearchKeydown"
            />
            <div v-if="searchOpen" class="search-suggest" role="listbox">
              <button
                v-for="(item, index) in searchHits"
                :key="item.path"
                type="button"
                role="option"
                :class="{ active: index === searchIndex }"
                :aria-selected="index === searchIndex"
                @mousedown.prevent="jumpToHit(item.path)"
              >
                <component :is="item.icon" :size="16" />
                <span>{{ item.label }}</span>
              </button>
              <p v-if="!searchHits.length" class="search-empty">没有匹配的页面</p>
            </div>
          </div>
          <button
            type="button"
            class="icon-btn"
            :aria-label="dark ? '切换浅色模式' : '切换深色模式'"
            @click="appStore.toggleDark()"
          >
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
            <button
              type="button"
              class="profile"
              :aria-expanded="profileOpen"
              aria-label="账户菜单"
              @click.stop="toggleProfile"
            >
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
