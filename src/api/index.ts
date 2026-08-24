import http from './http'
import type { RowRecord } from '../types'

/** 预留业务列表接口封装，当前仍由页面使用本地模拟数据 */
export async function fetchModuleList(module: string): Promise<RowRecord[]> {
  try {
    const { data } = await http.get<RowRecord[]>(`/${module}`)
    return data
  } catch (error) {
    console.error(`获取 ${module} 列表失败`, error)
    throw error
  }
}

export { http }
