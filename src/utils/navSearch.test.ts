import { describe, expect, it } from 'vitest'
import { matchNavItems } from './navSearch'

const nav = [
  { label: '总览', path: '/' },
  { label: '用户管理', path: '/members' },
  { label: '订单管理', path: '/orders' },
  { label: '陪玩申请', path: '/companion-applications' },
]

describe('matchNavItems', () => {
  it('returns all items when the query is empty', () => {
    expect(matchNavItems(nav, '  ')).toEqual(nav)
  })

  it('matches Chinese labels and path fragments', () => {
    expect(matchNavItems(nav, '用户').map((item) => item.path)).toEqual(['/members'])
    expect(matchNavItems(nav, 'order').map((item) => item.path)).toEqual(['/orders'])
    expect(matchNavItems(nav, '申请').map((item) => item.path)).toEqual(['/companion-applications'])
  })
})
