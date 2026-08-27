import { describe, expect, it } from 'vitest'
import { avatarInitial, formatRoleLabels, resolveDisplayName } from './roles'

describe('roles helpers', () => {
  it('优先使用昵称作为展示名', () => {
    expect(
      resolveDisplayName({
        userId: 1,
        nickname: '浅眠',
        phone: '13800138000',
        email: 'a@b.com',
      }),
    ).toBe('浅眠')
  })

  it('格式化角色中文标签', () => {
    expect(formatRoleLabels(['ADMIN', 'ASSESSOR'])).toBe('管理员 / 考核员')
    expect(formatRoleLabels(['GUEST'])).toBe('访客')
    expect(formatRoleLabels([])).toBe('')
    expect(formatRoleLabels(null)).toBe('')
  })

  it('取展示名首字作为头像字', () => {
    expect(avatarInitial('夜航星')).toBe('夜')
  })
})
