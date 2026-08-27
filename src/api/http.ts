import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { ApiResponse, AuthTokenResponse } from '../types'
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  clearStoredAuth,
  getStoredValue,
  storeAuthValue,
} from './auth-storage'
import { unwrapApiResponse } from './response'

const baseURL = import.meta.env.VITE_API_BASE_URL || ''

const http = axios.create({
  baseURL,
  timeout: 15000,
})

http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    try {
      const token = getStoredValue(ACCESS_TOKEN_KEY)
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (error) {
      console.error('读取认证令牌失败', error)
    }
    return config
  },
  (error: AxiosError) => Promise.reject(error),
)

let refreshPromise: Promise<string> | null = null

async function renewAccessToken(): Promise<string> {
  const refreshToken = getStoredValue(REFRESH_TOKEN_KEY)
  if (!refreshToken) throw new Error('登录状态已过期')
  const { data } = await axios.post<ApiResponse<AuthTokenResponse>>(
    `${baseURL}/api/v1/auth/refresh-token`,
    { refreshToken },
  )
  const token = unwrapApiResponse(data).accessToken
  const remember = Boolean(localStorage.getItem(REFRESH_TOKEN_KEY))
  storeAuthValue(ACCESS_TOKEN_KEY, token, remember)
  return token
}

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string }>) => {
    const request = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined
    if (error.response?.status === 401 && request && !request._retry) {
      request._retry = true
      try {
        refreshPromise ||= renewAccessToken()
        const token = await refreshPromise
        request.headers.Authorization = `Bearer ${token}`
        return await http(request)
      } catch {
        clearStoredAuth()
        window.dispatchEvent(new Event('auth:expired'))
      } finally {
        refreshPromise = null
      }
    }
    const message = error.response?.data?.message || error.message || '网络请求失败'
    console.error('接口请求异常', message)
    return Promise.reject(new Error(message))
  },
)

export default http
