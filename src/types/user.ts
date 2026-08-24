import type { UserRole } from './auth'

export type UserStatus = 'ACTIVE' | 'DISABLED' | 'BANNED' | 'DELETED'

export interface UserProfile {
  userId: number
  phone?: string
  email?: string
  nickname?: string
  privacyAnonymous?: boolean
  gender?: 'MALE' | 'FEMALE' | 'UNDISCLOSED'
  avatarUrl?: string
  birthDate?: string
  bio?: string
  regionCode?: string
  roles: UserRole[]
  membershipTierLevel?: number
  membershipTierCode?: string
  status: UserStatus
}

export interface UserQuery {
  pageNum: number
  pageSize: number
  keyword?: string
  status?: UserStatus
  createdFrom?: string
  createdTo?: string
}

export interface CreateUserRequest {
  phone?: string
  email?: string
  password?: string
  nickname?: string
  initialRole: UserRole
}
