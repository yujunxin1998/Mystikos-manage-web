import { describe, expect, it } from 'vitest'
import type { CompanionIdentityApplication } from '../types'
import { sortApplicationsForReview } from './companionApplications'

function row(
  partial: Partial<CompanionIdentityApplication> & Pick<CompanionIdentityApplication, 'id' | 'status'>,
): CompanionIdentityApplication {
  return {
    userId: partial.userId || 1,
    realName: '测试',
    gameNickname: 'nick',
    tags: [],
    ...partial,
  }
}

describe('sortApplicationsForReview', () => {
  it('待考核与考核中排在已处理之前，同状态按时间倒序', () => {
    const sorted = sortApplicationsForReview([
      row({ id: 1, status: 'APPROVED', createdAt: '2026-08-25T10:00:00' }),
      row({ id: 2, status: 'SUBMITTED', createdAt: '2026-08-24T10:00:00' }),
      row({ id: 3, status: 'SUBMITTED', createdAt: '2026-08-25T12:00:00' }),
      row({ id: 4, status: 'IN_ASSESSMENT', createdAt: '2026-08-25T11:00:00' }),
    ])

    expect(sorted.map((item) => item.id)).toEqual([3, 2, 4, 1])
  })
})
