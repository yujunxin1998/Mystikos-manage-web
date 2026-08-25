import { describe, expect, it } from 'vitest'
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS, pageRange } from './pagination'

describe('pagination helpers', () => {
  it('默认每页 10 条，并提供可选条数', () => {
    expect(DEFAULT_PAGE_SIZE).toBe(10)
    expect([...PAGE_SIZE_OPTIONS]).toEqual([10, 20, 50, 100])
  })

  it('计算当前页显示区间', () => {
    expect(pageRange(1, 10, 17)).toEqual({ start: 1, end: 10 })
    expect(pageRange(2, 10, 17)).toEqual({ start: 11, end: 17 })
    expect(pageRange(1, 10, 0)).toEqual({ start: 0, end: 0 })
  })
})
