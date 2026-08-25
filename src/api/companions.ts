import type {
  ApiResponse,
  Companion,
  CompanionApplicationQuery,
  CompanionIdentityApplication,
  CompanionQuery,
  CompanionShowcase,
  CompanionShowcaseQuery,
  CompanionStats,
  CreateCompanionRequest,
  PageResult,
  ReviewCompanionApplicationRequest,
  ReviewCompanionShowcaseRequest,
} from '../types'
import http from './http'
import { unwrapApiResponse } from './response'

function compact<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== '' && item !== undefined),
  ) as Partial<T>
}

export async function fetchCompanions(query: CompanionQuery): Promise<PageResult<Companion>> {
  const { data } = await http.get<ApiResponse<PageResult<Companion>>>('/api/v1/manage/companions', {
    params: compact(query),
  })
  return unwrapApiResponse(data)
}

export async function createCompanion(request: CreateCompanionRequest): Promise<void> {
  const { data } = await http.post<ApiResponse<null>>('/api/v1/manage/companions', compact(request))
  unwrapApiResponse(data)
}

export async function deleteCompanion(userId: number): Promise<void> {
  const { data } = await http.delete<ApiResponse<null>>(`/api/v1/manage/companions/${userId}`)
  unwrapApiResponse(data)
}

export async function fetchCompanionStats(): Promise<CompanionStats> {
  const { data } = await http.get<ApiResponse<CompanionStats>>('/api/v1/manage/companions/stats')
  return unwrapApiResponse(data)
}

export async function fetchCompanionApplications(
  query: CompanionApplicationQuery,
): Promise<PageResult<CompanionIdentityApplication>> {
  const { data } = await http.get<ApiResponse<PageResult<CompanionIdentityApplication>>>(
    '/api/v1/manage/companion-applications',
    { params: compact(query) },
  )
  return unwrapApiResponse(data)
}

export async function startCompanionAssessment(id: number): Promise<void> {
  const { data } = await http.put<ApiResponse<null>>(
    `/api/v1/manage/companion-applications/${id}/start-assessment`,
  )
  unwrapApiResponse(data)
}

export async function reviewCompanionApplication(
  id: number,
  request: ReviewCompanionApplicationRequest,
): Promise<void> {
  const { data } = await http.put<ApiResponse<null>>(
    `/api/v1/manage/companion-applications/${id}/review`,
    compact(request),
  )
  unwrapApiResponse(data)
}

export async function fetchCompanionShowcases(
  query: CompanionShowcaseQuery,
): Promise<PageResult<CompanionShowcase>> {
  const { data } = await http.get<ApiResponse<PageResult<CompanionShowcase>>>(
    '/api/v1/manage/companion-showcases',
    { params: compact(query) },
  )
  return unwrapApiResponse(data)
}

export async function reviewCompanionShowcase(
  revisionId: number,
  request: ReviewCompanionShowcaseRequest,
): Promise<void> {
  const { data } = await http.put<ApiResponse<null>>(
    `/api/v1/manage/companion-showcases/${revisionId}/review`,
    compact(request),
  )
  unwrapApiResponse(data)
}
