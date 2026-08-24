import { describe, expect, it } from 'vitest'
import { unwrapApiResponse } from './response'

describe('unwrapApiResponse', () => {
  it('返回成功响应中的 data', () => {
    expect(unwrapApiResponse({ code: 200, message: 'ok', data: { userId: 7 } })).toEqual({
      userId: 7,
    })
  })

  it('业务状态码失败时抛出服务端消息', () => {
    expect(() => unwrapApiResponse({ code: 403, message: '没有权限', data: null })).toThrow(
      '没有权限',
    )
  })
})
