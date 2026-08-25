import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getCurrentUser, login as loginRequest, logout as logoutRequest } from '../api/auth'
import { fetchMyProfile } from '../api/profile'
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, useAuthStore } from './auth'

vi.mock('../api/auth', () => ({
  login: vi.fn(),
  logout: vi.fn(),
  getCurrentUser: vi.fn(),
  refreshAccessToken: vi.fn(),
}))

vi.mock('../api/profile', () => ({
  fetchMyProfile: vi.fn(),
}))

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    sessionStorage.clear()
    vi.clearAllMocks()
  })

  it('登录后拉取当前用户资料并展示昵称', async () => {
    vi.mocked(loginRequest).mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      userId: 42,
    })
    vi.mocked(getCurrentUser).mockResolvedValue({
      userId: 42,
      roles: ['ADMIN'],
      status: 'ACTIVE',
    })
    vi.mocked(fetchMyProfile).mockResolvedValue({
      userId: 42,
      nickname: '夜航星',
      phone: '13800138000',
      email: 'admin@mystikos.local',
      roles: ['ADMIN'],
      status: 'ACTIVE',
    })
    const authStore = useAuthStore()

    await authStore.login({
      channel: 'PHONE',
      identifier: '13800138000',
      password: 'secret123',
      remember: true,
    })

    expect(authStore.isAuthenticated).toBe(true)
    expect(authStore.user?.id).toBe(42)
    expect(authStore.user?.displayName).toBe('夜航星')
    expect(authStore.user?.avatar).toBe('夜')
    expect(authStore.user?.roles).toEqual(['ADMIN'])
    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBe('access-token')
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBe('refresh-token')
  })

  it('退出时调用服务端并始终清除本地认证状态', async () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, 'access-token')
    localStorage.setItem(REFRESH_TOKEN_KEY, 'refresh-token')
    vi.mocked(logoutRequest).mockRejectedValue(new Error('offline'))
    const authStore = useAuthStore()

    await authStore.logout()

    expect(authStore.isAuthenticated).toBe(false)
    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull()
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull()
  })
})
