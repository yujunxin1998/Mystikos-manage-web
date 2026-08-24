import type {
  ApiResponse,
  CreateUserRequest,
  PageResult,
  UserProfile,
  UserQuery,
  UserRole,
} from '../types'
import http from './http'
import { unwrapApiResponse } from './response'

function compact<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== '' && item !== undefined),
  ) as Partial<T>
}

export async function fetchUsers(query: UserQuery): Promise<PageResult<UserProfile>> {
  const { data } = await http.get<ApiResponse<PageResult<UserProfile>>>('/api/v1/manage/users', {
    params: compact(query),
  })
  return unwrapApiResponse(data)
}

export async function createUser(request: CreateUserRequest): Promise<UserProfile> {
  const { data } = await http.post<ApiResponse<UserProfile>>(
    '/api/v1/manage/users',
    compact(request),
  )
  return unwrapApiResponse(data)
}

export async function deleteUser(userId: number): Promise<void> {
  const { data } = await http.delete<ApiResponse<null>>(`/api/v1/manage/users/${userId}`)
  unwrapApiResponse(data)
}

export async function banUser(userId: number): Promise<void> {
  const { data } = await http.post<ApiResponse<null>>(`/api/v1/manage/users/${userId}/ban`)
  unwrapApiResponse(data)
}

export async function addUserRole(userId: number, role: UserRole): Promise<void> {
  const { data } = await http.post<ApiResponse<null>>(
    `/api/v1/manage/users/${userId}/roles/${role}`,
  )
  unwrapApiResponse(data)
}

export async function removeUserRole(userId: number, role: UserRole): Promise<void> {
  const { data } = await http.delete<ApiResponse<null>>(
    `/api/v1/manage/users/${userId}/roles/${role}`,
  )
  unwrapApiResponse(data)
}

export async function fetchUserPermissions(userId: number): Promise<string[]> {
  const { data } = await http.get<ApiResponse<string[]>>(
    `/api/v1/manage/users/${userId}/permissions`,
  )
  return unwrapApiResponse(data)
}
