import type { TagView } from './worker'

export type CompanionShowcaseStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED'

export interface CompanionShowcase {
  id: number
  userId: number
  applicantNickname?: string
  applicantPhone?: string
  applicantEmail?: string
  status: CompanionShowcaseStatus
  bio?: string
  tagline?: string
  availability?: string
  coverUrl?: string
  coverObjectKey?: string
  tags?: TagView[]
  photoUrls?: string[]
  videoUrls?: string[]
  audioUrls?: string[]
  photoObjectKeys?: string[]
  videoObjectKeys?: string[]
  audioObjectKeys?: string[]
  reviewerId?: number
  reviewerNickname?: string
  reviewComment?: string
  reviewedAt?: string
  createdAt?: string
  updatedAt?: string
  published?: boolean
  publishedAt?: string
}

export interface CompanionShowcaseQuery {
  pageNum: number
  pageSize: number
  status?: CompanionShowcaseStatus
  createdFrom?: string
  createdTo?: string
  keyword?: string
}

export interface ReviewCompanionShowcaseRequest {
  approved: boolean
  comment?: string
}
