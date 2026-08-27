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
import { fetchUserPermissions } from '../api/users'
import type { AuthUser, LoginForm, UserProfile, UserRole } from '../types'
import { hasPermissionCode, type UserActionPermission } from '../utils/permissions'
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
  const permissions = ref<string[]>([])
  const loading = ref(false)

  const isAuthenticated = computed(() => Boolean(accessToken.value))
  const isAdmin = computed(() => user.value?.roles.includes('ADMIN') === true)

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
    try {
      permissions.value = await fetchUserPermissions(current.userId)
    } catch (error) {
      permissions.value = []
      console.warn('读取当前用户权限失败，将按角色回退操作权限', error)
    }
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

  function clearSession(): void {
    accessToken.value = ''
    refreshToken.value = ''
    user.value = null
    permissions.value = []
    clearStoredAuth()
  }

  async function logout(): Promise<void> {
    // 先清本地态，避免路由守卫因仍“已登录”拦回后台，界面也不应短暂显示访客
    const token = accessToken.value || getStoredValue(ACCESS_TOKEN_KEY)
    clearSession()
    if (!token) return
    try {
      await logoutRequest(token)
    } catch (error) {
      console.error('服务端退出失败，本地登录状态已清除', error)
    }
  }

  function can(permission: UserActionPermission): boolean {
    if (hasPermissionCode(permissions.value, permission)) return true
    return !permissions.value.length && isAdmin.value
  }

  return {
    accessToken,
    refreshToken,
    user,
    permissions,
    loading,
    isAuthenticated,
    isAdmin,
    can,
    login,
    hydrateUser,
    clearSession,
    logout,
  }
})

export { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY }
