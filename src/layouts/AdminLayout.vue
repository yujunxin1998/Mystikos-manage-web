<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
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
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
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
import { formatRoleLabels } from '../utils/roles'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()
const { dark, collapsed } = storeToRefs(appStore)
const { user } = storeToRefs(authStore)
const profileOpen = ref(false)

const roleText = computed(() => formatRoleLabels(user.value?.roles))
const avatarText = computed(() => user.value?.avatar || '管')
const displayName = computed(() => user.value?.displayName || '未登录')

const nav = [
  { label: '工作台', path: '/', icon: LayoutDashboard },
  { label: '用户管理', path: '/members', icon: UsersRound },
  { label: '订单管理', path: '/orders', icon: Gamepad2, badge: '12' },
  { label: '陪玩师管理', path: '/workers', icon: Headphones },
  { label: '身份申请审核', path: '/companion-applications', icon: ClipboardCheck },
  { label: '商品管理', path: '/products', icon: ShoppingBag, badge: '6' },
  { label: '财务中心', path: '/finance', icon: Wallet },
  { label: '数据报表', path: '/reports', icon: FileBarChart },
]

const pageTitle = computed(() => {
  const matched = nav.find((item) => item.path === route.path)
  if (matched) return matched.label
  if (route.path === '/settings') return '系统设置'
  return '工作台'
})

function isActive(path: string): boolean {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

function navigate(path: string) {
  router.push(path)
}

function toggleProfile() {
  profileOpen.value = !profileOpen.value
}

function closeProfile(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  if (!target?.closest('.profile-wrap')) {
    profileOpen.value = false
  }
}

async function handleLogout() {
  try {
    authStore.logout()
    profileOpen.value = false
    await router.replace('/login')
  } catch (error) {
    console.error('退出登录失败', error)
  }
}

onMounted(() => {
  document.addEventListener('click', closeProfile)
  authStore.hydrateUser().catch(async () => {
    await authStore.logout()
    await router.replace('/login')
  })
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeProfile)
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
        <p class="nav-title lower">系统</p>
        <button
          type="button"
          :class="{ active: route.path === '/settings' }"
          @click="navigate('/settings')"
        >
          <Settings :size="19" /><span>系统设置</span>
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
            <kbd>⌘ K</kbd>
          </label>
          <button type="button" class="icon-btn" @click="appStore.toggleDark()">
            <Sun v-if="dark" :size="19" />
            <Moon v-else :size="19" />
          </button>
          <button type="button" class="icon-btn notification"><Bell :size="19" /><i></i></button>
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
