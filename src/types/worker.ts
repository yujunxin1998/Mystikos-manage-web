export type CompanionStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE'

export interface TagView {
  id: number
  category: string
  label: string
  sortOrder: number
  enabled: boolean
}

export interface CompanionPerformance {
  totalOrders: number
  totalRevenue: number
  avgRating: number
}

export interface Companion {
  userId: number
  phone?: string
  email?: string
  nickname?: string
  avatarUrl?: string
  status: CompanionStatus
  level?: string
  tags: TagView[]
  hourlyRate?: number
  idCardNo?: string
  bankAccountName?: string
  bankAccountNo?: string
  bankName?: string
  createdAt?: string
  performance?: CompanionPerformance
}

export interface CompanionQuery {
  pageNum: number
  pageSize: number
  keyword?: string
  status?: CompanionStatus
  createdFrom?: string
  createdTo?: string
}

export interface CompanionStats {
  totalCount: number
  availableCount: number
  busyCount: number
  avgHourlyRate: number
}

export interface CreateCompanionRequest {
  phone?: string
  email?: string
  password?: string
  nickname?: string
  level?: string
  tagIds?: number[]
  hourlyRate?: number
  status?: CompanionStatus
  idCardNo?: string
  bankAccountName?: string
  bankAccountNo?: string
  bankName?: string
}
