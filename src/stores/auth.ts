import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getCurrentUser, login as loginRequest, logout as logoutRequest } from '../api/auth'
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_KEY,
  clearStoredAuth,
  getStoredValue,
  storeAuthValue,
} from '../api/auth-storage'
import type { AuthUser, LoginForm } from '../types'

function loadInitialUser(): AuthUser | null {
  try {
    const raw = getStoredValue(USER_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(getStoredValue(ACCESS_TOKEN_KEY))
  const refreshToken = ref(getStoredValue(REFRESH_TOKEN_KEY))
  const user = ref<AuthUser | null>(loadInitialUser())
  const loading = ref(false)

  const isAuthenticated = computed(() => Boolean(accessToken.value))

  async function login(form: LoginForm): Promise<void> {
    loading.value = true
    try {
      const result = await loginRequest({
        channel: form.channel,
        identifier: form.identifier.trim(),
        credentialType: 'PASSWORD',
        credential: form.password,
      })
      const nextUser: AuthUser = {
        id: result.userId,
        displayName: `管理员 #${result.userId}`,
        roles: ['ADMIN'],
        avatar: '管',
      }
      accessToken.value = result.accessToken
      refreshToken.value = result.refreshToken
      user.value = nextUser
      storeAuthValue(ACCESS_TOKEN_KEY, result.accessToken, form.remember)
      storeAuthValue(REFRESH_TOKEN_KEY, result.refreshToken, form.remember)
      storeAuthValue(USER_KEY, JSON.stringify(nextUser), form.remember)
    } finally {
      loading.value = false
    }
  }

  async function hydrateUser(): Promise<void> {
    if (!accessToken.value) return
    const current = await getCurrentUser()
    const nextUser: AuthUser = {
      id: current.userId,
      displayName: `管理员 #${current.userId}`,
      roles: current.roles,
      avatar: '管',
    }
    user.value = nextUser
    const remember = Boolean(localStorage.getItem(ACCESS_TOKEN_KEY))
    storeAuthValue(USER_KEY, JSON.stringify(nextUser), remember)
  }

  async function logout(): Promise<void> {
    try {
      if (accessToken.value) await logoutRequest()
    } catch (error) {
      console.error('服务端退出失败，本地登录状态已清除', error)
    } finally {
      accessToken.value = ''
      refreshToken.value = ''
      user.value = null
      clearStoredAuth()
    }
  }

  return { accessToken, refreshToken, user, loading, isAuthenticated, login, hydrateUser, logout }
})

export { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY }
