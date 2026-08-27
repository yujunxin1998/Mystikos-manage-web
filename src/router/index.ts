import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import AdminLayout from '../layouts/AdminLayout.vue'
import { useAuthStore } from '../stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/login/LoginView.vue'),
    meta: { title: '登录', public: true },
  },
  {
    path: '/',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('../views/dashboard/DashboardView.vue'),
        meta: { title: '总览', requiresAuth: true },
      },
      {
        path: 'members',
        name: 'members',
        component: () => import('../views/members/MembersView.vue'),
        meta: { title: '用户管理', requiresAuth: true },
      },
      {
        path: 'orders',
        name: 'orders',
        component: () => import('../views/orders/OrdersView.vue'),
        meta: { title: '订单管理', requiresAuth: true },
      },
      {
        path: 'workers',
        name: 'workers',
        component: () => import('../views/workers/WorkersView.vue'),
        meta: { title: '陪玩师管理', requiresAuth: true },
      },
      {
        path: 'companion-applications',
        name: 'companion-applications',
        component: () => import('../views/companion-applications/CompanionApplicationsView.vue'),
        meta: { title: '陪玩申请', requiresAuth: true },
      },
      {
        path: 'companion-showcases',
        name: 'companion-showcases',
        component: () => import('../views/companion-showcases/CompanionShowcasesView.vue'),
        meta: { title: '陪玩名片审核', requiresAuth: true },
      },
      {
        path: 'products',
        name: 'products',
        component: () => import('../views/products/ProductsView.vue'),
        meta: { title: '商品管理', requiresAuth: true },
      },
      {
        path: 'finance',
        name: 'finance',
        component: () => import('../views/finance/FinanceView.vue'),
        meta: { title: '财务中心', requiresAuth: true },
      },
      {
        path: 'reports',
        name: 'reports',
        component: () => import('../views/reports/ReportsView.vue'),
        meta: { title: '数据报表', requiresAuth: true },
      },
      {
        path: 'operation-logs',
        name: 'operation-logs',
        component: () => import('../views/operation-logs/OperationLogsView.vue'),
        meta: { title: '操作日志', requiresAuth: true },
      },
      {
        path: 'settings',
        redirect: '/',
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  const authStore = useAuthStore()
  const isPublic = to.meta.public === true
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  if (requiresAuth && !authStore.isAuthenticated) {
    return {
      path: '/login',
      query: to.fullPath !== '/' ? { redirect: to.fullPath } : undefined,
    }
  }

  if (isPublic && authStore.isAuthenticated && to.path === '/login') {
    return { path: '/' }
  }

  return true
})

router.afterEach((to) => {
  const pageTitle = typeof to.meta.title === 'string' ? to.meta.title : '运营中心'
  const appTitle = import.meta.env.VITE_APP_TITLE || 'Mystikos 运营中心'
  document.title = `${pageTitle} · ${appTitle}`
})

export default router
