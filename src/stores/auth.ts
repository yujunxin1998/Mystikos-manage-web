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
import { fetchMyProfile } from '../api/profile'
import type { AuthUser, LoginForm, UserProfile, UserRole } from '../types'
import { avatarInitial, resolveDisplayName } from '../utils/roles'

function loadInitialUser(): AuthUser | null {
  try {
    const raw = getStoredValue(USER_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

function buildAuthUser(
  userId: number,
  roles: UserRole[],
  profile: Pick<UserProfile, 'nickname' | 'phone' | 'email' | 'avatarUrl'> | null,
): AuthUser {
  const displayName = resolveDisplayName({
    userId,
    nickname: profile?.nickname,
    phone: profile?.phone,
    email: profile?.email,
  })
  return {
    id: userId,
    displayName,
    roles,
    avatar: avatarInitial(displayName),
    nickname: profile?.nickname?.trim() || undefined,
    phone: profile?.phone || undefined,
    email: profile?.email || undefined,
    avatarUrl: profile?.avatarUrl || undefined,
  }
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(getStoredValue(ACCESS_TOKEN_KEY))
  const refreshToken = ref(getStoredValue(REFRESH_TOKEN_KEY))
  const user = ref<AuthUser | null>(loadInitialUser())
  const loading = ref(false)

  const isAuthenticated = computed(() => Boolean(accessToken.value))

  function persistUser(nextUser: AuthUser, remember: boolean) {
    user.value = nextUser
    storeAuthValue(USER_KEY, JSON.stringify(nextUser), remember)
  }

  async function hydrateUser(): Promise<void> {
    if (!accessToken.value) return
    const remember = Boolean(localStorage.getItem(ACCESS_TOKEN_KEY))
    const current = await getCurrentUser()
    let profile: UserProfile | null = null
    try {
      profile = await fetchMyProfile()
    } catch (error) {
      console.warn('读取个人资料失败，将使用账号标识展示', error)
    }
    persistUser(buildAuthUser(current.userId, current.roles, profile), remember)
  }

  async function login(form: LoginForm): Promise<void> {
    loading.value = true
    try {
      const result = await loginRequest({
        channel: form.channel,
        identifier: form.identifier.trim(),
        credentialType: 'PASSWORD',
        credential: form.password,
      })
      accessToken.value = result.accessToken
      refreshToken.value = result.refreshToken
      storeAuthValue(ACCESS_TOKEN_KEY, result.accessToken, form.remember)
      storeAuthValue(REFRESH_TOKEN_KEY, result.refreshToken, form.remember)
      // 先写入占位信息，再拉取 /auth/me + /profile/me
      persistUser(
        buildAuthUser(result.userId, ['ADMIN'], {
          nickname: form.identifier.trim(),
          phone: form.channel === 'PHONE' ? form.identifier.trim() : undefined,
          email: form.channel === 'EMAIL' ? form.identifier.trim() : undefined,
          avatarUrl: undefined,
        }),
        form.remember,
      )
      await hydrateUser()
    } finally {
      loading.value = false
    }
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
