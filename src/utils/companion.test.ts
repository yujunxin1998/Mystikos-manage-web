import { describe, expect, it } from 'vitest'
import { parseCompanionTagIds } from './companion'

describe('parseCompanionTagIds', () => {
  it('转换逗号分隔标签并忽略非法值和重复值', () => {
    expect(parseCompanionTagIds('1, 7，7, abc, 0, -2, 12')).toEqual([1, 7, 12])
  })

  it('空文本返回空数组', () => {
    expect(parseCompanionTagIds('')).toEqual([])
  })
})
