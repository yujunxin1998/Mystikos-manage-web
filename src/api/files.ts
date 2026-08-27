import type { ApiResponse, UploadResult } from '../types'
import http from './http'
import { unwrapApiResponse } from './response'

export async function uploadFile(file: File): Promise<UploadResult> {
  const form = new FormData()
  form.append('file', file)
  // 不显式设置 Content-Type，交给浏览器为 FormData 自动带上 multipart/form-data 与 boundary
  const { data } = await http.post<ApiResponse<UploadResult>>('/api/v1/files/upload', form)
  return unwrapApiResponse(data)
}

export async function getFileUrl(objectKey: string): Promise<string> {
  const { data } = await http.get<ApiResponse<string>>('/api/v1/files/url', {
    params: { objectKey },
  })
  return unwrapApiResponse(data)
}

export async function deleteFile(objectKey: string): Promise<void> {
  const { data } = await http.delete<ApiResponse<null>>('/api/v1/files', {
    params: { objectKey },
  })
  unwrapApiResponse(data)
}
