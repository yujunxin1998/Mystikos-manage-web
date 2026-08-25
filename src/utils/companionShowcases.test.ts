import { describe, expect, it } from 'vitest'
import type { CompanionShowcase } from '../types'
import { sortShowcasesForReview } from './companionShowcases'

function row(
  partial: Partial<CompanionShowcase> & Pick<CompanionShowcase, 'id' | 'status'>,
): CompanionShowcase {
  return {
    userId: partial.userId || 1,
    ...partial,
  }
}

describe('sortShowcasesForReview', () => {
  it('待审优先，同状态按更新时间倒序', () => {
    const sorted = sortShowcasesForReview([
      row({ id: 1, status: 'APPROVED', updatedAt: '2026-08-25T12:00:00' }),
      row({ id: 2, status: 'PENDING_REVIEW', updatedAt: '2026-08-24T10:00:00' }),
      row({ id: 3, status: 'PENDING_REVIEW', updatedAt: '2026-08-25T11:00:00' }),
    ])
    expect(sorted.map((item) => item.id)).toEqual([3, 2, 1])
  })
})
