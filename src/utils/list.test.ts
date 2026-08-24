import { describe, expect, it } from 'vitest'
import type { RowRecord } from '../types'
import { collectStatusOptions, filterByKeyword, filterByStatus, recordKey } from './list'

const sampleRows: RowRecord[] = [
  { id: '1', name: 'Alpha', status: '正常' },
  { id: '2', name: 'Beta', status: '已停用' },
]

describe('list utils', () => {
  it('按关键词过滤', () => {
    expect(filterByKeyword(sampleRows, 'alpha')).toHaveLength(1)
    expect(filterByKeyword(sampleRows, '')).toHaveLength(2)
  })

  it('按状态过滤', () => {
    expect(filterByStatus(sampleRows, '正常')).toHaveLength(1)
    expect(filterByStatus(sampleRows, '全部状态')).toHaveLength(2)
  })

  it('提取状态选项', () => {
    expect(collectStatusOptions(sampleRows)).toEqual(['正常', '已停用'])
  })

  it('生成记录主键', () => {
    expect(recordKey({ id: 'abc', name: '测试' })).toBe('abc')
    expect(recordKey({ name: '测试' })).toBe('测试')
  })
})
