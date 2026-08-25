/** 列表默认每页条数 */
export const DEFAULT_PAGE_SIZE = 10

/** 可选每页条数 */
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const

export function pageRange(page: number, pageSize: number, total: number) {
  if (!total) return { start: 0, end: 0 }
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)
  return { start, end }
}
