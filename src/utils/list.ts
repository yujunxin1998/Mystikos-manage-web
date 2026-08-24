import type { ColumnDef, RowRecord } from '../types'

/** 按关键词过滤行数据 */
export function filterByKeyword<T extends RowRecord>(rows: T[], keyword: string): T[] {
  const query = keyword.trim().toLowerCase()
  if (!query) return rows
  return rows.filter((row) => Object.values(row).some((value) => value.toLowerCase().includes(query)))
}

/** 按状态过滤行数据 */
export function filterByStatus<T extends RowRecord>(rows: T[], status: string, allLabel = '全部状态'): T[] {
  if (status === allLabel) return rows
  return rows.filter((row) => row.status === status)
}

/** 提取状态选项 */
export function collectStatusOptions<T extends RowRecord>(rows: T[]): string[] {
  return [...new Set(rows.map((row) => row.status).filter(Boolean))]
}

/** 生成记录主键 */
export function recordKey(row: RowRecord): string {
  return row.id || row.image || Object.values(row)[0] || ''
}

/** 导出 CSV（带 UTF-8 BOM） */
export function exportCsv(filename: string, columns: ColumnDef[], rows: RowRecord[]): void {
  try {
    const header = columns.map((col) => col.label)
    const body = rows.map((row) =>
      columns.map((col) => `"${(row[col.key] || '').replace(/"/g, '""')}"`).join(','),
    )
    const blob = new Blob([`\ufeff${[header.join(','), ...body].join('\n')}`], {
      type: 'text/csv;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('导出 CSV 失败', error)
    throw error
  }
}
