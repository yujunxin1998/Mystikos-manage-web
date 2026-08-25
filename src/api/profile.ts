import type { ApiResponse, UserProfile } from '../types'
import http from './http'
import { unwrapApiResponse } from './response'

/** 当前登录用户资料（昵称、头像等），与 /auth/me 角色信息互补 */
export async function fetchMyProfile(): Promise<UserProfile> {
  const { data } = await http.get<ApiResponse<UserProfile>>('/api/v1/profile/me')
  return unwrapApiResponse(data)
}
