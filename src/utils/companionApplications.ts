import type { CompanionApplicationStatus, CompanionIdentityApplication } from '../types'

const APPLICATION_STATUS_PRIORITY: Record<CompanionApplicationStatus, number> = {
  SUBMITTED: 0,
  IN_ASSESSMENT: 1,
  APPROVED: 2,
  REJECTED: 3,
}

/** 待处理申请优先，同优先级按提交时间倒序，保证新申请更靠前 */
export function sortApplicationsForReview(
  rows: CompanionIdentityApplication[],
): CompanionIdentityApplication[] {
  return [...rows].sort((left, right) => {
    const priorityDiff =
      (APPLICATION_STATUS_PRIORITY[left.status] ?? 9) -
      (APPLICATION_STATUS_PRIORITY[right.status] ?? 9)
    if (priorityDiff !== 0) return priorityDiff
    const leftTime = left.createdAt ? Date.parse(left.createdAt) : 0
    const rightTime = right.createdAt ? Date.parse(right.createdAt) : 0
    return rightTime - leftTime
  })
}
