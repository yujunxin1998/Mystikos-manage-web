import type { ApiResponse, AuthTokenResponse, CurrentUserResponse, LoginRequest } from '../types'
import http from './http'
import { unwrapApiResponse } from './response'

export async function login(request: LoginRequest): Promise<AuthTokenResponse> {
  const { data } = await http.post<ApiResponse<AuthTokenResponse>>('/api/v1/auth/login', request)
  return unwrapApiResponse(data)
}

export async function getCurrentUser(): Promise<CurrentUserResponse> {
  const { data } = await http.get<ApiResponse<CurrentUserResponse>>('/api/v1/auth/me')
  return unwrapApiResponse(data)
}

export async function refreshAccessToken(refreshToken: string): Promise<AuthTokenResponse> {
  const { data } = await http.post<ApiResponse<AuthTokenResponse>>('/api/v1/auth/refresh-token', {
    refreshToken,
  })
  return unwrapApiResponse(data)
}

export async function logout(accessToken?: string): Promise<void> {
  const { data } = await http.post<ApiResponse<null>>(
    '/api/v1/auth/logout',
    null,
    accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
  )
  unwrapApiResponse(data)
}
