import type { CompanionShowcase, CompanionShowcaseStatus } from '../types'

const SHOWCASE_STATUS_PRIORITY: Record<CompanionShowcaseStatus, number> = {
  PENDING_REVIEW: 0,
  REJECTED: 1,
  APPROVED: 2,
  DRAFT: 3,
}

/** 待审名片优先，同状态按更新时间倒序 */
export function sortShowcasesForReview(rows: CompanionShowcase[]): CompanionShowcase[] {
  return [...rows].sort((left, right) => {
    const priorityDiff =
      (SHOWCASE_STATUS_PRIORITY[left.status] ?? 9) - (SHOWCASE_STATUS_PRIORITY[right.status] ?? 9)
    if (priorityDiff !== 0) return priorityDiff
    const leftTime = Date.parse(left.updatedAt || left.createdAt || '') || 0
    const rightTime = Date.parse(right.updatedAt || right.createdAt || '') || 0
    return rightTime - leftTime
  })
}
