import type { TagView } from './worker'

export type CompanionApplicationStatus = 'SUBMITTED' | 'IN_ASSESSMENT' | 'APPROVED' | 'REJECTED'

export type CompanionReviewResult = 'PASS' | 'FAIL'

export interface CompanionIdentityApplication {
  id: number
  userId: number
  applicantNickname?: string
  applicantPhone?: string
  applicantEmail?: string
  realName: string
  gender?: 'MALE' | 'FEMALE' | 'UNDISCLOSED'
  birthDate?: string
  selfIntro?: string
  gameNickname: string
  gameRankProofUrl?: string
  tags: TagView[]
  contactCountryCode?: string
  contactPhone?: string
  contactEmail?: string
  status: CompanionApplicationStatus
  reviewerId?: number
  reviewerNickname?: string
  reviewResult?: CompanionReviewResult
  reviewComment?: string
  reviewedAt?: string
  createdAt?: string
}

export interface CompanionApplicationQuery {
  pageNum: number
  pageSize: number
  status?: CompanionApplicationStatus
  createdFrom?: string
  createdTo?: string
  keyword?: string
}

export interface ReviewCompanionApplicationRequest {
  reviewerId: number
  result: CompanionReviewResult
  comment?: string
}
