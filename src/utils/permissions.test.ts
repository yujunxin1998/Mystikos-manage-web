import { describe, expect, it } from 'vitest'
import { hasPermissionCode } from './permissions'

describe('hasPermissionCode', () => {
  it('匹配服务端权限编码及常见别名', () => {
    expect(hasPermissionCode(['user.create'], 'user.create')).toBe(true)
    expect(hasPermissionCode(['USER_BAN'], 'user.ban')).toBe(true)
    expect(hasPermissionCode(['users:role'], 'user.role')).toBe(true)
    expect(hasPermissionCode(['user.permission'], 'user.delete')).toBe(false)
  })

  it('通配与空列表', () => {
    expect(hasPermissionCode(['user.*'], 'user.delete')).toBe(true)
    expect(hasPermissionCode(['*'], 'user.create')).toBe(true)
    expect(hasPermissionCode([], 'user.create')).toBe(false)
    expect(hasPermissionCode(undefined, 'user.create')).toBe(false)
  })
})
